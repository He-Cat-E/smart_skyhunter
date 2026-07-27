/*
  Sends the verification code. Uses Resend's HTTP API when RESEND_API_KEY is set
  (no npm dependency needed — just fetch). With no provider configured, it falls
  back to logging the code to the server console so the flow works in dev.

  provider "none" tells the caller we're in dev mode (safe to surface the code
  locally for testing); "resend" with sent:false means a real send failed.
*/
export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string,
): Promise<{ sent: boolean; provider: "resend" | "none" }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "SkyHunter <onboarding@resend.dev>";
  const subject = "Your SkyHunter verification code";

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          text: `Hi ${name || "there"},\n\nYour SkyHunter verification code is ${code}.\nIt expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
          html: emailHtml(name, code),
        }),
      });
      if (!res.ok) {
        throw new Error(`Resend ${res.status}: ${await res.text()}`);
      }
      return { sent: true, provider: "resend" };
    } catch (err) {
      console.error("[email] verification send failed:", err);
      return { sent: false, provider: "resend" };
    }
  }

  console.warn(
    `\n[email] No email provider configured (set RESEND_API_KEY to send real emails).\n` +
      `[email] Verification code for ${to}: ${code}\n`,
  );
  return { sent: false, provider: "none" };
}

function emailHtml(name: string, code: string): string {
  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1c1d1f">
    <p style="font-size:20px;font-weight:700;margin:0 0 4px">SkyHunter</p>
    <p style="color:#6a6f73;margin:0 0 24px">Build · Innovate · Elevate</p>
    <p>Hi ${name || "there"},</p>
    <p>Use this code to finish creating your account:</p>
    <div style="font-size:34px;font-weight:700;letter-spacing:10px;background:#f2effc;color:#6d28d9;text-align:center;padding:18px;border-radius:12px;margin:16px 0">${code}</div>
    <p style="color:#6a6f73;font-size:14px">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
  </div>`;
}
