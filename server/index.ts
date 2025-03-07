import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), '.data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Validate required environment variables
function validateEnvironment() {
  const required = [
    'SESSION_SECRET',
    'WSUS_SERVER',
    'WSUS_SERVICE_ACCOUNT',
    'WSUS_SERVICE_PASSWORD',
    'LDAP_URL',
    'LDAP_BASE_DN'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Ensure required directories exist
    await ensureDataDirectory();

    // Validate environment variables
    validateEnvironment();

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      log(`Error: ${err.message}`, 'error');
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server started on port ${port}`);
    });
  } catch (error) {
    log(`Failed to start server: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    process.exit(1);
  }
})();