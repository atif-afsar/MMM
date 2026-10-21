// Follow Deno and Supabase Edge Function standards
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RsvpPayload {
  wedding_slug: string;
  guest_name: string;
  phone?: string;
  email?: string;
  response: "attending" | "not_attending";
  attendees_count?: number;
  notes?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: RsvpPayload = await req.json();
    const { wedding_slug, guest_name, phone, email, response, attendees_count, notes } = payload;

    if (!wedding_slug || !guest_name || !response) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: wedding_slug, guest_name, and response are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedResponse = response.toLowerCase().trim();
    if (normalizedResponse !== "attending" && normalizedResponse !== "not_attending") {
      return new Response(
        JSON.stringify({ error: "Response must be either 'attending' or 'not_attending'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const count = typeof attendees_count === "number" && attendees_count >= 1 ? Math.floor(attendees_count) : 1;

    // Use environment service role or supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Validate that the wedding exists, is published, and has RSVP enabled
    const { data: wedding, error: weddingError } = await supabase
      .from("weddings")
      .select("id, invitation_published, rsvp_enabled")
      .eq("invitation_slug", wedding_slug.toLowerCase().trim())
      .single();

    if (weddingError || !wedding) {
      return new Response(
        JSON.stringify({ error: "Wedding invitation not found for this URL slug." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!wedding.invitation_published) {
      return new Response(
        JSON.stringify({ error: "This wedding invitation is not yet published." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!wedding.rsvp_enabled) {
      return new Response(
        JSON.stringify({ error: "RSVP submissions are currently disabled by the wedding hosts." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Insert into isolated rsvp_submissions table
    const { data: submission, error: insertError } = await supabase
      .from("rsvp_submissions")
      .insert({
        wedding_id: wedding.id,
        guest_name: guest_name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        response: normalizedResponse,
        attendees_count: count,
        notes: notes ? notes.trim() : null,
      })
      .select("id, submitted_at")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to record RSVP response: " + insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your RSVP has been confirmed with heartfelt thanks from the couple!",
        submissionId: submission.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
