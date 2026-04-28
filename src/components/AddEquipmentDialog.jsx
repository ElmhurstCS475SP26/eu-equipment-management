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
import { Upload, X, Plus, ChevronDown, ChevronUp, Package, Info, Database } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { createItemAction } from "@/app/actions/itemActions";

const CATEGORIES = [
  "Cameras",
  "Lenses",
  "Audio Equipment",
  "Lighting Equipment",
  "Tripods and Stabilizers",
  "Accessories",
  "Drones",
  "Editing Equipment",
  "Monitors",
  "Storage Devices",
];

export function AddEquipmentDialog({ open, onOpenChange, onAdd }) {
  const [imagePreview, setImagePreview] = useState("");
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [categories, setCategories] = useState(CATEGORIES);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    category: "",
    location: "DM Checkout (second floor of Daniels Hall)",
    quantity: "1",
    description: "",
    kind: "individual",
    barcode: ""
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) {
      toast.error("Please fill in required fields (Name, Category)");
      return;
    }

    const result = await createItemAction({
      ...formData,
      imageUrl: imagePreview // Simple base64 for now or placeholder
    });

    if (result.success) {
      onAdd();
      toast.success("Equipment added successfully");
      setImagePreview("");
      setFormData({
        name: "", brand: "", model: "", category: "", 
        location: "DM Checkout (second floor of Daniels Hall)", quantity: "1", description: "",
        kind: "individual", barcode: ""
      });
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to add equipment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[92vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <DialogHeader className="p-10 pb-4 border-b bg-white">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-2">
            <Package className="h-4 w-4" />
            Items &gt; New item
          </div>
          <DialogTitle className="text-3xl font-extrabold tracking-tight">Add Equipment</DialogTitle>
          <DialogDescription className="text-lg text-slate-500">
            Create a new asset in your global inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-50/30">
          <div className="grid md:grid-cols-[300px_1fr] gap-16">
            {/* Sidebar / Info */}
            <div className="space-y-4">
              <div className="sticky top-0">
                <h3 className="font-bold text-lg mb-2">Item details</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Provide a clear name, category, and storage location for this equipment.
                </p>
                
                <div className="mt-8">
                  <Label className="mb-2 block">Item Image</Label>
                  <div className="relative group">
                    <div className={`h-48 w-full rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${imagePreview ? 'border-transparent' : 'border-slate-200 hover:border-blue-400 bg-slate-50'}`}>
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                          <Button 
                            size="icon" 
                            variant="destructive" 
                            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setImagePreview("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                          <Upload className="h-8 w-8 text-slate-400" />
                          <span className="text-xs text-slate-500 font-medium">Click to upload image</span>
                        </label>
                      )}
                    </div>
                    <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Brand & Model */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input 
                    placeholder="e.g. Sony" 
                    className="bg-white"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input 
                    placeholder="e.g. Alpha 7 IV" 
                    className="bg-white"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Name</Label>
                <Input 
                  placeholder="e.g. Main Studio Camera" 
                  className="bg-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Category</Label>
                  <Select onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Location</Label>
                  <div className="bg-slate-100 p-2.5 rounded-md border text-sm text-slate-600 font-medium">
                    DM Checkout (second floor of Daniels Hall)
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                   type="number" 
                   value={formData.quantity} 
                   onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                   className="bg-white max-w-[200px]"
                />
              </div>

              {/* Advanced info toggle */}
              <div className="pt-4 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                  onClick={() => setShowMoreInfo(!showMoreInfo)}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <Info className="h-4 w-4" />
                    {showMoreInfo ? "Hide" : "Add"} more item info
                  </div>
                  {showMoreInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {showMoreInfo && (
                  <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        placeholder="Additional details about this item..." 
                        className="bg-white"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Individual checkbox logic section */}
              <div className="pt-6">
                 <h4 className="font-bold mb-4">Tracking Method</h4>
                 <RadioGroup defaultValue="individual" onValueChange={(v) => setFormData({...formData, kind: v})}>
                    <div className="flex items-start gap-3 p-4 rounded-xl border bg-slate-50/50">
                        <RadioGroupItem value="individual" id="r-ind" className="mt-1" />
                        <div className="grid gap-1">
                            <Label htmlFor="r-ind" className="text-base font-bold cursor-pointer">As individual items</Label>
                            <p className="text-sm text-slate-500">Recommended for unique, high-cost items (cameras, lenses).</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border mt-3">
                        <RadioGroupItem value="bulk" id="r-bulk" className="mt-1" />
                        <div className="grid gap-1">
                            <Label htmlFor="r-bulk" className="text-base font-bold cursor-pointer">As a bulk resource</Label>
                            <p className="text-sm text-slate-500">For items where individual tracking isn't needed (cables, memory cards).</p>
                        </div>
                    </div>
                 </RadioGroup>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-slate-50/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 font-bold">
                Add item
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
