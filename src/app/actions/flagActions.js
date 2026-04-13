"use server";

import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a flag for an item and updates its status to 'flagged'.
 */
export async function createFlagAction(itemId, reason, notes) {
  try {
    const user = await currentUser();
    // In our system, the role is checked via metadata or is assumed admin for these calls
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Create the flag
    await prisma.flag.create({
      data: {
        itemId: parseInt(itemId, 10),
        reason,
        notes: notes || "",
        resolved: false,
      },
    });

    // Update item status
    await prisma.item.update({
      where: { id: parseInt(itemId, 10) },
      data: { status: "flagged" },
    });

    revalidatePath("/admin");
    revalidatePath("/catalog");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to create flag:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Resolves a flag and reverts item status to 'available'.
 */
export async function resolveFlagAction(flagId, itemId) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Resolve the specific flag
    await prisma.flag.update({
      where: { id: parseInt(flagId, 10) },
      data: { resolved: true },
    });

    // Check if there are any other active flags for this item
    const activeFlags = await prisma.flag.count({
      where: { 
        itemId: parseInt(itemId, 10),
        resolved: false
      }
    });

    // If no more active flags, revert status to available
    if (activeFlags === 0) {
      await prisma.item.update({
        where: { id: parseInt(itemId, 10) },
        data: { status: "available" },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/catalog");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to resolve flag:", error);
    return { success: false, error: error.message };
  }
}
