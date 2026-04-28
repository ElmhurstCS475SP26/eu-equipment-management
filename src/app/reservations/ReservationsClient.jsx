/*
 * reservations/ReservationsClient.jsx — My Reservations (Client Component)
 * Groups flat reservation rows by bookingId so that multi-item reservations
 * appear as a single card. Renders three tabs (Active, Upcoming, Past) each
 * showing BookingCards with item thumbnails, shared dates, and a Cancel button
 * that cancels all items in the booking at once via cancelBookingAction.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Package, X, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  cancelBookingAction,
  cancelReservationAction,
} from "@/app/actions/reservationActions";

// ─────────────────────────────────────────────────────────────────────────────
// Group flat reservation rows by bookingId.
// Rows without a bookingId are treated as solo bookings keyed by their own id.
// ─────────────────────────────────────────────────────────────────────────────
function groupReservations(reservations) {
  const map = new Map();

  for (const r of reservations) {
    const key = r.bookingId || `solo-${r.id}`;

    if (!map.has(key)) {
      map.set(key, {
        bookingId: r.bookingId || null,
        groupKey: key,
        status: r.status,
        pickupDate: r.pickupDate,
        returnDate: r.returnDate,
        ids: [],          // all individual reservation IDs in this booking
        items: [],        // all equipment items in this booking
      });
    }

    const group = map.get(key);
    group.ids.push(r.id);
    group.items.push({
      id: r.id,
      itemId: r.itemId,
      equipmentName: r.equipmentName,
      equipmentImage: r.equipmentImage,
    });
  }

  return Array.from(map.values());
}

export default function ReservationsClient({ initialReservations }) {
  const router = useRouter();
  const [reservations, setReservations] = useState(initialReservations);
  const [isCancelling, setIsCancelling] = useState(false);

  // Group into bookings
  const allBookings = groupReservations(reservations);

  const activeBookings = allBookings.filter(
    (b) => b.status === "Active" || b.status === "approved"
  );
  const upcomingBookings = allBookings.filter((b) => b.status === "Upcoming");
  const pastBookings = allBookings.filter(
    (b) =>
      b.status === "Past" ||
      b.status === "completed" ||
      b.status === "returned"
  );

  // Cancel handler — bulk cancel by bookingId, fallback to single cancel
  const handleCancelBooking = async (booking) => {
    setIsCancelling(true);

    let result;
    if (booking.bookingId) {
      result = await cancelBookingAction(booking.bookingId);
    } else {
      // Legacy single-item without bookingId
      result = await cancelReservationAction(booking.ids[0]);
    }

    setIsCancelling(false);

    if (result.success) {
      // Remove all reservation rows that belong to this booking
      setReservations((prev) =>
        prev.filter((r) => !booking.ids.includes(r.id))
      );
      toast.success("Reservation cancelled successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to cancel reservation");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
      case "approved":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Upcoming":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "Past":
      case "completed":
      case "returned":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      default:
        return "";
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  const EmptyState = ({ message }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-gray-300" />
        </div>
        <p className="font-medium">{message}</p>
        <Link href="/reservations/new" className="mt-4">
          <Button className="bg-blue-600">Make New Reservation</Button>
        </Link>
      </CardContent>
    </Card>
  );

  // ── Booking card (one card per bookingId) ────────────────────────────────
  const BookingCard = ({ booking }) => {
    const isPast =
      booking.status === "Past" ||
      booking.status === "completed" ||
      booking.status === "returned";

    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          {/* Booking ID + status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <CardDescription className="text-xs font-medium">
              {booking.bookingId ? `Booking: ${booking.bookingId}` : `Reservation #${booking.ids[0]}`}
            </CardDescription>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>

          {/* Item thumbnails + names */}
          <div className="space-y-2">
            {booking.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.equipmentImage}
                  alt={item.equipmentName}
                  className="h-12 w-12 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                />
                <p className="text-sm font-semibold truncate">
                  {item.equipmentName}
                </p>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Dates (shared for whole booking) */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pickup
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(booking.pickupDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  •{" "}
                  {new Date(booking.pickupDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Return
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(booking.returnDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  •{" "}
                  {new Date(booking.returnDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isPast ? (
            <div className="pt-1">
              <Link href="/reservations/new" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl gap-2">
                  <Plus className="h-4 w-4" />
                  Book Again
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-red-600 hover:text-red-700 rounded-xl"
                      disabled={isCancelling}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  }
                />
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {booking.items.length > 1
                        ? `This will cancel all ${booking.items.length} items in this booking (${booking.items.map((i) => i.equipmentName).join(", ")}). This cannot be undone.`
                        : `Are you sure you want to cancel your reservation for ${booking.items[0]?.equipmentName}?`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Keep Reservation
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancelBooking(booking)}
                      className="bg-red-600 hover:bg-red-700 rounded-xl"
                    >
                      {booking.items.length > 1
                        ? `Cancel All ${booking.items.length} Items`
                        : "Cancel Reservation"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
          My Reservations
        </h1>
        <p className="text-gray-500 font-medium">
          View and manage your equipment bookings
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1 rounded-2xl w-full sm:w-auto">
          <TabsTrigger value="active" className="rounded-xl px-6">
            Active
            {activeBookings.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-white/50 text-gray-700"
              >
                {activeBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-xl px-6">
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-white/50 text-gray-700"
              >
                {upcomingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-xl px-6">
            Past
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeBookings.map((booking) => (
                <BookingCard key={booking.groupKey} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState message="No active reservations" />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.groupKey} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState message="No upcoming reservations" />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.groupKey} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyState message="No past reservations" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
