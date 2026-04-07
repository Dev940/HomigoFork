export type ApiListResponse<T> = {
  data: T[];
  count?: number;
  page?: number;
  limit?: number;
};

export type ApiSingleResponse<T> = {
  data: T;
};

export type Property = {
  property_id: number;
  owner_id: number;
  title: string;
  description?: string | null;
  property_type?: string | null;
  room_type?: string | null;
  listing_type?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  monthly_rent: number;
  cover_image?: string | null;
  status?: string | null;
  total_views?: number | null;
  created_at?: string | null;
  property_images?: Array<{ image_url: string; order_no?: number | null }>;
  property_amenities?: Array<{ amenity: string }>;
};

export type User = {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  profile_photo?: string | null;
  is_verified?: boolean | null;
};

export type RoommateMatch = {
  match_id: number;
  seeker_id: number;
  matched_user_id: number;
  compatibility?: number | null;
  status?: string | null;
  matched_user?: User;
};

export type Conversation = {
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  context_type?: string | null;
  context_id?: number | null;
  status?: string | null;
};

export type Message = {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  is_read?: boolean | null;
  sent_at?: string | null;
};

export type DashboardData = {
  user: User;
  matches: RoommateMatch[];
  saved: unknown[];
  conversations: Conversation[];
  notifications: unknown[];
};
