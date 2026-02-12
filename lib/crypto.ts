import crypto from "crypto";

const ENCRYPTION_KEY = process.env.SSN_ENCRYPTION_KEY || deriveKeyFromEnv();

/**
 * Derive a key from environment variables if SSN_ENCRYPTION_KEY is not set.
 * In production, SSN_ENCRYPTION_KEY must be set to a secure 32-byte hex string.
 */
function deriveKeyFromEnv(): Buffer {
  // For development, use a deterministic key derived from JWT_SECRET
  const secret = process.env.JWT_SECRET || "temporary-secret-for-interview";
  return crypto.pbkdf2Sync(secret, "ssn-encryption-salt", 100000, 32, "sha256");
}

function getEncryptionKey(): Buffer {
  if (typeof ENCRYPTION_KEY === "string") {
    return Buffer.from(ENCRYPTION_KEY, "hex");
  }
  return ENCRYPTION_KEY;
}

/**
 * Encrypt an SSN using AES-256-GCM encryption with authentication.
 * Returns a JSON string containing: iv, authTag, and encrypted data (all hex-encoded)
 *
 * @param ssn - The plain SSN (9 digits)
 * @returns Encrypted data as JSON string
 */
export function encryptSSN(ssn: string): string {
  if (!ssn || !/^\d{9}$/.test(ssn)) {
    throw new Error("Invalid SSN format. Expected 9 digits.");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(ssn, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    encrypted: encrypted,
  });
}

/**
 * Decrypt an SSN that was encrypted with encryptSSN.
 * Verifies the authentication tag to ensure data integrity.
 *
 * @param encryptedData - JSON string containing iv, authTag, and encrypted data
 * @returns Decrypted SSN (9 digits)
 */
export function decryptSSN(encryptedData: string): string {
  try {
    const data = JSON.parse(encryptedData);

    if (!data.iv || !data.authTag || !data.encrypted) {
      throw new Error("Invalid encrypted data format");
    }

    const key = getEncryptionKey();
    const iv = Buffer.from(data.iv, "hex");
    const authTag = Buffer.from(data.authTag, "hex");
    const encryptedText = data.encrypted;

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error("Failed to decrypt SSN. Data may be corrupted or invalid.");
  }
}

export function maskSSN(ssn: string): string {
  if (!ssn || !/^\d{9}$/.test(ssn)) {
    return "XXX-XX-XXXX"; // Invalid format
  }
  const lastFour = ssn.slice(-4);
  return `XXX-XX-${lastFour}`;
}

export function verifyEncryptedSSN(encryptedSSN: string): boolean {
  try {
    const decrypted = decryptSSN(encryptedSSN);
    return /^\d{9}$/.test(decrypted);
  } catch {
    return false;
  }
}
