import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const localCredentialPath = resolve(
  process.cwd(),
  "cortadaroo-f70b9-firebase-adminsdk-fbsvc-dd0cae6248.json",
);

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
  (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    ? Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
    : existsSync(localCredentialPath)
      ? readFileSync(localCredentialPath, "utf8")
      : undefined);

if (!serviceAccountJson) {
  throw new Error(
    "Falta configurar FIREBASE_SERVICE_ACCOUNT_BASE64 o FIREBASE_SERVICE_ACCOUNT_JSON.",
  );
}

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(serviceAccountJson) as ServiceAccount),
  });
}

export const db = getFirestore();
