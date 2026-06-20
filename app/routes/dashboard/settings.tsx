import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useDarkMode } from "../../hooks/useDarkMode";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Section ─────────────────────────────────────────────────────────────────

function Section({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div
      className="border rounded overflow-hidden"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e8e4de",
      }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{ borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "#e8e4de" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#1a1a1a" }}>
          {title}
        </h3>
      </div>
      <div
        className="divide-y"
        style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "#e8e4de" }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  desc = "",
  children,
  isDark,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors"
      style={{ background: isDark ? "transparent" : "#ffffff" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: isDark ? "#ffffff" : "#1a1a1a" }}>
          {label}
        </p>
        {desc && (
          <p className="text-xs mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888888" }}>
            {desc}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { isDark } = useDarkMode();
  const [saved, setSaved] = useState(false);

  // Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!supabase) return;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;
      if (!mounted) return;
      setUserId(auth.user.id);
      setEmail(auth.user.email ?? "");
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name,phone,avatar_url")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (prof && mounted) {
        setName(prof.full_name ?? "");
        setPhone(prof.phone ?? "");
        setPhoto(prof.avatar_url ?? "");
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const saveChanges = async () => {
    if (!supabase || !userId) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }
    await supabase.from("profiles").upsert({ 
      id: userId, 
      full_name: name, 
      phone,
      updated_at: new Date().toISOString()
    });
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user?.email !== email && email) {
      await supabase.auth.updateUser({ email });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        background: isDark ? "#0f1c2e" : "#f5f4f2",
        fontFamily: "Georgia, serif",
        color: isDark ? "#ffffff" : "#1a1a1a",
      }}
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <div
            className="inline-flex items-center gap-2 rounded px-3 py-1 text-xs mb-3"
            style={{
              background: isDark ? "rgba(139,26,46,0.15)" : "rgba(139,26,46,0.08)",
              border: `1px solid ${isDark ? "rgba(139,26,46,0.4)" : "rgba(139,26,46,0.3)"}`,
              color: isDark ? "#f0b8be" : "#8b1a2e",
              fontFamily: "sans-serif",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#c9a84c" }} />
            إعدادات الحساب
          </div>
          <h1 className="text-3xl font-extrabold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
            الإعدادات
          </h1>
          <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666666", fontFamily: "sans-serif" }}>
            تحكم في حسابك وتفضيلاتك
          </p>
        </div>

        {/* ── ACCOUNT ── */}
        <div className="space-y-5">
          {/* Avatar */}
          <div
            className="border rounded-3xl p-6 flex items-center gap-5"
            style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e8e4de",
            }}
          >
            <div className="relative w-12 h-12">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="w-12 h-12 rounded-lg object-cover border"
                  style={{ borderColor: "rgba(139,26,46,0.4)" }}
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg border"
                  style={{
                    background: "rgba(139,26,46,0.5)",
                    borderColor: "rgba(139,26,46,0.4)",
                  }}
                >
                  {name ? name.charAt(0).toUpperCase() : "؟"}
                </div>
              )}
              <button
                className="absolute -bottom-1 -left-1 w-7 h-7 rounded-xl flex items-center justify-center text-xs hover:scale-110 transition-transform"
                style={{ background: "#8b1a2e", color: "#fff" }}
              >
                ✏️
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                {name || "ولي أمر"}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666666" }}>
                {email}
              </p>
              <span
                className="text-xs px-2.5 py-0.5 rounded-full mt-1.5 inline-block"
                style={{
                  background: "rgba(139,26,46,0.15)",
                  border: "1px solid rgba(139,26,46,0.3)",
                  color: "#f0b8be",
                }}
              >
                ولي أمر
              </span>
            </div>
          </div>

          {/* Form */}
          <Section title="المعلومات الشخصية" isDark={isDark}>
            {[
              { label: "الاسم الكامل", value: name, setter: setName, type: "text", placeholder: "أدخل اسمك الكامل" },
              { label: "البريد الإلكتروني", value: email, setter: setEmail, type: "email", placeholder: "أدخل بريدك الإلكتروني" },
              { label: "رقم الهاتف", value: phone, setter: setPhone, type: "tel", placeholder: "أدخل رقم هاتفك" },
            ].map((f, i) => (
              <Row key={i} label={f.label} isDark={isDark}>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  className="border rounded-xl px-3 py-2 text-sm text-left focus:outline-none focus:ring-1 transition-colors w-52 md:w-64"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4",
                    color: isDark ? "#fff" : "#1a1a1a",
                    focusRingColor: "#8b1a2e",
                  }}
                  dir="ltr"
                />
              </Row>
            ))}
          </Section>

          <Section title="الأمان" isDark={isDark}>
            <Row label="تغيير كلمة المرور" desc="آخر تغيير منذ 3 أشهر" isDark={isDark}>
              <button
                className="text-xs border px-4 py-2 rounded-xl transition-all hover:opacity-80"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4",
                  color: isDark ? "rgba(255,255,255,0.7)" : "#666666",
                }}
              >
                تغيير
              </button>
            </Row>
            <Row label="التحقق بخطوتين" desc="تأمين إضافي لحسابك" isDark={isDark}>
              <button
                className="text-xs text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all"
                style={{ background: "#8b1a2e" }}
              >
                تفعيل
              </button>
            </Row>
          </Section>

          <Section title="خطر" isDark={isDark}>
            <Row label="حذف الحساب" desc="هذا الإجراء لا يمكن التراجع عنه" isDark={isDark}>
              <button
                className="text-xs border px-4 py-2 rounded-xl transition-all hover:opacity-80"
                style={{
                  background: "rgba(255,80,80,0.1)",
                  borderColor: "rgba(255,80,80,0.2)",
                  color: "#ff7a7a",
                }}
              >
                حذف
              </button>
            </Row>
          </Section>
        </div>

        {/* Save button */}
        <div className="flex justify-end pb-4">
          <button
            onClick={saveChanges}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
              saved ? "border" : "hover:opacity-90"
            }`}
            style={
              saved
                ? {
                    background: "rgba(201,168,76,0.15)",
                    borderColor: "rgba(201,168,76,0.4)",
                    color: "#c9a84c",
                  }
                : { background: "#8b1a2e", color: "#fff" }
            }
          >
            {saved ? "✅ تم الحفظ!" : "💾 حفظ التغييرات"}
          </button>
        </div>
      </div>
    </div>
  );
}