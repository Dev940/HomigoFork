import { getAuth, createClerkClient } from "@clerk/express";
import type { Request, Response } from "express";
import { Webhook } from "svix";
import { supabase } from "../config/supabase.js";
import { env } from "../config/env.js";
import { sendError } from "../utils/http.js";

function getClerkClient() {
  if (!env.CLERK_SECRET_KEY) throw new Error("CLERK_SECRET_KEY is not configured");
  return createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
}

async function upsertClerkUser(clerkId: string, payload: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("users")
    .upsert({ clerk_id: clerkId, ...payload }, { onConflict: "clerk_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** POST /api/auth/sync — call this from the frontend immediately after Clerk login/signup.
 *  Reads the Clerk JWT from the request, fetches the full user from Clerk's API,
 *  and upserts a row in the Supabase `users` table. */
export async function syncClerkUser(req: Request, res: Response) {
  try {
    if (!env.CLERK_SECRET_KEY) {
      return res.status(503).json({ error: "Clerk is not configured on this server" });
    }

    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const clerk = getClerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    );
    const email = primaryEmail?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return res.status(400).json({ error: "Clerk user has no email address" });

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

    const user = await upsertClerkUser(userId, {
      email,
      full_name: fullName,
      profile_photo: clerkUser.imageUrl || null,
      updated_at: new Date().toISOString(),
    });

    res.json({ success: true, data: user });
  } catch (error) {
    sendError(res, error);
  }
}

/** POST /api/webhooks/clerk — receive Clerk user lifecycle events and keep
 *  the Supabase `users` table in sync automatically.
 *  Requires CLERK_WEBHOOK_SECRET from the Clerk dashboard → Webhooks. */
export async function handleClerkWebhook(req: Request, res: Response) {
  if (!env.CLERK_WEBHOOK_SECRET) {
    return res.status(400).json({ error: "CLERK_WEBHOOK_SECRET is not configured" });
  }

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);
  let event: { type: string; data: any };

  try {
    event = wh.verify(req.body as Buffer, {
      "svix-id": req.headers["svix-id"] as string,
      "svix-timestamp": req.headers["svix-timestamp"] as string,
      "svix-signature": req.headers["svix-signature"] as string,
    }) as { type: string; data: any };
  } catch {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const { type, data } = event;

  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = (data.email_addresses ?? []).find(
      (e: any) => e.id === data.primary_email_address_id,
    );
    const email =
      primaryEmail?.email_address ?? data.email_addresses?.[0]?.email_address;

    if (email) {
      const fullName =
        [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

      await upsertClerkUser(data.id, {
        email,
        full_name: fullName,
        profile_photo: data.image_url || null,
        updated_at: new Date().toISOString(),
      });
    }
  } else if (type === "user.deleted") {
    await supabase
      .from("users")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("clerk_id", data.id);
  }

  res.json({ received: true });
}
