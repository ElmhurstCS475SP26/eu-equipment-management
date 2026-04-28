"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "./ui/dialog";
import { 
  Plus, X, Box, LayoutGrid, Search, 
  ChevronRight, Info, Package, Upload
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";
import { createKitAction } from "@/app/actions/kitActions";

export function AddKitDialog({ open, onOpenChange, availableEquipment, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    externalId: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [isPickingItems, setIsPickingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const filteredEquipment = availableEquipment.filter(item => 
    !item.kitId && // Only items not already in a kit
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please provide a kit name");
      return;
    }

    const result = await createKitAction({
      ...formData,
      itemIds: selectedItemIds,
      imageUrl: imagePreview
    });

    if (result.success) {
      toast.success("Kit created successfully");
      setFormData({ name: "", externalId: "" });
      setImagePreview("");
      setSelectedItemIds([]);
      onAdd();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to create kit");
    }
  };

  const toggleItem = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[92vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <DialogHeader className="p-10 pb-4 border-b bg-white">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-2">
            <LayoutGrid className="h-4 w-4" />
            Kits &gt; New kit
          </div>
          <DialogTitle className="text-3xl font-extrabold tracking-tight">Create Equipment Kit</DialogTitle>
          <DialogDescription className="text-lg text-slate-500">
            Bundle individual items together into a reusable kit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-50/30">
          {/* Kit Details Section */}
          <div className="grid md:grid-cols-[300px_1fr] gap-16">
            <div className="space-y-4">
              <div className="sticky top-0">
                <h3 className="text-xl font-bold mb-2">Kit details</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Choose a unique name for your kit (e.g. "Main Podcast Kit 01"). 
                  This will be searchable during reservations.
                </p>
                
                <Label className="mb-2 block font-bold">Kit Image</Label>
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
                      <label htmlFor="kit-image-upload" className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                        <Upload className="h-8 w-8 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">Click to upload image</span>
                      </label>
                    )}
                  </div>
                  <input id="kit-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
              <div className="space-y-2">
                <Label className="after:content-['*'] after:ml-0.5 after:text-red-500 font-bold">Name</Label>
                <Input 
                  placeholder="e.g. Camera Kit 001" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-12 text-lg"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="grid md:grid-cols-[300px_1fr] gap-16">
            <div>
              <h3 className="text-xl font-bold mb-2">Items</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Add the specific equipment items that you want to include in this kit.
              </p>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                <div>
                  <h4 className="font-bold text-lg">Equipment</h4>
                  <p className="text-sm text-slate-500">{selectedItemIds.length} items added</p>
                </div>
                <Button 
                   onClick={() => setIsPickingItems(true)}
                   className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
                >
                   Add items
                </Button>
              </div>

              <div className="flex-1">
                {selectedItemIds.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItemIds.map(id => {
                        const item = availableEquipment.find(e => e.id === id);
                        return (
                          <TableRow key={id}>
                            <TableCell><Checkbox checked /></TableCell>
                            <TableCell className="font-bold">{item?.name}</TableCell>
                            <TableCell className="text-slate-500">{item?.location || "N/A"}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" onClick={() => toggleItem(id)}>
                                 <X className="h-4 w-4 text-red-500" />
                               </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                    <div className="h-16 w-14 bg-blue-50 text-blue-300 rounded-xl flex items-center justify-center mb-6">
                        <Box className="h-10 w-10" />
                    </div>
                    <h5 className="text-xl font-bold mb-2">No items</h5>
                    <p className="text-slate-500 mb-8 max-w-xs">There are no items in this kit yet. Click the button below to start adding.</p>
                    <Button 
                        variant="outline" 
                        onClick={() => setIsPickingItems(true)}
                        className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white rounded-xl px-8 border-none"
                    >
                        Add items
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-10 border-t bg-white">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold px-8 h-12">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-12 font-bold h-12">
            Create Kit
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Item Picker Sub-Dialog */}
      <Dialog open={isPickingItems} onOpenChange={setIsPickingItems}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-6 border-b">
                <DialogTitle>Select Items to Add</DialogTitle>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search equipment..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-0">
                <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Category</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEquipment.map(item => (
                            <TableRow 
                                key={item.id} 
                                className="cursor-pointer hover:bg-slate-50"
                                onClick={() => toggleItem(item.id)}
                            >
                                <TableCell>
                                    <Checkbox 
                                        checked={selectedItemIds.includes(item.id)} 
                                        onCheckedChange={() => toggleItem(item.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-bold">{item.name}</TableCell>
                                <TableCell>{item.category}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredEquipment.length === 0 && (
                    <div className="py-20 text-center text-slate-500">
                        No available items found.
                    </div>
                )}
            </div>
            <DialogFooter className="p-4 border-t bg-slate-50">
                <Button onClick={() => setIsPickingItems(false)} className="bg-blue-600 w-full rounded-xl font-bold">
                    Done ({selectedItemIds.length} selected)
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
