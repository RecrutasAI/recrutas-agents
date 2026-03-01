/**
 * SDR Outreach Agent
 *
 * Reads companies from Supabase that haven't been contacted yet,
 * drafts a personalised email via Claude, and sends it via Resend.
 *
 * Usage:
 *   SDR_DRY_RUN=true npx tsx scripts/run-sdr.ts   # preview emails
 *   npx tsx scripts/run-sdr.ts                     # live send
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chat } from '../../lib/claude.js';
import { sendEmail } from '../../lib/resend.js';
import { supabase } from '../../lib/supabase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = readFileSync(join(__dirname, 'prompt.md'), 'utf8');

interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  open_roles?: string;
  notes?: string;
}

export async function runSDR(limit = 5): Promise<void> {
  // Fetch uncontacted leads from Supabase
  // Replace 'sdr_leads' with your actual table name
  const { data: leads, error } = await supabase
    .from('sdr_leads')
    .select('*')
    .eq('contacted', false)
    .limit(limit);

  if (error) throw new Error(`Failed to fetch leads: ${error.message}`);
  if (!leads || leads.length === 0) {
    console.log('[SDR] No uncontacted leads found');
    return;
  }

  console.log(`[SDR] Processing ${leads.length} leads...`);

  for (const lead of leads as Lead[]) {
    try {
      const userMessage = `
Company: ${lead.company_name}
Contact: ${lead.contact_name}
Open roles: ${lead.open_roles || 'unknown'}
Notes: ${lead.notes || 'none'}

Write a cold outreach email to ${lead.contact_name} at ${lead.company_name}.
      `.trim();

      const raw = await chat(SYSTEM_PROMPT, userMessage, 512);
      const parsed = JSON.parse(raw) as { subject: string; body: string };

      await sendEmail({
        to: lead.contact_email,
        subject: parsed.subject,
        html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${parsed.body}</pre>`,
      });

      // Mark as contacted
      await supabase
        .from('sdr_leads')
        .update({ contacted: true, contacted_at: new Date().toISOString() })
        .eq('id', lead.id);

      console.log(`[SDR] ✓ Sent to ${lead.contact_email} (${lead.company_name})`);
    } catch (err) {
      console.error(`[SDR] ✗ Failed for ${lead.company_name}:`, err);
    }
  }
}
