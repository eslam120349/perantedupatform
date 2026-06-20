// app/routes/auth/verify-email.tsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { supabase } from "../../lib/supabase";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("جاري تأكيد البريد الإلكتروني...");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    async function handleVerification() {
      try {
        // نجرب نجيب session الحالي
        const { data, error } = await supabase.auth.getSession();

        console.log("Session data:", data);
        console.log("Session error:", error);

        if (data?.session) {
          setStatus("success");
          setMessage("✅ تم تأكيد البريد الإلكتروني بنجاح! جاري التوجيه...");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // نجرب نبادل الـ code
        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("Exchange error:", exchangeError);
            throw exchangeError;
          }

          setStatus("success");
          setMessage("✅ تم تأكيد البريد الإلكتروني بنجاح! جاري التوجيه...");
          setTimeout(() => navigate("/login"), 3000);
          return;
        }

        // لو مفيش حاجة - الرابط منتهي الصلاحية
        const type = searchParams.get("type");
        if (type === "signup") {
          setStatus("error");
          setMessage("انتهت صلاحية رابط التأكيد. يمكنك طلب رابط جديد.");
        } else {
          setStatus("error");
          setMessage("رابط التأكيد غير صالح أو تم استخدامه من قبل.");
        }

      } catch (err: any) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("انتهت صلاحية رابط التأكيد. يمكنك طلب رابط جديد.");
      }
    }

    handleVerification();
  }, [searchParams, navigate]);

  // 🔥 إعادة إرسال رابط التأكيد
  const handleResendEmail = async () => {
    if (!email) {
      setMessage("الرجاء إدخال البريد الإلكتروني أولاً");
      return;
    }

    setResending(true);
    setResendSuccess(false);
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      if (error) {
        setMessage("❌ " + error.message);
      } else {
        setResendSuccess(true);
        setMessage("✅ تم إرسال رابط تأكيد جديد إلى بريدك الإلكتروني. الرجاء التحقق منه.");
      }
    } catch (err: any) {
      setMessage("❌ حدث خطأ: " + err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)",
        fontFamily: "Georgia, serif",
      }}
      dir="rtl"
    >
      <div
        className="w-full max-w-md backdrop-blur-xl border rounded-3xl p-8 shadow-2xl text-center"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div className="text-5xl mb-6">
          {status === "loading" ? "⏳" : status === "success" ? "✅" : "📧"}
        </div>
        
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: "#ffffff" }}
        >
          {status === "loading" ? "جاري تأكيد البريد..." : 
           status === "success" ? "تم التأكيد!" : "انتهت صلاحية الرابط"}
        </h2>
        
        <p
          className="text-base mb-6"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {message}
        </p>

        {status === "loading" && (
          <div className="mt-4">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: "#8b1a2e", borderTopColor: "transparent" }}
            />
          </div>
        )}

        {/* 🔥 نموذج إعادة إرسال التأكيد */}
        {status === "error" && !resendSuccess && (
          <div className="mt-6 space-y-4">
            <div className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              أدخل بريدك الإلكتروني لإرسال رابط تأكيد جديد:
            </div>
            
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontFamily: "sans-serif",
              }}
              dir="ltr"
            />

            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:opacity-90 disabled:opacity-50"
              style={{ background: "#8b1a2e", color: "#fff" }}
            >
              {resending ? "⏳ جاري الإرسال..." : "📧 إرسال رابط تأكيد جديد"}
            </button>
          </div>
        )}

        {/* رسالة نجاح إعادة الإرسال */}
        {resendSuccess && (
          <div
            className="mt-4 p-3 rounded-lg text-sm"
            style={{
              background: "rgba(64, 145, 108, 0.15)",
              border: "1px solid rgba(64, 145, 108, 0.3)",
              color: "#d8f3dc",
            }}
          >
            {message}
          </div>
        )}

        {/* أزرار التنقل */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:opacity-90"
            style={{ background: "#8b1a2e", color: "#fff" }}
          >
            الذهاب لتسجيل الدخول
          </button>

          {status === "error" && (
            <button
              onClick={() => navigate("/register")}
              className="w-full px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:opacity-90"
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              إنشاء حساب جديد
            </button>
          )}
        </div>
      </div>
    </div>
  );
}