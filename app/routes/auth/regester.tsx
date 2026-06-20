import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";
import { useDarkMode } from "../../hooks/useDarkMode";

export default function ParentRegister() {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode, mounted } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isSubmitting = useRef(false);
  const isGoogleSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting.current) return;
    isSubmitting.current = true;

    setError(null);
    setSuccess(false);

    if (!supabase) {
      setError("Supabase غير مهيّأ. الرجاء ضبط مفاتيح البيئة.");
      isSubmitting.current = false;
      return;
    }

    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      isSubmitting.current = false;
      return;
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      isSubmitting.current = false;
      return;
    }

    setLoading(true);

    try {
      // 🔥 أهم تعديل: emailRedirectTo يودي على /auth/verify
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: "parent",
          },
          // 🔥🔥🔥 الرابط الصحيح للتأكيد
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
          setError("هذا البريد الإلكتروني مسجل بالفعل");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (!authData.user) {
        setError("حدث خطأ في إنشاء الحساب");
        return;
      }

      // تحديث جدول profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      // 🔥 لو Confirm users مفعل، المستخدم لازم يأكد الإيميل
      if (authData.user.identities?.length === 0) {
        setSuccess(true);
      } else {
        setSuccess(true);
      }

    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleGoogleSignUp = async () => {
    if (isGoogleSubmitting.current) return;
    isGoogleSubmitting.current = true;

    if (!supabase) {
      setError("Supabase غير مهيّأ");
      isGoogleSubmitting.current = false;
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/verify`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      isGoogleSubmitting.current = false;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)"
          : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)",
        color: isDark ? "#fff" : "#1a1a1a",
        fontFamily: "Georgia, serif",
      }}
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] blur-[130px] rounded-full"
          style={{
            background: isDark
              ? "rgba(139, 26, 46, 0.15)"
              : "rgba(139, 26, 46, 0.06)",
          }}
        />
      </div>

      <div
        className="relative w-full max-w-md backdrop-blur-xl border rounded-3xl p-8 shadow-2xl my-8 transition-all duration-300"
        style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e8e4de",
          boxShadow: isDark
            ? "0 20px 30px -10px rgba(0,0,0,0.5)"
            : "0 10px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        <div className="absolute top-4 left-4">
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`,
              color: isDark ? "#c9a84c" : "#8b1a2e",
              fontSize: "20px",
            }}
            title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 shadow-lg"
            style={{
              background: "#8b1a2e",
              color: "#fff",
              boxShadow: isDark
                ? "0 4px 12px rgba(139, 26, 46, 0.3)"
                : "0 4px 8px rgba(139, 26, 46, 0.15)",
            }}
          >
            👨‍👧
          </div>
          <h2
            className="text-2xl font-bold"
            style={{
              color: isDark ? "#ffffff" : "#1a1a1a",
              fontFamily: "Georgia, serif",
            }}
          >
            تسجيل ولي أمر
          </h2>
          <p
            className="text-sm"
            style={{
              color: isDark ? "rgba(255,255,255,0.5)" : "#666666",
              fontFamily: "sans-serif",
            }}
          >
            انشئ حسابك وتابع مسيرة أبنائك
          </p>
        </div>

        {/* رسالة النجاح */}
        {success && (
          <div
            className="text-sm text-center py-3 px-4 rounded mb-4"
            style={{
              background: "rgba(64, 145, 108, 0.15)",
              border: "1px solid rgba(64, 145, 108, 0.3)",
              color: "#d8f3dc",
              fontFamily: "sans-serif",
            }}
          >
            ✅ تم إنشاء الحساب بنجاح! 
            <br />
            📧 الرجاء التحقق من بريدك الإلكتروني لتأكيد الحساب.
            <br />
            <button
              onClick={() => navigate("/login")}
              className="mt-2 px-4 py-1 rounded-lg font-semibold"
              style={{ background: "#8b1a2e", color: "#fff" }}
            >
              الذهاب لتسجيل الدخول
            </button>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div
            className="text-sm text-center py-2 px-3 rounded mb-4"
            style={{
              background: "rgba(139, 26, 46, 0.15)",
              border: "1px solid rgba(139, 26, 46, 0.3)",
              color: "#f0b8be",
              fontFamily: "sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* نفس الفورم من غير تغيير */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#444444", fontFamily: "sans-serif" }}>
                الاسم الكامل
              </label>
              <input type="text" placeholder="أدخل اسمك الكامل" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, color: isDark ? "#fff" : "#1a1a1a", fontFamily: "sans-serif" }}
                required />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#444444", fontFamily: "sans-serif" }}>
                رقم الهاتف
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 border rounded-xl text-sm whitespace-nowrap"
                  style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4", color: isDark ? "rgba(255,255,255,0.6)" : "#666666", fontFamily: "sans-serif" }}>
                  🇪🇬 +20
                </div>
                <input type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl focus:outline-none transition-all duration-200"
                  style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, color: isDark ? "#fff" : "#1a1a1a", fontFamily: "sans-serif" }}
                  required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#444444", fontFamily: "sans-serif" }}>
                البريد الإلكتروني
              </label>
              <input type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200" dir="ltr"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, color: isDark ? "#fff" : "#1a1a1a", fontFamily: "sans-serif" }}
                required />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#444444", fontFamily: "sans-serif" }}>
                كلمة المرور
              </label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="أنشئ كلمة مرور (6 أحرف على الأقل)" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl focus:outline-none transition-all duration-200" dir="ltr"
                  style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, color: isDark ? "#fff" : "#1a1a1a", fontFamily: "sans-serif" }}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-sm"
                  style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#aaaaaa" }}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "#444444", fontFamily: "sans-serif" }}>
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} placeholder="أعد كتابة كلمة المرور" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl focus:outline-none transition-all duration-200" dir="ltr"
                  style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, color: isDark ? "#fff" : "#1a1a1a", fontFamily: "sans-serif" }}
                  required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-sm"
                  style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#aaaaaa" }}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:opacity-90 mt-1 disabled:opacity-50"
              style={{ background: "#8b1a2e", fontFamily: "sans-serif" }}>
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب ولي أمر 🚀"}
            </button>
          </form>
        )}

        {!success && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#e8e4de" }} />
              <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaaaaa", fontFamily: "sans-serif" }}>أو</span>
              <div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#e8e4de" }} />
            </div>

            <button type="button" onClick={handleGoogleSignUp} disabled={loading}
              className="w-full flex items-center justify-center gap-3 border rounded-xl py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50"
              style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4", color: isDark ? "rgba(255,255,255,0.8)" : "#444444", fontFamily: "sans-serif" }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? "جاري..." : "المتابعة بحساب Google"}
            </button>
          </>
        )}

        <p className="text-center text-sm mt-5"
          style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888888", fontFamily: "sans-serif" }}>
          لديك حساب بالفعل؟{" "}
          <button type="button" onClick={() => navigate("/login")}
            className="font-medium transition-colors hover:opacity-80"
            style={{ color: "#c9a84c" }}>
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
}