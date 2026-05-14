"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  User, 
  Calendar, 
  Package, 
  FileText, 
  CheckCircle2, 
  Clock,
  ArrowRightLeft,
  Printer
} from "lucide-react";
import { toast } from "sonner";
import { checkOutReservationAction, returnReservationAction } from "@/app/actions/reservationActions";

export function ReservationDetailsDialog({ reservation, open, onOpenChange, onStatusChange }) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!reservation) return null;

  const handleCheckOut = async () => {
    setIsProcessing(true);
    const result = await checkOutReservationAction(reservation.id);
    setIsProcessing(false);
    if (result.success) {
      toast.success("Equipment checked out successfully");
      onStatusChange();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to check out");
    }
  };

  const handleReturn = async () => {
    setIsProcessing(true);
    const result = await returnReservationAction(reservation.id);
    setIsProcessing(false);
    if (result.success) {
      toast.success("Equipment returned successfully");
      onStatusChange();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to process return");
    }
  };

  const statusColors = {
    "Booked": "bg-blue-50 text-blue-700 border-blue-100",
    "Open": "bg-green-50 text-green-700 border-green-100",
    "Returned": "bg-gray-50 text-gray-700 border-gray-100",
    "Cancelled": "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`${statusColors[reservation.status]} font-bold px-3 py-1`}>
              {reservation.status}
            </Badge>
            <span className="text-xs text-slate-400 font-mono">ID: {reservation.id}</span>
          </div>
          <DialogTitle className="text-2xl font-bold mt-4">Reservation Details</DialogTitle>
          <DialogDescription>
            Booking ID: {reservation.bookingId || "N/A"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          {/* Student Info */}
          <div className="flex gap-4 p-4 rounded-xl border bg-slate-50/50">
            <div className="h-12 w-12 rounded-full bg-white border flex items-center justify-center shadow-sm">
              <User className="h-6 w-6 text-slate-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">{reservation.studentName}</h4>
              <p className="text-sm text-slate-500">ID: {reservation.studentId}</p>
              <p className="text-xs text-slate-400">{reservation.studentEmail}</p>
            </div>
          </div>

          {/* Item Info */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4" /> Reserved Equipment
            </h5>
            <div className="p-4 rounded-xl border space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-bold text-lg">{reservation.equipmentName}</span>
              </div>
              {/* Additional item details could be passed here if fetched */}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Timeline
            </h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border bg-slate-50/30">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Date</p>
                <p className="text-sm font-semibold">{new Date(reservation.pickupDate).toLocaleDateString()} {new Date(reservation.pickupDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="p-3 rounded-xl border bg-slate-50/30">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Return Date</p>
                <p className="text-sm font-semibold">{new Date(reservation.returnDate).toLocaleDateString()} {new Date(reservation.returnDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t">
          <div className="flex gap-2">
            {reservation.status === "Booked" && (
              <Button 
                onClick={handleCheckOut} 
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold h-12 rounded-xl"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Check-out Equipment
              </Button>
            )}
            {reservation.status === "Open" && (
              <Button 
                onClick={handleReturn} 
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 font-bold h-12 rounded-xl"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Returned
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl font-bold border-slate-200"
            onClick={() => window.open(`/api/reservations/${reservation.id}/contract`, '_blank')}
          >
            <FileText className="h-4 w-4 mr-2 text-slate-500" />
            View Signed Contract
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="w-full text-slate-500 font-medium"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
