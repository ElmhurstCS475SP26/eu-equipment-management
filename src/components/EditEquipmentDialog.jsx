"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export function EditEquipmentDialog({ equipment, open, onOpenChange, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    ...equipment,
    // Map database status back to UI options if needed
    availability: equipment?.availability || (equipment?.status ? equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1) : "Available")
  });
  const [imagePreview, setImagePreview] = useState(equipment?.image || equipment?.imageUrl || "");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (formData) {
      // Ensure we pass both naming conventions to be safe, or just the one the action expects
      await onSave({
        ...formData,
        imageUrl: imagePreview,
        status: formData.availability.toLowerCase()
      });
      // onSave (handleUpdateEquipment in the dashboard) handles closing via setEditingEquipment(null)
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogDescription>
            Update the equipment information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Equipment Image */}
          <div className="space-y-2">
            <Label>Equipment Image</Label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                    onClick={() => setImagePreview("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Equipment Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cameras">Cameras</SelectItem>
                  <SelectItem value="Audio Equipment">Audio Equipment</SelectItem>
                  <SelectItem value="Lighting Equipment">Lighting Equipment</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Computers">Computers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Select
                value={formData.location || "DM Checkout"}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger id="edit-location" className="w-full h-auto min-h-[40px] py-2">
                  <SelectValue placeholder="Select location" className="text-left whitespace-normal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DM Checkout">DM Checkout</SelectItem>
                  <SelectItem value="DM Checkout (second floor of Daniels Hall)">DM Checkout (second floor of Daniels Hall)</SelectItem>
                  <SelectItem value="DM Checkout / DA302">DM Checkout / DA302</SelectItem>
                  <SelectItem value="AR VR Makerspace">AR VR Makerspace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Brand</Label>
              <Input
                id="edit-brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Model</Label>
              <Input
                id="edit-model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Total Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-available">Available Count (Display Only)</Label>
              <Input
                id="edit-available"
                type="number"
                disabled
                value={formData.quantityAvailable}
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={formData.availability}
              onValueChange={(value) => setFormData({ ...formData, availability: value })}
              disabled={equipment?.status === 'flagged'}
            >
              <SelectTrigger id="edit-status" className={equipment?.status === 'flagged' ? "bg-slate-50 cursor-not-allowed" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Checked Out">Checked Out</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
            {equipment?.status === 'flagged' && (
              <p className="text-[10px] text-red-500 font-medium mt-1">Resolve active flag to change status.</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex w-full items-center justify-between sm:justify-between border-t border-gray-100 dark:border-zinc-800 pt-4 mt-2">
          <Button 
            variant="destructive" 
            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300"
            onClick={() => {
              onOpenChange(false);
              if (onDelete) onDelete();
            }}
          >
            Delete Equipment
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
