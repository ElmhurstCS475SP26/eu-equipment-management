import { prisma } from "@/lib/db";
import { generateContractBuffer } from "@/lib/email-utils";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Try to find the reservation by ID or Booking ID
    // If it's a booking ID, we might have multiple reservations, but we'll group them for the contract
    let reservations = await prisma.reservation.findMany({
      where: {
        OR: [
          { id: parseInt(id, 10) || -1 },
          { bookingId: id }
        ]
      },
      include: {
        item: true,
        user: true
      }
    });

    if (reservations.length === 0) {
      return new NextResponse("Reservation not found", { status: 404 });
    }

    const reservation = reservations[0];
    const items = reservations.map(r => r.item);
    const user = {
      name: reservation.user.name,
      email: reservation.user.email,
      studentId: reservation.studentId
    };

    // Ensure the user is either the owner or an admin
    const isAdmin = clerkUser.publicMetadata?.role === "admin";
    const isOwner = reservation.user.clerkId === clerkUser.id;

    if (!isAdmin && !isOwner) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const pdfBuffer = await generateContractBuffer(reservation, items, user);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Contract-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Contract Generation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
