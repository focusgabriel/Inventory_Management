export class AppError extends Error{
  readonly statusCode:number;
  readonly code:string;
  readonly isOperational: boolean;

  constructor(statusCode: number, message:string, code = "Error", isOperational = true){
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // capture a clean stack reace that starts at the call site, not inside this constructor
    if(Error.captureStackTrace){
      Error.captureStackTrace(this, AppError);
    }
  }
}

export const Errors = {
  badRequest:(message:string, code="BAD_REQUEST") => new AppError(400, message, code),
  // unAuthorized:(message:"Authenticated required", code="UNAUTHORIZED") => new AppError(401, message, code),
  unAuthorized:(message:string, code="UNAUTHORIZED") => new AppError(401, message, code),
  forbidden:(message:"you do not have permission to do this", code="FORBIDDEN") => new AppError(400, message, code),
  notFound:(message:"Resource", code="NOT_FOUND") => new AppError(404, message, code),
  conflict:(message:string, code="CONFLICT") => new AppError(409, message, code),
  internal :(message="An Unexpected error occured", code="INTERN_ERROR") => new AppError(409, message, code),
} as const;
