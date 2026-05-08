import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  Trash2,
  UserPlus,
  RefreshCw,
  Shield,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    setError("");

    if (!newUser.email || !newUser.password) {
      setError("E-posta ve şifre zorunludur!");
      return;
    }
    if (newUser.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setSaving(true);
    try {
      // ⭐ NETLIFY FUNCTION ÇAĞRISI
      const response = await fetch(
        "https://iyici-car.netlify.app/.netlify/functions/create-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newUser.email,
            password: newUser.password,
            full_name: newUser.full_name || newUser.email,
            role: newUser.role,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Bilinmeyen hata");
      }

      setError("");
      alert(`✅ Kullanıcı başarıyla oluşturuldu: ${newUser.email}`);
      setNewUser({ email: "", password: "", full_name: "", role: "user" });
      setShowForm(false);
      setTimeout(() => fetchUsers(), 500);
    } catch (err) {
      console.error("Hata:", err);
      setError(`❌ Hata: ${err.message}`);
    }
    setSaving(false);
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`${email} kullanıcısını silmek istediğine emin misin?`))
      return;

    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (!error) {
      alert("✅ Profil silindi.");
      fetchUsers();
    } else {
      alert("❌ Hata: " + error.message);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (!error) {
      fetchUsers();
    } else {
      alert("❌ Rol değiştirme hatası: " + error.message);
    }
  };

  const inputClass =
    "w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-red-600 text-sm";
  const labelClass =
    "text-[10px] font-black text-zinc-500 uppercase mb-1.5 block tracking-widest";

  return (
    <div className="w-full text-white font-sans p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
          KULLANICILAR
        </h1>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <RefreshCw size={12} /> Yenile
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white text-black hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all"
          >
            <UserPlus size={13} /> Kullanıcı Ekle
          </button>
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999] flex items-center justify-center p-4">
          <div className="bg-[#0c0c0e] border border-zinc-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 pb-4 flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase text-white">
                Yeni <span className="text-red-600">Kullanıcı</span>
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="text-zinc-500 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="px-8 py-3 bg-red-900/20 border-b border-red-600/30">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="px-8 pb-4 space-y-4">
              <div>
                <label className={labelClass}>Ad Soyad</label>
                <input
                  type="text"
                  className={inputClass}
                  value={newUser.full_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, full_name: e.target.value })
                  }
                  placeholder="Örnek: Ahmet Yılmaz"
                />
              </div>
              <div>
                <label className={labelClass}>E-Posta</label>
                <input
                  type="email"
                  className={inputClass}
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="ornek@gmail.com"
                />
              </div>
              <div>
                <label className={labelClass}>Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={inputClass + " pr-10"}
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Rol</label>
                <select
                  className={inputClass}
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="p-8 pt-4 flex gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-500 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleCreateUser}
                disabled={saving}
                className="flex-1 bg-white text-black hover:bg-red-600 hover:text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-50"
              >
                {saving ? "Oluşturuluyor..." : "Oluştur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LİSTE */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed border-zinc-800 rounded-3xl">
          <p className="text-zinc-700 font-black uppercase text-sm">
            Kullanıcı Bulunamadı
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => {
            const isAdmin = user.role === "admin";
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-800/40 rounded-2xl hover:border-zinc-700 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isAdmin
                      ? "bg-red-600/20 border border-red-600/30"
                      : "bg-zinc-800 border border-zinc-700"
                  }`}
                >
                  {isAdmin ? (
                    <Shield size={16} className="text-red-500" />
                  ) : (
                    <User size={16} className="text-zinc-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black uppercase tracking-tight truncate">
                    {user.full_name || "—"}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                    {user.email || "—"}
                  </p>
                </div>

                {/* ROL TOGGLE */}
                <button
                  onClick={() => handleToggleRole(user.id, user.role)}
                  className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase shrink-0 border transition-all ${
                    isAdmin
                      ? "bg-red-600/20 text-red-500 border-red-600/30 hover:bg-red-600/30"
                      : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  {isAdmin ? "Admin" : "Kullanıcı"}
                </button>

                <span className="text-[10px] text-zinc-600 font-bold shrink-0 hidden md:block">
                  {new Date(user.created_at).toLocaleDateString("tr-TR")}
                </span>

                <button
                  onClick={() =>
                    handleDeleteUser(
                      user.id,
                      user.full_name || user.email || user.id,
                    )
                  }
                  className="w-9 h-9 flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-zinc-500 hover:text-red-500 hover:border-red-900/50 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={async () => {
                    const { error } = await supabase
                      .from("auth.users")
                      .update({ email_confirmed_at: new Date().toISOString() })
                      .eq("email", user.email);

                    if (!error) {
                      alert(`✅ ${user.email} verified oldu!`);
                      fetchUsers(); // Listeyi yenile
                    } else {
                      alert("❌ Hata: " + error.message);
                    }
                  }}
                  className="text-[9px] px-3 py-1.5 rounded-full font-black uppercase shrink-0 border transition-all bg-green-600/20 text-green-500 border-green-600/30 hover:bg-green-600/30"
                >
                  ✓ Verify Et
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
          Not
        </p>
        <p className="text-xs text-zinc-400">
          Rol badge'ine tıklayarak kullanıcı/admin arasında geçiş yapabilirsin.
        </p>
      </div>
    </div>
  );
};

export default Users;
