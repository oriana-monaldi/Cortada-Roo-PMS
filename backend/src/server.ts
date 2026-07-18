import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { registerRoutes } from "./routes";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

registerRoutes(app);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Cortada Roo Backend escuchando en puerto ${PORT}`);
});
