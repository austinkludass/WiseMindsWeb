#!/usr/bin/env node
/**
 * Pulls reference data from the production WiseMinds API and writes it
 * into the local Firestore emulator.
 *
 * Prerequisites:
 *   - Firestore emulator running on 127.0.0.1:8080
 *   - Environment variables:
 *       WISEMINDS_API_URL  – base URL of the production API
 *                            e.g. https://australia-southeast1-wisemindsadmin.cloudfunctions.net/api
 *       WISEMINDS_API_KEY  – x-api-key header value for production
 *
 * Usage:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
 *   WISEMINDS_API_URL=https://... \
 *   WISEMINDS_API_KEY=... \
 *     node functions/scripts/pull-seed-data.mjs
 */

import process from "process";
import { generateKeyPairSync } from "crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const COLLECTIONS = [
  "students",
  "tutors",
  "families",
  "subjectGroups",
  "subjects",
  "locations",
  "curriculums",
  "lessons",
];

// The production API serializes Firestore Timestamps as {_seconds,_nanoseconds}
// JSON objects. Writing those back verbatim would store inert maps, not real
// Timestamps — breaking date ordering/queries and any consumer that expects a
// Timestamp. Walk the document and convert any timestamp-shaped object back
// into a Timestamp so the seeded data matches production semantics.
function reviveTimestamps(value) {
  if (Array.isArray(value)) {
    return value.map(reviveTimestamps);
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (
      keys.length === 2 &&
      typeof value._seconds === "number" &&
      typeof value._nanoseconds === "number"
    ) {
      return new Timestamp(value._seconds, value._nanoseconds);
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = reviveTimestamps(v);
    }
    return out;
  }
  return value;
}

const apiUrl = process.env.WISEMINDS_API_URL;
const apiKey = process.env.WISEMINDS_API_KEY;
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

if (!apiUrl || !apiKey) {
  console.error(
    "Missing WISEMINDS_API_URL or WISEMINDS_API_KEY environment variables."
  );
  process.exit(1);
}

if (!emulatorHost) {
  console.error(
    "FIRESTORE_EMULATOR_HOST is not set. " +
      "This script must target the emulator, not production.\n" +
      "Set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080"
  );
  process.exit(1);
}

console.log(`Targeting emulator at ${emulatorHost}`);

// Fake service account — FIRESTORE_EMULATOR_HOST routes all traffic to the
// local emulator, so this key is never used to authenticate against Google.
// It only exists because firebase-admin requires a valid-looking credential
// to construct the Firestore client.
const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
initializeApp({
  projectId: "wisemindsadmin",
  credential: cert({
    projectId: "wisemindsadmin",
    clientEmail: "emulator@wisemindsadmin.iam.gserviceaccount.com",
    privateKey,
  }),
});
const db = getFirestore();
// Docker Firestore emulator's gRPC layer is broken; use REST.
db.settings({ preferRest: true });

async function fetchCollection(name) {
  // The API uses lowercase resource names in the URL path
  const url = `${apiUrl.replace(/\/$/, "")}/${name.toLowerCase()}`;
  console.log(`  Fetching ${name} from ${url}...`);

  const res = await fetch(url, {
    headers: { "x-api-key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${name}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function writeCollection(name, docs) {
  if (!Array.isArray(docs) || docs.length === 0) {
    console.log(`  ${name}: no documents, skipping`);
    return 0;
  }

  const col = db.collection(name);
  let written = 0;

  // Write in batches of 500 (Firestore batch limit)
  for (let i = 0; i < docs.length; i += 500) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + 500);

    for (const doc of chunk) {
      const { id, ...rest } = doc;
      const data = reviveTimestamps(rest);
      if (id) {
        batch.set(col.doc(id), data);
      } else {
        batch.set(col.doc(), data);
      }
      written++;
    }

    await batch.commit();
  }

  return written;
}

async function main() {
  const summary = {};

  for (const name of COLLECTIONS) {
    try {
      const docs = await fetchCollection(name);
      const count = await writeCollection(name, docs);
      summary[name] = count;
      console.log(`  ${name}: ${count} documents written`);
    } catch (err) {
      console.error(`  ${name}: ERROR - ${err.message}`);
      summary[name] = `error: ${err.message}`;
    }
  }

  console.log("\nSeed complete:");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
