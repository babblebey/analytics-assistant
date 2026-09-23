// agent/sandbox/sandbox.ts
import { defineSandbox } from "eve/sandbox";

export default defineSandbox({
  async bootstrap({ use }) {
    const sandbox = await use();

    const commands = [
      "sudo apt-get update && sudo apt-get install -y python3 python3-venv",
      "python3 -m venv /workspace/.venv",
      "/workspace/.venv/bin/python -m pip install matplotlib==3.10.8",
      "/workspace/.venv/bin/python -c \"import matplotlib.pyplot; print('Chart dependencies ready')\"",
    ];

    for (const command of commands) {
      const result = await sandbox.run({ command });

      if (result.exitCode !== 0) {
        throw new Error(
          `Chart setup failed (exit ${result.exitCode}): ${result.stderr || result.stdout}`,
        );
      }
    }
  },
});
