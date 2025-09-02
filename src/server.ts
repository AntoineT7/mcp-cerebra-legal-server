import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Server } from "@modelcontextprotocol/sdk/server/index";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Import all your tool definitions and processors from src/mcp-tools.ts
import {
  LEGAL_THINK_TOOL,
  LEGAL_ASK_FOLLOWUP_QUESTION_TOOL,
  LEGAL_ATTEMPT_COMPLETION_TOOL,
  processLegalThink,
  processLegalAskFollowupQuestion,
  processLegalAttemptCompletion
} from "./mcp-tools";

const PORT = process.env.PORT || 8080;

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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;

  if (name === "legal_think") return processLegalThink(request.params.arguments);
  if (name === "legal_ask_followup_question") return processLegalAskFollowupQuestion(request.params.arguments);
  if (name === "legal_attempt_completion") return processLegalAttemptCompletion(request.params.arguments);

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
    const { name, arguments: args } = req.body as { name: string; arguments?: unknown };
    if (!name) return res.status(400).json({ error: "Missing tool name" });
    const result = await server.callTool(name, args);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Cerebra MCP HTTP server running on port ${PORT}`);
});
