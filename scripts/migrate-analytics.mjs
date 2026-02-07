/**
 * Migrate analytics data from Supabase to self-hosted PostgreSQL.
 *
 * Usage: node scripts/migrate-analytics.mjs
 *
 * Prerequisites: pnpm add -D pg
 */

import pg from "pg";

const OLD_URL =
  "postgresql://postgres.frulheyezwzijrejiflr:manishsparihar_4692@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
const NEW_URL =
  "postgresql://portfolio:%2Amsparihar@72.60.96.109:5435/portfolio";

const TABLES = ["Visitor", "Session", "PageView", "Event"];

// Column lists per table (order matters for COPY-style insert)
const COLUMNS = {
  Visitor: [
    "id",
    "fingerprint",
    "firstSeenAt",
    "lastSeenAt",
    "country",
    "city",
    "region",
    "device",
    "browser",
    "os",
  ],
  Session: [
    "id",
    "visitorId",
    "startedAt",
    "endedAt",
    "referrer",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "entryPage",
    "exitPage",
  ],
  PageView: [
    "id",
    "visitorId",
    "sessionId",
    "path",
    "title",
    "viewedAt",
    "duration",
    "scrollDepth",
  ],
  Event: [
    "id",
    "visitorId",
    "sessionId",
    "name",
    "category",
    "properties",
    "createdAt",
  ],
};

function quoted(col) {
  return `"${col}"`;
}

async function main() {
  const oldClient = new pg.Client({ connectionString: OLD_URL });
  const newClient = new pg.Client({ connectionString: NEW_URL });

  try {
    console.log("Connecting to source (Supabase)...");
    await oldClient.connect();
    console.log("Connected to source.");

    console.log("Connecting to target (self-hosted)...");
    await newClient.connect();
    console.log("Connected to target.\n");

    // Ensure the analytics schema exists on the new DB
    await newClient.query(`CREATE SCHEMA IF NOT EXISTS analytics`);
    console.log('Ensured "analytics" schema exists on target.\n');

    // Create tables on the new DB if they don't exist
    await createTables(newClient);

    // Migrate each table in FK-safe order (parents first)
    for (const table of TABLES) {
      await migrateTable(oldClient, newClient, table);
    }

    console.log("\nMigration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await oldClient.end();
    await newClient.end();
  }
}

async function createTables(client) {
  console.log("Creating tables on target (if not exist)...");

  await client.query(`
    CREATE TABLE IF NOT EXISTS analytics."Visitor" (
      "id"          TEXT PRIMARY KEY,
      "fingerprint" TEXT UNIQUE NOT NULL,
      "firstSeenAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "lastSeenAt"  TIMESTAMPTZ NOT NULL,
      "country"     TEXT,
      "city"        TEXT,
      "region"      TEXT,
      "device"      TEXT,
      "browser"     TEXT,
      "os"          TEXT
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS analytics."Session" (
      "id"          TEXT PRIMARY KEY,
      "visitorId"   TEXT NOT NULL REFERENCES analytics."Visitor"("id") ON DELETE CASCADE,
      "startedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
      "endedAt"     TIMESTAMPTZ,
      "referrer"    TEXT,
      "utmSource"   TEXT,
      "utmMedium"   TEXT,
      "utmCampaign" TEXT,
      "entryPage"   TEXT,
      "exitPage"    TEXT
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS analytics."PageView" (
      "id"          TEXT PRIMARY KEY,
      "visitorId"   TEXT NOT NULL REFERENCES analytics."Visitor"("id") ON DELETE CASCADE,
      "sessionId"   TEXT NOT NULL REFERENCES analytics."Session"("id") ON DELETE CASCADE,
      "path"        TEXT NOT NULL,
      "title"       TEXT,
      "viewedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
      "duration"    INTEGER,
      "scrollDepth" INTEGER
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS analytics."Event" (
      "id"         TEXT PRIMARY KEY,
      "visitorId"  TEXT NOT NULL REFERENCES analytics."Visitor"("id") ON DELETE CASCADE,
      "sessionId"  TEXT NOT NULL REFERENCES analytics."Session"("id") ON DELETE CASCADE,
      "name"       TEXT NOT NULL,
      "category"   TEXT,
      "properties" JSONB,
      "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // Create indexes matching the Prisma schema
  const indexes = [
    `CREATE INDEX IF NOT EXISTS "Visitor_firstSeenAt_idx" ON analytics."Visitor"("firstSeenAt")`,
    `CREATE INDEX IF NOT EXISTS "Visitor_country_idx"     ON analytics."Visitor"("country")`,
    `CREATE INDEX IF NOT EXISTS "Session_visitorId_idx"   ON analytics."Session"("visitorId")`,
    `CREATE INDEX IF NOT EXISTS "Session_startedAt_idx"   ON analytics."Session"("startedAt")`,
    `CREATE INDEX IF NOT EXISTS "Session_referrer_idx"    ON analytics."Session"("referrer")`,
    `CREATE INDEX IF NOT EXISTS "PageView_visitorId_idx"  ON analytics."PageView"("visitorId")`,
    `CREATE INDEX IF NOT EXISTS "PageView_sessionId_idx"  ON analytics."PageView"("sessionId")`,
    `CREATE INDEX IF NOT EXISTS "PageView_path_idx"       ON analytics."PageView"("path")`,
    `CREATE INDEX IF NOT EXISTS "PageView_viewedAt_idx"   ON analytics."PageView"("viewedAt")`,
    `CREATE INDEX IF NOT EXISTS "Event_visitorId_idx"     ON analytics."Event"("visitorId")`,
    `CREATE INDEX IF NOT EXISTS "Event_sessionId_idx"     ON analytics."Event"("sessionId")`,
    `CREATE INDEX IF NOT EXISTS "Event_name_idx"          ON analytics."Event"("name")`,
    `CREATE INDEX IF NOT EXISTS "Event_createdAt_idx"     ON analytics."Event"("createdAt")`,
  ];

  for (const idx of indexes) {
    await client.query(idx);
  }

  console.log("Tables and indexes ready.\n");
}

async function migrateTable(oldClient, newClient, table) {
  const cols = COLUMNS[table];
  const colList = cols.map(quoted).join(", ");

  // Read all rows from source
  const { rows } = await oldClient.query(
    `SELECT ${colList} FROM analytics."${table}" ORDER BY 1`
  );

  console.log(`${table}: ${rows.length} rows found in source.`);

  if (rows.length === 0) return;

  // Batch insert into target using ON CONFLICT DO NOTHING (safe to re-run)
  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    // Build parameterized query
    const valueClauses = [];
    const params = [];
    let paramIdx = 1;

    for (const row of batch) {
      const placeholders = cols.map(() => `$${paramIdx++}`);
      valueClauses.push(`(${placeholders.join(", ")})`);
      for (const col of cols) {
        const val = row[col];
        // Serialize JSON/JSONB fields
        params.push(
          val !== null && typeof val === "object" && !(val instanceof Date)
            ? JSON.stringify(val)
            : val
        );
      }
    }

    await newClient.query(
      `INSERT INTO analytics."${table}" (${colList})
       VALUES ${valueClauses.join(", ")}
       ON CONFLICT ("id") DO NOTHING`,
      params
    );

    inserted += batch.length;
    if (rows.length > batchSize) {
      process.stdout.write(`  ${table}: ${inserted}/${rows.length} inserted\r`);
    }
  }

  console.log(`  ${table}: ${inserted} rows migrated.`);
}

main();
