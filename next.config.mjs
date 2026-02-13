const remotePatterns = [];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const hostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    remotePatterns.push({
      protocol: "https",
      hostname,
    });
  } catch {
    // Ignore invalid URL in env.
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
