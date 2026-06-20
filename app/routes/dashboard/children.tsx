import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useDarkMode } from "../../hooks/useDarkMode";
import {
  FaChild, FaTimes, FaChartLine, FaBook, FaCalendarAlt, FaStar,
  FaChalkboardTeacher, FaClipboardList, FaArrowLeft, FaUserPlus,
  FaUsers, FaPlus, FaExclamationTriangle, FaCheck, FaGraduationCap
} from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChildType = {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  color: string;
  attendance: number;
  sessions: number;
  upcoming: number;
  teachers: any[];
  schedules: any[];
  attendanceList: any[];
};

const GRADES = [
  "الصف الأول", "الصف الثاني", "الصف الثالث",
  "الصف الرابع", "الصف الخامس", "الصف السادس",
  "الصف السابع", "الصف الثامن", "الصف التاسع",
  "الصف العاشر", "الصف الحادي عشر", "الصف الثاني عشر",
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonBlock({ className = "", isDark }: { className?: string; isDark: boolean }) {
  return (
    <div className={`relative overflow-hidden ${className}`}
      style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", borderRadius: "2px" }}>
      <div className="absolute inset-0 -translate-x-full"
        style={{ background: isDark ? "linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent)" : "linear-gradient(90deg, transparent, rgba(139,26,46,0.1), transparent)", animation: "shimmer 1.5s infinite" }} />
    </div>
  );
}

function ChildSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="p-6 space-y-4"
      style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderTop: "3px solid #8b1a2e", borderRadius: "2px" }}>
      <div className="flex items-center gap-4">
        <SkeletonBlock className="w-16 h-16 rounded-full" isDark={isDark} />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-32" isDark={isDark} />
          <SkeletonBlock className="h-3 w-24" isDark={isDark} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map(i => <SkeletonBlock key={i} className="h-10" isDark={isDark} />)}
      </div>
    </div>
  );
}

// ─── AvatarOrInitial ──────────────────────────────────────────────────────────
function AvatarOrInitial({ src, name, className = "", style }: { src: string; name: string; className?: string; style?: any }) {
  return src ? (
    <img src={src} alt={name} className={className} style={style} />
  ) : (
    <div className={`${className} flex items-center justify-center font-bold text-white`}
      style={{ background: "linear-gradient(135deg, #8b1a2e, #1c0c14)", ...style }}>
      {name?.charAt(0)?.toUpperCase() || "؟"}
    </div>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────
function AddChildModal({ onClose, onAdd, isDark }: { onClose: () => void; onAdd: () => void; isDark: boolean }) {
  const [form, setForm] = useState({ full_name: "", grade: "", gender: "male", date_of_birth: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.full_name.trim()) return setError("اكتب اسم الطالب");
    if (!form.grade) return setError("اختار الصف الدراسي");
    if (!supabase) return;
    
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("لم يتم العثور على المستخدم"); setLoading(false); return; }

    const studentNumber = `STU-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error: insertError } = await supabase
      .from("students")
      .insert({
        full_name: form.full_name.trim(),
        student_number: studentNumber,
        grade: form.grade,
        gender: form.gender,
        date_of_birth: form.date_of_birth || null,
        parent_id: user.id,
      });

    if (insertError) {
      setError("حدث خطأ: " + insertError.message);
    } else {
      onAdd();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="relative w-full max-w-md shadow-2xl overflow-hidden"
        style={{ background: isDark ? "#0f1c2e" : "#ffffff", borderTop: "4px solid #8b1a2e", border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "#e8e4de"}`, borderRadius: "2px" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="px-8 pt-8 pb-6" style={{ background: "#8b1a2e" }}>
          <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded"
            style={{ color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.2)" }}><FaTimes /></button>
          <div className="text-3xl mb-2"><FaChild /></div>
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>إضافة ابن جديد</h2>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "sans-serif" }}>أدخل بيانات ابنك لمتابعته</p>
        </div>
        <div className="px-8 py-6 space-y-4">
          {error && (
            <p className="text-xs py-2 px-3 text-center" style={{ background: "rgba(139,26,46,0.15)", border: "1px solid rgba(139,26,46,0.3)", borderRadius: "2px", color: "#f0b8be", fontFamily: "sans-serif" }}>
              <FaExclamationTriangle className="inline-block ml-1" /> {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#666" }}>الاسم الكامل</label>
            <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="مثال: أحمد محمد"
              className="w-full px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`, borderRadius: "2px", color: isDark ? "#fff" : "#1a1a1a" }} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#666" }}>الصف الدراسي</label>
            <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
              className="w-full px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: isDark ? "#0f1c2e" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`, borderRadius: "2px", color: isDark ? "#fff" : "#1a1a1a" }}>
              <option value="">اختار الصف</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#666" }}>الجنس</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
              className="w-full px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: isDark ? "#0f1c2e" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`, borderRadius: "2px", color: isDark ? "#fff" : "#1a1a1a" }}>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium"
              style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`, color: isDark ? "rgba(255,255,255,0.6)" : "#666", borderRadius: "2px" }}>إلغاء</button>
            <button onClick={submit} disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "#8b1a2e", borderRadius: "2px" }}>
              {loading ? "جاري..." : "إضافة"} <FaCheck className="inline-block mr-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChildrenPage() {
  const { isDark } = useDarkMode();
  const [children, setChildren] = useState<ChildType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    if (!supabase) { setLoading(false); return; }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    try {
      // 1. جلب الطلاب
      const { data: studentsData } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id)
        .order("full_name");

      if (!studentsData || studentsData.length === 0) {
        setChildren([]);
        setLoading(false);
        return;
      }

      const studentIds = studentsData.map(s => s.id);

      // 2. جلب المدرسين المسجلين
      const { data: stData } = await supabase
        .from("student_teachers")
        .select("*, teachers(full_name, specialty, profiles!teachers_user_id_fkey(full_name))")
        .in("student_id", studentIds);

      // 3. جلب الحصص
      const { data: schedulesData } = await supabase
        .from("schedules")
        .select("*")
        .in("student_id", studentIds)
        .eq("status", "scheduled");

      // 4. جلب الحضور
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .in("student_id", studentIds);

      // بناء البيانات
      const mapped: ChildType[] = studentsData.map(student => {
        const studentST = (stData || []).filter(st => st.student_id === student.id);
        const studentSchedules = (schedulesData || []).filter(s => s.student_id === student.id);
        const studentAttendance = (attendanceData || []).filter(a => a.student_id === student.id);

        const presentCount = studentAttendance.filter(a => a.status === 'present').length;
        const totalAtt = studentAttendance.length;
        const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;

        const teachers = studentST.map(st => ({
          name: st.teachers?.full_name || st.teachers?.profiles?.full_name || "معلم",
          subject: st.subject,
          image: "",
          rating: 5,
        }));

        return {
          id: student.id,
          name: student.full_name,
          grade: student.grade || "",
          avatar: student.avatar_url || "",
          color: "#8b1a2e",
          attendance: attendanceRate,
          sessions: studentSchedules.length,
          upcoming: studentSchedules.filter(s => s.day_of_week >= new Date().getDay()).length,
          teachers,
          schedules: studentSchedules,
          attendanceList: studentAttendance,
        };
      });

      setChildren(mapped);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const deleteChild = async (id: string) => {
    if (!supabase) return;
    await supabase.from("students").delete().eq("id", id);
    setChildren(prev => prev.filter(c => c.id !== id));
  };

  const totalSessions = children.reduce((a, c) => a + c.sessions, 0);
  const avgAttendance = children.length ? Math.round(children.reduce((a, c) => a + c.attendance, 0) / children.length) : 0;
  const totalUpcoming = children.reduce((a, c) => a + c.upcoming, 0);

  return (
    <>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
      <div className="min-h-screen transition-colors duration-300"
        style={{ background: isDark ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)" : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)", color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }}
        dir="rtl">

        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div style={{ position: "absolute", top: 0, left: "33%", width: 400, height: 250, background: isDark ? "rgba(139,26,46,0.12)" : "rgba(139,26,46,0.04)", filter: "blur(100px)", borderRadius: "50%" }} />
        </div>

        {showAdd && <AddChildModal onClose={() => setShowAdd(false)} onAdd={loadData} isDark={isDark} />}

        {/* HEADER */}
        <div style={{ borderBottom: "4px solid #8b1a2e" }}>
          <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm mb-3"
                style={{ background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)", border: `1px solid ${isDark ? "rgba(139,26,46,0.5)" : "rgba(139,26,46,0.3)"}`, color: isDark ? "#f0b8be" : "#8b1a2e", letterSpacing: ".05em", borderRadius: "2px", fontFamily: "sans-serif" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />
                {children.length} {children.length === 1 ? "ابن مسجل" : "أبناء مسجلين"}
              </div>
              <h1 className="text-3xl font-extrabold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>أبنائي</h1>
              <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>إدارة ومتابعة أبنائك</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}>
              <FaUserPlus /> إضافة ابن جديد
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* STATS */}
          {!loading && children.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
              {[
                { l: "عدد الأبناء", v: children.length, icon: FaUsers },
                { l: "إجمالي الحصص", v: totalSessions, icon: FaBook },
                { l: "متوسط الحضور", v: `${avgAttendance}%`, icon: FaChartLine },
                { l: "حصص قادمة", v: totalUpcoming, icon: FaCalendarAlt },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="py-8 px-4 text-center"
                    style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7", borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none" }}>
                    <div className="text-2xl mb-1"><Icon /></div>
                    <div className="text-3xl font-extrabold mb-0.5" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>{s.v}</div>
                    <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>{s.l}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CHILDREN GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[...Array(2)].map((_, i) => <ChildSkeleton key={i} isDark={isDark} />)}
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-24" style={{ border: `1px dashed ${isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px" }}>
              <div className="text-6xl mb-4"><FaUsers /></div>
              <h3 className="text-xl font-bold mb-2" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>لا يوجد أبناء مسجلين</h3>
              <p className="text-sm mb-6" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>أضف ابنك الأول وابدأ تتابع تقدمه</p>
              <button onClick={() => setShowAdd(true)}
                className="px-7 py-3 text-sm font-semibold text-white"
                style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}>
                <FaUserPlus className="inline-block ml-1" /> أضف ابنك الأول
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {children.map((child) => (
                <div key={child.id}
                  className="group p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderTop: "3px solid #8b1a2e", borderRadius: "2px", boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)" }}>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <AvatarOrInitial src={child.avatar} name={child.name}
                      className="w-16 h-16 flex-shrink-0 object-cover text-xl transition-transform duration-300 group-hover:scale-105"
                      style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{child.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: "#8b1a2e", fontFamily: "sans-serif", fontWeight: 500 }}>
                        <FaGraduationCap className="inline-block ml-1" /> {child.grade}
                      </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteChild(child.id); }}
                      className="text-xs px-3 py-1.5 transition-colors hover:opacity-80"
                      style={{ background: "rgba(139,26,46,0.15)", color: "#f0b8be", borderRadius: "2px", fontFamily: "sans-serif" }}>
                      حذف
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { v: `${child.attendance}%`, l: "حضور" },
                      { v: child.sessions, l: "حصة" },
                      { v: child.upcoming, l: "قادمة" },
                    ].map((s, i) => (
                      <div key={i} className="p-2 text-center"
                        style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`, borderRadius: "2px" }}>
                        <p className="text-sm font-extrabold" style={{ color: "#c9a84c" }}>{s.v}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#888", fontFamily: "sans-serif" }}>{s.l}</p>
                      </div>
                    ))}
                  </div>

                  {child.teachers.length > 0 && (
                    <div className="flex items-center gap-2 pt-4" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}` }}>
                      <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#888", fontFamily: "sans-serif" }}>
                        <FaChalkboardTeacher className="inline-block ml-1" /> {child.teachers.length} مدرس
                      </span>
                      <span className="mr-auto text-xs" style={{ color: "#8b1a2e" }}>
                        {child.teachers.map(t => t.subject).join("، ")}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Add card */}
              <button onClick={() => setShowAdd(true)}
                className="flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:opacity-80 min-h-[200px]"
                style={{ border: `2px dashed ${isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px", background: "transparent" }}>
                <div className="w-12 h-12 flex items-center justify-center text-2xl"
                  style={{ background: isDark ? "rgba(139,26,46,0.1)" : "rgba(139,26,46,0.05)", border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px", color: "#8b1a2e" }}>
                  <FaPlus />
                </div>
                <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>إضافة ابن جديد</p>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}