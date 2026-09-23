import { eveChannel } from "eve/channels/eve";
import { localDev, placeholderAuth, vercelOidc, type AuthFn } from "eve/channels/auth";

const devTeam: AuthFn<Request> = () =>
  process.env.NODE_ENV === "production"
    ? null
    : {
        attributes: { team: "finance" },
        authenticator: "dev-team",
        principalId: "dev",
        principalType: "user",
      };

export default eveChannel({
  auth: [
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
    // Dev-only: stamp a team so Step 6's playbook resolver has something to read.
    devTeam,
    // This placeholder will not allow browser requests in production.
    // Replace it with your app's auth provider, like Auth.js or Clerk,
    // or use none() for a public demo.
    placeholderAuth(),
  ],
});
