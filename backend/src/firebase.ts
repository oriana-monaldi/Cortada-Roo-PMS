import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin";

import serviceAccount from "../cortadaroo-f70b9-firebase-adminsdk-fbsvc-dd0cae6248.json";

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

export const db = getFirestore();
