import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientCheckout from "./ClientCheckout";

export const dynamic = "force-dynamic";

export default async function ReservationCheckout({ params }) {
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
            <Link href="/catalog" className="mt-4">
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
  };

  return <ClientCheckout equipment={equipment} />;
}
