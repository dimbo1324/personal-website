import { custom } from "./custom";
import { formspree } from "./formspree";
import { web3forms } from "./web3forms";

/** HTTP form back-ends the request form can post to. */
export const HTTP_PROVIDERS = Object.freeze({ web3forms, formspree, custom });

export type HttpProviderKey = keyof typeof HTTP_PROVIDERS;

export type { HttpProvider, ProviderOptions } from "./web3forms";
