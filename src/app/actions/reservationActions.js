"use server";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function createReservationAction(data) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not logged in" };
    }
    
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {},
      create: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "unknown@domain.com",
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || "Unknown",
      }
    });

    const startDate = new Date(`${data.pickupDate}T${data.pickupTime}:00`);
    const endDate = new Date(`${data.returnDate}T${data.returnTime}:00`);

    const reservation = await prisma.reservation.create({
      data: {
        userId: dbUser.id,
        itemId: parseInt(data.itemId, 10),
        startDate,
        endDate,
        status: "pending",
      }
    });
    
    return { success: true, reservationId: reservation.id };
  } catch (error) {
    console.error("Failed to create reservation:", error);
    return { success: false, error: error.message || "Failed to create reservation" };
  }
}

export async function cancelReservationAction(reservationId) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Not logged in" };
    }
    
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) return { success: false, error: "User not found in DB" };

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation || reservation.userId !== dbUser.id) {
      return { success: false, error: "Reservation not found or unauthorized" };
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "cancelled" }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel reservation:", error);
    return { success: false, error: error.message || "Failed to cancel reservation" };
  }
}

export async function updateReservationStatusAction(reservationId, newStatus) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: newStatus }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}
