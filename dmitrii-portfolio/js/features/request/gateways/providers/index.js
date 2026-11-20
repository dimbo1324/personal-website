import { web3forms } from "./web3forms.js";
import { formspree } from "./formspree.js";
import { custom } from "./custom.js";

/** HTTP form back-ends the request form can post to. */
export const HTTP_PROVIDERS = Object.freeze({ web3forms, formspree, custom });
