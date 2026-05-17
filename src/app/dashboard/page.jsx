/**
 * dashboard/page.jsx — Student Dashboard
 * The main landing page for signed-in students. Displays a welcome message,
 * active/upcoming reservation counts, featured equipment categories, and a
 * summary of the student's current active reservations. Server-rendered.
 */
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Mirror the grouping logic from ReservationsClient so cards match. */
function groupByBooking(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = r.bookingId || `solo-${r.id}`;
    if (!map.has(key)) {
      map.set(key, {
        bookingId: r.bookingId || null,
        groupKey: key,
        status: r.status,
        pickupDate: r.pickupDate,
        returnDate: r.returnDate,
        ids: [],
        items: [],
      });
    }
    const group = map.get(key);
    group.ids.push(r.id);
    group.items.push({
      id: r.id,
      equipmentName: r.equipmentName,
      equipmentImage: r.equipmentImage,
    });
  }
  return Array.from(map.values());
}

/**
 * Read-only booking card for the dashboard.
 * Mirrors the visual layout of ReservationsClient's BookingCard
 * but omits the cancel / contract actions (those live on /reservations).
 */
function DashboardBookingCard({ booking }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Upcoming": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      default: return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        {/* Booking ID + status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <CardDescription className="text-xs font-medium">
            {booking.bookingId ? `Booking: ${booking.bookingId}` : `Reservation #${booking.ids[0]}`}
          </CardDescription>
          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
        </div>

        {/* Item thumbnails + names — show first 2, then overflow hint */}
        <div className="space-y-2">
          {booking.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.equipmentImage}
                alt={item.equipmentName}
                className="h-12 w-12 rounded-lg object-cover bg-gray-50 flex-shrink-0"
              />
              <p className="text-sm font-semibold break-words">{item.equipmentName}</p>
            </div>
          ))}
          {booking.items.length > 2 && (
            <p className="text-xs text-gray-400 pl-1">
              + {booking.items.length - 2} more item{booking.items.length - 2 !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pickup</p>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(booking.pickupDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" • "}
                {new Date(booking.pickupDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Return</p>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(booking.returnDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" • "}
                {new Date(booking.returnDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function Dashboard() {
  const user = await currentUser();
  const firstName = user?.firstName || 'User';

  let activeBookings = [];
  let upcomingBookings = [];

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        reservations: {
          include: { item: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (dbUser) {
      const now = new Date();

      // Compute the same display-status logic as reservations/page.jsx
      const rows = dbUser.reservations
        .filter((r) => r.status !== "cancelled" && r.status !== "completed" && r.status !== "returned")
        .map((r) => {
          let displayStatus = r.status; // 'approved' | 'active' | 'pending'
          if (r.status === "approved" && new Date(r.startDate) <= now) {
            displayStatus = "Active";
          } else if (r.status === "approved" && new Date(r.startDate) > now) {
            displayStatus = "Upcoming";
          } else if (r.status === "active") {
            displayStatus = "Active";
          }
          return {
            id: r.id,
            bookingId: r.bookingId || null,
            status: displayStatus,
            pickupDate: r.startDate,
            returnDate: r.endDate,
            equipmentName: r.item.name,
            equipmentImage:
              r.item.imageUrl ||
              "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
          };
        });

      const activeRows = rows.filter((r) => r.status === "Active");
      const upcomingRows = rows.filter((r) => r.status === "Upcoming");

      activeBookings = groupByBooking(activeRows);
      upcomingBookings = groupByBooking(upcomingRows);
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your equipment reservations.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
            <p className="text-xs text-gray-500 mt-1">Currently checked out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Pickups</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-gray-500 mt-1">Ready to pick up</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Equipment</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500 mt-1">All on time</p>
          </CardContent>
        </Card>
      </div>

      {/* My Active Reservations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">My Reservations</h2>
          <Link href="/reservations">
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {activeBookings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeBookings.map((booking) => (
              <DashboardBookingCard key={booking.groupKey} booking={booking} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No active reservations</p>
              <Link href="/catalog">
                <Button className="bg-blue-600 hover:bg-blue-700">Browse Equipment</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Reservations */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Pickups</h2>
        {upcomingBookings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBookings.map((booking) => (
              <DashboardBookingCard key={booking.groupKey} booking={booking} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No upcoming pickups</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}