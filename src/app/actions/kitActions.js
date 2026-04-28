"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new equipment kit.
 */
export async function createKitAction(data) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const kit = await prisma.kit.create({
      data: {
        name: data.name,
        externalId: data.externalId || `KIT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        status: data.status || "available",
      },
    });

    // If items were selected, update them
    if (data.itemIds && data.itemIds.length > 0) {
      await prisma.item.updateMany({
        where: { id: { in: data.itemIds.map(id => parseInt(id, 10)) } },
        data: { kitId: kit.id },
      });
    }

    revalidatePath("/admin");
    return { success: true, kit };
  } catch (error) {
    console.error("Failed to create kit:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates a kit's name or status.
 */
export async function updateKitAction(kitId, data) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const kit = await prisma.kit.update({
      where: { id: kitId },
      data: {
        name: data.name,
        status: data.status,
      },
    });

    revalidatePath("/admin");
    return { success: true, kit };
  } catch (error) {
    console.error("Failed to update kit:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a kit and unlinks its items.
 */
export async function deleteKitAction(kitId) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    // Unlink items first (Prisma handles this via nullable kitId usually, but good to be explicit)
    await prisma.item.updateMany({
      where: { kitId },
      data: { kitId: null },
    });

    await prisma.kit.delete({
      where: { id: kitId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete kit:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Adds or removes items from a kit.
 */
export async function manageKitItemsAction(kitId, itemIds) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    // First unlink everything from this kit
    await prisma.item.updateMany({
      where: { kitId },
      data: { kitId: null },
    });

    // Then link new set
    if (itemIds.length > 0) {
      await prisma.item.updateMany({
        where: { id: { in: itemIds.map(id => parseInt(id, 10)) } },
        data: { kitId: kitId },
      });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to manage kit items:", error);
    return { success: false, error: error.message };
  }
}
