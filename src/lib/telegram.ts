// src/lib/telegram.ts
import crypto from "crypto";

/**
 * Parsea el initData (querystring) de Telegram WebApp en un objeto clave-valor
 */
export function parseInitData(initData: string): Record<string, string> {
  const params = new URLSearchParams(initData);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Valida la firma HMAC de Telegram WebApp usando el BOT_TOKEN.
 * Devuelve { ok: boolean, userId?: number }.
 */
export function validateTelegramInitData(initData: string, botToken: string): { ok: boolean; userId?: number } {
  if (!initData || !botToken) return { ok: false };

  const parsed = parseInitData(initData);
  const receivedHash = parsed["hash"];
  if (!receivedHash) return { ok: false };

  // Construye el data_check_string (pares key=value ordenados, excepto hash)
  const dataCheckString = Object.keys(parsed)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${parsed[key]}`)
    .join("\n");

  // Clave secreta: sha256("WebAppData" + botToken)
  const secretKey = crypto
    .createHash("sha256")
    .update("WebAppData" + botToken)
    .digest();

  // Calcula el hash HMAC-SHA256(data_check_string, secretKey)
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const ok = computedHash === receivedHash;

  // Extrae user.id del campo user (si existe)
  let userId: number | undefined;
  try {
    if (parsed.user) {
      const userObj = JSON.parse(parsed.user);
      if (userObj?.id) userId = Number(userObj.id);
    }
  } catch (e) {
    // no-op
  }

  return { ok, userId };
}