import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const authInstance = await auth;
const handler = toNextJsHandler(authInstance!);

export const { POST, GET } = handler;