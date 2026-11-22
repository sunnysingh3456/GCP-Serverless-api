# Project 4: Serverless Event-Driven Microservice & Observability — LOGBOOK 🚀

**Project ID:** `project-92dbe3cf-b4e8-43e8-927`  
**Project Number:** `815182455529`  
**Region:** `us-central1`  
**Execution Environment:** GCP Cloud Shell (0% local RAM load)

---

### 1st. Symptom: `nodejs20` runtime is unsupported or deprecated on Cloud Functions Gen2 (`helloServerless`).

**Root Cause:** The specified Node.js runtime version was no longer supported for deployment in this environment.

**Fix:** Checked available runtimes and switched deployment flag to `--runtime=nodejs22`.

---

### 2nd. Symptom: Build failed with status: FAILURE. Could not build the function due to a missing permission on the build service account.

**Root Cause:** Compute default service account (`815182455529-compute@developer.gserviceaccount.com`) lacked `roles/cloudbuild.builds.builder`.

**Fix:** Added IAM policy binding for `roles/cloudbuild.builds.builder` and re-ran `gcloud functions deploy`.

---

### 3rd. Symptom: `SyntaxError: missing ) after argument list` in `/workspace/index.js:18` during build.

**Root Cause:** Missing comma (`,`) between the string message and `error` variable inside `console.error('Error saving to Firestore:' error);`.

**Fix:** Added the missing comma in `index.js`, verified syntax with `node --check index.js`, and redeployed.

---

### 4th. Symptom: Container Healthcheck failed — container failed to start and listen on `PORT=8080` within the allocated timeout.

**Root Cause:** Startup / initialization overhead delayed container readiness on `PORT=8080` during Cloud Run revision startup.

**Fix:** Moved Firestore client initialization to lazy loading (`getDb()` inside the handler) and redeployed until `Default STARTUP TCP probe succeeded` on port `8080`.

---

### 5th. Symptom: `ResponseError: status=[400]` during deploy with `--allow-unauthenticated`, and `Error: Forbidden` (`403`) when opening the function URL in a browser.

**Root Cause:** An organization policy restricted unauthenticated / public policy binding (`allUsers`), so browser requests without a token were rejected (`403 Forbidden`).

**Fix:** Deployed without `--allow-unauthenticated` and tested using authenticated requests (`Authorization: Bearer $(gcloud auth print-identity-token)`).

---

### 6th. Symptom: Runtime error responses — `{"status":"Error","error":"firestore is not a constructor"}`, `{"status":"Error","error":"Data is not defined"}`, and `{"status":"Error","error":"getDb is not defined"}`.

**Root Cause:** Incorrect constructor casing (`firestore` instead of `Firestore`) and undeclared/missing identifiers (`Data`, `getDb`) in `index.js` edits.

**Fix:** Corrected `const { Firestore } = require('@google-cloud/firestore')`, defined `getDb()`, removed undeclared `Data` references, validated with `node --check index.js`, and redeployed (`ACTIVE` revision).

---

### 7th. Symptom: `{"status":"Error","error":"7 PERMISSION_DENIED: Missing or insufficient permissions."}` when saving a document to Firestore.

**Root Cause:** The function runtime service account (`815182455529-compute@developer.gserviceaccount.com`) lacked Firestore read/write permissions (`roles/datastore.user`).

**Fix:** Granted `roles/datastore.user` to the runtime service account via `gcloud projects add-iam-policy-binding` and verified successful Firestore writes (`savedId: PDpcRVgaxuBxYOdl6p7d`).

---

### 8th. Symptom: Missing `user` query parameter allowed unvalidated input path, and logs needed clear verification across `400` / `200` / auth / startup events.

**Root Cause:** No explicit validation check for empty/missing `req.query.user` prior to Firestore write, and execution/Cloud Run logs needed structured inspection.

**Fix:** Added `400` validation for missing `user` while returning `200` + `savedId` on valid requests (`k9xteX7bzsMJoauHh1Nx`), tested both via `curl`, and inspected logs via `gcloud functions logs read`.
