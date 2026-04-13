import { prisma } from "@/lib/db";
import CatalogClient from "@/app/catalog/CatalogClient";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;

  if (role !== "admin") {
    // Only admins can view the inventory management page.
    redirect("/dashboard");
  }

  const items = await prisma.item.findMany();

  const equipmentData = items.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    category: item.category,
    brand: item.brand || "",
    model: item.model || "",
    image: item.imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1080&auto=format&fit=crop",
    availability: item.status === "available" ? "Available" : item.status === "checked_out" ? "Reserved" : "Maintenance",
    description: item.description || "",
    quantity: item.quantity || 1,
    quantityAvailable: item.status === "available" ? (item.quantity || 1) : 0,
    condition: "Good"
  }));

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-gray-600">Admin view of all digital media equipment</p>
      </div>
      <div className="-mt-14">
        {/* We reuse the Catalog client but it links to /inventory */}
        <CatalogClient initialEquipment={equipmentData} linkPrefix="/inventory" />
      </div>
    </div>
  );
}