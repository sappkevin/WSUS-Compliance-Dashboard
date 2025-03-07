import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mcpServer } from "./mcp";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { getWsusComputers, getWsusUpdates } from "@shared/powershell";
// Temporarily comment out authentication imports
// import passport from "passport";
// import { configureAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  // Temporarily disable auth
  // const { requireAuth } = configureAuth(app);

  // Commenting out authentication routes for now
  /*
  app.post("/api/login", passport.authenticate("ldapauth"), (req, res) => {
    res.json({ message: "Login successful" });
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/user", requireAuth, (req, res) => {
    res.json(req.user);
  });
  */

  // MCP routes - temporarily disable auth
  app.get("/mcp/sse", async (req, res) => {
    const transport = new SSEServerTransport("/mcp/messages", res);
    await mcpServer.connect(transport);
  });

  app.post("/mcp/messages", async (req, res) => {
    const transport = new SSEServerTransport("/mcp/messages", res);
    await transport.handlePostMessage(req, res);
  });

  // API routes - temporarily remove requireAuth middleware
  app.get("/api/computers", async (_req, res) => {
    try {
      const computers = await storage.getAllComputers();
      res.json(computers);
    } catch (err) {
      console.error('Error fetching computers:', err);
      res.status(500).json({ message: "Failed to fetch computers" });
    }
  });

  app.get("/api/updates", async (_req, res) => {
    try {
      const updates = await storage.getAllUpdates();
      res.json(updates);
    } catch (err) {
      console.error('Error fetching updates:', err);
      res.status(500).json({ message: "Failed to fetch updates" });
    }
  });

  app.get("/api/compliance", async (_req, res) => {
    try {
      const stats = await storage.getComplianceStats();
      res.json(stats);
    } catch (err) {
      console.error('Error fetching compliance stats:', err);
      res.status(500).json({ message: "Failed to fetch compliance stats" });
    }
  });

  app.post("/api/sync", async (_req, res) => {
    try {
      console.log('Starting WSUS data sync...');

      // First try to get computers
      let computers;
      try {
        computers = await getWsusComputers();
        console.log(`Retrieved ${computers?.length || 0} computers from WSUS`);
      } catch (err: any) {
        console.error('Failed to get WSUS computers:', err);
        return res.status(500).json({ 
          message: err.message || 'Failed to retrieve computers from WSUS server'
        });
      }

      // Then try to get updates
      let updates;
      try {
        updates = await getWsusUpdates();
        console.log(`Retrieved ${updates?.length || 0} updates from WSUS`);
      } catch (err: any) {
        console.error('Failed to get WSUS updates:', err);
        return res.status(500).json({ 
          message: err.message || 'Failed to retrieve updates from WSUS server'
        });
      }

      // Finally sync the data
      try {
        await storage.syncData(computers, updates);
        console.log('Successfully synced WSUS data to storage');
        res.json({ 
          message: "Sync completed",
          computers: computers.length,
          updates: updates.length
        });
      } catch (err: any) {
        console.error('Failed to sync data to storage:', err);
        return res.status(500).json({ 
          message: 'Failed to save WSUS data to storage'
        });
      }
    } catch (err: any) {
      console.error('Unexpected error during sync:', err);
      res.status(500).json({ 
        message: err.message || 'An unexpected error occurred during sync'
      });
    }
  });

  return httpServer;
}