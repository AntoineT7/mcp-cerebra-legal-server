// mcp-tools.ts
import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { DomainDetector } from "./shared/DomainDetector.js";
import { LegalKnowledgeBase } from "./shared/LegalKnowledgeBase.js";
import { CitationFormatter } from "./shared/CitationFormatter.js";
import { logger } from "./utils/logger.js";

import { LegalThinkTool } from "./tools/LegalThinkTool.js";
import { LegalAskFollowupQuestionTool } from "./tools/LegalAskFollowupQuestionTool.js";
import { LegalAttemptCompletionTool } from "./tools/LegalAttemptCompletionTool.js";

// Shared dependencies (singletons)
const domainDetector = new DomainDetector();
const legalKnowledgeBase = new LegalKnowledgeBase();
const citationFormatter = new CitationFormatter();

// Tool instances
const thinkTool = new LegalThinkTool(domainDetector, legalKnowledgeBase, citationFormatter);
const askFollowupTool = new LegalAskFollowupQuestionTool(domainDetector, legalKnowledgeBase);
const attemptCompletionTool = new LegalAttemptCompletionTool(domainDetector, legalKnowledgeBase, citationFormatter);

// MCP tool definitions
export const toolList: Tool[] = [
  {
    name: "legal_think",
    description: "Analyze and expand legal thoughts, detect domain, provide guidance/templates, and track reasoning history.",
    inputSchema: {
      type: "object",
      properties: {
        thought: { type: "string" },
        category: { type: "string" },
        references: { type: "array", items: { type: "string" } },
        isRevision: { type: "boolean" },
        revisesThoughtNumber: { type: "number" },
        requestGuidance: { type: "boolean" },
        requestTemplate: { type: "boolean" },
        thoughtNumber: { type: "number" },
        totalThoughts: { type: "number" },
        nextThoughtNeeded: { type: "boolean" }
      },
      required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
    }
  },
  {
    name: "legal_ask_followup_question",
    description: "Generate follow-up legal questions with suggested options based on the detected domain.",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string" },
        options: { type: "array", items: { type: "string" } },
        context: { type: "string" }
      },
      required: ["question"]
    }
  },
  {
    name: "legal_attempt_completion",
    description: "Format and complete a draft legal analysis with domain-specific structure and citations.",
    inputSchema: {
      type: "object",
      properties: {
        result: { type: "string" },
        command: { type: "string" },
        context: { type: "string" }
      },
      required: ["result"]
    }
  }
];

// Tool execution router
export async function executeTool(name: string, args: unknown) {
  logger.debug(`Executing tool: ${name}`, args);

  switch (name) {
    case "legal_think":
      return thinkTool.processThought(args);
    case "legal_ask_followup_question":
      return askFollowupTool.processQuestion(args);
    case "legal_attempt_completion":
      return attemptCompletionTool.processCompletion(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
