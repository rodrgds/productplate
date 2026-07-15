/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as autumn from "../autumn.js";
import type * as billing from "../billing.js";
import type * as chat from "../chat.js";
import type * as crons from "../crons.js";
import type * as developer from "../developer.js";
import type * as emails from "../emails.js";
import type * as http from "../http.js";
import type * as maintenance from "../maintenance.js";
import type * as notifications from "../notifications.js";
import type * as organizations from "../organizations.js";
import type * as storage from "../storage.js";
import type * as userProfiles from "../userProfiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  autumn: typeof autumn;
  billing: typeof billing;
  chat: typeof chat;
  crons: typeof crons;
  developer: typeof developer;
  emails: typeof emails;
  http: typeof http;
  maintenance: typeof maintenance;
  notifications: typeof notifications;
  organizations: typeof organizations;
  storage: typeof storage;
  userProfiles: typeof userProfiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  autumn: import("@useautumn/convex/_generated/component.js").ComponentApi<"autumn">;
};
