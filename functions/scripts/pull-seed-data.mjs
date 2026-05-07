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
import crypto from "crypto";
import { Firestore } from "@google-cloud/firestore";

const COLLECTIONS = [
  "students",
  "tutors",
  "families",
  "subjectGroups",
  "subjects",
  "locations",
  "curriculums",
];

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

// The Docker emulator's gRPC layer is unreachable through port-forwarding,
// so we use the REST transport. REST goes through google-auth-library, which
// would otherwise hunt for Application Default Credentials and fail. Hand it
// an explicit throwaway RSA key so the JWT signing path succeeds — the actual
// request gets an "Authorization: Bearer owner" header injected by Firestore
// when ssl=false (auto-set from FIRESTORE_EMULATOR_HOST), and the emulator
// accepts that as admin.
const { privateKey: emulatorPrivateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const db = new Firestore({
  projectId: "wisemindsadmin",
  preferRest: true,
  credentials: {
    private_key: emulatorPrivateKey,
    client_email: "emulator@wisemindsadmin.iam.gserviceaccount.com",
  },
});

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
      const { id, ...data } = doc;
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
