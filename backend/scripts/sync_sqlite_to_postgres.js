#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const chalk = require('chalk');

const SQLITE_FILE = process.env.DB_FILE || path.join(__dirname, '..', 'db.sqlite');
const PG_HOST = process.env.POSTGRES_HOST || 'localhost';
const PG_PORT = process.env.POSTGRES_PORT || 5432;
const PG_DB = process.env.POSTGRES_DB || 'ibague_digital';
const PG_USER = process.env.POSTGRES_USER || 'postgres';
const PG_PASS = process.env.POSTGRES_PASSWORD || 'admin';
const SYNC_INTERVAL = parseInt(process.env.SYNC_INTERVAL || '60000', 10);

const args = process.argv.slice(2);
const once = args.includes('--once');
const intervalArg = args.find(a => a.startsWith('--interval='));
if (intervalArg) {
  const iv = parseInt(intervalArg.split('=')[1],10);
  if (!isNaN(iv)) { global.SYNC_INTERVAL_OVERRIDE = iv; }
}

const logFile = path.join(__dirname, '..', 'sync.log');

function log(msg) {
  const ts = new Date().toISOString();
  fs.appendFileSync(logFile, `[${ts}] ${msg}\n`);
}

function pgClient() {
  return new Client({
    host: PG_HOST, port: PG_PORT, database: PG_DB, user: PG_USER, password: PG_PASS
  });
}

function sqliteAllTables(db) {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';", (err, rows) => {
      if (err) return reject(err);
      resolve(rows.map(r => r.name));
    });
  });
}

function sqliteTableInfo(db, table) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table});`, (err, rows) => {
      if (err) return reject(err);
      resolve(rows); // each row: cid, name, type, notnull, dflt_value, pk
    });
  });
}

function sqliteAllRows(db, table) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM "${table}";`, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function ensurePgTable(client, table, columns) {
  // Build CREATE TABLE IF NOT EXISTS with columns mapped to Postgres types
  const colsDefs = columns.map(c => {
    // Map basic types
    const name = c.name;
    let type = (c.type || '').toUpperCase();
    if (!type) type = 'TEXT';
    if (type.includes('INT')) type = 'INTEGER';
    else if (type.includes('CHAR') || type.includes('CLOB') || type.includes('TEXT')) type = 'TEXT';
    else if (type.includes('REAL') || type.includes('FLOA') || type.includes('DOUB')) type = 'REAL';
    else type = 'TEXT';
    // Use name as-is (quote)
    return `"\${name}" ${type}`;
  });
  const createSQL = `CREATE TABLE IF NOT EXISTS "\${table}" (
  ${colsDefs.join(',\n  ')}
);`;
  // Replace placeholders
  const sql = createSQL.replace(/\\${table}/g, table).replace(/\\${name}/g, '${name}');
  // But we need to construct properly with actual names:
  const defs = columns.map(c => {
    let name = c.name.replace(/"/g,'""');
    let type = (c.type || '').toUpperCase();
    if (!type) type = 'TEXT';
    if (type.includes('INT')) type = 'INTEGER';
    else if (type.includes('CHAR') || type.includes('CLOB') || type.includes('TEXT')) type = 'TEXT';
    else if (type.includes('REAL') || type.includes('FLOA') || type.includes('DOUB')) type = 'REAL';
    else type = 'TEXT';
    return `"\${name}" ${type}`.replace(/\\${name}/g, name);
  });
  const finalSQL = `CREATE TABLE IF NOT EXISTS "${table}" (
  ${defs.join(',\n  ')}
);`;
  await client.query(finalSQL);
}

function rowKey(row) {
  // Construct a deterministic key from row values to compare presence
  // Prefer 'id' column if exists
  if ('id' in row) return String(row.id);
  // Else use JSON of all values
  return JSON.stringify(row);
}

async function syncOnce() {
  console.log(chalk.blue('[SYNC] Starting synchronization cycle...'));
  log('[SYNC] Starting synchronization cycle...');
  const sqliteDb = new sqlite3.Database(SQLITE_FILE);
  const tables = await sqliteAllTables(sqliteDb);
  const client = pgClient();
  try {
    await client.connect();
  } catch (e) {
    console.log(chalk.red('[SYNC] Cannot connect to PostgreSQL:', e.message));
    log('[ERROR] Cannot connect to PostgreSQL: ' + e.message);
    sqliteDb.close();
    return {error: true};
  }

  let totalInserted = 0;
  let totalDeleted = 0;

  for (const table of tables) {
    try {
      const cols = await sqliteTableInfo(sqliteDb, table);
      if (!cols || cols.length===0) continue;
      // Ensure table exists in PG
      await ensurePgTable(client, table, cols);
      // Read all rows from sqlite
      const srows = await sqliteAllRows(sqliteDb, table);
      // Read all rows from pg
      // Build SELECT * FROM table
      const pres = await client.query(`SELECT * FROM "${table}";`);
      const prows = pres.rows || [];
      // Build maps by key
      const smap = new Map();
      for (const r of srows) smap.set(rowKey(r), r);
      const pmap = new Map();
      for (const r of prows) pmap.set(rowKey(r), r);
      // Rows to insert: keys in smap not in pmap
      const toInsert = [];
      for (const [k,v] of smap) {
        if (!pmap.has(k)) toInsert.push(v);
      }
      // Rows to delete: keys in pmap not in smap
      const toDelete = [];
      for (const [k,v] of pmap) {
        if (!smap.has(k)) toDelete.push(v);
      }
      // Insert rows
      if (toInsert.length>0) {
        for (const r of toInsert) {
          const colsNames = Object.keys(r);
          const placeholders = colsNames.map((c,i)=>`$${i+1}`).join(',');
          const values = colsNames.map(c=>r[c]);
          const sql = `INSERT INTO "${table}" ("${colsNames.join('","')}") VALUES (${placeholders})`;
          try {
            await client.query(sql, values);
            totalInserted++;
          } catch (ie) {
            console.log(chalk.red(`[SYNC] Error inserting into ${table}: ${ie.message}`));
            log(`[ERROR] Insert ${table}: ${ie.message}`);
          }
        }
        console.log(chalk.green(`[SYNC] Table '${table}': ${toInsert.length} new rows inserted.`));
        log(`[SYNC] Table '${table}': ${toInsert.length} new rows inserted.`);
      } else {
        console.log(chalk.yellow(`[SYNC] Table '${table}': no new rows.`));
      }
      // Delete rows in PG that no longer exist in SQLite
      if (toDelete.length>0) {
        for (const r of toDelete) {
          // If 'id' exists, prefer deleting by id, else build condition across all columns matching values
          if ('id' in r) {
            try {
              await client.query(`DELETE FROM "${table}" WHERE id = $1`, [r.id]);
              totalDeleted++;
            } catch (de) {
              console.log(chalk.red(`[SYNC] Error deleting from ${table}: ${de.message}`));
              log(`[ERROR] Delete ${table}: ${de.message}`);
            }
          } else {
            // attempt delete by all columns equality (may be dangerous if types mismatch)
            const colsNames = Object.keys(r);
            const conds = colsNames.map((c,i)=>`"\${c}" = $${i+1}`).join(' AND ');
            const values = colsNames.map(c=>r[c]);
            const sql = `DELETE FROM "${table}" WHERE ${conds}`.replace(/\\${c}/g, function(){ return colsNames.shift(); });
            try {
              await client.query(sql, values);
              totalDeleted++;
            } catch (de) {
              console.log(chalk.red(`[SYNC] Error deleting (by condition) from ${table}: ${de.message}`));
              log(`[ERROR] DeleteCondition ${table}: ${de.message}`);
            }
          }
        }
        console.log(chalk.red(`[SYNC] Table '${table}': ${toDelete.length} rows deleted in Postgres.`));
        log(`[SYNC] Table '${table}': ${toDelete.length} rows deleted in Postgres.`);
      }
    } catch (te) {
      console.log(chalk.red(`[SYNC] Error processing table '${table}': ${te.message}`));
      log(`[ERROR] Table ${table}: ${te.message}`);
    }
  } // end for tables

  await client.end();
  sqliteDb.close();

  console.log(chalk.blue(`[SYNC] Cycle complete. Inserted: ${totalInserted}, Deleted: ${totalDeleted}`));
  log(`[SYNC] Cycle complete. Inserted: ${totalInserted}, Deleted: ${totalDeleted}`);
  return {inserted: totalInserted, deleted: totalDeleted};
}

async function mainLoop() {
  const effectiveInterval = global.SYNC_INTERVAL_OVERRIDE || SYNC_INTERVAL;
  while (true) {
    const res = await syncOnce();
    if (once) {
      console.log(chalk.blue('[SYNC] Exiting (once mode).'));
      break;
    }
    console.log(chalk.gray(`[SYNC] Waiting ${effectiveInterval/1000} seconds until next cycle...`));
    await new Promise(r=>setTimeout(r, effectiveInterval));
  }
}

mainLoop().catch(e=>{
  console.error(chalk.red('[SYNC] Fatal error:'), e);
  log('[FATAL] ' + (e && e.message));
  process.exit(1);
});
