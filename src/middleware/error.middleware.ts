import type {Request, Response, NextFunction} from "express";
import { AppError } from "../lib/AppError";

export function notFoundHandler(req:Request, res:Response){
  return res.status(404).json({
    status: "error",
    code: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
} 

// ================ GLOBAL ERROR HANDLER ==========================
// Express recognizes a 4-argument function as an error handler.
// Mount this as the very last middleware in index.ts.
export function globalErrorHandler(err:unknown, req:Request, res:Response, _next:NextFunction):void {
  if(err instanceof AppError){
    res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
    });
    return;
  }

  //  ---- Database / Drizzle error ---- 
  // PostgreSQL drivers errors have a "code" property (e.g. "23505" = unique violation)

if(isPostgresError(err)){
  const {statusCode, code, message} = mapPostgresError(err);
  res.status(statusCode).json({status: "error", code, message});
  return;
}

// JWT ERRORS
if(err instanceof Error && err.name === "TokenExpiredError") {
  res.status(401).json({
    status: "error",
    code: "TOKEN_EXPIRED",
    message: "Access token has expired. Please refresh your token.",
  });
  return
}

if(err instanceof Error && err.name === "JsonWebTokenError"){
  res.status(401).json({
    status:"error",
    code: "INVALID_tOKEN",
    message: "Invalid token.",
  });
  return;
}

// Express body-parser errors(malformed JSON)
if(err instanceof SyntaxError && "body" in err) {
  res.status(400).json({
    status:"error",
    code: "INVALID_tOKEN",
    message: "Request body contains invalid JSON.",
  });
  return;
}

// Unknown / programming errors
// log the full error so we can debug it, but send a safe generic message to the client
console.error('[Unhandled Error]', {
  method: req.method,
  url: req.originalUrl,
  error: err,
});

res.status(500).json({
  status: "error",
  code: "INTERNAL_ERROR",
  message: "An unexpected error occurred. please try again later"
});
}

//  ================= POSTGRESS ERROR MAPPING =====================
interface PostgresError{
  code: string;
  detail?: string;
  constraint?: string;
}

function isPostgresError(err:unknown): err is PostgresError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as Record<string, unknown>).code === "string" &&
    /^[0-9A-Z]+$/.test((err as Record<string, unknown>).code as string)
  );
}

type PostgresErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
};

function mapPostgresError(err: PostgresError): PostgresErrorResponse {
  switch (err.code) {
    case "23505":
      return {
        statusCode: 409,
        code: "DUPLICATE_ENTRY",
        message: buildUniqueMessage(err.detail),
      };
    default:
      return {
        statusCode: 500,
        code: "DATABASE_ERROR",
        message: "A database error occurred.",
      };
  }
}

/* 
"Key (email)=(test@test.com) already exists"
*/
function buildUniqueMessage(detail?: string): string {
  if (!detail) {
    return "Duplicate entry already exists.";
  }

  const match = detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
  if (match) {
    return `Duplicate entry for ${match[1]}: ${match[2]}.`;
  }

  return "A duplicate value violates a unique constraint.";
}