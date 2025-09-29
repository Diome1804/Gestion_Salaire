import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

dotenv.config();

const app = express();


app.use(cors());

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/company", companyRoutes);

app.get("/", (_, res) => {
  res.json({ message: "API Salary Backend OK" });
});

export default app;
