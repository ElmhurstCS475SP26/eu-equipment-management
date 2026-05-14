"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Creates or updates a flag for an item or kit and updates its status to 'flagged'.
 */
export async function createFlagAction(id, type, reason, notes) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const isKit = type === "kit";
    const entityId = parseInt(id, 10);

    // Upsert the flag (ensure only one exists per entity)
    await prisma.flag.upsert({
      where: isKit ? { kitId: entityId } : { itemId: entityId },
      update: {
        reason,
        notes: notes || "",
        resolved: false,
      },
      create: isKit ? {
        kitId: entityId,
        reason,
        notes: notes || "",
        resolved: false,
      } : {
        itemId: entityId,
        reason,
        notes: notes || "",
        resolved: false,
      },
    });

    // Update entity status
    if (isKit) {
      await prisma.kit.update({
        where: { id: entityId },
        data: { status: "flagged" },
      });
    } else {
      await prisma.item.update({
        where: { id: entityId },
        data: { status: "flagged" },
      });
    }

    revalidatePath("/admin", "layout");
    revalidatePath("/catalog");

    return { success: true };
  } catch (error) {
    console.error("Failed to create flag:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Removes a flag and reverts status to 'available'.
 */
export async function removeFlagAction(id, type) {
  try {
    const user = await currentUser();
    if (!user || user.publicMetadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const isKit = type === "kit";
    const entityId = parseInt(id, 10);

    // Delete the flag
    await prisma.flag.delete({
      where: isKit ? { kitId: entityId } : { itemId: entityId },
    }).catch(() => null); // Ignore if not found

    // Revert status
    if (isKit) {
      await prisma.kit.update({
        where: { id: entityId },
        data: { status: "available" },
      });
    } else {
      await prisma.item.update({
        where: { id: entityId },
        data: { status: "available" },
      });
    }

    revalidatePath("/admin", "layout");
    revalidatePath("/catalog");

    return { success: true };
  } catch (error) {
    console.error("Failed to remove flag:", error);
    return { success: false, error: error.message };
  }
}
