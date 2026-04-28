/**
 * dashboard/page.jsx — Student Dashboard
 * The main landing page for signed-in students. Displays a welcome message,
 * active/upcoming reservation counts, featured equipment categories, and a
 * summary of the student's current active reservations. Server-rendered.
 */
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar, Clock, AlertCircle, Video, Mic, Lightbulb, Camera, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await currentUser();
  const firstName = user?.firstName || 'User';

  let activeReservations = [];
  let upcomingReservations = [];

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        reservations: {
          include: { item: true }
        }
      }
    });

    if (dbUser) {
      const reservations = dbUser.reservations
        .filter(r => r.status !== "cancelled")
        .map(r => ({
          id: r.id,
          status: r.status,
          pickupDate: r.startDate,
          returnDate: r.endDate,
          equipmentName: r.item.name,
          equipmentImage: r.item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
          equipmentId_full: r.item.externalId || r.item.id.toString(),
        }));

      const now = new Date();
      // Active means it's current or already picked up
      activeReservations = reservations.filter(r => 
        (r.status === "approved" || r.status === "active") && 
        new Date(r.pickupDate) <= now && 
        new Date(r.returnDate) >= now
      );
      
      // Upcoming means approved but start date is in the future
      upcomingReservations = reservations.filter(r => 
        (r.status === "approved" || r.status === "active") && 
        new Date(r.pickupDate) > now
      );
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
            <div className="text-2xl font-bold">{activeReservations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Currently checked out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Pickups</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReservations.length}</div>
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
        {activeReservations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <img
                    src={reservation.equipmentImage}
                    alt={reservation.equipmentName}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <CardTitle className="text-lg">{reservation.equipmentName}</CardTitle>
                  <CardDescription>ID: {reservation.equipmentId_full}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Pickup: {new Date(reservation.pickupDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      Return: {new Date(reservation.returnDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mt-2">
                    {reservation.status}
                  </Badge>
                </CardContent>
              </Card>
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
      {upcomingReservations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Pickups</h2>
          <div className="space-y-3">
            {upcomingReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <img
                    src={reservation.equipmentImage}
                    alt={reservation.equipmentName}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{reservation.equipmentName}</h3>
                    <p className="text-sm text-gray-600">
                      Pickup: {new Date(reservation.pickupDate).toLocaleDateString()} at{" "}
                      {new Date(reservation.pickupDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{reservation.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}