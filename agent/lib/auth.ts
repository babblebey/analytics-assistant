import { verifyHttpBasic, withAuthChallenges } from "eve/channels/auth";

export const appAuth = withAuthChallenges(
  (request: Request) => {
    const username = process.env.ANALYTICS_USERNAME;
    const password = process.env.ANALYTICS_PASSWORD;
    if (!username || !password) return null;
    if (request.headers.has("origin") && request.headers.get("sec-fetch-site") !== "same-origin")
      return null;
    const result = verifyHttpBasic(request.headers.get("authorization"), { username, password });
    if (!result.ok) return null;
    return {
      ...result.sessionAuth,
      attributes: { team: "growth" },
      issuer: "analytics-tutorial",
    };
  },
  [{ scheme: "Basic", parameters: { realm: "analytics", charset: "UTF-8" } }],
);