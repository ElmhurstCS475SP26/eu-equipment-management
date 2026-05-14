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
    prisma.item.findMany({ where: { kitId: null } }),
    prisma.kit.findMany({ include: { items: true } })
  ]);

  // Transform items
  const equipmentData = items.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    category: item.category,
    brand: item.brand || "",
    model: item.model || "",
    image: item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
    availability: item.status === "available" ? "Available" : item.status === "checked_out" ? "Reserved" : "Maintenance",
    description: item.description || "",
    quantity: item.quantity || 1,
    quantityAvailable: item.status === "available" ? (item.quantity || 1) : 0,
    type: 'individual'
  }));

  // Transform kits
  const kitsData = kits.map(kit => ({
    id: `kit-${kit.id}`,
    dbId: kit.id,
    name: kit.name,
    category: "Equipment Kit",
    brand: "Multiple",
    model: `${kit.items.length} items`,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop", // Kit placeholder
    availability: kit.status === "available" ? "Available" : "Unavailable",
    description: `A curated set of equipment including: ${kit.items.map(i => i.name).join(", ")}`,
    quantity: 1,
    quantityAvailable: kit.status === "available" ? 1 : 0,
    type: 'kit',
    items: kit.items
  }));

  return <CatalogClient initialEquipment={[...equipmentData, ...kitsData]} />;
}
