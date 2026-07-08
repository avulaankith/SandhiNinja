import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const server = spawn(npmCommand, ["run", "dev:server"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

const client = spawn(npmCommand, ["run", "dev:client"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

let shuttingDown = false;

const killChild = (child, signal = "SIGTERM") => {
  if (!child.killed && child.exitCode === null) {
    child.kill(signal);
  }
};

const shutdown = (signal = "SIGTERM", exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  process.exitCode = exitCode;
  killChild(server, signal);
  killChild(client, signal);
  setTimeout(() => process.exit(exitCode), 50).unref();
};

const handleChildExit = (name, sibling) => (code, signal) => {
  if (shuttingDown) {
    return;
  }

  const reason = signal ? `signal ${signal}` : `code ${code ?? 1}`;
  console.error(`${name} exited unexpectedly with ${reason}.`);
  killChild(sibling);
  shutdown("SIGTERM", code ?? 1);
};

const handleChildError = (name, sibling) => (error) => {
  if (shuttingDown) {
    return;
  }

  console.error(`${name} failed to start.`, error);
  killChild(sibling);
  shutdown("SIGTERM", 1);
};

server.on("exit", handleChildExit("Server dev process", client));
client.on("exit", handleChildExit("Client dev process", server));
server.on("error", handleChildError("Server dev process", client));
client.on("error", handleChildError("Client dev process", server));

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
