//  ==================== ADMIN SEED SCRIPT ====================
// Creates the first admin account directly in the database.
// Run once during initial setup:
//
//   pnpm seed:admin
//
// Reads credentials from environment variables so nothing sensitive
// is hardcoded or committed to source control.
//
// Required env vars (add to your .env file before running):
//   ADMIN_NAME     — display name for the admin account
//   ADMIN_EMAIL    — email address used to log in
//   ADMIN_PASSWORD — must meet the password policy (see below)

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { user } from '../db/schema';

const SALT_ROUNDS = 12;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

async function seedAdmin() {
  // ---- Read credentials from env ----
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error(
      '\n[seed:admin] ERROR: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must all be set in your .env file.\n',
    );
    process.exit(1);
  }

  if (!PASSWORD_REGEX.test(password)) {
    console.error(
      '\n[seed:admin] ERROR: ADMIN_PASSWORD does not meet the password policy.\n' +
        'Requirements: min 8 chars, uppercase, lowercase, number, special character.\n',
    );
    process.exit(1);
  }

  // ---- Check if this email already exists ----
  const existing = await db.select().from(user).where(eq(user.email, email));
  if (existing.length > 0) {
    const current = existing[0]!;
    if (current.role === 'admin') {
      console.log(`\n[seed:admin] Admin account already exists for ${email}. Nothing to do.\n`);
    } else {
      // Promote an existing user to admin
      await db.update(user).set({ role: 'admin' }).where(eq(user.email, email));
      console.log(`\n[seed:admin] Existing user ${email} has been promoted to admin.\n`);
    }
    process.exit(0);
  }

  // ---- Create the admin account ----
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [admin] = await db
    .insert(user)
    .values({ name, email, passwordHash, role: 'admin' })
    .returning();

  if (!admin) {
    console.error('\n[seed:admin] ERROR: Insert returned no row. Check your database connection.\n');
    process.exit(1);
  }

  console.log(
    `\n[seed:admin] ✓ Admin account created successfully.\n` +
      `  ID:    ${admin.id}\n` +
      `  Name:  ${admin.name}\n` +
      `  Email: ${admin.email}\n` +
      `  Role:  ${admin.role}\n`,
  );

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('\n[seed:admin] Unexpected error:', err);
  process.exit(1);
});