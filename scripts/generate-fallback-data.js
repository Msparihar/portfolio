#!/usr/bin/env node
/**
 * Generate Fallback GitHub Data Script
 * Fetches current GitHub contributions and saves as static fallback
 * Run this before build to ensure fresh fallback data
 */

import { saveFallbackData } from '../src/lib/githubContributions.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const portfolioData = JSON.parse(
  readFileSync(join(__dirname, '../src/config/portfolio.json'), 'utf8')
);

async function main() {
  console.log('🚀 Generating fallback GitHub data...\n');

  const username = portfolioData.githubUsername || 'Msparihar';
  console.log(`👤 Fetching data for: ${username}`);

  const success = await saveFallbackData(username);

  if (success) {
    console.log('\n✅ Fallback data generated successfully!');
    console.log('📁 Location: public/fallback-github-data.json');
    process.exit(0);
  } else {
    console.error('\n❌ Failed to generate fallback data');
    console.error('⚠️  Build will continue, but fallback may be unavailable');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});