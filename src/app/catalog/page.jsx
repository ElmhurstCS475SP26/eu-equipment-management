import { prisma } from "@/lib/db";
import CatalogClient from "./CatalogClient";

// Opt out of static side generation for up-to-date DB fetches
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const items = await prisma.item.findMany();
  
  // Transform Prisma DB records to the format expected by the frontend
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

  return <CatalogClient initialEquipment={equipmentData} />;
}
