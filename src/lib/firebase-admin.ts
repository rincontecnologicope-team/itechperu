import { Storage as GoogleCloudStorage } from "@google-cloud/storage";
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

function getFirebaseStorageLocation(): string {
  return process.env.FIREBASE_STORAGE_LOCATION?.trim() || "us-central1";
}

let googleStorageClient: GoogleCloudStorage | null = null;

function getGoogleStorageClient(): GoogleCloudStorage {
  if (googleStorageClient) {
    return googleStorageClient;
  }

  const projectId = getFirebaseProjectId();
  const clientEmail = getFirebaseClientEmail();
  const privateKey = getFirebasePrivateKey();
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Storage no configurado. Define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.",
    );
  }

  googleStorageClient = new GoogleCloudStorage({
    projectId,
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
  });

  return googleStorageClient;
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
    const storage = getGoogleStorageClient();
    const projectId = getFirebaseProjectId();
    const [buckets] = await storage.getBuckets(projectId ? { project: projectId } : undefined);
    return buckets
      .map((bucket) => bucket.name?.trim())
      .filter((name): name is string => Boolean(name));
  } catch (error) {
    console.error("No se pudieron listar buckets de Firebase Storage.", error);
    return [];
  }
}

export async function ensureFirebaseStorageBucket(bucketName: string): Promise<boolean> {
  const normalizedBucket = normalizeBucketName(bucketName);
  const projectId = getFirebaseProjectId();
  if (!normalizedBucket || !projectId) {
    return false;
  }

  try {
    const storage = getGoogleStorageClient();
    await storage.createBucket(normalizedBucket, {
      project: projectId,
      location: getFirebaseStorageLocation(),
      storageClass: "STANDARD",
      iamConfiguration: {
        uniformBucketLevelAccess: {
          enabled: true,
        },
      },
    });
    return true;
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error ? String(error.code) : "unknown";
    if (code === "409" || /already exists/i.test(String((error as Error)?.message ?? ""))) {
      return true;
    }
    const message = String((error as Error)?.message ?? "Error desconocido");
    if (code === "403") {
      throw new Error(
        `No hay permisos para crear el bucket ${normalizedBucket}. Firebase/Google Cloud respondio 403: ${message}.`,
      );
    }
    console.error(`No se pudo crear bucket ${normalizedBucket}.`, error);
    return false;
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
