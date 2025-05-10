// app/.well-known/appspecific/com.chrome.devtools.json/route.ts

import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';

interface DevToolsWorkspace {
  workspace: {
    root: string;
    uuid: string;
  };
}

// Cached UUID to persist between requests (in-memory during dev)
let cachedUUID: string | null = null;

/**
 * Route handler for Chrome DevTools Automatic Workspace Folders feature
 * This allows DevTools to automatically connect to local workspace folders
 * See: https://developer.chrome.com/docs/devtools/workspaces
 */

export async function GET(req: NextRequest): Promise<Response> {
  const host = req.headers.get('host');

  // ✅ Only serve on localhost and during development
  if (
    process.env.NODE_ENV !== 'development' ||
    !host?.startsWith('localhost')
  ) {
    return new Response(null, { status: 404 });
  }

  const projectRoot = process.cwd();

  // Prefer env variable if set, else use cached or new UUID
  const uuid = process.env.WORKSPACE_UUID || cachedUUID || (cachedUUID = uuidv4());

  const workspaceConfig: DevToolsWorkspace = {
    workspace: {
      root: projectRoot,
      uuid
    }
  };

  return new Response(JSON.stringify(workspaceConfig, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}