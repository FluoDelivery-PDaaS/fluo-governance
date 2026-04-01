import prisma from "../../lib/prisma";
import { logger } from "../../lib/logger";
import type { NotificationType } from "@prisma/client";

interface SendNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  sendEmail?: boolean;
}

export async function sendNotification(opts: SendNotificationOptions) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        title: opts.title,
        content: opts.content,
        metadata: opts.metadata as any,
      },
    });

    if (opts.sendEmail) {
      const user = await prisma.user.findUnique({ where: { id: opts.userId } });
      if (user) {
        await sendEmail({
          to: user.email,
          subject: opts.title,
          html: buildEmailHtml(opts.title, opts.content),
        });
        await prisma.notification.update({
          where: { id: notification.id },
          data: { emailSent: true },
        });
      }
    }

    return notification;
  } catch (err) {
    logger.error("Failed to send notification:", err);
  }
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(opts: EmailOptions) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Fluo Governance <noreply@fluodelivery.com>";

  if (!resendKey) {
    logger.warn("RESEND_API_KEY not set — skipping email send");
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    await resend.emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html });
    logger.info(`Email sent to ${opts.to}: ${opts.subject}`);
  } catch (err) {
    logger.error("Email send failed:", err);
  }
}

function buildEmailHtml(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1E3A5F, #0891B2); padding: 24px; }
    .header h1 { color: white; margin: 0; font-size: 20px; }
    .body { padding: 24px; color: #374151; line-height: 1.6; }
    .footer { padding: 16px 24px; background: #f9fafb; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Fluo Governance</h1></div>
    <div class="body">
      <h2>${title}</h2>
      <p>${content}</p>
      <p><a href="${process.env.APP_URL || 'https://app.fluodelivery.com'}" style="background:#0891B2;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Acessar plataforma</a></p>
    </div>
    <div class="footer">Fluo Governance — fluodelivery.com</div>
  </div>
</body>
</html>`;
}
