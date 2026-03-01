# recrutas-agents

Claude-powered automation agents for RecrutasAI.

## Agents

### SDR (`agents/sdr/`)
Outbound sales development — identifies companies, drafts personalised outreach emails, and follows up automatically.

- `prompt.md` — system prompt for the SDR agent
- `outreach.ts` — orchestration script (find leads → draft email → send via Resend)
- `templates/` — cold email + follow-up templates

### Screener (`agents/screener/`)
Auto-screens incoming candidate applications against job requirements before human review.

- `prompt.md` — scoring rubric + system prompt
- `screen.ts` — reads new applications from Supabase, scores them, writes results back

### Matcher (`agents/matcher/`)
Enhances the core matching engine with LLM reasoning for edge cases the embedding model misses.

- `prompt.md` — match explanation prompt
- `match.ts` — called when cosine similarity score is in the 0.4–0.6 ambiguous range

## Structure

```
agents/
  sdr/
  screener/
  matcher/
lib/
  claude.ts     # Anthropic SDK wrapper (claude-sonnet-4-6)
  resend.ts     # Email sending
  supabase.ts   # DB client
scripts/
  run-sdr.ts    # Manual SDR trigger
.github/
  workflows/
    sdr-weekly.yml      # Every Monday 9am UTC
    screen-on-push.yml  # Trigger on new application (webhook)
```

## Setup

```bash
npm install
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

## Running locally

```bash
npx tsx scripts/run-sdr.ts          # Run SDR agent
npx tsx scripts/run-screener.ts     # Screen pending applications
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key |
| `RESEND_API_KEY` | Email sending |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SDR_FROM_EMAIL` | Sender email (e.g. aba@recrutas.ai) |
| `SDR_DRY_RUN` | Set to `true` to skip sending emails |
