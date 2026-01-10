import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "crypto";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const alg = "HS256";

export async function signToken(payload, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setJti(randomBytes(16).toString('hex')) // Add unique identifier
    .sign(secret);
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}