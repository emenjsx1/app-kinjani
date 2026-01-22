import { Hono, type Context } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { McpServer, StreamableHttpTransport } from "https://esm.sh/mcp-lite@0.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const app = new Hono();

// Create MCP server instance
const mcpServer = new McpServer({
  name: "kijani-mcp-server",
  version: "1.0.0",
  logger: {
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  },
});

// Tool: Hello World
mcpServer.tool("hello_world", {
  description: "Returns a greeting message",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Name to greet" },
    },
    required: ["name"],
  },
  handler: (args: { name: string }) => {
    console.log(`[MCP] hello_world called with name: ${args.name}`);
    return {
      content: [{ type: "text", text: `Hello, ${args.name}! Welcome to Kijani AI.` }],
    };
  },
});

// Tool: Get current time
mcpServer.tool("get_current_time", {
  description: "Returns the current server time",
  handler: () => {
    const now = new Date().toISOString();
    console.log(`[MCP] get_current_time called, returning: ${now}`);
    return {
      content: [{ type: "text", text: `Current server time: ${now}` }],
    };
  },
});

// Tool: Echo message
mcpServer.tool("echo", {
  description: "Echoes back the provided message",
  inputSchema: {
    type: "object",
    properties: {
      message: { type: "string", description: "Message to echo" },
    },
    required: ["message"],
  },
  handler: (args: { message: string }) => {
    console.log(`[MCP] echo called with message: ${args.message}`);
    return {
      content: [{ type: "text", text: `Echo: ${args.message}` }],
    };
  },
});

// Create HTTP transport and bind to server
const transport = new StreamableHttpTransport();
const handler = transport.bind(mcpServer);

// Handle CORS preflight
app.options("/*", (c: Context) => {
  return new Response(null, { headers: corsHeaders });
});

// MCP endpoint - handles all MCP requests
app.all("/mcp-server/mcp", async (c: Context) => {
  console.log(`[MCP] Received ${c.req.method} request to /mcp`);
  
  try {
    const response = await handler(c.req.raw);
    
    // Add CORS headers to response
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[MCP] Error handling request:", errorMessage);
    return new Response(
      JSON.stringify({ 
        jsonrpc: "2.0",
        error: { code: -32603, message: errorMessage },
        id: null 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Health check - root of the function
app.get("/mcp-server", (c: Context) => {
  return new Response(
    JSON.stringify({ 
      status: "ok", 
      server: "kijani-mcp-server",
      version: "1.0.0",
      tools: ["hello_world", "get_current_time", "echo"],
      mcp_endpoint: "/mcp-server/mcp"
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});

Deno.serve(app.fetch);
