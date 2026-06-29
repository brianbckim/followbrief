import { prisma } from "../db/prisma";

export async function findSourceItems(input: {
  workspaceId: string;
  query?: string | null;
}) {
  const query = input.query?.trim();
  return prisma.sourceItem.findMany({
    where: {
      workspaceId: input.workspaceId,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" as const } },
              { body: { contains: query, mode: "insensitive" as const } },
              { companyName: { contains: query, mode: "insensitive" as const } },
              { contactName: { contains: query, mode: "insensitive" as const } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: "desc" }
  });
}
