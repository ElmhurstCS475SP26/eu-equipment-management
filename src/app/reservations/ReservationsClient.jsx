"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Package, X, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cancelReservationAction } from "@/app/actions/reservationActions";

export default function ReservationsClient({ initialReservations }) {
  const router = useRouter();
  const [reservations, setReservations] = useState(initialReservations);
  const [isCancelling, setIsCancelling] = useState(false);

  const activeReservations = reservations.filter((r) => r.status === "Active");
  const pendingReservations = reservations.filter((r) => r.status === "Pending");
  const upcomingReservations = reservations.filter((r) => r.status === "Upcoming");
  const pastReservations = reservations.filter((r) => r.status === "Past");
  const cancelledReservations = reservations.filter((r) => r.status === "Cancelled");

  const handleCancelReservation = async (id) => {
    setIsCancelling(true);
    const result = await cancelReservationAction(id);
    setIsCancelling(false);

    if (result.success) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r))
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
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "Upcoming":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "Past":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      case "Cancelled":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "";
    }
  };

  const EmptyState = ({ message }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">{message}</p>
      </CardContent>
    </Card>
  );

  const ReservationCard = ({ reservation }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <img
            src={reservation.equipmentImage}
            alt={reservation.equipmentName}
            className="h-20 w-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{reservation.equipmentName}</CardTitle>
            <CardDescription>Reservation ID: {reservation.id}</CardDescription>
            <Badge className={`mt-2 ${getStatusColor(reservation.status)}`}>
              {reservation.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Pickup Date</p>
              <p className="text-sm text-gray-600">
                {new Date(reservation.pickupDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(reservation.pickupDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Return Date</p>
              <p className="text-sm text-gray-600">
                {new Date(reservation.returnDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(reservation.returnDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4" />
          <span>Equipment ID: {reservation.equipmentId_full}</span>
        </div>

        {(reservation.status === "Upcoming" || reservation.status === "Active" || reservation.status === "Pending") && (
          <div className="flex gap-2 pt-2">
            {(reservation.status === "Upcoming" || reservation.status === "Pending") && (
              <Button variant="outline" className="flex-1 gap-2" disabled={isCancelling}>
                <Edit className="h-4 w-4" />
                Modify
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 gap-2 text-red-600 hover:text-red-700" disabled={isCancelling}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your reservation for {reservation.equipmentName}?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Reservation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Reservations</h1>
        <p className="text-gray-600">View and manage your equipment reservations</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto overflow-x-auto">
          <TabsTrigger value="active">
            Active
            {activeReservations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeReservations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingReservations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingReservations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming
            {upcomingReservations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {upcomingReservations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          ) : (
            <EmptyState message="No active reservations" />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          ) : (
            <EmptyState message="No pending reservations" />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          ) : (
            <EmptyState message="No upcoming reservations" />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pastReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          ) : (
            <EmptyState message="No past reservations" />
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {cancelledReservations.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          ) : (
            <EmptyState message="No cancelled reservations" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
