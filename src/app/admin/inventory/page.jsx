/**
 * admin/inventory/page.jsx — Equipment Inventory (Admin)
 */
import { prisma } from "@/lib/db";
import AdminDashboardClient from "../AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const items = await prisma.item.findMany({
    include: {
      flags: true,
      kit: true
    }
  });

  const equipmentData = items.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    category: item.category,
    brand: item.brand || "",
    model: item.model || "",
    kind: item.kind || "Individual",
    barcode: item.barcode || "",
    image: item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
    availability: item.status === "flagged" ? "Flagged" : item.status === "checked_out" ? "Checked out" : "Available",
    description: item.description || "",
    quantity: item.quantity || 1,
    quantityAvailable: item.status === "available" ? (item.quantity || 1) : 0,
    condition: "Good",
    kitId: item.kitId,
    kitName: item.kit?.name || null,
    flags: item.flags,
    flag: item.flags.find(f => !f.resolved) || null,
  }));

  // Fetch reservations too if needed for stats or layout consistency
  const allReservations = await prisma.reservation.findMany({
    include: { item: true, user: true }
  });

  return (
    <AdminDashboardClient
      initialEquipment={equipmentData}
      initialReservations={allReservations.map(r => ({ id: r.id, status: r.status, returnDate: r.endDate.toISOString() }))}
      forcedTab="inventory"
    />
  );
}
