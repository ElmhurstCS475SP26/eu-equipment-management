"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { equipmentData } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function EquipmentCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState([]);

  const categories = Array.from(new Set(equipmentData.map((item) => item.category)));
  const availabilityOptions = ["Available", "Reserved", "Maintenance"];

  const filteredEquipment = equipmentData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(item.category);

    const matchesAvailability =
      selectedAvailability.length === 0 || selectedAvailability.includes(item.availability);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleAvailability = (availability) => {
    setSelectedAvailability((prev) =>
      prev.includes(availability) ? prev.filter((a) => a !== availability) : [...prev, availability]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedAvailability([]);
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "Reserved":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
      case "Maintenance":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "";
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Filters</h3>
          {(selectedCategories.length > 0 || selectedAvailability.length > 0) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-3">Availability</h4>
        <div className="space-y-2">
          {availabilityOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`availability-${option}`}
                checked={selectedAvailability.includes(option)}
                onCheckedChange={() => toggleAvailability(option)}
              />
              <Label htmlFor={`availability-${option}`} className="text-sm font-normal cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Equipment Catalog</h1>
        <p className="text-gray-600">Browse and reserve digital media equipment</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search equipment by name, brand, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Filter */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {(selectedCategories.length + selectedAvailability.length > 0) && (
                <Badge variant="secondary" className="ml-1">
                  {selectedCategories.length + selectedAvailability.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              <FilterContent />
            </CardContent>
          </Card>
        </aside>

        {/* Equipment Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredEquipment.length} {filteredEquipment.length === 1 ? "item" : "items"} found
            </p>
          </div>

          {filteredEquipment.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEquipment.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-48 w-full object-cover"
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-1">{item.name}</CardTitle>
                    <CardDescription className="text-sm mb-3">
                      {item.brand} {item.model}
                    </CardDescription>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className={getAvailabilityColor(item.availability)}>
                        {item.availability}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {item.quantityAvailable}/{item.quantity} available
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/equipment/${item.id}`} className="w-full">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={item.availability !== "Available"}
                      >
                        {item.availability === "Available" ? "View Details" : "Unavailable"}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Filter className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No equipment found</p>
                <p className="text-sm text-gray-400 mb-4">Try adjusting your filters or search query</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
