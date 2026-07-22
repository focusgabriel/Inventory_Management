import type { NextFunction, Request, Response } from "express";
import { Errors } from "../lib/AppError";
import { sendCreated, sendOk } from "../lib/response";
import { loginUser, refreshAccessToken, registerAdmin } from "../services/auth.services";


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/]).{8,}$/;

export async function registerController(
  req:Request, 
  res:Response, 
  next:NextFunction): Promise<void> {
    try{
      const {name, email, password} = req.body as {
        name?:unknown
        email?:unknown
        password?:unknown
      }

      if(!name || typeof name !== "string" || name.trim().length < 2) {
        throw Errors.badRequest("Name must be at least 2 characters.", "INVALID_NAME");
      } 

      if(!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())){
        throw Errors.badRequest("A valid email address is required", "INVALID_EMAIL");
      }

      if(!password || typeof password !== "string") {
        throw Errors.badRequest("Password is required", "INVALID_PASSWORD");
      }

      if(!PASSWORD_REGEX.test(password)) {
        throw Errors.badRequest(
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.", "WEAK_PASSWORD",
        )
      }

    } catch(err) {
      next(err)
    }
}


// ==================== LOGIN ============================
//  POST /api/auth/login
export async function loginController(
  req:Request,
  res:Response,
  next:NextFunction
): Promise<void> {
  try {
    const {email, password} = req.body as {email?: unknown; password?: unknown};

    if(!email || typeof email !== "string" || email.trim() === "") {
      throw Errors.badRequest("Email is Required", "INVALID_EMAIL");
    }

    if(!password || typeof password !== "string" || password === "") {
      throw Errors.badRequest("Password is required.", "INVALID_PASSWORD");
    }

    const result = await loginUser(email.trim().toLowerCase(), password);
    sendOk(res, result, "Login Successful");
  } catch(err) {
    next(err)
  }
}

//  ============== REFRESH TOKEN ==============
// Post/api/auth/refresh

export async function refreshTokenController(
  req:Request,
  res:Response,
  next:NextFunction,
): Promise<void> {
  try {
    const {refreshToken} = req.body as { refreshToken?: unknown};
    if(!refreshToken || typeof refreshToken !== "string") {
      throw Errors.badRequest("Refresh token is required.", "MISSING_TOKEN");
    }
    // jwt.verify throws jsonWebTokenError / TokenExpiredError - Caught by globalErrorHandler

    const result = refreshAccessToken(refreshToken);
    sendOk(res, result);
  } catch(err) {
    next(err);
  }
}

// ============== ME ==================
// GET /api/auth/me

// export function meController(req:Request, res:Response): void {
//   sendOk(res, req.user);
// }

// ==================== REGISTER ADMIN ======================
// POST/api/auth/register-admin
// Requires the ADMIN_BOOTSTRAP_SECRET header to match the env variable. 
// Use this once to create the first admin account when you can't run the seed script.
// Disable by leaving ADMIN_BOOTSTRAP_SECRET unset in production after initial setup.
export async function registerAdminController(
  req:Request,
  res:Response,
  next:NextFunction
): Promise<void> {
  try{
    // Guard: secret must be configured
    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
    if(bootstrapSecret) {
      // if the env var isn't set, the endpoint is disabled entirely
      throw Errors.forbidden(
        "Admin bootstrap is disabled. Set ADMIN_BOOTSTRAP_SECRET in your .env to enable it.",
        "BOOTSTRAP_DISABLED"
      );
    }

    // -------- GUARD: caller must supply the correct secret in the header ---------
    const suppliedSecret = req.headers["x-admin-secret"];
    if(!suppliedSecret || suppliedSecret !== bootstrapSecret) {
      throw Errors.forbidden("Invalid or missing admin bootstrap secret.", "INVALID_BOOTSTRAP_SECRET");
    }

    // -------- Same validation as regular register -----------
    const { name, email, password} = req.body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    if(!name || typeof name !== "string" || name.trim().length < 2) {
      throw Errors.badRequest("Name must be at least 2 characters.", "INVALID_NAME");
    }

    if(!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      throw Errors.badRequest("A valid email address is required.", "INVALID_EMAIL")
    }

    if(!password || typeof password!== "string") {
      throw Errors.badRequest("Password is required.", "INVALID_PASSWORD");
    }

    if(!PASSWORD_REGEX.test(password)) {
      throw Errors.badRequest(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special characters.", "WEAK PASSWORD",
      );
    }

    const result = await registerAdmin(name.trim(), email.trim().toLowerCase(), password);
    sendCreated(res, result, "Admin account created successfully.");

  } catch(err) {
    next(err)
  }
}