import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { LoginInput, RegisterInput } from "./schema";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return { url, key };
}

export async function registerStudent(input: RegisterInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone || null,
      },
    },
  });

  if (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("Registration failed: no authenticated user was created.");
  }

  if (!data.session) {
    throw new Error(
      "Registration requires an authenticated session. Please try again."
    );
  }

  const { url, key } = getSupabaseConfig();

  /*
   * signUp() returns the access token, but our server client deliberately
   * does not persist sessions. Create a short-lived authenticated client
   * carrying this request's access token for the provisioning RPC.
   */
  const authenticatedClient = createSupabaseClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error: provisioningError } = await authenticatedClient.rpc(
    "provision_student_account",
    {
      target_user_id: data.user.id,
      target_email: input.email,
      target_first_name: input.firstName,
      target_last_name: input.lastName,
      target_phone: input.phone || null,
    }
  );

  if (provisioningError) {
    throw new Error(
      `Registration provisioning failed: ${provisioningError.message}`
    );
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function loginStudent(input: LoginInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new Error(`Login failed: ${error.message}`);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function logoutStudent() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}
