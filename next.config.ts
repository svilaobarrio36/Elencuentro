import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Excluye better-sqlite3 del bundle — solo se usa en dev local, nunca en Vercel
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@prisma/adapter-libsql",
    "@libsql/client",
    "libsql",
  ],
};

export default nextConfig;
