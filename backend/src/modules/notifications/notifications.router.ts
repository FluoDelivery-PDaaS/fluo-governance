import { Router } from "express";
import prisma from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

// GET /api/notifications
notificationsRouter.get("/", async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  } catch (err) { next(err); }
});

// PATCH /api/notifications/:id/read
notificationsRouter.patch("/:id/read", async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });
    res.json(notification);
  } catch (err) { next(err); }
});

// PATCH /api/notifications/read-all
notificationsRouter.patch("/read-all", async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ message: "All notifications marked as read." });
  } catch (err) { next(err); }
});
