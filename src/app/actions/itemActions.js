"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createItemAction(data) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const item = await prisma.item.create({
      data: {
        name: data.name,
        brand: data.brand,
        model: data.model,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        quantity: parseInt(data.quantity, 10) || 1,
        status: "available",
        kind: data.kind || "individual",
        barcode: data.barcode,
        location: data.location || "DM Checkout",
      },
    });

    revalidatePath("/admin");
    revalidatePath("/catalog");
    return { success: true, item };
  } catch (error) {
    console.error("Failed to create item:", error);
    return { success: false, error: error.message };
  }
}

export async function updateItemAction(id, data) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const item = await prisma.item.update({
      where: { id: parseInt(id, 10) },
      data: {
        name: data.name,
        brand: data.brand,
        model: data.model,
        category: data.category,
        description: data.description,
        imageUrl: data.imageUrl,
        quantity: parseInt(data.quantity, 10),
        status: data.status,
        kind: data.kind,
        barcode: data.barcode,
        location: data.location,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/catalog");
    return { success: true, item };
  } catch (error) {
    console.error("Failed to update item:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteItemAction(id) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.item.delete({
      where: { id: parseInt(id, 10) },
    });

    revalidatePath("/admin");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete item:", error);
    return { success: false, error: error.message };
  }
}
