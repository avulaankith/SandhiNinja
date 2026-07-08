import { spawn, spawnSync } from "node:child_process";

const cwd = process.cwd();
const SERVER_BUILD_ARGS = ["./node_modules/typescript/bin/tsc", "-p", "tsconfig.server.json"];
const SERVER_WATCH_ARGS = [
  ...SERVER_BUILD_ARGS,
  "--watch",
  "--preserveWatchOutput",
  "--watchFile",
  "fixedpollinginterval",
  "--watchDirectory",
  "fixedpollinginterval",
];

const initialBuild = spawnSync(
  process.execPath,
  SERVER_BUILD_ARGS,
  {
    cwd,
    stdio: "inherit",
  },
);

if (initialBuild.error) {
  console.error("Initial server build failed to start.", initialBuild.error);
  process.exit(1);
}

if ((initialBuild.status ?? 1) !== 0) {
  process.exit(initialBuild.status ?? 1);
}

const tsc = spawn(
  process.execPath,
  SERVER_WATCH_ARGS,
  {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let shuttingDown = false;
let restartingServer = false;
let restartTimer = null;
let watchReady = false;
let server = null;

const killChild = (child, signal = "SIGTERM") => {
  if (child && !child.killed && child.exitCode === null) {
    child.kill(signal);
  }
};

const startServer = () => {
  server = spawn(process.execPath, ["server-dist/server/index.js"], {
    cwd,
    stdio: "inherit",
  });

  server.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (restartingServer) {
      restartingServer = false;
      startServer();
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`;
    console.error(`Server process exited unexpectedly with ${reason}.`);
    shutdown("SIGTERM", code ?? 1);
  });

  server.on("error", (error) => {
    if (shuttingDown) {
      return;
    }

    console.error("Server process failed to start.", error);
    shutdown("SIGTERM", 1);
  });
};

const restartServer = () => {
  if (shuttingDown) {
    return;
  }

  if (!server || server.exitCode !== null) {
    startServer();
    return;
  }

  restartingServer = true;
  killChild(server);
};

const scheduleServerRestart = () => {
  if (shuttingDown) {
    return;
  }

  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  restartTimer = setTimeout(() => {
    restartTimer = null;
    restartServer();
  }, 80);
  restartTimer.unref?.();
};

const shutdown = (signal = "SIGTERM", exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  process.exitCode = exitCode;
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }
  killChild(tsc, signal);
  killChild(server, signal);
  setTimeout(() => process.exit(exitCode), 50).unref();
};

const handleTscExit = (code, signal) => {
  if (shuttingDown) {
    return;
  }

  const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`;
  console.error(`TypeScript watcher exited unexpectedly with ${reason}.`);
  shutdown("SIGTERM", code ?? 1);
};

const handleTscError = (error) => {
  if (shuttingDown) {
    return;
  }

  console.error("TypeScript watcher failed to start.", error);
  shutdown("SIGTERM", 1);
};

tsc.on("exit", handleTscExit);
tsc.on("error", handleTscError);
tsc.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);

  if (!text.includes("Found 0 errors.")) {
    return;
  }

  if (!watchReady) {
    watchReady = true;
    return;
  }

  scheduleServerRestart();
});
tsc.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});
startServer();

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
