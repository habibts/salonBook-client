import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getDb } from "./mongodb";
import type { BetterAuthOptions } from "better-auth";

let authPromise: Promise<ReturnType<typeof betterAuth>> | null = null;

function initializeAuth(): Promise<ReturnType<typeof betterAuth>> {
  if (authPromise) return authPromise;

  authPromise = (async () => {
    const db = await getDb();

    const options: BetterAuthOptions = {
      database: mongodbAdapter(db),
      emailAndPassword: {
        enabled: true,
      },
      baseURL: process.env.BETTER_AUTH_URL,
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            required: false,
            defaultValue: "customer",
            input: false,
          },
        },
      },
    };

    return betterAuth(options);
  })();

  return authPromise;
}

export const auth = initializeAuth();