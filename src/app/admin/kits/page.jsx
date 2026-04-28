/**
 * admin/kits/page.jsx — Equipment Kits (Admin)
 */
import { prisma } from "@/lib/db";
import AdminDashboardClient from "../AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminKitsPage() {
  const kits = await prisma.kit.findMany({
    include: {
      items: true
    }
  });

  const kitsData = kits.map(k => ({
    id: k.id,
    name: k.name,
    externalId: k.externalId,
    status: k.status,
    itemCount: k.items.length,
    items: k.items.map(i => ({ id: i.id, name: i.name }))
  }));

  const items = await prisma.item.findMany({
    where: { kitId: null }
  });

  const equipmentData = items.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    location: item.location || "DM Checkout"
  }));

  return (
    <AdminDashboardClient
      initialKits={kitsData}
      initialEquipment={equipmentData}
      initialReservations={[]}
      forcedTab="kits"
    />
  );
}
