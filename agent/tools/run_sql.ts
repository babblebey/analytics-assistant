import { defineTool } from "eve/tools";
import { z } from "zod";
import { runReadOnlySql } from "../lib/sample-db";
import { estimateScanGb } from "../lib/cost";

const THRESHOLD_GB = 50;

export default defineTool({
  description: "Run a read-only SQL query against the analytics tables.",
  inputSchema: z.object({ sql: z.string().max(10_000) }),
  // Cost-based gate: only the expensive queries need a human yes.
  approval: ({ toolInput }) =>
    estimateScanGb(toolInput?.sql ?? "") > THRESHOLD_GB ? "user-approval" : "not-applicable",
  async execute({ sql }) {
    const { columns, rows } = await runReadOnlySql(sql);
    return { columns, rows: rows.slice(0, 500), truncated: rows.length > 500 };
  },
});