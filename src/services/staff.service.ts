import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

type Role = "member" | "reviewer" | "admin";

export async function changeUserRole(
  actorId: string,
  targetUserId: string,
  newRole: Role,
  reason?: string,
  ip?: string
) {
  // Blocks the case where the last admin demotes themselves and nobody can fix it
  if (actorId === targetUserId) {
    throw new AppError(400, "You cannot change your own role");
  }

  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { id: targetUserId } });
    if (!target || target.deletedAt) throw new AppError(404, "User not found");
    if (target.role === newRole) throw new AppError(400, `User is already ${newRole}`);

    const updated = await tx.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, email: true, username: true, role: true },
    });

    await tx.staffAuditLog.create({
      data: {
        actorId,
        action: "change_role",
        targetType: "user",
        targetId: targetUserId,
        reason,
        metadata: { from: target.role, to: newRole },
        ipAddress: ip,
      },
    });

    return updated;
  });
}