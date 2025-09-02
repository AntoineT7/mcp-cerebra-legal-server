import { Tool } from "@modelcontextprotocol/sdk/types.js";
import chalk from "chalk";

/**
 * Tool definitions
 */
export const LEGAL_THINK_TOOL: Tool = {
  name: "legal_think",
  description: `A powerful tool for structured legal reasoning that helps analyze complex legal issues.
This tool provides domain-specific guidance and templates for different legal areas including ANSC contestations, consumer protection, and contract analysis.`,
  inputSchema: {
    type: "object",
    properties: {
      thought: { type: "string", description: "The main legal reasoning content" },
      category: {
        type: "string",
        enum: [
          "analysis", "planning", "verification", "legal_reasoning",
          "ansc_contestation", "consumer_protection", "contract_analysis"
        ],
        description: "Category of legal reasoning (optional, auto-detected if not provided)"
      },
      references: { type: "array", items: { type: "string" }, description: "References (optional)" },
      isRevision: { type: "boolean", description: "Whether this thought revises a previous one (optional)" },
      revisesThoughtNumber: { type: "integer", description: "The thought number being revised" },
      requestGuidance: { type: "boolean", description: "Request domain-specific guidance" },
      requestTemplate: { type: "boolean", description: "Request a template" },
      thoughtNumber: { type: "integer", minimum: 1 },
      totalThoughts: { type: "integer", minimum: 1 },
      nextThoughtNeeded: { type: "boolean" }
    },
    required: ["thought", "thoughtNumber", "totalThoughts", "nextThoughtNeeded"]
  }
};

export const LEGAL_ASK_FOLLOWUP_QUESTION_TOOL: Tool = {
  name: "legal_ask_followup_question",
  description: "A specialized tool for asking follow-up questions in legal contexts.",
  inputSchema: {
    type: "object",
    properties: {
      question: { type: "string", description: "The legal question to ask the user" },
      options: { type: "array", items: { type: "string" }, description: "Optional options" },
      context: { type: "string", description: "Additional context" }
    },
    required: ["question"]
  }
};

export const LEGAL_ATTEMPT_COMPLETION_TOOL: Tool = {
  name: "legal_attempt_completion",
  description: "A specialized tool for presenting legal analysis results and conclusions.",
  inputSchema: {
    type: "object",
    properties: {
      result: { type: "string", description: "The legal analysis result or conclusion" },
      command: { type: "string", description: "CLI command (optional)" },
      context: { type: "string", description: "Additional context (optional)" }
    },
    required: ["result"]
  }
};

/**
 * Thought history
 */
const thoughtHistory: Array<Record<string, unknown>> = [];

/**
 * Domain detection
 */
const legalDomainPatterns: Record<string, RegExp[]> = {
  ansc_contestation: [/contestation/i, /ANSC/i, /procurement/i, /tender/i, /Law 131\/2015/i, /technical specification/i, /award criteria/i],
  consumer_protection: [/consumer/i, /warranty/i, /product/i, /refund/i, /Consumer Protection Law/i, /misleading/i, /advertising/i, /product safety/i],
  contract_analysis: [/contract/i, /clause/i, /agreement/i, /Civil Code/i, /obligation/i, /contractual/i, /parties/i]
};

function detectDomain(text: string): string {
  for (const [domain, patterns] of Object.entries(legalDomainPatterns)) {
    if (patterns.some((pattern) => pattern.test(text))) return domain;
  }
  return "legal_reasoning";
}

/**
 * Format thought for logs
 */
function formatThought(
  thought: string,
  domain: string,
  thoughtNumber: number,
  totalThoughts: number,
  isRevision?: boolean,
  revisesThoughtNumber?: number
): string {
  let prefix = "";
  let color = chalk.blue;

  switch (domain) {
    case "ansc_contestation": color = chalk.magenta; prefix = "ANSC Analysis"; break;
    case "consumer_protection": color = chalk.green; prefix = "Consumer Protection"; break;
    case "contract_analysis": color = chalk.cyan; prefix = "Contract Analysis"; break;
    default: color = chalk.blue; prefix = "Legal Reasoning";
  }

  if (isRevision) {
    prefix = chalk.yellow(`${prefix} (Revision)`);
  }

  return `${prefix} ${thoughtNumber}/${totalThoughts}: ${thought}`;
}

/**
 * Process legal_think
 */
export function processLegalThink(input: Record<string, any>) {
  const domain = input.category || detectDomain(input.thought || "");
  thoughtHistory.push({ ...input, domain, timestamp: new Date() });

  const formatted = formatThought(
    input.thought,
    domain,
    input.thoughtNumber,
    input.totalThoughts,
    input.isRevision,
    input.revisesThoughtNumber
  );
  console.error(formatted);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          thoughtNumber: input.thoughtNumber,
          totalThoughts: input.totalThoughts,
          nextThoughtNeeded: input.nextThoughtNeeded,
          detectedDomain: domain,
          thoughtHistoryLength: thoughtHistory.length
        }, null, 2)
      }
    ]
  };
}

/**
 * Process legal_ask_followup_question
 */
export function processLegalAskFollowupQuestion(input: Record<string, any>) {
  const domain = detectDomain(input.context ? `${input.question} ${input.context}` : input.question);
  const options = input.options && input.options.length ? input.options : ["Option 1", "Option 2", "Option 3"];

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ question: input.question, options, detectedDomain: domain }, null, 2)
      }
    ]
  };
}

/**
 * Process legal_attempt_completion
 */
export function processLegalAttemptCompletion(input: Record<string, any>) {
  const domain = detectDomain(input.context ? `${input.result} ${input.context}` : input.result);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ result: input.result, detectedDomain: domain }, null, 2)
      }
    ]
  };
}
