/*
 * catalog/page.jsx — Equipment Catalog (Server Page)
 * Fetches all equipment items from the database and passes them to CatalogClient.
 * Students use this page to browse, filter, and search available equipment,
 * and to navigate to individual item detail pages or start a reservation.
 */
import { prisma } from "@/lib/db";
import CatalogClient from "./CatalogClient";

// Opt out of static side generation for up-to-date DB fetches
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [items, kits] = await Promise.all([
    prisma.item.findMany({ where: { kitId: null }, include: { flags: true } }),
    prisma.kit.findMany({ include: { items: true, flags: true } })
  ]);

  // Transform items — mirror the admin availability logic:
  // "Maintenance" only when there is at least one active (unresolved) flag.
  const equipmentData = items.map((item) => {
    const hasActiveFlag = item.flags.some(f => !f.resolved);
    const isFlagged = item.status === "flagged" && hasActiveFlag;
    const availability = item.status === "available"
      ? "Available"
      : item.status === "checked_out"
      ? "Reserved"
      : isFlagged
      ? "Maintenance"
      : "Available"; // flagged status but all flags resolved → treat as available

    return {
      id: item.id.toString(),
      name: item.name,
      category: item.category,
      brand: item.brand || "",
      model: item.model || "",
      image: item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
      availability,
      description: item.description || "",
      quantity: item.quantity || 1,
      quantityAvailable: (availability === "Available") ? (item.quantity || 1) : 0,
      type: 'individual'
    };
  });

  // Transform kits — same logic: unresolved flag → "Unavailable" (shown as Maintenance in filter)
  const kitsData = kits.map(kit => {
    const hasActiveFlag = kit.flags.some(f => !f.resolved);
    const isFlagged = kit.status === "flagged" && hasActiveFlag;
    const availability = kit.status === "available"
      ? "Available"
      : isFlagged
      ? "Maintenance"
      : kit.status === "checked_out"
      ? "Reserved"
      : "Available"; // resolved flags → available

    return {
      id: `kit-${kit.id}`,
      dbId: kit.id,
      name: kit.name,
      category: "Equipment Kit",
      brand: "Multiple",
      model: `${kit.items.length} items`,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
      availability,
      description: `A curated set of equipment including: ${kit.items.map(i => i.name).join(", ")}`,
      quantity: 1,
      quantityAvailable: availability === "Available" ? 1 : 0,
      type: 'kit',
      items: kit.items
    };
  });

  return <CatalogClient initialEquipment={[...equipmentData, ...kitsData]} />;
}
