import { createHash } from "crypto";

interface CloudinaryConfig {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
  uploadPreset?: string;
  uploadFolder: string;
}

function sanitizeCloudinaryValue(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function parseCloudinaryUrl(raw: string | undefined): {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
} {
  const value = sanitizeCloudinaryValue(raw);
  if (!value) {
    return {};
  }

  const match = value.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i);
  if (!match) {
    return {};
  }

  return {
    apiKey: decodeURIComponent(match[1]),
    apiSecret: decodeURIComponent(match[2]),
    cloudName: decodeURIComponent(match[3]),
  };
}

function getCloudinaryConfig(): CloudinaryConfig {
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const cloudName =
    sanitizeCloudinaryValue(process.env.CLOUDINARY_CLOUD_NAME) ?? fromUrl.cloudName;
  const apiKey = sanitizeCloudinaryValue(process.env.CLOUDINARY_API_KEY) ?? fromUrl.apiKey;
  const apiSecret =
    sanitizeCloudinaryValue(process.env.CLOUDINARY_API_SECRET) ?? fromUrl.apiSecret;
  const uploadPreset = sanitizeCloudinaryValue(process.env.CLOUDINARY_UPLOAD_PRESET);
  const uploadFolder = sanitizeCloudinaryValue(process.env.CLOUDINARY_UPLOAD_FOLDER) ?? "products";

  if (!cloudName) {
    throw new Error(
      "Cloudinary no configurado. Define CLOUDINARY_CLOUD_NAME (o CLOUDINARY_URL).",
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
    uploadFolder,
  };
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string): string {
  const serialized = Object.entries(params)
    .filter(([, value]) => Boolean(value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${serialized}${apiSecret}`)
    .digest("hex");
}

function getUploadEndpoint(cloudName: string): string {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`;
}

export async function uploadCloudinaryProductImage(file: File): Promise<string> {
  const config = getCloudinaryConfig();
  const endpoint = getUploadEndpoint(config.cloudName);
  const formData = new FormData();
  const timestamp = Math.floor(Date.now() / 1000);

  formData.append("file", file, file.name);
  formData.append("folder", config.uploadFolder);

  if (config.uploadPreset) {
    // Preferimos upload preset para facilitar despliegue sin exponer secretos en cliente.
    formData.append("upload_preset", config.uploadPreset);
  } else {
    if (!config.apiKey || !config.apiSecret) {
      throw new Error(
        "Faltan credenciales de Cloudinary. Define CLOUDINARY_UPLOAD_PRESET o CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.",
      );
    }

    const paramsToSign = {
      folder: config.uploadFolder,
      timestamp: String(timestamp),
    };

    formData.append("api_key", config.apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signCloudinaryParams(paramsToSign, config.apiSecret));
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !payload.secure_url) {
    const detail =
      payload.error?.message ??
      `Cloudinary devolvio status ${response.status} al subir ${file.name}.`;
    throw new Error(`No se pudo subir imagen a Cloudinary. ${detail}`);
  }

  return payload.secure_url;
}
