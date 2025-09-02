import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Server } from "@modelcontextprotocol/sdk/server";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import {
  LEGAL_THINK_TOOL,
  LEGAL_ASK_FOLLOWUP_QUESTION_TOOL,
  LEGAL_ATTEMPT_COMPLETION_TOOL,
  processLegalThink,
  processLegalAskFollowupQuestion,
  processLegalAttemptCompletion
} from "./mcp-tools.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const app = express();
app.use(bodyParser.json());

// Create MCP server instance
const server = new Server(
  { name: "mcp-cerebra-legal-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [LEGAL_THINK_TOOL, LEGAL_ASK_FOLLOWUP_QUESTION_TOOL, LEGAL_ATTEMPT_COMPLETION_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: typeof CallToolRequestSchema._type) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};

  if (name === "legal_think") return processLegalThink(args);
  if (name === "legal_ask_followup_question") return processLegalAskFollowupQuestion(args);
  if (name === "legal_attempt_completion") return processLegalAttemptCompletion(args);

  return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
});

// HTTP endpoints for Cloud Run
app.get("/tools", async (_req: Request, res: Response) => {
  try {
    const tools = await server.getTools();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.post("/call-tool", async (req: Request, res: Response) => {
  try {
    const { name, arguments: args } = req.body as { name: string; arguments?: Record<string, unknown> };
    if (!name) return res.status(400).json({ error: "Missing tool name" });
    const result = await server.callTool(name, args ?? {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// Cloud Run requires 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cerebra MCP HTTP server running on port ${PORT}`);
});
