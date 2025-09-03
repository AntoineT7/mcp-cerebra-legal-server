import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { toolList, executeTool } from "./mcp-tools-prime.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const app = express();
app.use(bodyParser.json());

// Create MCP server instance
const server = new Server(
  { name: "mcp-cerebra-legal-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Register ListTools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolList,
}));

// Register CallTool handler
server.setRequestHandler(CallToolRequestSchema, async (request: typeof CallToolRequestSchema._type) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};

  try {
    return await executeTool(name, args);
  } catch (err) {
    return {
      content: [
        { type: "text", text: err instanceof Error ? err.message : String(err) }
      ],
      isError: true
    };
  }
});

// Root endpoint for health check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    name: "mcp-cerebra-legal-server",
    version: "1.0.0",
    message: "Server is running. Use GET /tools to see available tools."
  });
});

// HTTP endpoint to list tools
app.get("/tools", async (_req: Request, res: Response) => {
  try {
    res.json({ tools: toolList });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// HTTP endpoint to call a tool
app.post("/call-tool", async (req: Request, res: Response) => {
  try {
    const { name, arguments: args } = req.body as { name: string; arguments?: Record<string, unknown> };
    if (!name) return res.status(400).json({ error: "Missing tool name" });

    const result = await executeTool(name, args ?? {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cerebra MCP HTTP server running on port ${PORT}`);
});
