"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, User, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { equipmentData } from "@/data/mockData";
import { toast } from "sonner";

export default function ReservationCheckout() {
  const { id } = useParams();
  const router = useRouter();
  const equipment = equipmentData.find((item) => item.id === id);

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("17:00");
  const [studentId, setStudentId] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!equipment) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">Equipment not found</p>
            <Link href="/catalog" className="mt-4">
              <Button variant="outline">Back to Catalog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!pickupDate || !returnDate) {
      toast.error("Please select both pickup and return dates");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    // Show success modal instead of immediate redirect
    setShowSuccessModal(true);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Link href={`/equipment/${id}`}>
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Confirm Reservation</h1>
        <p className="text-gray-600">Complete your equipment reservation</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Equipment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <img
                  src={equipment.image}
                  alt={equipment.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{equipment.name}</h3>
                  <p className="text-sm text-gray-600">
                    {equipment.brand} {equipment.model}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{equipment.category}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reservation Period
                </CardTitle>
                <CardDescription>Select your pickup and return dates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Pickup Date</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      min={getTomorrowDate()}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupTime">Pickup Time</Label>
                    <Input
                      id="pickupTime"
                      type="time"
                      min="09:00"
                      max="17:00"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="returnDate">Return Date</Label>
                    <Input
                      id="returnDate"
                      type="date"
                      min={pickupDate || getTomorrowDate()}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnTime">Return Time</Label>
                    <Input
                      id="returnTime"
                      type="time"
                      min="09:00"
                      max="17:00"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  * Equipment must be picked up and returned during business hours (9 AM - 5 PM)
                </p>
              </CardContent>
            </Card>

            {/* Pickup Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Digital Media Equipment Room</p>
                  <p className="text-sm text-gray-600">Hammerschmidt Memorial Chapel, Room 103</p>
                  <p className="text-sm text-gray-600">190 Prospect Ave, Elmhurst, IL 60126</p>
                </div>
              </CardContent>
            </Card>

            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="S123456"
                    required
                  />
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  />
                  <div className="grid gap-1.5 leading-none mt-[2px]">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal leading-normal cursor-pointer"
                    >
                      I agree to the equipment policies and understand that I am responsible for
                      the equipment during the reservation period. I will return the equipment in
                      the same condition and on time.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href={`/equipment/${id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Confirm Reservation
              </Button>
            </div>
          </form>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Reservation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Equipment</p>
                <p className="font-semibold">{equipment.name}</p>
              </div>

              {pickupDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pickup</p>
                  <p className="font-semibold">
                    {new Date(pickupDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{pickupTime}</p>
                </div>
              )}

              {returnDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Return</p>
                  <p className="font-semibold">
                    {new Date(returnDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{returnTime}</p>
                </div>
              )}

              {pickupDate && returnDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold">
                    {Math.ceil(
                      (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </p>
                </div>
              )}

              {/*<div className="pt-4 border-t">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <p>Valid student ID required for pickup</p>
                </div>
              </div>*/}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Request Submitted</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base pt-2">
              You have successfully submitted a request, which is now pending to be approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-4">
            <AlertDialogAction 
              onClick={() => router.push("/reservations")} 
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              View My Reservations
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
