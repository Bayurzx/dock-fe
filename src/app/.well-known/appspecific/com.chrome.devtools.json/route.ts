// app/.well-known/appspecific/com.chrome.devtools.json/route.ts
import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs';

interface DevToolsWorkspace {
  workspace: {
    root: string;
    uuid: string;
  };
}

export async function GET(_request: NextRequest): Promise<Response> {
  // Try to read tsconfig to determine root directory
  let projectRoot = process.cwd();
  
  try {
    // Attempt to read tsconfig for more accurate path information
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      
      // If using baseUrl in tsconfig, adjust the root path accordingly
      if (tsconfig.compilerOptions?.baseUrl) {
        projectRoot = path.join(process.cwd(), tsconfig.compilerOptions.baseUrl);
      }
    }
  } catch (error) {
    console.warn('Failed to parse tsconfig.json, using default path:', error);
  }

  const workspaceConfig: DevToolsWorkspace = {
    workspace: {
      root: projectRoot,
      uuid: process.env.WORKSPACE_UUID || uuidv4()
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