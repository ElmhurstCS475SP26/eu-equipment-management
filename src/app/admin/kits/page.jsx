/**
 * admin/kits/page.jsx — Equipment Kits (Admin)
 */
import { prisma } from "@/lib/db";
import AdminDashboardClient from "../AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminKitsPage() {
  const kits = await prisma.kit.findMany({
    include: {
      items: true,
      flags: true
    }
  });

  const kitsData = kits.map(k => {
    const activeFlag = k.flags.find(f => !f.resolved) || null;
    return {
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
      flag: activeFlag,
    };
  });

  const items = await prisma.item.findMany({
    include: { flags: true, kit: true }
  });

  const equipmentData = items.map(item => {
    const activeFlag = item.flags.find(f => !f.resolved) || null;
    return {
      id: item.id,
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
      kitId: item.kitId,
      kitName: item.kit?.name || null,
      flags: item.flags,
      flag: activeFlag,
    };
  });

  return (
    <AdminDashboardClient
      initialKits={kitsData}
      initialEquipment={equipmentData}
      initialReservations={[]}
      forcedTab="kits"
    />
  );
}
