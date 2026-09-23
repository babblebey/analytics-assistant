import { randomUUID } from "node:crypto";
import { defineTool } from "eve/tools";
import { z } from "zod";
export default defineTool({
  description:
    "Plot a time series to a PNG in the workspace. Pass {date, value} points; " +
    "returns the chart path and PNG data for the client to save.",
  inputSchema: z.object({
    title: z.string().min(1).max(120),
    points: z
      .array(z.object({ date: z.string().max(40), value: z.number() }))
      .min(1)
      .max(366),
  }),
  async execute({ title, points }, ctx) {
    const sandbox = await ctx.getSandbox();
    const directory = `analysis/${randomUUID()}`;
    await sandbox.writeTextFile({
      path: `${directory}/series.json`,
      content: JSON.stringify({ title, points }),
    });
    await sandbox.writeTextFile({
      path: `${directory}/plot.py`,
      content: [
        "import json, matplotlib",
        "matplotlib.use('Agg')",
        "import matplotlib.pyplot as plt",
        "d = json.load(open('series.json'))",
        "plt.figure(figsize=(8, 4), dpi=100)",
        "plt.plot([p['date'] for p in d['points']], [p['value'] for p in d['points']])",
        "plt.title(d['title']); plt.savefig('chart.png')",
      ].join("\n"),
    });
    const root = sandbox.resolvePath(directory);
    const result = await sandbox.run({
      command: `cd ${JSON.stringify(root)} && /workspace/.venv/bin/python plot.py`,
    });
    if (result.exitCode !== 0) {
      throw new Error(
        `Chart generation failed (exit ${result.exitCode}): ${result.stderr || result.stdout}`,
      );
    }
    const chart = `${root}/chart.png`;
    const png = await sandbox.readBinaryFile({ path: chart });
    if (!png || png.byteLength === 0) {
      throw new Error("The chart command did not produce a PNG.");
    }
    if (png.byteLength > 1024 * 1024) {
      throw new Error("The chart exceeds the 1 MiB download limit. Plot fewer points.");
    }
    return { chart, pngBase64: Buffer.from(png).toString("base64") };
  },
  toModelOutput({ chart }) {
    return {
      type: "text",
      value: `Created ${chart}. The PNG is available in the tool result for the client to save.`,
    };
  },
});