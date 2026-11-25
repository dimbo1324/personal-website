// -----------
// entry point
// -----------

import { LeadApiHandler } from "../lib/leadHandler";
import type { LeadEnv } from "../lib/types";

const handler = new LeadApiHandler();

export const onRequestPost: PagesFunction<LeadEnv> = (context) => {
  return handler.handle(context.request, context.env);
};
