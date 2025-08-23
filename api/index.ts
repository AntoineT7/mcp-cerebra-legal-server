// File: api/index.ts

import { createMcpHandler } from 'mcp-handler';
import { tools } from '../src/tools'; // Imports the legal tools from the original source

// This one line creates and exports the entire serverless function!
export default createMcpHandler({ tools });