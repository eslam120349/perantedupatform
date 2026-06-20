"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { useDarkMode } from "../hooks/useDarkMode";

import { 
  FaStar, FaCalculator, FaAtom, FaFlask, FaDna, FaBook, FaPenFancy,
  FaThLarge, FaUser, FaGraduationCap, FaSearch
} from "react-icons/fa";

// ─── Theme ────────────────────────────────────────────────────────────────────
// Hero    : dark navy  #0f1c2e (داكن) / أبيض (فاتح)
// White sections : #ffffff  text #1a1a1a
// Crimson sections : #8b1a2e  text #ffffff
// Light gray sections : #f5f4f2
// Accent  : #8b1a2e
// Gold    : #c9a84c

// ─── Types ────────────────────────────────────────────────────────────────────
type TeacherType = {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  subjects: string[];
  rating: number;
  students: number;
  bio: string;
  qualification: string;
  years_of_experience: number;
  price: number;
  pricing: any;
  is_active: boolean;
};

// 🔥 ربط أسماء المواد بين الفلتر وقاعدة البيانات
const subjectCategories = [
  { name: "الكل", ar: "الكل", icon: FaThLarge },
  { name: "الرياضيات", ar: "الرياضيات", icon: FaCalculator },
  { name: "الفيزياء", ar: "الفيزياء", icon: FaAtom },
  { name: "الكيمياء", ar: "الكيمياء", icon: FaFlask },
  { name: "الأحياء", ar: "الأحياء", icon: FaDna },
  { name: "اللغة الإنجليزية", ar: "اللغة الإنجليزية", icon: FaBook },
  { name: "اللغة العربية", ar: "اللغة العربية", icon: FaPenFancy },
];

const stats = [
  { value: "1,200+", label: "طالب نشط" },
  { value: "80+", label: "مدرس محترف" },
  { value: "95%", label: "نسبة الرضا" },
  { value: "15+", label: "مادة دراسية" },
];

const testimonials = [
  { name: "ليلى حسن", role: "ولي أمر", text: "درجات ابنتي تحسنت بشكل كبير. المدرسون هنا رائعون.", avatar: "https://i.pravatar.cc/150?img=47" },
  { name: "عمر خالد", role: "ولي أمر", text: "العثور على المدرس المناسب كان سهلاً جداً. المنصة منظمة ورائعة.", avatar: "https://i.pravatar.cc/150?img=52" },
  { name: "دينا يوسف", role: "طالب", text: "أخيراً فهمت الكيمياء! الشرح واضح ومبسط.", avatar: "https://i.pravatar.cc/150?img=45" },
];

// ─── StarRating ───────────────────────────────────────────────────────────────
function StarRating({ rating, onLight = true }: { rating: number; onLight?: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className="w-3.5 h-3.5"
          style={{ color: s <= Math.floor(rating) ? "#c9a84c" : onLight ? "#d4cfc8" : "rgba(255,255,255,0.25)" }}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function SectionLabel({ text, onDark = false }: { text: string; onDark?: boolean }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
      style={{ color: onDark ? "rgba(255,255,255,0.55)" : "#8b1a2e", fontFamily: "sans-serif" }}>{text}</p>
  );
}

// ─── Teacher Modal ────────────────────────────────────────────────────────────
function TeacherModal({ teacher, onClose, isDark }: { teacher: TeacherType; onClose: () => void; isDark: boolean }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="relative w-full max-w-md shadow-2xl overflow-hidden"
        style={{ background: isDark ? "#0f1c2e" : "#ffffff", borderTop: "4px solid #8b1a2e", borderRadius: "2px" }}
        onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded transition-colors"
          style={{ color: "rgba(255,255,255,0.8)", fontFamily: "sans-serif", background: "rgba(0,0,0,0.2)" }}>✕</button>

        <div className="flex flex-col items-center text-center px-8 pt-10 pb-6" style={{ background: "#8b1a2e" }}>
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
              style={{ background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.35)" }}>
              {teacher.name?.charAt(0) || "؟"}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400" style={{ border: "2px solid #8b1a2e" }} />
          </div>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{teacher.name}</h2>
          <span className="mt-1 text-xs px-3 py-1 font-medium"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "2px", fontFamily: "sans-serif" }}>
            {teacher.specialty}
          </span>
          {teacher.qualification && (
            <span className="mt-1 text-xs text-white/60"><FaGraduationCap className="inline-block ml-1" /> {teacher.qualification}</span>
          )}
        </div>

        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { value: `${teacher.years_of_experience || '-'} سنة`, label: "خبرة" },
              { value: teacher.students, label: "طالب" },
              { value: `${teacher.price || '-'} ج`, label: "/ حصة" },
            ].map((item, i) => (
              <div key={i} className="p-3 text-center"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`, borderRadius: "2px" }}>
                <div className="text-lg font-bold" style={{ color: "#8b1a2e", fontFamily: "Georgia, serif" }}>{item.value}</div>
                <div className="text-xs mt-0.5" style={{ color: isDark ? "#ccc" : "#888", fontFamily: "sans-serif" }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Subjects */}
          {teacher.subjects && teacher.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
              {teacher.subjects.map(sub => (
                <span key={sub} className="text-xs px-2.5 py-1 rounded"
                  style={{ background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)", border: `1px solid ${isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.2)"}`, color: isDark ? "#f0b8be" : "#8b1a2e" }}>
                  {sub}
                </span>
              ))}
            </div>
          )}

          {teacher.bio && (
            <p className="text-sm text-center leading-relaxed mb-6" style={{ color: isDark ? "#ddd" : "#555", fontFamily: "sans-serif" }}>{teacher.bio}</p>
          )}

          <button onClick={() => navigate("/teachers")}
            className="w-full py-3 font-semibold text-sm text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}>
            عرض كل المدرسين
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ParentHome() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [activeSubject, setActiveSubject] = useState("الكل");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTeachers(); }, []);

  async function loadTeachers() {
    if (!supabase) { setLoading(false); return; }
    try {
      const { data: teachersData } = await supabase
        .from("teachers")
        .select("*, profiles!teachers_user_id_fkey(full_name)")
        .eq("is_active", true)
        .order("full_name");

      // جلب عدد الطلاب
      const { data: stData } = await supabase.from("student_teachers").select("teacher_id");
      const counts: Record<string, number> = {};
      if (stData) stData.forEach((st: any) => { counts[st.teacher_id] = (counts[st.teacher_id] || 0) + 1; });

      const mapped: TeacherType[] = (teachersData || []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        name: t.full_name || t.profiles?.full_name || "معلم",
        specialty: t.specialty || t.subjects?.[0] || "",
        subjects: t.subjects || [],
        rating: 4.5 + Math.random() * 0.5,
        students: counts[t.user_id] || 0,
        bio: t.bio || "",
        qualification: t.qualification || "",
        years_of_experience: t.years_of_experience || 0,
        price: t.pricing?.unified_private || 0,
        pricing: t.pricing || {},
        is_active: t.is_active,
      }));

      console.log("Teachers loaded:", mapped); // 🔍 تشخيص
      setTeachers(mapped);
    } catch (err) { console.error("Error loading teachers:", err); }
    finally { setLoading(false); }
  }

  // 🔥🔥🔥 فلترة المعلمين - المتغير activeSubject دلوقتي بالعربي
  const filteredTeachers = activeSubject === "الكل"
    ? teachers
    : teachers.filter(t => {
        // البحث في subjects بتاعة المعلم
        const found = t.subjects?.some(sub => sub === activeSubject);
        // أو في specialty
        const foundInSpecialty = t.specialty?.includes(activeSubject);
        return found || foundInSpecialty;
      });

  console.log("Active subject:", activeSubject, "Filtered count:", filteredTeachers.length); // 🔍 تشخيص

  return (
    <div className="min-h-screen transition-colors duration-300"
      style={{ background: isDark ? "#0f1c2e" : "#ffffff", fontFamily: "Georgia, serif", color: isDark ? "#fff" : "#1a1a1a" }}>

      {selectedTeacher && <TeacherModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} isDark={isDark} />}

      {/* HERO */}
      <section className="relative text-center px-6 pt-20 pb-24 overflow-hidden transition-all duration-300"
        style={{ background: isDark ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)" : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)", borderBottom: "4px solid #8b1a2e" }}>
        
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: isDark ? "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,26,46,0.2) 0%, transparent 70%)" : "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,26,46,0.05) 0%, transparent 70%)" }} />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm mb-6"
          style={{ background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)", border: isDark ? "1px solid rgba(139,26,46,0.5)" : "1px solid rgba(139,26,46,0.3)", color: isDark ? "#f0b8be" : "#8b1a2e", letterSpacing: ".05em", borderRadius: "2px", fontFamily: "sans-serif" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />
          المنصة الأولى للتعليم الخصوصي في مصر
        </div>

        <h1 className="text-5xl md:text-7xl font-Georgia leading-tight mb-6" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
          اختر <span style={{ color: "#c9a84c" }}>مدرسك</span> المثالي
          <br />
          <span style={{ color: isDark ? "#f0e8d0" : "#8b1a2e" }}>لطفلك</span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#666", fontFamily: "sans-serif" }}>
          اختار المدرس المثالي لطفلك من بين أفضل المدرسين المتخصصين — بسهولة، بسرعة، وبثقة.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate("/register")}
            className="px-8 py-3.5 font-semibold text-base text-white transition-all duration-200 hover:opacity-90"
            style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}>
            ابدأ دلوقتي — مجاناً
          </button>
          <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-3.5 font-semibold text-base transition-all duration-200"
            style={{ background: "transparent", border: isDark ? "1px solid rgba(255,255,255,0.3)" : "1px solid #8b1a2e", color: isDark ? "#fff" : "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}>
            شوف كيف بتشتغل ▶
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 transition-colors"
        style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`, background: isDark ? "#0f1c2e" : "#ffffff" }}>
        {stats.map((s, i) => (
          <div key={i} className="text-center py-10 px-4 transition-colors"
            style={{ borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}` : "none" }}>
            <div className="text-4xl font-extrabold mb-1" style={{ color: "#8b1a2e", fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "#888", fontFamily: "sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* SUBJECTS */}
      <section id="subjects" className="px-6 py-16 transition-colors"
        style={{ background: isDark ? "#1a2a40" : "#f5f4f2" }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <SectionLabel text="المواد الدراسية" />
            <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>تصفح حسب المادة</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {subjectCategories.map((sub) => {
              const Icon = sub.icon;
              const isActive = activeSubject === sub.ar;
              return (
                <button key={sub.ar} onClick={() => setActiveSubject(sub.ar)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200"
                  style={{ 
                    borderRadius: "2px", fontFamily: "sans-serif", 
                    border: isActive ? "1px solid #8b1a2e" : isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid #d0ccc4", 
                    background: isActive ? "#8b1a2e" : isDark ? "#0f1c2e" : "#ffffff", 
                    color: isActive ? "#fff" : isDark ? "#ddd" : "#555" 
                  }}>
                  <Icon style={{ fontSize: "1.2rem" }} /> {sub.ar}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEACHERS */}
      <section id="teachers" className="px-6 py-16 transition-colors"
        style={{ background: isDark ? "#0f1c2e" : "#ffffff" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <SectionLabel text="أفضل المدرسين" />
              <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                {activeSubject === "الكل" ? "المدرسين المميزين" : `مدرسين ${activeSubject}`}
                <span className="ml-3 text-lg font-normal" style={{ color: "#aaa" }}>({filteredTeachers.length})</span>
              </h2>
            </div>
            <button onClick={() => navigate("/teachers")}
              className="text-sm font-medium hover:underline" style={{ color: "#8b1a2e", fontFamily: "sans-serif" }}>
              عرض الكل ←
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-5 text-center animate-pulse"
                  style={{ background: isDark ? "#1a2a40" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`, borderTop: "3px solid #8b1a2e", borderRadius: "2px", minHeight: 300 }} />
              ))}
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-20" style={{ color: "#aaa" }}>
              <div className="text-5xl mb-4"><FaSearch /></div>
              <p style={{ fontFamily: "sans-serif" }}>لا يوجد مدرسين في {activeSubject} حالياً</p>
              <button onClick={() => setActiveSubject("الكل")} className="mt-4 text-sm underline" style={{ color: "#8b1a2e" }}>عرض كل المدرسين</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTeachers.slice(0, 8).map((teacher) => (
                <div key={teacher.id}
                  className="p-5 text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ background: isDark ? "#1a2a40" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`, borderTop: "3px solid #8b1a2e", borderRadius: "2px", boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.05)" }}
                  onClick={() => setSelectedTeacher(teacher)}>
                  
                  <div className="relative w-fit mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #8b1a2e, #1c0c14)", border: "2px solid #8b1a2e" }}>
                      {teacher.name?.charAt(0) || "؟"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500" style={{ border: "2px solid #fff" }} />
                  </div>

                  <h3 className="text-base font-bold mb-0.5" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{teacher.name}</h3>
                  <p className="text-sm mb-3" style={{ color: "#8b1a2e", fontFamily: "sans-serif", fontWeight: 500 }}>{teacher.specialty}</p>

                  {/* مواد المعلم */}
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {teacher.subjects.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded"
                          style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2", color: isDark ? "#aaa" : "#888" }}>{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <StarRating rating={teacher.rating} onLight={!isDark} />
                    <span className="text-xs font-semibold" style={{ color: "#c9a84c" }}>{teacher.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: "#aaa", fontFamily: "sans-serif" }}>{teacher.students} طالب</p>

                  <button
                    className="w-full px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
                    style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}>
                    عرض الملف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-16" style={{ background: "#8b1a2e" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel text="الطريقة" onDark />
            <h2 className="text-3xl font-bold text-white">كيف تعمل المنصة</h2>
            <p className="mt-2" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>3 خطوات بسيطة وطفلك هيلاقي مدرسه المثالي</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "اختار المادة", desc: "اختار المادة اللي محتاجها وحدد مستوى طفلك.", icon: "🎯" },
              { step: "02", title: "قارن المدرسين", desc: "اطلع على ملفات المدرسين ومراجعات الأولياء الآخرين.", icon: "👀" },
              { step: "03", title: "احجز حصة", desc: "احجز أول حصة تجريبية مجانية بضغطة واحدة.", icon: "✅" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center p-8 transition-all duration-200 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "2px" }}>
                <div className="w-16 h-16 flex items-center justify-center text-3xl mb-4"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "2px" }}>{item.icon}</div>
                <div className="text-xs font-mono tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>{item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "sans-serif" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="px-6 py-16 transition-colors"
        style={{ background: isDark ? "#1a2a40" : "#f5f4f2" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel text="آراء الأهالي" />
            <h2 className="text-3xl font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>ماذا يقول أولياء الأمور</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ background: isDark ? "#0f1c2e" : "#fff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`, borderLeft: "3px solid #8b1a2e", borderRadius: "2px", boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" style={{ border: "2px solid #8b1a2e" }} />
                  <div>
                    <div className="text-sm font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#8b1a2e", fontFamily: "sans-serif" }}>{t.role}</div>
                  </div>
                  <div className="ml-auto"><StarRating rating={5} onLight={!isDark} /></div>
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: isDark ? "#ddd" : "#555", fontFamily: "sans-serif" }}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative text-center px-8 py-20 overflow-hidden" style={{ background: "#0f1c2e" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#8b1a2e" }} />
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-3" style={{ color: "#c9a84c", fontFamily: "sans-serif" }}>انضم إلينا</p>
        <h2 className="text-4xl font-extrabold mb-4 text-white">ابدأ رحلة التعلم دلوقتي</h2>
        <p className="mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "sans-serif" }}>انضم لأكثر من 1,200 طالب بيتعلموا مع أفضل المدرسين على المنصة.</p>
        <button onClick={() => navigate("/register")}
          className="px-10 py-4 font-semibold text-base transition-all duration-200 hover:opacity-90"
          style={{ background: "#8b1a2e", color: "#fff", borderRadius: "2px", fontFamily: "sans-serif", fontWeight: 600 }}>
          سجل مجاناً الآن
        </button>
      </section>
    </div>
  );
}