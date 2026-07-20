import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { user } from "../db/schema";
import { eq } from "drizzle-orm";
import { Errors } from "../lib/AppError";

//  pnpm add bcryptjs && pnpm add -D @types/bcryptjs


// determine how computationally expensive the bcrypt hash will be. Each increment doubles the time required

// ! This takes ~250ms on modern hardware. this is intentionally slow - it makes brute-force attacks against stolen password hashes practically impossinle, while being fast enough that users don't notice the delay during signup/login.
const SALT_ROUNDS = 12

function getJwtSecret(): string{
  const secret = process.env.JWT_SECRET;
  if(!secret) throw new Error("JWT_SECRET ENVIRONMENT VARIABLE IS NOT SET");
  return secret;
}

//  JWT access token expiry - short-lived for security
const ACCESS_TOKEN_EXPIRY = "15m";
//  JWT refresh token enquiry - longer-lived, used to get new access tokens 
// 
const REFRESH_TOKEN_EXPIRY = "7d";

// ============= TOKEN PAYLOAD TYPE ================
// only put non-sensitive, frequently-needed data here. this payload is base64-encoded(not encrypted ), so anyone can decode it. Never put passwords, secrets, or PII beyond what's necessary for authorization.
export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export async function registerUser(name:string, email:string, password:string) {
  return _createAccount(name, email, password, "user");
}

export async function registerAdmin(name: string, email:string, password:string) {
  return _createAccount(name, email, password, "admin");
} 

export async function _createAccount(name:string, email:string, password:string, role:"user" | "admin"){
  const existing = await db.select().from(user).where(eq(user.email, email));

  if(existing.length > 0) {
    throw Errors.conflict("An account with that email already exists.", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [users] = await db.insert(user).values({name, email, passwordHash, role}).returning();

  if(!users) throw Errors.internal("Failed to create user");

  const tokens = generateTokens({ userId: users.id, email: users.email, role: users.role });
  return {
    user: sanitizeUser(users),
    ...tokens
  }
}

// ============== LOGIN ===============
// Validates credentials and return user + tokens on success.
// ALways returns the same generic error for wrong email or wrong password(prevents user enumeration).

export async function loginUser(email:string, password:string) {
  // fetch the user row - we need the password hash for comparison
  const result = await db.select().from(user).where(eq(user.email, email));
  const userRow = result[0];

  // Use a dummy compare even when user doesn't exist - prevents timing-based user enumeration
  const DUMMY_HASH = "$2b$12$invalidhashfortimingprotection0000000000000000000000000000";
  const hashToCompare = userRow?.passwordHash ?? DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(password, hashToCompare);

  // Fail after the compare(not before) to prevent timing side-channels
  if(!userRow || !passwordMatch) {
    throw Errors.unAuthorized("invalid email or password.", "INVALID_CREDENTIALS");
  }

  const tokens = generateTokens({userId: userRow.id, email: userRow.email, role: userRow.role});
  return {
     user: sanitizeUser(userRow),
    ...tokens
  }
}

// ==================== TOKEN GENERATION ====================
// Issues a short-lived access token and a longer-lived refresh token
function generateTokens(payload: TokenPayload) {
  const secret = getJwtSecret();

  const accessToken = jwt.sign(payload, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });

  const refreshToken = jwt.sign(payload, secret, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });

  return { accessToken, refreshToken };
}

// ==================== REFRESH ACCESS TOKEN ====================
// Verifies a refresh token and issues a new access token
export function refreshAccessToken(refreshToken: string) {
  const secret = getJwtSecret();

  const decoded = jwt.verify(refreshToken, secret, { algorithms: ['HS256'] }) as TokenPayload;

  const newAccessToken = jwt.sign(
    { userId: decoded.userId, email: decoded.email, role: decoded.role },
    secret,
    { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' },
  );

  return { accessToken: newAccessToken };
}

// ==================== VERIFY TOKEN ====================
// Used by the auth middleware to validate incoming JWT access tokens
export function verifyAccessToken(token: string): TokenPayload {
  const secret = getJwtSecret();
  return jwt.verify(token, secret, { algorithms: ['HS256'] }) as TokenPayload;
}

// ==================== SANITIZE USER ====================
// Strips passwordHash before returning user data to the client — never leak it
function sanitizeUser(users: typeof user.$inferSelect) {
  const { passwordHash: _omit, ...safeUser } = users;
  return safeUser;
}