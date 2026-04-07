import { Router } from "express";
import { supabase } from "../config/supabase.js";
import { HttpError, sendError } from "../utils/http.js";

type UserRow = {
  user_id: number;
  clerk_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  profile_photo?: string | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const numeric = (value: unknown) => /^\d+$/.test(String(value ?? ""));

async function resolveUser(identifier: string | number): Promise<UserRow> {
  const column = numeric(identifier) ? "user_id" : "clerk_id";
  const { data, error } = await supabase.from("users").select("*").eq(column, identifier).single();
  if (error || !data) throw new HttpError(404, `User ${identifier} not found`);
  return data as UserRow;
}

async function resolveOwnerId(identifier: string | number): Promise<number> {
  if (numeric(identifier)) {
    const owner = await supabase.from("owner_profiles").select("owner_id").eq("owner_id", Number(identifier)).maybeSingle();
    if (owner.data) return owner.data.owner_id;
  }
  const user = await resolveUser(identifier);
  const { data, error } = await supabase.from("owner_profiles").select("owner_id").eq("user_id", user.user_id).single();
  if (error || !data) throw new HttpError(404, `Owner profile for ${identifier} not found`);
  return data.owner_id;
}

async function upsertByField(table: string, field: string, value: unknown, payload: Record<string, unknown>, trackUpdatedAt = true) {
  const existing = await supabase.from(table).select("*").eq(field, value).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    const updatePayload = trackUpdatedAt ? { ...payload, updated_at: new Date().toISOString() } : payload;
    const { data, error } = await supabase.from(table).update(updatePayload).eq(field, value).select("*").single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from(table).insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

async function fullUserProfile(identifier: string | number) {
  const user = await resolveUser(identifier);
  const [seeker, owner, room, matchCount, chatCount] = await Promise.all([
    supabase.from("seeker_profiles").select("*, seeker_preferred_locations(*)").eq("user_id", user.user_id).maybeSingle(),
    supabase.from("owner_profiles").select("*").eq("user_id", user.user_id).maybeSingle(),
    supabase.from("current_room_details").select("*, current_room_images(*), current_room_amenities(*)").eq("user_id", user.user_id).maybeSingle(),
    supabase.from("roommate_matches").select("*", { count: "exact", head: true }).or(`seeker_id.eq.${user.user_id},matched_user_id.eq.${user.user_id}`),
    supabase.from("conversations").select("*", { count: "exact", head: true }).or(`sender_id.eq.${user.user_id},receiver_id.eq.${user.user_id}`).eq("status", "active"),
  ]);
  for (const result of [seeker, owner, room, matchCount, chatCount]) if (result.error) throw result.error;
  const seekerData = seeker.data as any;
  const ownerData = owner.data as any;
  const roomData = room.data as any;
  return {
    user_id: user.clerk_id,
    basic_info: { full_name: user.full_name, email: user.email, phone: user.phone, role: user.role, profile_photo: user.profile_photo, is_verified: user.is_verified },
    seeker_profile: seekerData ? {
      gender: seekerData.gender,
      age: seekerData.age,
      occupation: seekerData.occupation,
      bio: seekerData.bio,
      preferred_locations: seekerData.seeker_preferred_locations ?? [],
      lifestyle_preferences: { smoking: seekerData.smoking, drinking: seekerData.drinking, sleep_schedule: seekerData.sleep_schedule, cleanliness: seekerData.cleanliness },
      roommate_preferences: { preferred_gender: seekerData.preferred_gender, age_range: { min: seekerData.age_min, max: seekerData.age_max }, pet_friendly: seekerData.pet_friendly, additional_notes: seekerData.roommate_notes },
    } : null,
    owner_profile: ownerData ? { business_name: ownerData.business_name, owner_type: ownerData.owner_type, bio: ownerData.bio, kyc_status: ownerData.kyc_status, is_verified: ownerData.is_verified } : null,
    current_room_details: roomData ? {
      has_room: roomData.has_room,
      room_id: roomData.room_id,
      room_type: roomData.room_type,
      location: roomData.location,
      rent: roomData.rent,
      vacancy: roomData.vacancy,
      description: roomData.description,
      room_images: (roomData.current_room_images ?? []).map((image: any) => image.image_url),
      amenities: (roomData.current_room_amenities ?? []).map((amenity: any) => amenity.amenity),
      available_from: roomData.available_from,
      room_preferences: { preferred_gender: roomData.preferred_gender, pet_friendly: roomData.pet_friendly, smoking_allowed: roomData.smoking_allowed },
    } : null,
    stats: { profile_completion: 90, total_matches: matchCount.count ?? 0, active_chats: chatCount.count ?? 0 },
    compatibility_score: 87,
    timestamps: { created_at: user.created_at, updated_at: user.updated_at },
  };
}

export function createDomainRouter() {
  const router = Router();

  router.post("/users/profile", async (req, res) => {
    try {
      const body = req.body;
      const basic = body.basic_info ?? {};
      const { data: user, error: userError } = await supabase
        .from("users")
        .upsert({
          clerk_id: body.user_id,
          full_name: basic.full_name,
          email: basic.email,
          phone: basic.phone,
          role: basic.role,
          profile_photo: basic.profile_photo,
          updated_at: new Date().toISOString(),
        }, { onConflict: "clerk_id" })
        .select("*")
        .single();
      if (userError) throw userError;

      if (body.seeker_profile) {
        const seeker = body.seeker_profile;
        const lifestyle = seeker.lifestyle_preferences ?? {};
        const roommate = seeker.roommate_preferences ?? {};
        const seekerRow = await upsertByField("seeker_profiles", "user_id", user.user_id, {
          user_id: user.user_id,
          gender: seeker.gender,
          age: seeker.age,
          occupation: seeker.occupation,
          bio: seeker.bio,
          smoking: lifestyle.smoking,
          drinking: lifestyle.drinking,
          sleep_schedule: lifestyle.sleep_schedule,
          cleanliness: lifestyle.cleanliness,
          preferred_gender: roommate.preferred_gender,
          age_min: roommate.age_range?.min,
          age_max: roommate.age_range?.max,
          pet_friendly: roommate.pet_friendly,
          roommate_notes: roommate.additional_notes,
        });
        await supabase.from("seeker_preferred_locations").delete().eq("seeker_id", seekerRow.seeker_id);
        if (seeker.preferred_locations?.length) {
          await supabase.from("seeker_preferred_locations").insert(seeker.preferred_locations.map((location: any) => ({ ...location, seeker_id: seekerRow.seeker_id })));
        }
      }

      if (body.owner_profile) {
        await upsertByField("owner_profiles", "user_id", user.user_id, {
          user_id: user.user_id,
          business_name: body.owner_profile.business_name,
          kyc_status: body.owner_profile.kyc_status ?? "pending",
        });
      }

      let currentRoom: any = null;
      if (body.current_room_details) {
        const room = body.current_room_details;
        const preferences = room.room_preferences ?? {};
        currentRoom = await upsertByField("current_room_details", "user_id", user.user_id, {
          user_id: user.user_id,
          has_room: room.has_room,
          room_type: room.room_type,
          location: room.location,
          rent: room.rent,
          vacancy: room.vacancy,
          description: room.description,
          available_from: room.available_from,
          preferred_gender: preferences.preferred_gender,
          pet_friendly: preferences.pet_friendly,
          smoking_allowed: preferences.smoking_allowed,
          status: "active",
        });
        await Promise.all([
          supabase.from("current_room_images").delete().eq("room_id", currentRoom.room_id),
          supabase.from("current_room_amenities").delete().eq("room_id", currentRoom.room_id),
        ]);
        if (room.room_images?.length) await supabase.from("current_room_images").insert(room.room_images.map((image_url: string, order_no: number) => ({ room_id: currentRoom.room_id, image_url, order_no })));
        if (room.amenities?.length) await supabase.from("current_room_amenities").insert(room.amenities.map((amenity: string) => ({ room_id: currentRoom.room_id, amenity })));
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          current_room_details: currentRoom ? {
            room_id: currentRoom.room_id,
            has_room: currentRoom.has_room,
            location: currentRoom.location,
            rent: currentRoom.rent,
            vacancy: currentRoom.vacancy,
            images_count: body.current_room_details?.room_images?.length ?? 0,
            status: currentRoom.status,
          } : null,
        },
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/users/dashboard/:userId", async (req, res) => {
    try {
      const user = await resolveUser(req.params.userId);
      const [matches, saved, conversations, notifications, properties] = await Promise.all([
        supabase.from("roommate_matches").select("*, matched_user:users!roommate_matches_matched_user_id_fkey(*)").or(`seeker_id.eq.${user.user_id},matched_user_id.eq.${user.user_id}`).limit(10),
        supabase.from("saved_items").select("*").eq("user_id", user.user_id).limit(10).order("saved_at", { ascending: false }),
        supabase.from("conversations").select("*").or(`sender_id.eq.${user.user_id},receiver_id.eq.${user.user_id}`).limit(10).order("updated_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("user_id", user.user_id).limit(10).order("created_at", { ascending: false }),
        supabase.from("properties").select("*, property_images(*)").eq("status", "active").limit(6).order("created_at", { ascending: false }),
      ]);
      for (const result of [matches, saved, conversations, notifications, properties]) if (result.error) throw result.error;
      res.json({
        success: true,
        data: {
          user,
          matches: matches.data ?? [],
          saved: saved.data ?? [],
          conversations: conversations.data ?? [],
          notifications: notifications.data ?? [],
          stats: {
            total_matches: matches.data?.length ?? 0,
            active_chats: conversations.data?.filter((item: any) => item.status === "active").length ?? 0,
            saved_properties: saved.data?.filter((item: any) => item.item_type === "property").length ?? 0,
            profile_completion: 90,
          },
          recommended_roommates: matches.data ?? [],
          recommended_properties: properties.data ?? [],
          recent_activity: notifications.data ?? [],
          saved_items: {
            roommates: saved.data?.filter((item: any) => item.item_type === "roommate") ?? [],
            properties: saved.data?.filter((item: any) => item.item_type === "property") ?? [],
          },
        },
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/conversations", async (req, res) => {
    try {
      const requestedUserId = req.query.sender_id ?? req.query.user_id;
      if (!requestedUserId) return res.json({ success: true, data: [] });
      const user = await resolveUser(String(requestedUserId));
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`sender_id.eq.${user.user_id},receiver_id.eq.${user.user_id}`)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      res.json({ success: true, data });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/inquiries", async (req, res) => {
    try {
      const user = await resolveUser(req.body.user_id);
      const { data, error } = await supabase
        .from("inquiries")
        .insert({ user_id: user.user_id, property_id: req.body.property_id, message: req.body.message, status: "pending" })
        .select("*")
        .single();
      if (error) throw error;
      res.status(201).json({ success: true, data });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/users/:userId", async (req, res, next) => {
    if (["dashboard", "search"].includes(req.params.userId)) return next();
    try {
      res.json({ success: true, data: await fullUserProfile(req.params.userId) });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/users/search", async (req, res) => {
    try {
      const filters = req.body.filters ?? {};
      const pagination = req.body.pagination ?? {};
      const sort = req.body.sort ?? {};
      const page = Math.max(Number(pagination.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(pagination.limit ?? 10), 1), 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from("seeker_profiles").select("*, users(*), seeker_preferred_locations(*)", { count: "exact" }).range(from, to);
      if (filters.gender) query = query.eq("gender", filters.gender);
      if (filters.age_range?.min) query = query.gte("age", filters.age_range.min);
      if (filters.age_range?.max) query = query.lte("age", filters.age_range.max);
      if (filters.occupation) query = query.ilike("occupation", `%${filters.occupation}%`);
      if (filters.lifestyle?.smoking) query = query.eq("smoking", filters.lifestyle.smoking);
      if (filters.lifestyle?.drinking) query = query.eq("drinking", filters.lifestyle.drinking);
      if (filters.lifestyle?.sleep_schedule) query = query.eq("sleep_schedule", filters.lifestyle.sleep_schedule);
      if (filters.roommate_preferences?.pet_friendly !== undefined) query = query.eq("pet_friendly", filters.roommate_preferences.pet_friendly);
      if (sort.by === "age") query = query.order("age", { ascending: sort.order !== "desc" });

      const { data, error, count } = await query;
      if (error) throw error;
      const userIds = (data ?? []).map((item: any) => item.user_id);
      const rooms = userIds.length ? await supabase.from("current_room_details").select("*").in("user_id", userIds) : { data: [], error: null };
      if (rooms.error) throw rooms.error;
      const roomByUser = new Map((rooms.data ?? []).map((room: any) => [room.user_id, room]));

      const rows = (data ?? [])
        .filter((item: any) => !filters.location || item.seeker_preferred_locations?.some((location: any) => String(location.location_name).toLowerCase().includes(String(filters.location).toLowerCase())))
        .filter((item: any) => filters.room_filters?.has_room === undefined || Boolean(roomByUser.get(item.user_id)?.has_room) === filters.room_filters.has_room)
        .filter((item: any) => !filters.budget?.min || Number(roomByUser.get(item.user_id)?.rent ?? 0) >= Number(filters.budget.min))
        .filter((item: any) => !filters.budget?.max || Number(roomByUser.get(item.user_id)?.rent ?? 0) <= Number(filters.budget.max))
        .map((item: any) => {
          const room = roomByUser.get(item.user_id);
          return {
            user_id: item.users?.clerk_id ?? item.user_id,
            name: item.users?.full_name,
            age: item.age,
            gender: item.gender,
            occupation: item.occupation,
            location: room?.location ?? item.seeker_preferred_locations?.[0]?.location_name,
            budget: room?.rent,
            profile_image: item.users?.profile_photo,
            lifestyle: { smoking: item.smoking, drinking: item.drinking, sleep: item.sleep_schedule, cleanliness: item.cleanliness },
            compatibility: Math.min(98, 70 + Number(item.cleanliness ?? 3) * 4),
          };
        })
        .sort((a: any, b: any) => sort.by === "compatibility" && sort.order !== "asc" ? b.compatibility - a.compatibility : 0);

      res.json({ success: true, page, limit, total: count ?? rows.length, data: rows });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/owners/profile", async (req, res) => {
    try {
      const body = req.body;
      const basic = body.basic_info ?? {};
      const verification = body.verification_details ?? {};
      const { data: user, error: userError } = await supabase
        .from("users")
        .upsert({
          clerk_id: body.owner_id,
          full_name: basic.full_name,
          email: basic.email,
          phone: basic.phone,
          role: "owner",
          profile_photo: basic.profile_photo,
          updated_at: new Date().toISOString(),
        }, { onConflict: "clerk_id" })
        .select("*")
        .single();
      if (userError) throw userError;

      const ownerProfile = body.owner_profile ?? {};
      const owner = await upsertByField("owner_profiles", "user_id", user.user_id, {
        user_id: user.user_id,
        business_name: ownerProfile.business_name,
        owner_type: ownerProfile.owner_type,
        bio: ownerProfile.bio,
        kyc_status: verification.kyc_status ?? "pending",
        is_verified: false,
      });

      const government = verification.government_id ?? {};
      const address = verification.address_proof ?? {};
      await supabase.from("kyc_documents").insert({
        owner_id: owner.owner_id,
        id_type: government.id_type,
        id_number: government.id_number,
        id_front_url: government.document_images?.[0],
        id_back_url: government.document_images?.[1],
        address_doc_type: address.document_type,
        address_doc_url: address.document_image,
      });

      res.json({
        success: true,
        message: "Owner profile & verification submitted successfully",
        data: { owner_id: body.owner_id, kyc_status: owner.kyc_status, is_verified: owner.is_verified },
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/owners/dashboard/:ownerId", async (req, res) => {
    try {
      const ownerId = await resolveOwnerId(req.params.ownerId);
      const owner = await supabase.from("owner_profiles").select("*, users(*)").eq("owner_id", ownerId).single();
      if (owner.error) throw owner.error;
      const properties = await supabase.from("properties").select("*, property_images(*)").eq("owner_id", ownerId).order("created_at", { ascending: false });
      if (properties.error) throw properties.error;
      const propertyIds = (properties.data ?? []).map((property: any) => property.property_id);
      const [inquiries, messages, notifications, analytics] = await Promise.all([
        propertyIds.length ? supabase.from("inquiries").select("*, users(*), properties(*)").in("property_id", propertyIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
        supabase.from("conversations").select("*").eq("receiver_id", owner.data.user_id).limit(10).order("updated_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("user_id", owner.data.user_id).limit(10).order("created_at", { ascending: false }),
        propertyIds.length ? supabase.from("property_analytics").select("*").in("property_id", propertyIds).order("date", { ascending: true }) : Promise.resolve({ data: [], error: null }),
      ]);
      for (const result of [inquiries, messages, notifications, analytics]) if (result.error) throw result.error;
      const active = (properties.data ?? []).filter((property: any) => property.status === "active");

      res.json({
        success: true,
        data: {
          owner: {
            owner_id: owner.data.users?.clerk_id,
            full_name: owner.data.users?.full_name,
            profile_photo: owner.data.users?.profile_photo,
            is_verified: owner.data.is_verified,
            kyc_status: owner.data.kyc_status,
          },
          stats: {
            total_properties: properties.data?.length ?? 0,
            active_listings: active.length,
            inactive_listings: (properties.data?.length ?? 0) - active.length,
            total_views: (properties.data ?? []).reduce((sum: number, property: any) => sum + Number(property.total_views ?? 0), 0),
            total_inquiries: inquiries.data?.length ?? 0,
            total_bookings: 0,
          },
          earnings: { monthly_earnings: 0, pending_payments: 0, total_earnings: 0 },
          properties: (properties.data ?? []).map((property: any) => ({
            property_id: property.property_id,
            title: property.title,
            location: property.city,
            price: property.monthly_rent,
            status: property.status,
            available_rooms: property.available_rooms,
            views: property.total_views,
            inquiries: inquiries.data?.filter((inquiry: any) => inquiry.property_id === property.property_id).length ?? 0,
            cover_image: property.cover_image ?? property.property_images?.[0]?.image_url,
            created_at: property.created_at,
          })),
          recent_inquiries: (inquiries.data ?? []).slice(0, 10).map((inquiry: any) => ({
            inquiry_id: inquiry.inquiry_id,
            user: { user_id: inquiry.users?.clerk_id, name: inquiry.users?.full_name, profile_image: inquiry.users?.profile_photo },
            property: { property_id: inquiry.properties?.property_id, title: inquiry.properties?.title },
            message: inquiry.message,
            timestamp: inquiry.created_at,
            status: inquiry.status,
          })),
          recent_messages: messages.data ?? [],
          notifications: notifications.data ?? [],
          analytics: {
            views_trend: (analytics.data ?? []).map((row: any) => ({ date: row.date, views: row.views })),
            inquiry_trend: (analytics.data ?? []).map((row: any) => ({ date: row.date, count: row.inquiries })),
          },
          quick_actions: [{ label: "Add New Property", action: "/add-property" }, { label: "View Messages", action: "/messages" }],
        },
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/properties/search", async (req, res) => {
    try {
      const filters = req.body.filters ?? {};
      const pagination = req.body.pagination ?? {};
      const sort = req.body.sort ?? {};
      const page = Math.max(Number(pagination.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(pagination.limit ?? 10), 1), 100);
      let query = supabase.from("properties").select("*, owner_profiles(*, users(*)), property_images(*), property_amenities(*)", { count: "exact" }).range((page - 1) * limit, page * limit - 1);
      if (filters.city) query = query.ilike("city", `%${filters.city}%`);
      if (filters.property_type) query = query.eq("property_type", filters.property_type);
      if (filters.room_type) query = query.eq("room_type", filters.room_type);
      if (filters.promotion_type) query = query.eq("promotion_type", filters.promotion_type);
      if (filters.available_rooms) query = query.gte("available_rooms", filters.available_rooms);
      if (filters.price_range?.min) query = query.gte("monthly_rent", filters.price_range.min);
      if (filters.price_range?.max) query = query.lte("monthly_rent", filters.price_range.max);
      query = sort.by === "price" ? query.order("monthly_rent", { ascending: sort.order !== "desc" }) : query.order("created_at", { ascending: false });
      const { data, error, count } = await query;
      if (error) throw error;
      const amenities = filters.amenities ?? [];
      const rows = (data ?? []).filter((property: any) => amenities.every((amenity: string) => property.property_amenities?.some((item: any) => item.amenity === amenity)));
      res.json({
        success: true,
        total: count ?? rows.length,
        page,
        limit,
        data: rows.map((property: any) => ({
          ...property,
          price: property.monthly_rent,
          location: property.city,
          cover_image: property.cover_image ?? property.property_images?.[0]?.image_url,
          owner: { name: property.owner_profiles?.users?.full_name, is_verified: property.owner_profiles?.is_verified },
        })),
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/properties", async (req, res) => {
    try {
      const body = req.body;
      const ownerId = await resolveOwnerId(body.owner_id);
      const details = body.property_details ?? {};
      const location = body.location ?? {};
      const pricing = body.pricing ?? {};
      const availability = body.availability ?? {};
      const specs = body.property_specs ?? {};
      const features = body.features ?? {};
      const media = body.media ?? {};
      const payload = {
        owner_id: ownerId,
        title: details.title,
        description: details.description,
        property_type: details.property_type,
        room_type: details.room_type,
        listing_type: body.listing_type,
        promotion_type: body.promotion_type,
        address: location.address,
        city: location.city,
        state: location.state,
        lat: location.lat,
        lng: location.lng,
        monthly_rent: pricing.monthly_rent,
        security_deposit: pricing.security_deposit,
        maintenance_charges: pricing.maintenance_charges,
        available_from: availability.available_from,
        minimum_stay_months: availability.minimum_stay_months,
        available_rooms: availability.is_available === false ? 0 : specs.available_rooms,
        total_rooms: specs.total_rooms,
        bathrooms: specs.bathrooms,
        balcony: specs.balcony,
        furnishing: features.furnishing,
        cover_image: media.cover_image,
        status: body.status ?? "active",
      };
      const existingId = numeric(body.property_id) ? Number(body.property_id) : null;
      const result = existingId
        ? await supabase.from("properties").update({ ...payload, updated_at: new Date().toISOString() }).eq("property_id", existingId).select("*").single()
        : await supabase.from("properties").insert(payload).select("*").single();
      if (result.error) throw result.error;
      const propertyId = result.data.property_id;
      await Promise.all([supabase.from("property_amenities").delete().eq("property_id", propertyId), supabase.from("property_images").delete().eq("property_id", propertyId)]);
      if (features.amenities?.length) await supabase.from("property_amenities").insert(features.amenities.map((amenity: string) => ({ property_id: propertyId, amenity })));
      if (media.images?.length) await supabase.from("property_images").insert(media.images.map((image_url: string, order_no: number) => ({ property_id: propertyId, image_url, order_no })));
      res.status(existingId ? 200 : 201).json({ success: true, message: "Property listing saved successfully", data: { property_id: propertyId, status: result.data.status } });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/properties/:propertyId", async (req, res, next) => {
    if (req.params.propertyId === "search") return next();
    try {
      const { data: property, error } = await supabase.from("properties").select("*, owner_profiles(*, users(*)), property_images(*), property_amenities(*)").eq("property_id", req.params.propertyId).single();
      if (error) throw error;
      res.json({
        success: true,
        data: {
          property_id: property.property_id,
          listing_type: property.listing_type,
          promotion_type: property.promotion_type,
          property_details: { title: property.title, description: property.description, property_type: property.property_type, room_type: property.room_type },
          location: { address: property.address, city: property.city, state: property.state, lat: property.lat, lng: property.lng },
          pricing: { monthly_rent: property.monthly_rent, security_deposit: property.security_deposit, maintenance_charges: property.maintenance_charges },
          availability: { available_from: property.available_from, minimum_stay_months: property.minimum_stay_months },
          property_specs: { total_rooms: property.total_rooms, available_rooms: property.available_rooms, bathrooms: property.bathrooms },
          features: { amenities: property.property_amenities?.map((item: any) => item.amenity) ?? [], furnishing: property.furnishing },
          media: { cover_image: property.cover_image, images: property.property_images?.map((image: any) => image.image_url) ?? [] },
          owner: { owner_id: property.owner_profiles?.users?.clerk_id, name: property.owner_profiles?.users?.full_name, phone: property.owner_profiles?.users?.phone, is_verified: property.owner_profiles?.is_verified },
        },
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/properties/search", async (req, res) => {
    try {
      const limit = Math.min(Number(req.query.limit ?? 20), 100);
      let query = supabase.from("properties").select("*, property_images(*), property_amenities(*)").eq("status", "active").limit(limit).order("created_at", { ascending: false });

      if (req.query.city) query = query.ilike("city", `%${String(req.query.city)}%`);
      if (req.query.property_type) query = query.eq("property_type", req.query.property_type);
      if (req.query.room_type) query = query.eq("room_type", req.query.room_type);
      if (req.query.min_rent) query = query.gte("monthly_rent", Number(req.query.min_rent));
      if (req.query.max_rent) query = query.lte("monthly_rent", Number(req.query.max_rent));
      if (req.query.q) query = query.or(`title.ilike.%${req.query.q}%,description.ilike.%${req.query.q}%,address.ilike.%${req.query.q}%`);

      const { data, error } = await query;
      if (error) throw error;
      res.json({ data });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/chat/conversations", async (req, res) => {
    try {
      const sender = await resolveUser(req.body.sender_id);
      const receiver = await resolveUser(req.body.receiver_id);
      const context = req.body.context ?? {};
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          sender_id: sender.user_id,
          receiver_id: receiver.user_id,
          context_type: context.type,
          context_id: numeric(context.context_id) ? Number(context.context_id) : null,
          status: "pending",
        })
        .select("*")
        .single();
      if (error) throw error;
      if (req.body.message) {
        const message = await supabase.from("messages").insert({ conversation_id: conversation.conversation_id, sender_id: sender.user_id, body: req.body.message });
        if (message.error) throw message.error;
      }
      res.status(201).json({ success: true, data: { conversation_id: conversation.conversation_id, status: conversation.status, message: "Chat request sent" } });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/properties/:propertyId/view", async (req, res) => {
    try {
      const propertyId = Number(req.params.propertyId);
      const viewerId = req.body.viewer_id ?? null;
      const { data, error } = await supabase.from("property_views").insert({ property_id: propertyId, viewer_id: viewerId }).select("*").single();
      if (error) throw error;
      await supabase.rpc("increment_property_views", { target_property_id: propertyId });
      res.status(201).json({ data });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/users/:userId/dashboard", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const [user, matches, saved, conversations, notifications] = await Promise.all([
        supabase.from("users").select("*").eq("user_id", userId).single(),
        supabase.from("roommate_matches").select("*").or(`seeker_id.eq.${userId},matched_user_id.eq.${userId}`).limit(10).order("created_at", { ascending: false }),
        supabase.from("saved_items").select("*").eq("user_id", userId).limit(10).order("saved_at", { ascending: false }),
        supabase.from("conversations").select("*").or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).limit(10).order("updated_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("user_id", userId).eq("is_read", false).limit(10).order("created_at", { ascending: false }),
      ]);

      for (const result of [user, matches, saved, conversations, notifications]) {
        if (result.error) throw result.error;
      }

      res.json({
        data: {
          user: user.data,
          matches: matches.data,
          saved: saved.data,
          conversations: conversations.data,
          notifications: notifications.data,
        },
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/users/:userId/matches", async (req, res) => {
    try {
      const userId = Number(req.params.userId);
      const { data, error } = await supabase
        .from("roommate_matches")
        .select("*, matched_user:users!roommate_matches_matched_user_id_fkey(*)")
        .or(`seeker_id.eq.${userId},matched_user_id.eq.${userId}`)
        .order("compatibility", { ascending: false });
      if (error) throw error;
      res.json({ data });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/users/:userId/saved", async (req, res) => {
    try {
      const { data, error } = await supabase.from("saved_items").select("*").eq("user_id", Number(req.params.userId)).order("saved_at", { ascending: false });
      if (error) throw error;
      res.json({ data });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/users/:userId/saved", async (req, res) => {
    try {
      const { data, error } = await supabase.from("saved_items").insert({ ...req.body, user_id: Number(req.params.userId) }).select("*").single();
      if (error) throw error;
      res.status(201).json({ data });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.delete("/users/:userId/saved/:savedId", async (req, res) => {
    try {
      const { error } = await supabase.from("saved_items").delete().eq("user_id", Number(req.params.userId)).eq("id", Number(req.params.savedId));
      if (error) throw error;
      res.status(204).send();
    } catch (error) {
      sendError(res, error);
    }
  });

  router.get("/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", Number(req.params.conversationId)).order("sent_at", { ascending: true });
      if (error) throw error;
      res.json({ data });
    } catch (error) {
      sendError(res, error);
    }
  });

  router.post("/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({ ...req.body, conversation_id: Number(req.params.conversationId) })
        .select("*")
        .single();
      if (error) throw error;
      await supabase.from("conversations").update({ updated_at: new Date().toISOString(), status: "active" }).eq("conversation_id", Number(req.params.conversationId));
      res.status(201).json({ data });
    } catch (error) {
      sendError(res, error);
    }
  });

  return router;
}
