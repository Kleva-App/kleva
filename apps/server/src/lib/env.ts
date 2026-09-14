import "../env.js";

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string): string | undefined;
export function getOptionalEnv(name: string, fallback: string): string;
export function getOptionalEnv(name: string, fallback?: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || fallback;
}
