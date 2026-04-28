/**
 * admin/reservations/page.jsx — Global Reservations (Admin)
 */
import { prisma } from "@/lib/db";
import AdminDashboardClient from "../AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
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
      initialReservations={reservationsData}
      initialEquipment={[]}
      forcedTab="reservations"
    />
  );
}
