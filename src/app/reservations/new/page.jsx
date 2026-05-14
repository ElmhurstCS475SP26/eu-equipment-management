/*
 * reservations/new/page.jsx — New Reservation (Server Page)
 * Fetches all equipment items and maps them into a format usable by the client.
 * Entry point for creating a new multi-item reservation. Can be pre-populated
 * with an item via the ?equipmentId= query param (e.g., from catalog or "Book Again").
 */
import { prisma } from "@/lib/db";
import NewReservationClient from "./NewReservationClient";

export const dynamic = "force-dynamic";

export default async function NewReservationPage() {
  const [items, kits] = await Promise.all([
    prisma.item.findMany(),
    prisma.kit.findMany({ include: { items: true } })
  ]);

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

  const kitsData = kits.map(kit => ({
    id: `kit-${kit.id}`,
    name: kit.name,
    category: "Equipment Kit",
    brand: "Multiple",
    model: `${kit.items.length} items`,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop",
    availability: kit.status === "available" ? "Available" : "Unavailable",
    description: `A curated set of equipment including: ${kit.items.map(i => i.name).join(", ")}`,
    quantity: 1,
    quantityAvailable: kit.status === "available" ? 1 : 0,
    type: 'kit',
    itemIds: kit.items.map(i => i.id.toString())
  }));

  return <NewReservationClient initialEquipment={[...equipmentData, ...kitsData]} />;
}
