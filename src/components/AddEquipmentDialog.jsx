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
import { Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";

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

const BRANDS = [
  "Canon",
  "Sony",
  "Nikon",
  "Panasonic",
  "Rode",
  "Zoom",
  "DJI",
  "Aputure",
  "Shure",
  "Blackmagic",
  "Manfrotto",
  "Sigma",
  "Tamron",
  "Sennheiser",
];

export function AddEquipmentDialog({ open, onOpenChange, onAdd }) {
  const [imagePreview, setImagePreview] = useState("");
  const [categories, setCategories] = useState(CATEGORIES);
  const [brands, setBrands] = useState(BRANDS);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newBrand, setNewBrand] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      toast.success(`Category "${newCategory}" added`);
      setNewCategory("");
      setShowNewCategory(false);
    }
  };

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      setBrands([...brands, newBrand.trim()]);
      toast.success(`Brand "${newBrand}" added`);
      setNewBrand("");
      setShowNewBrand(false);
    }
  };

  const handleSave = () => {
    onAdd();
    setImagePreview("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
          <DialogDescription>
            Enter the details of the new equipment
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
                <label htmlFor="image-upload-add" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 transition-colors">
                    <Upload className="h-5 w-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {imagePreview ? "Change Image" : "Upload Image"}
                      </p>
                      <p className="text-xs text-gray-400">Drag & drop or click to upload</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                  <input
                    id="image-upload-add"
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
              <Label htmlFor="add-name">Equipment Name</Label>
              <Input id="add-name" placeholder="Canon EOS R5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-category">Category</Label>
              {!showNewCategory ? (
                <Select>
                  <SelectTrigger id="add-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new__">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Plus className="h-4 w-4" />
                        Add New Category
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory} size="sm">Add</Button>
                  <Button onClick={() => setShowNewCategory(false)} size="sm" variant="outline">Cancel</Button>
                </div>
              )}
              {!showNewCategory && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600"
                  onClick={() => setShowNewCategory(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Category
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-brand">Brand</Label>
              {!showNewBrand ? (
                <Select>
                  <SelectTrigger id="add-brand">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add_new__">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Plus className="h-4 w-4" />
                        Add New Brand
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter new brand"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddBrand()}
                  />
                  <Button onClick={handleAddBrand} size="sm">Add</Button>
                  <Button onClick={() => setShowNewBrand(false)} size="sm" variant="outline">Cancel</Button>
                </div>
              )}
              {!showNewBrand && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600"
                  onClick={() => setShowNewBrand(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Brand
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-model">Model</Label>
              <Input id="add-model" placeholder="EOS R5" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-description">Description</Label>
            <Textarea
              id="add-description"
              placeholder="Professional full-frame mirrorless camera with 45MP sensor..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-quantity">Total Quantity</Label>
              <Input id="add-quantity" type="number" placeholder="1" min="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-available">Available Count</Label>
              <Input id="add-available" type="number" placeholder="1" min="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-condition">Condition</Label>
              <Select>
                <SelectTrigger id="add-condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <Select defaultValue="Available">
                <SelectTrigger id="add-status">
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
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Add Equipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
