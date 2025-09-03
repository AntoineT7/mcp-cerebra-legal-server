import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";

// ✨ NEW: Import your tool classes and their dependencies
import { LegalThinkTool } from './tools/LegalThinkTool.js';
import { LegalAskFollowupQuestionTool } from './tools/LegalAskFollowupQuestionTool.js';
import { LegalAttemptCompletionTool } from './tools/LegalAttemptCompletionTool.js';
import { DomainDetector } from './shared/DomainDetector.js';
import { LegalKnowledgeBase } from './shared/LegalKnowledgeBase.js';
import { CitationFormatter } from './shared/CitationFormatter.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const app = express();
app.use(bodyParser.json());

// ✨ NEW: Define the MCP Tool schemas directly here
const LEGAL_THINK_TOOL: Tool = {
  name: "legal_think",
  description: "A powerful tool for structured legal reasoning that helps analyze complex legal issues.",
  inputSchema: { type: "object", properties: { thought: { type: "string" } }, required: ["thought"] }
};
const LEGAL_ASK_FOLLOWUP_QUESTION_TOOL: Tool = {
  name: "legal_ask_followup_question",
  description: "A specialized tool for asking follow-up questions in legal contexts.",
  inputSchema: { type: "object", properties: { question: { type: "string" } }, required: ["question"] }
};
const LEGAL_ATTEMPT_COMPLETION_TOOL: Tool = {
  name: "legal_attempt_completion",
  description: "A specialized tool for presenting legal analysis results and conclusions.",
  inputSchema: { type: "object", properties: { result: { type: "string" } }, required: ["result"] }
};

// ✨ NEW: Instantiate your dependencies
const domainDetector = new DomainDetector();
const legalKnowledgeBase = new LegalKnowledgeBase();
const citationFormatter = new CitationFormatter();

// ✨ NEW: Instantiate your tool classes with their dependencies
const legalThinkTool = new LegalThinkTool(domainDetector, legalKnowledgeBase, citationFormatter);
const legalAskFollowupQuestionTool = new LegalAskFollowupQuestionTool(domainDetector, legalKnowledgeBase);
const legalAttemptCompletionTool = new LegalAttemptCompletionTool(domainDetector, legalKnowledgeBase, citationFormatter);

// Create MCP server instance
const server = new Server(
  { name: "mcp-cerebra-legal-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Define the list of tools
const toolList = [LEGAL_THINK_TOOL, LEGAL_ASK_FOLLOWUP_QUESTION_TOOL, LEGAL_ATTEMPT_COMPLETION_TOOL];

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolList,
}));

// ✅ Reusable function for the core tool-calling logic
async function executeTool(name: string, args: Record<string, any>) {
  logger.info(`Executing tool: ${name}`);
  // ✨ UPDATED: Call the methods on your new class instances
  if (name === "legal_think") return legalThinkTool.processThought(args);
  if (name === "legal_ask_followup_question") return legalAskFollowupQuestionTool.processQuestion(args);
  if (name === "legal_attempt_completion") return legalAttemptCompletionTool.processCompletion(args);

  return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};
  return executeTool(name, args);
});

// Add a root endpoint for health checks and basic info
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    name: "mcp-cerebra-legal-server",
    version: "1.0.0",
    message: "Server is running. Use GET /tools to see available tools."
  });
});

// HTTP endpoints for Cloud Run
app.get("/tools", async (_req: Request, res: Response) => {
  try {
    res.json({ tools: toolList });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

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

// Cloud Run requires 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Cerebra MCP HTTP server running on port ${PORT}`);
});
