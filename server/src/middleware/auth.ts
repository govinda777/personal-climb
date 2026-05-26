import { createMiddleware } from "hono/factory";
import { PrivyClient } from "@privy-io/server-auth";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "";

const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

export const privyAuth = () => {
  return createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Missing Authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    try {
      const verifiedClaims = await privy.verifySession(token);
      c.set("user", { id: verifiedClaims.userId });
      await next();
    } catch (error) {
      console.error("Privy Auth Error:", error);
      return c.json({ error: "Invalid or expired token" }, 401);
    }
  });
};
