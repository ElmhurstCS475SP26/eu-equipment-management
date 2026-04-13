import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import ReservationsClient from "./ReservationsClient";

export const dynamic = "force-dynamic";

export default async function MyReservationsPage() {
  const user = await currentUser();

  let reservationsData = [];
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        reservations: {
          include: { item: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (dbUser) {
      reservationsData = dbUser.reservations.map(r => {
        let displayStatus = "Past";
        if (r.status === "pending") displayStatus = "Pending";
        if (r.status === "approved") displayStatus = "Upcoming"; // Or Active depending on date
        if (r.status === "active") displayStatus = "Active";
        if (r.status === "cancelled") displayStatus = "Cancelled";
        if (r.status === "completed" || r.status === "returned") displayStatus = "Past";

        // If approved but pickupDate is passed, maybe it's active. Keeping simple:
        const now = new Date();
        if (displayStatus === "Upcoming" && new Date(r.startDate) <= now) {
          displayStatus = "Active";
        }

        return {
          id: r.id,
          status: displayStatus,
          pickupDate: r.startDate.toISOString(),
          returnDate: r.endDate.toISOString(),
          equipmentName: r.item.name,
          equipmentImage: r.item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
          equipmentId_full: r.item.externalId || r.item.id.toString(),
        };
      });
    }
  }

  return <ReservationsClient initialReservations={reservationsData} />;
}