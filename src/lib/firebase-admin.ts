import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function normalizeBucketName(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  return value
    .trim()
    .replace(/^gs:\/\//i, "")
    .replace(/\/+$/, "")
    .split("/")[0]
    ?.trim();
}

function getFirebaseProjectId(): string | undefined {
  return (
    process.env.FIREBASE_PROJECT_ID?.trim() ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
  );
}

export function getFirebaseProjectIdValue(): string | undefined {
  return getFirebaseProjectId();
}

function getFirebaseClientEmail(): string | undefined {
  return process.env.FIREBASE_CLIENT_EMAIL?.trim();
}

function getFirebasePrivateKey(): string | undefined {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) {
    return undefined;
  }
  return raw.trim().replace(/\\n/g, "\n");
}

function getFirebaseStorageBucket(): string | undefined {
  return normalizeBucketName(
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ??
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  );
}

export function getFirebaseStorageBucketCandidates(): string[] {
  const projectId = getFirebaseProjectId();
  const configured = getFirebaseStorageBucket();
  const candidates = [
    configured,
    projectId ? `${projectId}.appspot.com` : undefined,
    projectId ? `${projectId}.firebasestorage.app` : undefined,
  ].filter((item): item is string => Boolean(item));

  return Array.from(new Set(candidates));
}

export async function listFirebaseStorageBuckets(): Promise<string[]> {
  try {
    const app = getFirebaseAdminApp();
    const projectId = getFirebaseProjectId();
    if (!projectId) {
      return [];
    }

    const credential = app.options.credential as
      | { getAccessToken?: () => Promise<{ access_token?: string }> }
      | undefined;
    const token = await credential?.getAccessToken?.();
    const accessToken = token?.access_token?.trim();
    if (!accessToken) {
      return [];
    }

    const response = await fetch(
      `https://storage.googleapis.com/storage/v1/b?project=${encodeURIComponent(projectId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { items?: Array<{ name?: string }> };
    return (payload.items ?? [])
      .map((item) => item.name?.trim())
      .filter((name): name is string => Boolean(name));
  } catch (error) {
    console.error("No se pudieron listar buckets de Firebase Storage.", error);
    return [];
  }
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

export function getFirebaseBucket(bucketName?: string) {
  const app = getFirebaseAdminApp();
  const storageBucket = normalizeBucketName(bucketName) ?? getFirebaseStorageBucketCandidates()[0];
  if (!storageBucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET no configurado.");
  }
  return getStorage(app).bucket(storageBucket);
}
