"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Package, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { equipmentData } from "@/data/mockData";

export default function EquipmentDetails() {
  const { id } = useParams();
  const equipment = equipmentData.find((item) => item.id === id);

  if (!equipment) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Equipment not found</p>
            <Link href="/catalog" className="mt-4">
              <Button variant="outline">Back to Catalog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Link href="/catalog">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Equipment Image */}
        <div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src={equipment.image}
                alt={equipment.name}
                className="w-full h-96 object-cover"
              />
            </CardContent>
          </Card>
        </div>

        {/* Equipment Details */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-3">
              {equipment.category}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{equipment.name}</h1>
            <p className="text-xl text-gray-600 mb-4">
              {equipment.brand} {equipment.model}
            </p>
            <div className="flex items-center gap-4">
              <Badge className={getAvailabilityColor(equipment.availability)}>
                {equipment.availability}
              </Badge>
              <span className="text-sm text-gray-600">
                {equipment.quantityAvailable} of {equipment.quantity} available
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{equipment.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {Object.entries(equipment.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b last:border-0">
                    <dt className="font-medium text-gray-700">{key}</dt>
                    <dd className="text-gray-600">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equipment Condition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{equipment.condition}</p>
            </CardContent>
          </Card>

          {/* Reservation Section */}
          {equipment.availability === "Available" ? (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Reserve This Equipment
                </CardTitle>
                <CardDescription>Select your pickup and return dates</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/checkout/${equipment.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Continue to Reservation
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-yellow-600" />
                  Currently Unavailable
                </CardTitle>
                <CardDescription>
                  This equipment is {equipment.availability.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="secondary" disabled>
                  Not Available for Reservation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Equipment Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Reservation Rules</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Equipment must be picked up during business hours (9 AM - 5 PM)</li>
              <li>Maximum reservation period is 7 days</li>
              <li>Valid student ID required for pickup</li>
              <li>Equipment must be returned in the same condition</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Late Return Policy</h3>
            <p className="text-sm text-gray-600">
              Late returns may result in reservation restrictions. Please contact the Digital Media
              Department if you need to extend your reservation.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Damage Responsibility</h3>
            <p className="text-sm text-gray-600">
              Students are responsible for any damage or loss of equipment during the reservation
              period. Please report any issues immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
