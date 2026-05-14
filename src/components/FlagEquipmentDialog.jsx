"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFlagAction, removeFlagAction } from "@/app/actions/flagActions";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";

export function FlagEquipmentDialog({ open, onOpenChange, equipment, type = "item" }) {
  const router = useRouter();
  const [reason, setReason] = useState("Maintenance");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing flag data if available
  useEffect(() => {
    const activeFlag = equipment?.flag || equipment?.flags?.find(f => !f.resolved);
    if (open && activeFlag) {
      setReason(activeFlag.reason);
      setNotes(activeFlag.notes || "");
    } else if (open) {
      setReason("Maintenance");
      setNotes("");
    }
  }, [open, equipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipment) return;

    setIsSubmitting(true);
    try {
      const result = await createFlagAction(equipment.id, type, reason, notes);

      if (result?.success) {
        toast.success(`${type === 'kit' ? 'Kit' : 'Equipment'} flagged as ${reason.toLowerCase()}`);
        router.refresh();
        onOpenChange(false);
      } else {
        toast.error(result?.error || "Failed to flag equipment");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFlag = async () => {
    if (!equipment) return;

    setIsSubmitting(true);
    try {
      const result = await removeFlagAction(equipment.id, type);
      if (result?.success) {
        toast.success(`${type === 'kit' ? 'Kit' : 'Equipment'} unflagged successfully`);
        router.refresh();
        onOpenChange(false);
      } else {
        toast.error(result?.error || "Failed to remove flag");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Flag className="h-5 w-5 text-red-600 fill-red-600" />
              {equipment?.status === 'flagged' ? 'Edit Flag' : 'Flag Equipment'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {equipment && `Mark "${equipment.name}" as unavailable for reservations.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="reason" className="font-bold text-slate-700">Reason</Label>
              <Select value={reason} onValueChange={setReason} required>
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Maintenance">Requires Maintenance</SelectItem>
                  <SelectItem value="Broken">Broken</SelectItem>
                  <SelectItem value="Missing">Missing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="font-bold text-slate-700">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Provide additional details about the issue..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] rounded-xl border-slate-200"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center border-t pt-4">
            {equipment?.status === 'flagged' ? (
              <Button
                type="button"
                variant="ghost"
                className="text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-xl px-4"
                onClick={handleRemoveFlag}
                disabled={isSubmitting}
              >
                Remove Flag
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting} className="rounded-xl bg-red-600 hover:bg-red-700 px-6 font-bold text-white">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  equipment?.status === 'flagged' ? 'Update Flag' : 'Flag Equipment'
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
