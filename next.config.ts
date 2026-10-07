import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// EN: Local dev only. Load the central secrets file when it exists (no-op on
// Vercel, where it is absent). Never overrides a variable already set.
// FR : Developpement local seulement. Charge le fichier central de secrets s'il
// existe (sans effet sur Vercel, ou il est absent). N'ecrase jamais une variable deja posee.
const centralEnvFile =
  process.env.CENTRAL_ENV_FILE ?? join(homedir(), ".secrets", "projets.env");
if (existsSync(centralEnvFile)) process.loadEnvFile(centralEnvFile);

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
