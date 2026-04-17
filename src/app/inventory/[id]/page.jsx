import Link from "next/link";
import { ArrowLeft, Calendar, Package, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EquipmentDetails({ params }) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;

  if (role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;

  let dbItem;
  try {
    dbItem = await prisma.item.findUnique({
      where: { id: parseInt(id, 10) },
    });
  } catch (error) {
    dbItem = null;
  }

  if (!dbItem) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Equipment not found</p>
            <Link href="/inventory" className="mt-4">
              <Button variant="outline">Back to Catalog</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const equipment = {
    id: dbItem.id.toString(),
    name: dbItem.name,
    category: dbItem.category,
    brand: dbItem.brand || "",
    model: dbItem.model || "",
    image: dbItem.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
    availability: dbItem.status === "available" ? "Available" : dbItem.status === "checked_out" ? "Reserved" : "Maintenance",
    description: dbItem.description || "",
    quantity: dbItem.quantity || 1,
    quantityAvailable: dbItem.status === "available" ? (dbItem.quantity || 1) : 0,
    condition: "Good",
    specifications: {
      "Barcode": dbItem.barcode || "N/A",
      "Location": dbItem.location || "N/A",
    }
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

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Link href="/inventory">
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

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-purple-600" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" variant="solid">Edit Item</Button>
                <Button className="flex-1" variant="outline">View History</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
