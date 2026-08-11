import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactPayload {
  name: string;
  email: string;
  company: string;
  message: string;
}

function isValidPayload(data: unknown): data is ContactPayload {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.name === "string" &&
    d.name.trim().length > 0 &&
    typeof d.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) &&
    typeof d.company === "string" &&
    typeof d.message === "string" &&
    d.message.trim().length > 0
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const CONTACT_INBOX = "info@cykoai.com";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidPayload(body)) {
    return NextResponse.json(
      { ok: false, error: "Please fill in every field with a valid email." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "RESEND_API_KEY is not set — contact form submission was received but not delivered."
    );
    return NextResponse.json(
      { ok: false, error: "Sorry, something went wrong. Please email us directly instead." },
      { status: 500 }
    );
  }

  const { name, email, company, message } = body;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      // Must be a verified sender on your Resend domain — see README for setup.
      from: "Cykoai Website <website@cykoai.com>",
      to: CONTACT_INBOX,
      replyTo: email,
      subject: `New inquiry from ${name}${company ? ` (${company})` : ""}`,
      text: `${message}\n\n—\n${name}\n${company}\n${email}`,
      html: `
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        <hr />
        <p>
          ${escapeHtml(name)}<br />
          ${escapeHtml(company)}<br />
          <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
        </p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { ok: false, error: "Sorry, something went wrong. Please email us directly instead." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return NextResponse.json(
      { ok: false, error: "Sorry, something went wrong. Please email us directly instead." },
      { status: 500 }
    );
  }
}
