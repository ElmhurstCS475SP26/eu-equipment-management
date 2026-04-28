/**
 * admin/page.jsx — Admin Dashboard (Server Page)
 * Protected route — redirects non-admins to /dashboard.
 * Fetches all equipment items (with unresolved flags) and all reservations from
 * the database, then passes them to AdminDashboardClient for display.
 */
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const items = await prisma.item.findMany({
    include: {
      flags: true,
      kit: true
    }
  });

  const kits = await prisma.kit.findMany({
    include: {
      items: true
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

  const kitsData = kits.map(k => ({
    id: k.id,
    name: k.name,
    externalId: k.externalId,
    status: k.status,
    itemCount: k.items.length,
    items: k.items.map(i => ({ id: i.id, name: i.name }))
  }));

  const allReservations = await prisma.reservation.findMany({
    include: {
      item: true,
      user: true
    },
    orderBy: { createdAt: "desc" }
  });

  const reservationsData = allReservations.map((r) => {
    let displayStatus = "Unknown";
    if (r.status === "pending") displayStatus = "Pending";
    if (r.status === "approved") displayStatus = "Booked"; 
    if (r.status === "active") displayStatus = "Open";
    if (r.status === "cancelled") displayStatus = "Cancelled";
    if (r.status === "completed" || r.status === "returned") displayStatus = "Returned";

    // Standardize mapping for admin
    if (displayStatus === "Booked" && new Date(r.startDate) <= new Date()) {
      displayStatus = "Open";
    }

    return {
      id: r.id,
      equipmentName: r.item.name,
      studentName: r.user.name,
      studentEmail: r.user.email,
      studentId: r.studentId || "N/A",
      pickupDate: r.startDate.toISOString(),
      returnDate: r.endDate.toISOString(),
      status: displayStatus,
    };
  });

  return (
    <AdminDashboardClient
      initialEquipment={equipmentData}
      initialReservations={reservationsData}
      initialKits={kitsData}
      forcedTab="overview"
    />
  );
}