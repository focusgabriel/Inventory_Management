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

    if(Error.captureStackTrace){
      Error.captureStackTrace(this, AppError);
    }
  }
}

