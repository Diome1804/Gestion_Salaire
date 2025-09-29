import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import payRunRoutes from "./routes/payRunRoutes.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/company", companyRoutes);
app.use("/employees", employeeRoutes);
app.use("/payruns", payRunRoutes);
app.get("/", (_, res) => {
    res.json({ message: "API Salary Backend OK" });
});
export default app;
//# sourceMappingURL=App.js.map