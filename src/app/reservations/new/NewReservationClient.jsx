/*
 * reservations/new/NewReservationClient.jsx — New Reservation Form (Client Component)
 * Multi-step form for creating a reservation with multiple items. Features:
 *   - Equipment cart: search and add multiple items via a slide-out catalog sheet
 *   - Reservation period: date/time inputs with inline validation
 *   - Pickup location: static DM Checkout address
 *   - Student information: student ID field + terms & conditions checkbox
 *   - Live summary sidebar: lists items, dates, duration, and ID reminder
 * On submit, calls createReservationAction to save all items under a shared bookingId.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  User,
  CheckCircle,
  Plus,
  Trash2,
  Search,
  ArrowLeft,
  Package,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { createReservationAction } from "@/app/actions/reservationActions";

export default function NewReservationClient({ initialEquipment }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("17:00");
  const [studentId, setStudentId] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Catalog sheet state
  const [catalogSearch, setCatalogSearch] = useState("");
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Inline validation errors
  const [errors, setErrors] = useState({});

  // Pre-fill cart if equipmentId is in URL
  useEffect(() => {
    const prefillId = searchParams.get("equipmentId");
    if (prefillId && initialEquipment) {
      const item = initialEquipment.find((e) => e.id === prefillId);
      if (item && item.availability === "Available") {
        setCart((prev) => {
          if (prev.find((i) => i.id === prefillId)) return prev;
          return [...prev, item];
        });
      }
    }
  }, [searchParams, initialEquipment]);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const filteredEquipment = initialEquipment.filter(
    (item) =>
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.brand.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const addToCart = (item) => {
    if (cart.find((i) => i.id === item.id)) {
      toast.error("Item already in reservation");
      return;
    }
    setCart([...cart, item]);
    toast.success(`${item.name} added to reservation`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const getDuration = () => {
    if (!pickupDate || !returnDate) return null;
    const diff =
      (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  const formatDateDisplay = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return {
      full: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: timeStr,
    };
  };

  const validate = () => {
    const newErrors = {};
    if (cart.length === 0) newErrors.cart = "Please add at least one item.";
    if (!pickupDate) newErrors.pickupDate = "Pick-up date is required.";
    if (!returnDate) newErrors.returnDate = "Return date is required.";
    if (returnDate && pickupDate && returnDate <= pickupDate)
      newErrors.returnDate = "Return date must be after pickup date.";
    if (!studentId.trim()) newErrors.studentId = "Student ID is required.";
    if (!agreedToTerms) newErrors.terms = "You must agree to the policies.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Show the first error as a toast too
      toast.error(Object.values(validationErrors)[0]);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const result = await createReservationAction({
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      studentId,
      itemIds: cart.map((item) => item.id),
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowSuccessModal(true);
    } else {
      toast.error(result.error || "Failed to create reservation. Please try again.");
    }
  };

  const pickupDisplay = formatDateDisplay(pickupDate, pickupTime);
  const returnDisplay = formatDateDisplay(returnDate, returnTime);
  const duration = getDuration();

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          type="button"
          variant="ghost"
          className="mb-4 gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-1">New Reservation</h1>
        <p className="text-gray-600">Complete your equipment reservation</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column ── */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 1. Reserved Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle>Reserved Items</CardTitle>
                  <CardDescription>
                    {cart.length === 0
                      ? "No items added yet"
                      : `${cart.length} item${cart.length > 1 ? "s" : ""} selected`}
                  </CardDescription>
                </div>

                {/* Add Items Sheet */}
                <Sheet open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
                  <SheetTrigger
                    render={
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Items or Kits
                      </Button>
                    }
                  />
                  <SheetContent
                    side="right"
                    className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col"
                  >
                    <SheetHeader className="p-6 border-b">
                      <SheetTitle>Equipment Catalog</SheetTitle>
                      <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search items..."
                          className="pl-9"
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                        />
                      </div>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {filteredEquipment.length > 0 ? (
                        filteredEquipment.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-14 w-14 rounded-md object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                              <Badge
                                variant={
                                  item.availability === "Available"
                                    ? "outline"
                                    : "secondary"
                                }
                                className={`mt-1 text-[10px] h-4 ${item.availability === "Available"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : ""
                                  }`}
                              >
                                {item.availability}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                item.availability === "Available"
                                  ? "outline"
                                  : "ghost"
                              }
                              disabled={
                                item.availability !== "Available" ||
                                cart.some((i) => i.id === item.id)
                              }
                              onClick={() => addToCart(item)}
                              className="h-8 flex-shrink-0"
                            >
                              {cart.some((i) => i.id === item.id)
                                ? "Added"
                                : "Add"}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                          <Package className="h-10 w-10 mb-2 opacity-30" />
                          <p>No items found</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t bg-gray-50">
                      <SheetClose
                        render={
                          <Button
                            type="button"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Done — {cart.length} item{cart.length !== 1 ? "s" : ""} selected
                          </Button>
                        }
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </CardHeader>

              <CardContent className="p-0">
                {cart.length > 0 ? (
                  <div className="divide-y">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 px-6 py-4"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.brand} • {item.category}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 px-6">
                    <Package className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm">No items added yet.</p>
                    <p className="text-xs mt-1">
                      Click &quot;Add Items or Kits&quot; above to search the catalog.
                    </p>
                  </div>
                )}
                {errors.cart && (
                  <p className="text-red-500 text-xs px-6 pb-4">{errors.cart}</p>
                )}
              </CardContent>
            </Card>

            {/* 2. Reservation Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reservation Period
                </CardTitle>
                <CardDescription>
                  Select your pickup and return dates
                </CardDescription>
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
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        setErrors((prev) => ({ ...prev, pickupDate: undefined }));
                      }}
                      disabled={isSubmitting}
                      className={errors.pickupDate ? "border-red-500" : ""}
                    />
                    {errors.pickupDate && (
                      <p className="text-red-500 text-xs">{errors.pickupDate}</p>
                    )}
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
                      disabled={isSubmitting}
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
                      onChange={(e) => {
                        setReturnDate(e.target.value);
                        setErrors((prev) => ({ ...prev, returnDate: undefined }));
                      }}
                      disabled={isSubmitting}
                      className={errors.returnDate ? "border-red-500" : ""}
                    />
                    {errors.returnDate && (
                      <p className="text-red-500 text-xs">{errors.returnDate}</p>
                    )}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  * Equipment must be picked up and returned during business hours
                  (9 AM – 5 PM)
                </p>
              </CardContent>
            </Card>

            {/* 3. Pickup Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pickup Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-semibold">Digital Media Equipment Room</p>
                <p className="text-sm text-gray-600">
                  Daniels Hall, Second Floor
                </p>
                <p className="text-sm text-gray-600">
                  190 S Prospect Ave, Elmhurst, IL 60126
                </p>
              </CardContent>
            </Card>

            {/* 4. Student Information */}
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
                    placeholder="e1234567"
                    value={studentId}
                    onChange={(e) => {
                      setStudentId(e.target.value);
                      setErrors((prev) => ({ ...prev, studentId: undefined }));
                    }}
                    disabled={isSubmitting}
                    className={errors.studentId ? "border-red-500" : ""}
                  />
                  {errors.studentId && (
                    <p className="text-red-500 text-xs">{errors.studentId}</p>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => {
                      setAgreedToTerms(checked === true);
                      setErrors((prev) => ({ ...prev, terms: undefined }));
                    }}
                    disabled={isSubmitting}
                    className={errors.terms ? "border-red-500" : ""}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal leading-normal cursor-pointer"
                    >
                      I agree to the equipment policies and understand that I am
                      responsible for the equipment during the reservation period.
                      I will return the equipment in the same condition and on
                      time.
                    </Label>
                    {errors.terms && (
                      <p className="text-red-500 text-xs">{errors.terms}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Action Buttons */}
            <div className="flex gap-3 pb-8">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm Reservation"}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Right column: Summary ── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Reservation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Items list */}
              {cart.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items ({cart.length})
                  </p>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-8 w-8 rounded object-cover flex-shrink-0"
                      />
                      <p className="text-sm font-medium truncate">{item.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No items selected yet
                </p>
              )}

              {/* Pickup */}
              {pickupDisplay && (
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Pickup</p>
                  <p className="font-semibold">{pickupDisplay.full}</p>
                  <p className="text-sm text-gray-600">{pickupDisplay.time}</p>
                </div>
              )}

              {/* Return */}
              {returnDisplay && (
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Return</p>
                  <p className="font-semibold">{returnDisplay.full}</p>
                  <p className="text-sm text-gray-600">{returnDisplay.time}</p>
                </div>
              )}

              {/* Duration */}
              {duration !== null && duration > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">Duration</p>
                  <p className="font-semibold">
                    {duration} day{duration !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* Divider + note */}
              <div className="border-t pt-3">
                <div className="flex items-start gap-2 text-blue-600">
                  <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">Valid student ID required for pickup</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Booking Confirmed!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base pt-1">
              Your reservation has been created. You can pick up your equipment
              at the Digital Media Equipment Room during the scheduled time.
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
