```markdown
# Serverless Event-Driven Microservice & Observability (GCP)

A serverless HTTP microservice built on **Cloud Functions (Gen2, Node.js 22)** with **Cloud Firestore**, request validation, and **Cloud Logging**—run in browser-based **GCP Cloud Shell** with **0% local RAM load**.

---

## 💡 Why Build This?

* **On-Demand Execution:** Runs only when requests arrive instead of keeping an idle server running continuously.
* **Persistent Storage:** Validates incoming requests and stores records in **Firestore** with a generated document ID.
* **Real Debugging & Logs:** Covers clean `400`/`200`/`500` responses, IAM permissions, startup healthchecks, and execution logs.

---

## 🏗️ Architecture

```text
  [ Authenticated Request (?user=...) ]
                  │
                  ▼
  [ Cloud Function Gen2 (Node.js 22) ]
    ├── Validates "user" query param (400 if missing)
    ├── Lazy Firestore init (fast PORT=8080 startup)
    └── Saves record to Firestore ("requests")
                  │
                  ▼
  [ Cloud Firestore ] ──► Returns savedId (200 OK)
                  │
                  ▼
  [ Cloud Logging ]   ──► Startup probes, auth checks, events & errors

```

---

## 🛠️ How to Run

1. **Select Project**
```bash
gcloud config set project project-92dbe3cf-b4e8-43e8-927

```


2. **Install Dependencies & Verify Syntax**
```bash
npm install
node --check index.js

```


3. **Deploy Function**
```bash
gcloud functions deploy helloServerless \
  --gen2 \
  --runtime=nodejs22 \
  --region=us-central1 \
  --source=. \
  --entry-point=helloServerless \
  --trigger-http

```


4. **Test & Read Logs**
```bash
FUNCTION_URL=$(gcloud functions describe helloServerless \
  --gen2 \
  --region=us-central1 \
  --format='value(serviceConfig.uri)')

TOKEN=$(gcloud auth print-identity-token)

curl -s -H "Authorization: Bearer ${TOKEN}" "${FUNCTION_URL}"
curl -s -H "Authorization: Bearer ${TOKEN}" "${FUNCTION_URL}?user=Suraj"

gcloud functions logs read helloServerless \
  --gen2 \
  --region=us-central1 \
  --limit=20

```



---

## 📁 Files

* `index.js` — Function handler, validation, lazy Firestore client, and logs.
* `package.json` & `package-lock.json` — Dependencies (`@google-cloud/firestore`).
* `LOGBOOK.md` — Symptoms, root causes, and fixes from troubleshooting.

---
