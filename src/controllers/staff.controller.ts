import { RequestHandler } from "express";
import { z } from "zod";
import * as staffService from "../services/staff.service";

const paramsSchema = z.object({ userId: z.string().uuid() });
const roleSchema = z.object({
  role: z.enum(["member", "reviewer", "admin"]),
  reason: z.string().trim().max(500).optional(),
});

export const changeRole: RequestHandler = async (req, res) => {
  const { userId } = paramsSchema.parse(req.params);
  const { role, reason } = roleSchema.parse(req.body);
  const user = await staffService.changeUserRole(res.locals.userId, userId, role, reason, req.ip);
  res.json({ user });
};