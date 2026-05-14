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

  const kits = await prisma.kit.findMany({
    include: {
      items: true,
      flags: true
    }
  });

  const equipmentData = items.map((item) => {
    const activeFlag = item.flags.find(f => !f.resolved) || null;
    return {
      id: item.id.toString(),
      name: item.name,
      category: item.category,
      brand: item.brand || "",
      model: item.model || "",
      kind: item.kind || "Individual",
      image: item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
      availability: item.status?.toLowerCase() === "flagged" ? (activeFlag?.reason || "Flagged") : item.status?.toLowerCase() === "checked_out" ? "Checked out" : "Available",
      status: item.status?.toLowerCase(),
      description: item.description || "",
      quantity: item.quantity || 1,
      quantityAvailable: item.status?.toLowerCase() === "available" ? (item.quantity || 1) : 0,
      kitId: item.kitId,
      kitName: item.kit?.name || null,
      flags: item.flags,
      flag: activeFlag,
    };
  });

  const kitsData = kits.map(k => ({
    id: k.id,
    name: k.name,
    image: k.imageUrl || null,
    externalId: k.externalId,
    status: k.status?.toLowerCase(),
    itemCount: k.items.length,
    items: k.items.map(i => ({ 
      id: i.id, 
      name: i.name, 
      image: i.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop" 
    })),
    flags: k.flags,
    flag: k.flags.find(f => !f.resolved) || null,
  }));

  const allReservations = await prisma.reservation.findMany({
    include: { item: true, user: true }
  });

  return (
    <AdminDashboardClient
      initialEquipment={equipmentData}
      initialKits={kitsData}
      initialReservations={allReservations.map(r => ({ id: r.id, status: r.status, returnDate: r.endDate.toISOString() }))}
      forcedTab="inventory"
    />
  );
}
