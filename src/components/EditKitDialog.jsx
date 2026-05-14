"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { updateKitAction } from "@/app/actions/kitActions";

export function EditKitDialog({ open, onOpenChange, kit, availableEquipment, onSave }) {
  const [formData, setFormData] = useState({
    id: kit?.id,
    name: kit?.name || "",
    externalId: kit?.externalId || "",
    status: kit?.status || "available",
    imageUrl: kit?.image || kit?.imageUrl || "",
  });
  const [imagePreview, setImagePreview] = useState(kit?.image || kit?.imageUrl || "");
  const [selectedItemIds, setSelectedItemIds] = useState(kit?.items?.map(i => i.id) || []);
  const [isPickingItems, setIsPickingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (kit) {
      setFormData({
        id: kit.id,
        name: kit.name,
        externalId: kit.externalId || "",
        status: kit.status,
        imageUrl: kit.image || kit.imageUrl || "",
      });
      setImagePreview(kit.image || kit.imageUrl || "");
      setSelectedItemIds(kit.items?.map(i => i.id) || []);
    }
  }, [kit]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredEquipment = availableEquipment.filter(item =>
    (!item.kitId || selectedItemIds.includes(item.id)) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please provide a kit name");
      return;
    }

    if (selectedItemIds.length < 1) {
      toast.error("A kit must contain at least 1 item");
      return;
    }

    const result = await updateKitAction(formData.id, {
      ...formData,
      itemIds: selectedItemIds,
    });

    if (result.success) {
      toast.success("Kit updated successfully");
      onSave();
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to update kit");
    }
  };

  const toggleItem = (id) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!kit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[92vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
        <DialogHeader className="p-10 pb-4 border-b bg-white">
          <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-2">
            <LayoutGrid className="h-4 w-4" />
            Kits &gt; Edit kit
          </div>
          <DialogTitle className="text-3xl font-extrabold tracking-tight">Edit Equipment Kit</DialogTitle>
          <DialogDescription className="text-lg text-slate-500">
            Modify kit name, status, and contents.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-50/30">
          <div className="grid md:grid-cols-[300px_1fr] gap-16">
            <div className="space-y-4">
              <div className="sticky top-0">
                <h3 className="text-xl font-bold mb-2">Kit details</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Modify the kit's image, name, and current status.
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
                          onClick={() => {
                            setImagePreview("");
                            setFormData({ ...formData, imageUrl: "" });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <label htmlFor="edit-kit-image-upload" className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                        <Upload className="h-8 w-8 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium">Click to upload image</span>
                      </label>
                    )}
                  </div>
                  <input id="edit-kit-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6 flex-1 h-fit">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Kit Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                    disabled={kit?.status === 'flagged'}
                  >
                    <SelectTrigger className={`h-12 rounded-xl ${kit?.status === 'flagged' ? 'bg-slate-50 cursor-not-allowed' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="incomplete">Incomplete</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                    </SelectContent>
                  </Select>
                  {kit?.status === 'flagged' && (
                    <p className="text-[10px] text-red-500 font-medium px-1">Remove active flag to change status.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[300px_1fr] gap-16">
            <div>
              <h3 className="text-xl font-bold mb-2">Items</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Add or remove equipment items from this kit.
              </p>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col min-h-[400px]">
              <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                <div>
                  <h4 className="font-bold text-lg">Equipment</h4>
                  <p className="text-sm text-slate-500">{selectedItemIds.length} items (min. 1 required)</p>
                </div>
                <Button
                  onClick={() => setIsPickingItems(true)}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
                >
                  Modify Items
                </Button>
              </div>

              <div className="flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItemIds.map(id => {
                      // Try to find in available equipment or in kit's own items
                      const item = availableEquipment.find(e => e.id === id) || kit.items.find(e => e.id === id);
                      return (
                        <TableRow key={id}>
                          <TableCell className="font-bold">{item?.name}</TableCell>
                          <TableCell className="text-slate-500">{item?.category || "N/A"}</TableCell>
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
              </div>
          </div>
        </div>
      </div>

        <DialogFooter className="p-10 border-t bg-white">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold px-8 h-12">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-12 font-bold h-12">
              Save Changes
            </Button>
          </DialogFooter>
      </DialogContent>

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
          <div className="flex-1 overflow-y-auto">
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
