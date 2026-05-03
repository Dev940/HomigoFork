import type { ApiListResponse, ApiSingleResponse, Conversation, DashboardData, Message, Property, RoommateMatch, SeekerSearchResult } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
let authTokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: (() => Promise<string | null>) | null) {
  authTokenGetter = getter;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = authTokenGetter ? await authTokenGetter() : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? `Request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  /** Sync the signed-in Clerk user into the Supabase users table.
   *  Returns the Supabase user row including the numeric user_id. */
  syncUser() {
    return request<ApiSingleResponse<{ user_id: number; clerk_id: string; email: string; full_name: string | null; role: string | null }>>(
      "/auth/sync",
      { method: "POST" },
    );
  },

  saveUserProfile(payload: unknown) {
    return request<ApiSingleResponse<unknown>>("/users/profile", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  searchUsers(payload: unknown) {
    return request<ApiListResponse<SeekerSearchResult>>("/users/search", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getRecommendedRoommates(limit = 3) {
    return request<ApiListResponse<SeekerSearchResult>>("/users/search", {
      method: "POST",
      body: JSON.stringify({
        filters: {},
        pagination: { page: 1, limit },
        sort: { by: "compatibility", order: "desc" },
      }),
    });
  },

  getUserDetails(userId: string | number) {
    return request<ApiSingleResponse<unknown>>(`/users/${userId}`);
  },

  saveOwnerProfile(payload: unknown) {
    return request<ApiSingleResponse<unknown>>("/owners/profile", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getOwnerDashboard(ownerId: string | number) {
    return request<ApiSingleResponse<unknown>>(`/owners/dashboard/${ownerId}`);
  },

  saveProperty(payload: unknown) {
    return request<ApiSingleResponse<unknown>>("/properties", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  searchProperties(params: Record<string, string | number | undefined> = {}) {
    return request<ApiListResponse<Property>>("/properties/search", {
      method: "POST",
      body: JSON.stringify({
        filters: {
          city: params.city,
          property_type: params.property_type,
          room_type: params.room_type,
          price_range: { min: params.min_rent, max: params.max_rent },
        },
        pagination: { page: params.page ?? 1, limit: params.limit ?? 10 },
        sort: { by: "recent", order: "desc" },
      }),
    });
  },

  listProperties() {
    return request<ApiListResponse<Property>>("/properties");
  },

  getPropertyDetails(propertyId: string | number) {
    return request<ApiSingleResponse<unknown>>(`/properties/${propertyId}`);
  },

  getDashboard(userId: string | number) {
    return request<ApiSingleResponse<DashboardData>>(`/users/dashboard/${userId}`);
  },

  getMatches(userId: string | number) {
    return request<ApiListResponse<RoommateMatch>>(`/users/${userId}/matches`);
  },

  listConversations(userId: string | number) {
    return request<ApiListResponse<Conversation>>(`/conversations?sender_id=${userId}`);
  },

  getMessages(conversationId: number) {
    return request<ApiListResponse<Message>>(`/conversations/${conversationId}/messages`);
  },

  sendMessage(conversationId: number, payload: Pick<Message, "sender_id" | "body">) {
    return request<ApiSingleResponse<Message>>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createConversation(payload: { sender_id: string | number; receiver_id: string | number; context: { type: "property" | "roommate"; context_id: string | number }; message: string }) {
    return request<ApiSingleResponse<unknown>>("/chat/conversations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createInquiry(payload: { user_id: string | number; property_id: number; message?: string }) {
    return request<ApiSingleResponse<unknown>>("/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
