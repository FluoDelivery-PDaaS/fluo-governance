import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Contact form endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, company, position, message } = req.body;

    if (!name || !email || !company || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return res.status(500).json({ error: "Email service not configured" });
    }

    const emailBody = `
<h2>Novo Lead - Fluo Delivery</h2>
<p><strong>Nome:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Empresa:</strong> ${company}</p>
<p><strong>Cargo:</strong> ${position || "Não informado"}</p>
<hr/>
<p><strong>Mensagem:</strong></p>
<p>${message.replace(/\n/g, "<br/>")}</p>
<hr/>
<p><em>Enviado via formulário do site fluodelivery.com</em></p>
    `.trim();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fluo Delivery <contato@fluodelivery.com>",
        to: ["anna@fluodelivery.com", "contato@fluodelivery.com"],
        reply_to: email,
        subject: `Novo Lead: ${name} - ${company}`,
        html: emailBody,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend error:", errorData);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "fluo-landing" });
});

// Serve static files from Vite build
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Fluo Landing running on http://localhost:${PORT}`);
});
