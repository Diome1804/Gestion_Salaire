import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

dotenv.config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'http://localhost:5173', // Vite dev server
    'https://salary-management-system.vercel.app', // Deployed frontend (adjust if different)
    'https://salary-management-system.netlify.app', // Alternative deployment
    'https://bachir-uchiwa-salary-management.netlify.app', // If using Netlify
    '*' // Allow all origins for now (remove in production)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/company", companyRoutes);

app.get("/", (_, res) => {
  res.json({ message: "API Salary Backend OK" });
});

export default app;
