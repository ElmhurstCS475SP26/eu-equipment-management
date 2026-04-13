"use server";

import { prisma } from "@/lib/db";

export async function searchEquipment(query) {
  if (!query || query.trim() === "") return [];
  
  const results = await prisma.item.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: {
      id: true,
      name: true,
      brand: true,
      category: true,
      imageUrl: true,
    }
  });

  return results.map(item => ({
    ...item,
    id: item.id.toString(),
  }));
}
