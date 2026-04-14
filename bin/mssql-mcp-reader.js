#!/usr/bin/env node
// Launcher: spawns node with --import preloader from @esetnik/mssql-mcp-core,
// then runs @connorbritain/mssql-mcp-reader's entry point. The preloader must
// run before the reader imports the mssql driver — that's why this indirection
// exists instead of a plain `import`.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const require = createRequire(import.meta.url);

// Resolved through the @connorbritain namespace because the reader's own
// dep on @connorbritain/mssql-mcp-core is aliased (via the `npm:` protocol
// in this package's dependencies) to @esetnik/mssql-mcp-core. That means
// there's only one physical copy installed under the @connorbritain path,
// and it contains our fork's content.
const preloadUrl = pathToFileURL(
  require.resolve("@connorbritain/mssql-mcp-core/dist/preload-driver.js"),
).href;
const readerEntry = require.resolve("@connorbritain/mssql-mcp-reader/dist/index.js");

const child = spawn(
  process.execPath,
  ["--import", preloadUrl, readerEntry, ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(sig, () => child.kill(sig));
}
