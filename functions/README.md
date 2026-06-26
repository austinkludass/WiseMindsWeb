# Local development (Cloud Functions + Emulator)

Run the backend API and Firestore locally using the Firebase Emulator Suite.
The local API runs the exact production code (`src/index.ts`) against an
in-memory Firestore, so it behaves like prod without touching prod.

## Prerequisites

- **Node.js** (v22+) (youse will have this already)
- **Java (based)** (JDK 11+) — required by the Firestore emulator
- **Firebase CLI**: `npm install -g firebase-tools`

## setup

1. Install deps:

   ```bash
   cd functions
   npm install
   ```

2. Create `functions/.env.local` with:

   ```bash
   # Key the local API expects in the `x-api-key` header
   API_KEY=<any value you like for local>

   # Production API to pull seed data from (only needed for seeding)
   WISEMINDS_API_URL=<prod api base url>
   WISEMINDS_API_KEY=<prod x-api-key>
   ```

## Running

From the `functions/` directory again:

```bash
npm run serve
```

This builds it, starts the **functions**, **firestore**, and
**auth** emulators, and automatically seeds (read only) reference data once Firestore is
ready (not everything - only stuff is seeded that I needed lols).

## Calling the API

All endpoints require the `x-api-key` header (must match `API_KEY` in
`.env.local`):

```bash
curl -H "x-api-key: $API_KEY" \
  http://127.0.0.1:5001/wisemindsadmin/australia-southeast1/api/students
```

## Seeding

Seeding pulls reference data (students, tutors, families, subjectGroups,
subjects, locations, curriculums, lessons (a.k.a. not actually everything!)) 
from the production API into the emulator. It runs automatically
on `npm run serve`, or manually while the emulator is running:

```bash
npm run seed
```

Requires `WISEMINDS_API_URL` and `WISEMINDS_API_KEY` in `.env.local`.

> **Note:** the Firestore emulator is in-memory — all data is wiped on every
> restart. Seeding repopulates the reference collections each time you run
> `npm run serve`, but anything you create via the app/API between restarts is
> not persisted.
