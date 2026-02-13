import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getFirebaseProjectId(): string | undefined {
  return process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}

function getFirebaseClientEmail(): string | undefined {
  return process.env.FIREBASE_CLIENT_EMAIL;
}

function getFirebasePrivateKey(): string | undefined {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) {
    return undefined;
  }
  return raw.replace(/\\n/g, "\n");
}

function getFirebaseStorageBucket(): string | undefined {
  return process.env.FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
}

export function isFirebaseCatalogConfigured(): boolean {
  return Boolean(getFirebaseProjectId() && getFirebaseClientEmail() && getFirebasePrivateKey());
}

function getFirebaseAdminApp() {
  const existing = getApps();
  if (existing.length > 0) {
    return getApp();
  }

  const projectId = getFirebaseProjectId();
  const clientEmail = getFirebaseClientEmail();
  const privateKey = getFirebasePrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase no configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: getFirebaseStorageBucket(),
  });
}

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

export function getFirebaseBucket() {
  const app = getFirebaseAdminApp();
  const storageBucket = getFirebaseStorageBucket();
  if (!storageBucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET no configurado.");
  }
  return getStorage(app).bucket(storageBucket);
}
