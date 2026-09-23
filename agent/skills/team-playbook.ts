import { defineDynamic, defineSkill } from "eve/skills";

const PLAYBOOKS: Record<string, { title: string; markdown: string }> = {
  growth: {
    title: "Growth analysis playbook",
    markdown:
      "When analyzing sample orders, group revenue by order date, report dollars, " +
      "and compare customers by plan.",
  },
  finance: {
    title: "Finance analysis playbook",
    markdown:
      "Reconcile total order revenue against the daily and customer totals. " +
      "Report dollars and label this as gross order revenue; the dataset has no refunds.",
  },
};

export default defineDynamic({
  events: {
    "session.started": async (_event, ctx) => {
      const team = ctx.session.auth.current?.attributes.team;
      const key = Array.isArray(team) ? team[0] : team;
      const playbook = key ? PLAYBOOKS[key] : undefined;
      
      if (!playbook) return null;
      
      return defineSkill({
        description:
          `Use when answering analysis questions for the ${key} team. ` +
          `Contains that team's standing conventions.`,
        markdown: `# ${playbook.title}\n\n${playbook.markdown}`,
      });
    },
  },
});