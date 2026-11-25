// -----------
// entry point
// -----------

import { Cli } from "./Cli.ts";

process.exitCode = Cli.run(process.argv.slice(2));
