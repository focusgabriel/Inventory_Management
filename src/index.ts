import express, {type Request, type Response} from "express";

import cors from "cors";
import "dotenv/config";
import {db} from "./db/index";
import {sql} from "drizzle-orm";

import { usersRouter } from "./routes";

const app = express();
const PORT = process.env.PORT || 8391

// Register CORS middleware - allows cross-origin requests from any frontend during developpment
// For Production, restrict `origin` to your frontend domain(s)
// app.use(cors());

// Register middleware: express.json() parses incoming JSON request bodies
// this allows us to access request body data via `req.body` in route handlers

app.use(express.json());

//  ======================== ROOT ENDPOPINT ===========================
//  GET / - Simple health check to confirm the API server is running

app.get('/', (_req: Request, res: Response) => {
  // Respond with a JSON message indicating the API is operational 
  res.json({message: "san_juan_inventory API Is running"});
});

//  =================== Health Check ENDPOINT ========================
// GET /health - verifies that the server can successfully connect to the database 
// Health check - verifies DB connectivity
app.get("/health", async(_req:Request, res: Response) => {
  try{
    // Execute a lightweight query (SELECT 1) to test the database connection
    await db.execute(sql `SELECT 1`);
    // if the query succeeds, the database is connected and healthy
    res.json({status: "ok", database: "connected"});
  } catch(error) {
    // if the query fails (e.g., DB is down), return a 503 Service Unavailable status 
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: error
    });
  }
});

app.use("/api/users", usersRouter){

}
app.listen(PORT, ()=> {
  console.log(`Server running on http://localhost:${PORT}`);
})


