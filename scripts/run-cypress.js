/**
 * Cypress launcher — removes ELECTRON_RUN_AS_NODE from env before starting.
 * VS Code terminal sets ELECTRON_RUN_AS_NODE=1 for its own Electron instance.
 * Cypress's Electron binary checks if ELECTRON_RUN_AS_NODE is *set to any non-empty value*
 * and runs as bare Node.js, which rejects --smoke-test as "bad option".
 * Deleting the variable (not just setting to 0) is the correct fix.
 */

delete process.env.ELECTRON_RUN_AS_NODE;

const { spawn } = require('child_process');
const args = process.argv.slice(2); // e.g. ['run'] or ['open']

const proc = spawn('npx', ['cypress', ...args], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

proc.on('exit', (code) => process.exit(code ?? 0));
