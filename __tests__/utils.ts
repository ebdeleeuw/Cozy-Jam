import { spawn } from 'node:child_process';
import { once } from 'node:events';

function pickPort() {
  return 10000 + Math.floor(Math.random() * 20000);
}

export async function startServer(port?: number) {
  let attempts = 0;
  let lastErr: Error | null = null;

  while (attempts < 5) {
    attempts += 1;
    const chosen = port ?? pickPort();
    const proc = spawn('node', ['server/index.js'], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: String(chosen) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const ready = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => resolve(), 150);
      proc.stdout.on('data', (data) => {
        const text = data.toString();
        if (text.includes('Cozy Jam server listening')) {
          clearTimeout(timer);
          resolve();
        }
      });
      proc.stderr.on('data', (data) => {
        const text = data.toString();
        if (text.includes('EADDRINUSE')) {
          clearTimeout(timer);
          reject(new Error(text));
        }
      });
      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
      proc.on('exit', (code) => {
        if (code && code !== 0) reject(new Error(`server exited ${code}`));
      });
    });

    try {
      await ready;
      return {
        proc,
        port: chosen,
        async stop() {
          proc.kill();
          await once(proc, 'exit');
        },
      };
    } catch (err: any) {
      lastErr = err;
      proc.kill();
      await once(proc, 'exit');
    }
  }

  throw lastErr ?? new Error('failed to start server');
}
