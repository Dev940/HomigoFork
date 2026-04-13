import type { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { HttpError, sendError } from "../utils/http.js";

const numeric = (value: unknown) => /^\d+$/.test(String(value ?? ""));

async function resolveUserId(identifier: unknown): Promise<number> {
  if (numeric(identifier)) {
    const userId = Number(identifier);
    const { data, error } = await supabase.from("users").select("user_id").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    if (!data?.user_id) throw new HttpError(404, `User ${userId} not found`);
    return userId;
  }
  const str = String(identifier ?? "");
  if (!str) throw new HttpError(400, "Invalid user identifier");

  const byEmail = await supabase.from("users").select("user_id").eq("email", str).maybeSingle();
  if (byEmail.error) throw byEmail.error;
  if (byEmail.data?.user_id) return byEmail.data.user_id;

  const byClerk = await supabase.from("users").select("user_id").eq("clerk_id", str).maybeSingle();
  if (byClerk.error) throw byClerk.error;
  if (byClerk.data?.user_id) return byClerk.data.user_id;

  throw new HttpError(404, `User ${str} not found`);
}

async function findConversationBetween(userA: number, userB: number) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`and(user1_id.eq.${userA},user2_id.eq.${userB}),and(user1_id.eq.${userB},user2_id.eq.${userA})`)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createOrGetConversation(req: Request, res: Response) {
  try {
    const user1Id = await resolveUserId(req.body?.user1_id ?? req.body?.sender_id);
    const user2Id = await resolveUserId(req.body?.user2_id ?? req.body?.receiver_id);
    if (user1Id === user2Id) throw new HttpError(400, "Conversation users must be different");

    const existing = await findConversationBetween(user1Id, user2Id);
    if (existing) return res.json({ success: true, data: existing, existing: true });

    const insertAttempt = await supabase
      .from("conversations")
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (!insertAttempt.error && insertAttempt.data) {
      return res.status(201).json({ success: true, data: insertAttempt.data, existing: false });
    }

    // Handle race: if a concurrent request inserted the conversation, return the existing one.
    if (insertAttempt.error && (insertAttempt.error.code === "23505" || String(insertAttempt.error.message).toLowerCase().includes("duplicate"))) {
      const concurrent = await findConversationBetween(user1Id, user2Id);
      if (concurrent) return res.json({ success: true, data: concurrent, existing: true });
    }

    throw insertAttempt.error ?? new Error("Unable to create conversation");
  } catch (error) {
    sendError(res, error);
  }
}

export async function listConversations(req: Request, res: Response) {
  try {
    const requestedUserId = req.query.user_id ?? req.query.sender_id;
    if (!requestedUserId) return res.json({ success: true, data: [] });
    const userId = await resolveUserId(requestedUserId);

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getMessagesByConversation(req: Request, res: Response) {
  try {
    const conversationId = Number(req.params.conversationId ?? req.params.conversation_id);
    if (!Number.isFinite(conversationId)) throw new HttpError(400, "Invalid conversation_id");

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("timestamp", { ascending: true });
    if (error) throw error;
    res.json({ success: true, data: data ?? [] });
  } catch (error) {
    sendError(res, error);
  }
}

export async function postMessageToConversation(req: Request, res: Response) {
  try {
    const conversationId = Number(req.params.conversationId ?? req.params.conversation_id ?? req.body?.conversation_id);
    if (!Number.isFinite(conversationId)) throw new HttpError(400, "Invalid conversation_id");

    const senderId = await resolveUserId(req.body?.sender_id);
    const receiverId = await resolveUserId(req.body?.receiver_id);
    const message = String(req.body?.message ?? req.body?.body ?? "").trim();
    if (!message) throw new HttpError(400, "message is required");

    const { data: conversation, error: convErr } = await supabase.from("conversations").select("*").eq("conversation_id", conversationId).maybeSingle();
    if (convErr) throw convErr;
    if (!conversation) throw new HttpError(404, "Conversation not found");

    const allowed =
      (conversation.user1_id === senderId && conversation.user2_id === receiverId) ||
      (conversation.user1_id === receiverId && conversation.user2_id === senderId);
    if (!allowed) throw new HttpError(403, "Sender/receiver are not participants of this conversation");

    const insert = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content: message,
        message_type: "text",
        read: false,
      })
      .select("*")
      .single();
    if (insert.error || !insert.data) throw insert.error ?? new Error("Unable to save message");

    const updated = await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("conversation_id", conversationId);
    if (updated.error) throw updated.error;

    res.status(201).json({ success: true, data: insert.data });
  } catch (error) {
    sendError(res, error);
  }
}

