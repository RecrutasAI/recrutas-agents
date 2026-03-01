import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  const from = opts.from ?? process.env.SDR_FROM_EMAIL ?? 'aba@recrutas.ai';

  if (process.env.SDR_DRY_RUN === 'true') {
    console.log('[dry-run] Would send email:', { to: opts.to, subject: opts.subject, from });
    return;
  }

  await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
