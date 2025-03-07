import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { storage } from "./storage";

export const mcpServer = new McpServer({
  name: "WSUS Compliance",
  version: "1.0.0"
});

// Resource for computer status
mcpServer.resource(
  "computer",
  new ResourceTemplate("wsus://{computerName}", { list: undefined }),
  async (uri, { computerName }) => {
    const computer = await storage.getComputerByName(computerName);
    if (!computer) {
      throw new Error(`Computer ${computerName} not found`);
    }

    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify({
          name: computer.computerName,
          ip: computer.ipAddress,
          os: computer.osVersion,
          compliance: {
            needed: computer.neededCount,
            installed: computer.installedCount,
            failed: computer.failedCount
          },
          lastSync: computer.lastSyncTime
        }, null, 2)
      }]
    };
  }
);

// Tool to list non-compliant computers
mcpServer.tool(
  "list_noncompliant",
  {},
  async () => {
    const computers = await storage.getNonCompliantComputers();
    return {
      content: [{
        type: "text",
        text: JSON.stringify(computers.map(c => ({
          name: c.computerName,
          needed: c.neededCount,
          failed: c.failedCount
        })), null, 2)
      }]
    };
  }
);

// Tool to get update status
mcpServer.tool(
  "get_update_status",
  { updateId: z.string() },
  async ({ updateId }) => {
    const status = await storage.getUpdateStatus(updateId);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(status, null, 2)
      }]
    };
  }
);
