import type { Response } from "express";

// =========== RESPONSE SHAPE ============
// Every success response has the same envelope so clients always know
// where to find data and whether the call succeded.
//  200: {status: "success", data: T}
//  200: {status: "success", message:string, data:T}
//  201: {stauts: "success", message:string, data:T}
//  204: {empty body - used for deletes}

//  ============== SEND 200 OK =============
// Generic successful read or update response.

export function sendOk<T>(res: Response, data: T, message?:string): void {
  res.status(200).json({
    status: "success",
    ...(message ? {message} : {}),
    data,
  })
}

//  ============== SEND 201 CREATED =============
// Used after any resource creation (POST that inserts a new row).
export function sendCreated<T>(res:Response, data:T, message?:string): void {
  res.status(201).json({
    status: "success", 
    message: message ?? "Resource created successfully.",
    data,
  });
}

// ============= SEND 204 NO CONTENT ================
//  used after a successful delete where there is nothing to return.
//  No body is set - 204 status alone confirms success.
export function sendNoContent(res:Response): void {
  res.status(204).end();
}