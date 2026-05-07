import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "ok",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { email, password, full_name, role } = JSON.parse(event.body);

    console.log("📝 Creating user:", { email, full_name, role });

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Email ve şifre gereklidir" }),
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Şifre en az 6 karakter olmalıdır" }),
      };
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("❌ Missing Supabase env vars");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Server configuration error" }),
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("🔐 Creating auth user...");
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: full_name || email,
      },
    });

    if (error) {
      console.error("❌ Auth error:", error.message);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Auth hatası: ${error.message}` }),
      };
    }

    console.log("✅ Auth user created:", data.user.id);

    console.log("👤 Creating profile...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          email: email,
          full_name: full_name || email,
          role: role || "user",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (profileError) {
      console.error("❌ Profile error:", profileError.message);
      await supabase.auth.admin.deleteUser(data.user.id);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: `Profil hatası: ${profileError.message}`,
        }),
      };
    }

    console.log("✅ Profile created");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Kullanıcı başarıyla oluşturuldu: ${email}`,
        user: data.user,
      }),
    };
  } catch (error) {
    console.error("🔴 Error:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
