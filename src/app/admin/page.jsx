import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await currentUser();
  // const role = user?.publicMetadata?.role;
  // --- ADMIN VIEW TOGGLE (via .env) ---
  const envRole = process.env.NEXT_PUBLIC_ENABLE_ADMIN_VIEW === "true" ? "admin" : null;
  const role = envRole || user?.publicMetadata?.role;
  // ------------------------------------

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const items = await prisma.item.findMany({
    include: {
      flags: {
        where: { resolved: false }
      }
    }
  });

  const equipmentData = items.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    category: item.category,
    brand: item.brand || "",
    model: item.model || "",
    image: item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
    availability: item.status === "flagged" ? "Flagged" : item.status === "checked_out" ? "Reserved" : "Available",
    description: item.description || "",
    quantity: item.quantity || 1,
    quantityAvailable: item.status === "available" ? (item.quantity || 1) : 0,
    condition: "Good",
    flag: item.flags?.[0] || null, // pass the unresolved flag if it exists
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
    if (r.status === "approved") displayStatus = "Approved"; // Or Active depending on date
    if (r.status === "active") displayStatus = "Active";
    if (r.status === "cancelled") displayStatus = "Cancelled";
    if (r.status === "completed" || r.status === "returned") displayStatus = "Returned";

    // Standardize mapping for admin
    if (displayStatus === "Approved" && new Date(r.startDate) <= new Date()) {
      displayStatus = "Active";
    }

    return {
      id: r.id,
      equipmentName: r.item.name,
      studentId: r.user.name || r.user.email,
      pickupDate: r.startDate.toISOString(),
      returnDate: r.endDate.toISOString(),
      status: displayStatus,
    };
  });

  return (
    <AdminDashboardClient
      initialEquipment={equipmentData}
      initialReservations={reservationsData}
    />
  );
}