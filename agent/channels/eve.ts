import { eveChannel } from "eve/channels/eve";
import { localDev, vercelOidc } from "eve/channels/auth";
import { appAuth } from "../lib/auth";

export default eveChannel({
  auth: [appAuth, vercelOidc(), localDev()],
});