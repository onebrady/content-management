import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'example_tool',
      'Description of your tool',
      {
        param: z.string(),
      },
      async ({ param }) => {
        return {
          content: [{ type: 'text', text: `Result: ${param}` }],
        };
      }
    );
  },
  {}, // Optional server options
  {
    basePath: '/api',
    redisUrl: process.env.REDIS_URL,
  }
);

export { handler as GET, handler as POST };
