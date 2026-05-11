import { prisma } from "@/lib/db";
import { sendReservationEmail } from "@/lib/email-utils";
import { NextResponse } from "next/server";

// This endpoint should be called by a cron job (e.g. Vercel Cron, GitHub Actions)
// Ideally secured with a secret header: CRON_SECRET
export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourAndTenFromNow = new Date(now.getTime() + 70 * 60 * 1000);

    // 1. PICKUP REMINDERS (1 hour before startDate)
    const upcomingPickups = await prisma.reservation.findMany({
      where: {
        status: 'approved',
        remindedPickupAt: null,
        startDate: {
          gte: now,
          lte: oneHourFromNow,
        },
      },
      include: { user: true, item: true },
    });

    for (const res of upcomingPickups) {
      await sendReservationEmail({
        to: res.user.email,
        subject: `Reminder: Equipment Pickup in 1 Hour`,
        type: 'reminder',
        reservation: res,
        items: [res.item],
        user: res.user,
      });
      
      await prisma.reservation.update({
        where: { id: res.id },
        data: { remindedPickupAt: new Date() },
      });
    }

    // 2. RETURN REMINDERS (1 hour before endDate)
    const upcomingReturns = await prisma.reservation.findMany({
      where: {
        status: 'approved',
        remindedReturnAt: null,
        endDate: {
          gte: now,
          lte: oneHourFromNow,
        },
      },
      include: { user: true, item: true },
    });

    for (const res of upcomingReturns) {
      await sendReservationEmail({
        to: res.user.email,
        subject: `Reminder: Equipment Due in 1 Hour`,
        type: 'return_reminder',
        reservation: res,
        items: [res.item],
        user: res.user,
      });
      
      await prisma.reservation.update({
        where: { id: res.id },
        data: { remindedReturnAt: new Date() },
      });
    }

    // 3. OVERDUE NOTIFICATIONS
    // If startDate has passed but status is still 'approved' (meaning not 'completed')
    // AND now is past endDate
    const overdueReservations = await prisma.reservation.findMany({
      where: {
        status: 'approved',
        notifiedOverdueAt: null,
        endDate: {
          lt: now,
        },
      },
      include: { user: true, item: true },
    });

    for (const res of overdueReservations) {
      await sendReservationEmail({
        to: res.user.email,
        subject: `URGENT: Equipment Overdue`,
        type: 'overdue',
        reservation: res,
        items: [res.item],
        user: res.user,
      });
      
      await prisma.reservation.update({
        where: { id: res.id },
        data: { notifiedOverdueAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      processed: {
        pickups: upcomingPickups.length,
        returns: upcomingReturns.length,
        overdue: overdueReservations.length,
      }
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
