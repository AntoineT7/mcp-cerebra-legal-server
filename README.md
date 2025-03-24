# Cerebra Legal MCP Server

An enterprise-grade MCP server for legal reasoning and analysis based on the "think" tool concept from [Anthropic's engineering blog](https://www.anthropic.com/engineering/claude-think-tool).

## Overview

Cerebra Legal provides three powerful tools for legal reasoning and analysis:

1. **legal_think** - A structured legal reasoning tool that helps analyze complex legal issues with domain-specific guidance and templates.
2. **legal_ask_followup_question** - A specialized tool for asking follow-up questions in legal contexts with domain-specific options.
3. **legal_attempt_completion** - A tool for presenting legal analysis results with proper structure and citation formatting.

The server automatically detects legal domains (ANSC contestation, consumer protection, contract analysis) and provides domain-specific guidance, templates, and feedback.

## Features

- **Domain Detection**: Automatically identifies the legal domain of the analysis
- **Domain-Specific Guidance**: Provides tailored guidance for different legal domains
- **Structured Templates**: Offers domain-specific templates for legal analysis
- **Citation Formatting**: Properly formats legal citations
- **Thought Quality Analysis**: Provides feedback on legal reasoning quality
- **Revision Support**: Allows for revising previous thoughts

## Installation

```bash
# Clone the repository
git clone https://github.com/yoda-digital/mcp-cerebra-legal-server.git
cd mcp-cerebra-legal-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

### Testing the Server

The repository includes a test client that demonstrates how to interact with the server:

```bash
# Make the test client executable
chmod +x test-client.js

# Run the test client
./test-client.js
```

The test client will:
1. Start the server
2. Send a tools/list request to get available tools
3. Send a legal_think request with a sample thought
4. Display the server's responses

### Adding to Claude

To add the server to Claude, update your MCP settings file with the following configuration:

#### For VSCode Extension

Edit the file at `~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "cerebra-legal": {
      "command": "node",
      "args": ["/path/to/mcp-cerebra-legal-server/build/index.js"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

#### For Claude Desktop App

Edit the file at `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the equivalent on your platform:

```json
{
  "mcpServers": {
    "cerebra-legal": {
      "command": "node",
      "args": ["/path/to/mcp-cerebra-legal-server/build/index.js"],
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

### Using the Tools in Claude

Once the server is added to Claude, you can use the tools in your conversations:

#### 1. Using legal_think

The legal_think tool helps you analyze complex legal issues with structured thinking:

```
I need to analyze an ANSC contestation where a claimant argues that technical specifications in a tender were too restrictive.
```

Claude will use the legal_think tool to:
- Detect the legal domain (ANSC contestation)
- Provide domain-specific guidance
- Offer a structured template for analysis
- Give feedback on the quality of legal reasoning
- Support revision of previous thoughts

#### 2. Using legal_ask_followup_question

When Claude needs more information to complete a legal analysis:

```
What specific provisions of the technical specifications are being challenged?
```

Claude will use the legal_ask_followup_question tool to:
- Format the question with appropriate legal terminology
- Provide domain-specific options for the user to choose from
- Detect the legal domain for context-aware questioning

#### 3. Using legal_attempt_completion

When Claude is ready to present the final legal analysis:

```
Based on my analysis, the technical specifications requiring "minimum 5 years experience" appear disproportionate and likely violate Article 33(2) of Law 131/2015 on public procurement.
```

Claude will use the legal_attempt_completion tool to:
- Format the conclusion with proper legal structure
- Extract and format legal citations
- Organize the analysis into clear sections
- Provide a professional legal document format

### Tool Input Schemas

#### legal_think

```json
{
  "thought": "Analyzing ANSC contestation where claimant argues technical specifications were too restrictive.",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true,
  "category": "ansc_contestation",  // Optional, auto-detected if not provided
  "references": ["Law 131/2015", "ANSC Decision #12345"],  // Optional
  "isRevision": false,  // Optional
  "revisesThoughtNumber": null,  // Optional
  "requestGuidance": true,  // Optional
  "requestTemplate": true  // Optional
}
```

#### legal_ask_followup_question

```json
{
  "question": "What specific provisions of the technical specifications are being challenged?",
  "options": [  // Optional, auto-generated if not provided
    "Are you challenging the experience requirements?",
    "Are you challenging the technical capacity requirements?",
    "Are you challenging the financial requirements?",
    "Are you challenging the certification requirements?"
  ],
  "context": "ANSC contestation regarding procurement of IT equipment"  // Optional
}
```

#### legal_attempt_completion

```json
{
  "result": "Based on the analysis of ANSC contestation #12345, the technical specifications requiring 'minimum 5 years experience' appear disproportionate and likely violate Article 33(2) of Law 131/2015 on public procurement.",
  "command": null,  // Optional
  "context": "ANSC contestation analysis"  // Optional
}
```

## Architecture

The server is built with a modular architecture:

- **Domain Detector**: Identifies the legal domain of the analysis
- **Legal Knowledge Base**: Provides domain-specific guidance and templates
- **Citation Formatter**: Formats legal citations properly
- **Tool Implementations**: Handles the logic for each tool

## Development

### Project Structure

```
mcp-cerebra-legal-server/
├── src/
│   ├── shared/           # Shared components
│   │   ├── DomainDetector.ts
│   │   ├── LegalKnowledgeBase.ts
│   │   ├── CitationFormatter.ts
│   │   └── types.ts
│   ├── tools/            # Tool implementations
│   │   ├── LegalThinkTool.ts
│   │   ├── LegalAskFollowupQuestionTool.ts
│   │   └── LegalAttemptCompletionTool.ts
│   ├── utils/            # Utilities
│   │   └── logger.ts
│   └── index.ts          # Main server entry point
├── build/                # Compiled JavaScript
├── test-client.js        # Test client
├── package.json
└── tsconfig.json
```

### Building

```bash
npm run build
```

### Testing

```bash
# Run the test client
./test-client.js
```

## Repository

This project is available on GitHub at:
https://github.com/yoda-digital/mcp-cerebra-legal-server

## References

- [The "think" tool: Enabling Claude to stop and think in complex tool use situations](https://www.anthropic.com/engineering/claude-think-tool) - Anthropic Engineering Blog

## License

MIT