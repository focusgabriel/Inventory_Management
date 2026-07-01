import express, {type Request, type Response} from "express";

import cors from "cors";
import "dotenv/config";
import {db} from "./db/index";
import {sql} from "drizzle-orm";


const app = express();
const PORT = process.env.PORT || 8391
