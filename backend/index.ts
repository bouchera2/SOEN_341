// backend/index.ts
import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

// Other routers (keep your existing imports; IMPORTANT: use .js for the ones that are already compiled to JS at runtime)
import ticketsRouter from "./routes/tickets.js";
import eventRoutes from "./routes/events.js";
import analyticsRoutes from "./routes/analytics.js";
import eventAnalyticsRoutes from "./routes/eventAnalytics.js";
import eventExportRoutes from "./routes/eventExports.js";
import authRoutes from "./routes/authRouter.js";
import permissionsRoutes from "./routes/permissions.js";
import imagesRoutes from "./routes/images.js";
import userRoleRoutes from "./routes/userRole.js";
import organizerRequestsRouter from "./routes/organizerRequests.js";

// 👇 For TSX + ESM + NodeNext, import the TS file WITH .ts extension.
// TSX will handle it. This bypasses Node’s “must-be-real-.js-on-disk” rule.
import chatRouter from "./routes/chat";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("✅ Backend ConcoEvents running on port 3002");
});

// Your routes
app.use("/tickets", ticketsRouter);
app.use("/events", eventRoutes);
app.use("/events", eventAnalyticsRoutes);
app.use("/events", eventExportRoutes);
app.use("/events/analytics", analyticsRoutes);
app.use("/auth", authRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/images", imagesRoutes);
app.use("/userRole", userRoleRoutes);
app.use("/organizer-requests", organizerRequestsRouter);

// 👇 Mount the chat router at root. The route itself is /api/chat inside chat.ts
app.use("/", chatRouter);

app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

const port = parseInt(process.env.PORT || "3002", 10);
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
