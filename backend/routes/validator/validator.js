import crypto from "crypto";

class Validator {
  constructor() {
    this.algorithm = "aes-256-gcm";

    this.key = Buffer.from(
      process.env.AES_SECRET_KEY,
      "hex"
    );
  }

  generateToken({
    messageId,
    userId,
    bankKey,
    ttl = 300000,
  }) {
    const now = Date.now();

    const payload = {
      messageId,
      userId,
      bankKey,
      issuedAt: now,
      expiresAt: now + ttl,
      nonce: crypto.randomUUID(),
    };

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.key,
      iv
    );

    let encrypted = cipher.update(
      JSON.stringify(payload),
      "utf8",
      "hex"
    );

    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
      token: encrypted,
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
    };
  }

  validateToken({
    token,
    iv,
    authTag,
  }) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(
      Buffer.from(authTag, "hex")
    );

    let decrypted = decipher.update(
      token,
      "hex",
      "utf8"
    );

    decrypted += decipher.final("utf8");

    const payload = JSON.parse(decrypted);

    if (Date.now() > payload.expiresAt) {
      throw new Error("Token expired");
    }

    return payload;
  }
}

export default new Validator();