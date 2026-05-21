// server.js
import fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import workflowRouter from "./src/routers/workflowRouter.js";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = fastify({ logger: true });

//CORS — MUST BE BEFORE ROUTES
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization","x-tenant-id","x-client-timezone"],
});

// REQUIRED FOR IMAGE / VIDEO / DOC UPLOAD
await app.register(multipart, {
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

// Routes
app.register(workflowRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
await app.register(fastifyStatic, {
  root: __dirname,
});


// Serve index.html
app.get("/", async (request, reply) => {
    console.log("✅ Frontend Loaded Successfully");
  return reply.sendFile("index.html");
});

app.get("/health", async (request, reply) => {
  return {
    success: true,
    message: "CI/CD Auto Deployment Working Successfully 🚀"
  };
});

// Server start
const PORT = process.env.PORT || 8000;

app.listen({ port: PORT, host: "0.0.0.0" })
  .then(async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("🟩 Temporal client connected");
  })
  .catch(err => {
    console.error("❌ Server failed:", err);
    process.exit(1);
  });
