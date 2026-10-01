import { z } from "zod";
import { logger } from "../config/logger.js";

const toolRegistry = new Map();

export function registerTool(tool) {
  toolRegistry.set(tool.name, tool);
}

export async function executeTool(toolName, inputParams, context = {}) {
  const tool = toolRegistry.get(toolName);
  if (!tool) {
    throw new Error(`Tool '${toolName}' is not registered.`);
  }

  // Validate input parameters using Zod schema
  const parsedInput = tool.schema.parse(inputParams);

  const startTime = Date.now();
  const result = await tool.execute(parsedInput, context);
  const executionTimeMs = Date.now() - startTime;

  if (context.recordStep) {
    await context.recordStep({
      agentName: context.agentName || "ToolRunner",
      stepType: "TOOL_CALL",
      toolName,
      inputParams: parsedInput,
      outputResult: result,
      executionTimeMs
    });
  }

  return result;
}

export function getAllTools() {
  return Array.from(toolRegistry.values()).map(t => ({
    name: t.name,
    description: t.description
  }));
}
