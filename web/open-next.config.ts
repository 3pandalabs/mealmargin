// No proxy.ts / middleware in this app — see CLAUDE.md. The adapter cannot
// bundle Next.js middleware (it pulls in Node-only `async_hooks`), and there is
// nothing for one to guard here anyway: MealMargin is a single anonymous page
// with no accounts and no backend.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig();
