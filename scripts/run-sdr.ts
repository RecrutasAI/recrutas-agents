import 'dotenv/config';
import { runSDR } from '../agents/sdr/outreach.js';

const limit = parseInt(process.env.SDR_BATCH_SIZE ?? '5');
console.log(`[run-sdr] Starting SDR agent (batch: ${limit}, dry-run: ${process.env.SDR_DRY_RUN ?? 'false'})`);

runSDR(limit)
  .then(() => console.log('[run-sdr] Done'))
  .catch(err => { console.error('[run-sdr] Fatal:', err); process.exit(1); });
