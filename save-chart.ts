import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "eve/client";
import { z } from "zod";

const host = process.argv[2];
if (!host) throw new Error("Usage: node save-chart.ts <dev-server-url>");

const client = new Client({ host });
const { response } = await client.sessions.create({
  message: "Use run_sql and chart_series to plot daily order revenue in May 2026.",
});
const turn = await response.result();
if (turn.status === "failed") throw new Error("The agent turn failed. Check the dev server logs.");
if (turn.inputRequests.length > 0) {
  const prompts = turn.inputRequests.map((request) => request.prompt).join("\n");
  throw new Error(
    `Session ${turn.sessionId} needs your input before it can create the chart:\n${prompts}`,
  );
}
const chartOutput = z.object({ pngBase64: z.string().min(1).max(1_398_104) });
let saved = false;
for (const event of turn.events) {
  if (event.type !== "action.result") continue;
  const result = event.data.result;
  if (result.kind !== "tool-result" || result.toolName !== "chart_series" || result.isError)
    continue;

  const { pngBase64 } = chartOutput.parse(result.output);
  const png = Buffer.from(pngBase64, "base64");
  if (
    png.byteLength > 1024 * 1024 ||
    !png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    throw new Error("The tool result is not a PNG within the 1 MiB download limit.");
  }
  await writeFile("chart.png", png);
  saved = true;
}
if (!saved) {
  console.error(turn.message ?? "The agent returned no explanation.");
  throw new Error("No chart was returned. Check the agent's response above and sandbox setup.");
}
console.log(`Saved ${resolve("chart.png")}`);