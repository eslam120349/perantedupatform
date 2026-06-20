import { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useDarkMode } from "../hooks/useDarkMode";

import {
  FaThLarge, FaCalculator, FaAtom, FaFlask, FaDna,
  FaBook, FaPenFancy, FaSearch, FaTimes,
  FaExclamationTriangle, FaComment, FaStar,
  FaUserCheck, FaClock, FaGraduationCap,
  FaChalkboardTeacher, FaUsers, FaCalendarAlt, FaMoneyBillWave,
} from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────
type TeacherType = {
  id: string;
  user_id: string;
  name: string;
  nameAr: string;
  subject: string;
  subjectAr: string;
  specialty: string;
  rating: number;
  students: number;
  sessions: number;
  experience: string;
  price: number;
  bio: string;
  tags: string[];
  available: boolean;
  image: string;
  levels: string[];
  schedule: string[];
  color: string;
  subjects: string[];
  qualification: string;
  years_of_experience: number;
  pricing: any;
  locations: any[];
};

type ChildType = { id: string; name: string; grade: string; };

// 🔥 نفس الفلتر المستخدم في صفحة الهوم
const subjectCategories = [
  { name: "الكل", ar: "الكل", icon: FaThLarge },
  { name: "الرياضيات", ar: "الرياضيات", icon: FaCalculator },
  { name: "الفيزياء", ar: "الفيزياء", icon: FaAtom },
  { name: "الكيمياء", ar: "الكيمياء", icon: FaFlask },
  { name: "الأحياء", ar: "الأحياء", icon: FaDna },
  { name: "اللغة الإنجليزية", ar: "اللغة الإنجليزية", icon: FaBook },
  { name: "اللغة العربية", ar: "اللغة العربية", icon: FaPenFancy },
];

const ALL_SUBJECTS = [
  'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء',
  'اللغة العربية', 'اللغة الإنجليزية', 'الدراسات الاجتماعية',
  'التاريخ', 'الجغرافيا', 'التربية الإسلامية',
  'الحاسب الآلي', 'التربية الفنية', 'الفلسفة', 'علم النفس'
];

const DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const TIME_SLOTS = [
  { start: "08:00", end: "09:00" }, { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" }, { start: "11:00", end: "12:00" },
  { start: "12:00", end: "13:00" }, { start: "13:00", end: "14:00" },
  { start: "14:00", end: "15:00" }, { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" }, { start: "17:00", end: "18:00" },
  { start: "18:00", end: "19:00" }, { start: "19:00", end: "20:00" },
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

function TeacherCardSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="p-6 space-y-4"
      style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderTop: "3px solid #8b1a2e", borderRadius: "2px" }}>
      <div className="flex flex-col items-center gap-3">
        <SkeletonBlock className="w-20 h-20 rounded-full" isDark={isDark} />
        <SkeletonBlock className="w-32 h-4" isDark={isDark} />
        <SkeletonBlock className="w-20 h-5" isDark={isDark} />
      </div>
      <SkeletonBlock className="w-24 h-3 mx-auto" isDark={isDark} />
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (<SkeletonBlock key={i} className="h-10" isDark={isDark} />))}
      </div>
      <SkeletonBlock className="w-full h-9" isDark={isDark} />
    </div>
  );
}

function GridSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (<TeacherCardSkeleton key={i} isDark={isDark} />))}
    </div>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────
function StarRating({ rating, isDark }: { rating: number; isDark: boolean }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className="w-3.5 h-3.5"
          style={{ color: s <= Math.floor(rating) ? "#c9a84c" : isDark ? "rgba(255,255,255,0.15)" : "#d4cfc8" }}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function SectionLabel({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
      style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#666", fontFamily: "sans-serif" }}>{text}</p>
  );
}

// ─── Teacher Detail Modal ────────────────────────────────────────────────────
function TeacherModal({ teacher, onClose, isDark }: { teacher: TeacherType; onClose: () => void; isDark: boolean }) {
  const [children, setChildren] = useState<ChildType[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [booked, setBooked] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLessonType, setSelectedLessonType] = useState("private");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [teacherBusySlots, setTeacherBusySlots] = useState<any[]>([]);

  useEffect(() => { loadChildren(); }, []);
  useEffect(() => { if (teacher.user_id) loadTeacherSchedule(); }, [teacher.user_id]);

  async function loadChildren() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setChildrenLoading(false); return; }
    const { data } = await supabase.from("students").select("id, full_name, grade").eq("parent_id", user.id).order("full_name");
    if (data) { 
      setChildren(data.map(c => ({ id: c.id, name: c.full_name, grade: c.grade }))); 
      if (data.length === 1) setSelectedChild(data[0].id); 
    }
    setChildrenLoading(false);
  }

  async function loadTeacherSchedule() {
    const { data } = await supabase
      .from("schedules")
      .select("day_of_week, start_time")
      .eq("teacher_id", teacher.user_id)
      .eq("status", "scheduled");
    setTeacherBusySlots(data || []);
  }

  const handleBook = async () => {
    if (!supabase || !selectedChild || !selectedSubject) {
      setBookingError("يرجى اختيار الابن والمادة");
      return;
    }
    if (selectedDay === null || !selectedTime) {
      setBookingError("اختر اليوم والوقت");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    try {
      const { data: conflict } = await supabase
        .from("schedules")
        .select("id")
        .eq("teacher_id", teacher.user_id)
        .eq("day_of_week", selectedDay)
        .eq("start_time", `${selectedTime}:00`)
        .eq("status", "scheduled")
        .maybeSingle();

      if (conflict) { 
        setBookingError("هذا الوقت محجوز بالفعل"); 
        setBookingLoading(false); 
        return; 
      }

      const { data: existing } = await supabase
        .from("student_teachers")
        .select("id")
        .eq("student_id", selectedChild)
        .eq("teacher_id", teacher.user_id)
        .eq("subject", selectedSubject)
        .maybeSingle();

      if (existing) { 
        await addSchedule(selectedChild, selectedSubject);
        setBooked(true);
        setBookingLoading(false);
        return; 
      }

      const { error: stError } = await supabase.from("student_teachers").insert({
        student_id: selectedChild,
        teacher_id: teacher.user_id,
        subject: selectedSubject,
        lesson_type: selectedLessonType,
        price: getPrice(),
      });

      if (stError) { 
        setBookingError(stError.message); 
        setBookingLoading(false); 
        return; 
      }

      await addSchedule(selectedChild, selectedSubject);
      setBooked(true);
    } catch (err) { 
      setBookingError("حدث خطأ غير متوقع"); 
    } finally { 
      setBookingLoading(false); 
    }
  };

  const addSchedule = async (studentId: string, subject: string) => {
    if (!supabase) return;
    
    const startHour = parseInt(selectedTime.split(":")[0]);
    const endHour = startHour + 1;
    const startTime = `${selectedTime}:00`;
    const endTime = `${String(endHour).padStart(2, "0")}:00:00`;

    await supabase.from("schedules").insert({
      teacher_id: teacher.user_id,
      student_id: studentId,
      subject: subject,
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime,
      status: "scheduled",
      color: "#8b1a2e",
      room: "غرفة افتراضية",
    });
  };

  const getPrice = () => {
    if (!teacher.pricing || Object.keys(teacher.pricing).length === 0) return teacher.price;
    if (teacher.pricing.unified) return teacher.pricing[`unified_${selectedLessonType}`] || teacher.price;
    return teacher.price;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }} onClick={onClose}>
      <div className="relative w-full max-w-lg shadow-2xl"
        style={{ background: isDark ? "#0f1c2e" : "#ffffff", borderTop: "4px solid #8b1a2e", border: `1px solid ${isDark ? "rgba(139,26,46,0.3)" : "#e8e4de"}`, borderRadius: "2px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}>
        
        <div className="px-6 pt-5 pb-4 flex-shrink-0 relative" style={{ background: "#8b1a2e" }}>
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded" style={{ color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.2)" }}><FaTimes size={14} /></button>
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)" }}>{teacher.nameAr?.charAt(0) || "؟"}</div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full" style={{ background: teacher.available ? "#4ade80" : "#4b5563", border: "2px solid #8b1a2e" }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{teacher.nameAr}</h2>
              <span className="inline-block text-xs font-medium px-2 py-0.5 mt-1" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "2px" }}>{teacher.specialty || teacher.subjectAr}</span>
              {teacher.qualification && <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}><FaGraduationCap className="inline-block ml-1" /> {teacher.qualification}</div>}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1" style={{ scrollbarWidth: "thin", scrollbarColor: isDark ? "rgba(255,255,255,0.15) transparent" : "rgba(139,26,46,0.2) transparent" }}>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[{ v: teacher.students, l: "طالب" }, { v: teacher.sessions, l: "حصة" }, { v: teacher.years_of_experience ? `${teacher.years_of_experience} سنة` : teacher.experience, l: "خبرة" }, { v: `${getPrice()} ج`, l: "/ حصة" }].map((s, i) => (
              <div key={i} className="p-2 text-center" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px" }}>
                <div className="text-sm font-extrabold" style={{ color: "#c9a84c" }}>{s.v}</div>
                <div className="text-[10px] mt-0.5" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {teacher.bio && <p className="text-xs leading-relaxed mb-4" style={{ color: isDark ? "rgba(255,255,255,0.55)" : "#555" }} dir="rtl">{teacher.bio}</p>}

          {teacher.subjects && teacher.subjects.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#666" }}>المواد الدراسية</p>
              <div className="flex flex-wrap gap-1.5">
                {teacher.subjects.map((sub) => (
                  <span key={sub} className="text-xs font-medium px-2.5 py-1" style={{ background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)", border: `1px solid ${isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.2)"}`, color: isDark ? "#f0b8be" : "#8b1a2e", borderRadius: "2px" }}>{sub}</span>
                ))}
              </div>
            </div>
          )}

          {teacher.available ? (
            <div className="space-y-2.5">
              {childrenLoading ? (
                <div className="w-full px-4 py-2.5 text-xs text-center animate-pulse" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px", color: isDark ? "rgba(255,255,255,0.35)" : "#888" }}>جار تحميل الأبناء...</div>
              ) : children.length === 0 ? (
                <div className="w-full px-4 py-2.5 text-xs text-center" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "2px", color: "#c9a84c" }}><FaExclamationTriangle className="inline-block ml-1" /> لا يوجد أبناء مسجلين</div>
              ) : (
                <>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#888" }}>اختر الابن</label>
                    <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} disabled={booked}
                      className="w-full px-3 py-2.5 text-xs focus:outline-none disabled:opacity-50"
                      style={{ background: isDark ? "#0f1c2e" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`, borderRadius: "2px", color: isDark ? "#fff" : "#1a1a1a" }}>
                      {children.length > 1 && <option value="">— اختر الابن —</option>}
                      {children.map((child) => (<option key={child.id} value={child.id}>{child.name} - {child.grade}</option>))}
                    </select>
                  </div>

                  {selectedChild && (
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#888" }}>اختر المادة</label>
                      <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={booked}
                        className="w-full px-3 py-2.5 text-xs focus:outline-none disabled:opacity-50"
                        style={{ background: isDark ? "#0f1c2e" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`, borderRadius: "2px", color: isDark ? "#fff" : "#1a1a1a" }}>
                        <option value="">— اختر المادة —</option>
                        {(teacher.subjects?.length > 0 ? teacher.subjects : ALL_SUBJECTS).map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    </div>
                  )}

                  {selectedSubject && (
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#888" }}>نوع الحصة</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[{ v: 'private', l: '👤 برايفت' }, { v: 'center', l: '🏫 سنتر' }, { v: 'online', l: '💻 أونلاين' }, { v: 'group', l: '👥 مجموعة' }].map(t => (
                          <button key={t.v} onClick={() => setSelectedLessonType(t.v)} disabled={booked}
                            className="px-2.5 py-2 text-xs font-medium transition-all"
                            style={{ border: selectedLessonType === t.v ? "2px solid #8b1a2e" : `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`, background: selectedLessonType === t.v ? "rgba(139,26,46,0.15)" : "transparent", color: selectedLessonType === t.v ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.5)" : "#666", borderRadius: "2px" }}>{t.l}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSubject && (
                    <div className="space-y-2">
                      <label className="text-xs block" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#888" }}>اختر اليوم والوقت *</label>
                      
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {DAYS.map((day, i) => (
                          <button key={i} type="button"
                            onClick={() => { setSelectedDay(i); setSelectedTime(""); }}
                            style={{ padding: "5px 8px", border: "1px solid", borderColor: selectedDay === i ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4", borderRadius: "2px", background: selectedDay === i ? "rgba(139,26,46,0.15)" : "transparent", color: selectedDay === i ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.5)" : "#666", fontSize: 10, cursor: "pointer" }}>
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>

                      {selectedDay !== null && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, maxHeight: 120, overflowY: "auto" }}>
                          {TIME_SLOTS.map(slot => {
                            const isBusy = teacherBusySlots.some(s => s.day_of_week === selectedDay && s.start_time?.slice(0, 5) === slot.start);
                            return (
                              <button key={slot.start} type="button" disabled={isBusy}
                                onClick={() => setSelectedTime(slot.start)}
                                style={{ padding: "6px 4px", border: "1px solid", borderColor: isBusy ? "rgba(229,57,53,0.4)" : selectedTime === slot.start ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4", borderRadius: "2px", background: isBusy ? "rgba(229,57,53,0.1)" : selectedTime === slot.start ? "rgba(139,26,46,0.15)" : "transparent", color: isBusy ? "#e53935" : selectedTime === slot.start ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.5)" : "#666", fontSize: 10, opacity: isBusy ? 0.5 : 1, cursor: isBusy ? "not-allowed" : "pointer" }}>
                                {slot.start}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <p style={{ fontSize: 9, color: isDark ? "rgba(255,255,255,0.3)" : "#aaa" }}>🟢 متاح | 🔴 مشغول</p>
                    </div>
                  )}
                </>
              )}

              {bookingError && <p className="text-xs text-center py-2" style={{ background: "rgba(139,26,46,0.15)", border: "1px solid rgba(139,26,46,0.3)", borderRadius: "2px", color: "#f0b8be" }}>{bookingError}</p>}

              <button onClick={handleBook}
                disabled={booked || bookingLoading || !selectedChild || !selectedSubject || selectedDay === null || !selectedTime || children.length === 0}
                className="w-full py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif" }}>
                {bookingLoading ? "⏳ جاري الحجز..." : booked ? "✅ تم التسجيل!" : "تسجيل مع المدرس 🚀"}
              </button>
            </div>
          ) : (
            <div className="w-full py-3 text-center text-xs" style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#f5f4f2", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px", color: isDark ? "rgba(255,255,255,0.3)" : "#aaa" }}>المدرس غير متاح حالياً</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────
function TeacherCard({ teacher, onSelect, isDark }: { teacher: TeacherType; onSelect: () => void; isDark: boolean }) {
  return (
    <div onClick={onSelect} className="group p-5 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1"
      style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderTop: "3px solid #8b1a2e", borderRadius: "2px", boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex justify-end mb-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5"
          style={{ background: teacher.available ? "rgba(74,222,128,0.1)" : isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2", color: teacher.available ? "#4ade80" : isDark ? "rgba(255,255,255,0.3)" : "#aaa", borderRadius: "2px" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: teacher.available ? "#4ade80" : isDark ? "rgba(255,255,255,0.2)" : "#ccc", animation: teacher.available ? "pulse 2s infinite" : "none" }} />{teacher.available ? "متاح" : "مشغول"}
        </span>
      </div>
      <div className="relative w-fit mx-auto mb-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: "linear-gradient(135deg, #8b1a2e, #1c0c14)", border: "2px solid #8b1a2e" }}>{teacher.nameAr?.charAt(0) || "؟"}</div>
      </div>
      <h3 className="text-base font-bold mb-0.5" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{teacher.nameAr}</h3>
      <p className="text-sm mb-3 font-medium" style={{ color: "#8b1a2e" }}>{teacher.specialty || teacher.subjectAr}</p>
      {teacher.subjects && teacher.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 justify-center">
          {teacher.subjects.slice(0, 3).map(s => <span key={s} className="text-[10px] px-2 py-0.5" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, color: isDark ? "rgba(255,255,255,0.35)" : "#888", borderRadius: "2px" }}>{s}</span>)}
          {teacher.subjects.length > 3 && <span className="text-[10px] px-2 py-0.5" style={{ color: "#c9a84c" }}>+{teacher.subjects.length - 3}</span>}
        </div>
      )}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#888" }}>سعر الحصة</span>
        <span className="text-sm font-bold" style={{ color: "#c9a84c" }}>{teacher.price} ج</span>
      </div>
      <button className="w-full py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90" style={{ background: "#8b1a2e", borderRadius: "2px" }}>عرض الملف الكامل</button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeachersPage() {
  const { isDark } = useDarkMode();
  const [activeSubject, setActiveSubject] = useState("الكل");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "price_asc" | "price_desc" | "students">("rating");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => { loadTeachers(); }, []);

  async function loadTeachers() {
    if (!supabase) { setErrorMsg("Supabase غير مهيّأ"); setLoading(false); return; }
    try {
      const { data: teachersData, error } = await supabase
        .from("teachers")
        .select("*, profiles!teachers_user_id_fkey(full_name, phone)")
        .eq("is_active", true)
        .order("full_name");
      
      if (error) throw error;
      
      const { data: stData } = await supabase.from("student_teachers").select("teacher_id");
      const teacherStudentCounts: Record<string, number> = {};
      if (stData) { stData.forEach((st: any) => { teacherStudentCounts[st.teacher_id] = (teacherStudentCounts[st.teacher_id] || 0) + 1; }); }
      
      const mapped: TeacherType[] = (teachersData || []).map((t: any) => ({
        id: t.id, user_id: t.user_id, name: t.profiles?.full_name || t.full_name,
        nameAr: t.full_name || t.profiles?.full_name || "", subject: t.subjects?.[0] || "",
        subjectAr: t.subjects?.[0] || "", specialty: t.specialty || "", rating: 4.5,
        students: teacherStudentCounts[t.user_id] || 0, sessions: 0,
        experience: t.years_of_experience ? `${t.years_of_experience} سنوات` : "",
        price: t.pricing?.unified_private || 0, bio: t.bio || "", tags: t.subjects || [],
        available: t.is_active, image: t.avatar_url || "", levels: [], schedule: [],
        color: "#8b1a2e", subjects: t.subjects || [], qualification: t.qualification || "",
        years_of_experience: t.years_of_experience || 0, pricing: t.pricing || {}, locations: t.locations || [],
      }));
      setTeachers(mapped);
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setLoading(false); }
  }

  // 🔥🔥🔥 نفس فلتر صفحة الهوم
  const filteredTeachers = activeSubject === "الكل"
    ? teachers
    : teachers.filter(t => {
        const found = t.subjects?.some(sub => sub === activeSubject);
        const foundInSpecialty = t.specialty?.includes(activeSubject);
        return found || foundInSpecialty;
      });

  // 🔥 تطبيق الفلاتر الإضافية (البحث، المتاح، الترتيب)
  const filtered = useMemo(() => {
    let list = [...filteredTeachers];
    
    // فلتر البحث
    if (search.trim()) { 
      const q = search.trim().toLowerCase(); 
      list = list.filter((t) => 
        t.nameAr?.toLowerCase().includes(q) || 
        t.specialty?.toLowerCase().includes(q) || 
        t.subjects?.some(s => s.toLowerCase().includes(q))
      ); 
    }
    
    // فلتر المتاح فقط
    if (onlyAvailable) list = list.filter((t) => t.available);
    
    // الترتيب
    switch (sortBy) { 
      case "rating": list.sort((a, b) => b.rating - a.rating); break; 
      case "students": list.sort((a, b) => b.students - a.students); break; 
      case "price_asc": list.sort((a, b) => a.price - b.price); break; 
      case "price_desc": list.sort((a, b) => b.price - a.price); break; 
    }
    return list;
  }, [filteredTeachers, search, sortBy, onlyAvailable]);

  const statsAvailable = teachers.filter((t) => t.available).length;
  const statsStudents = teachers.reduce((a, b) => a + b.students, 0);
  const hasFilters = search || onlyAvailable || activeSubject !== "الكل";

  return (
    <>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      <div className="min-h-screen transition-colors duration-300"
        style={{ background: isDark ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)" : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)", color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }} dir="rtl">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div style={{ position: "absolute", top: 0, right: "25%", width: 500, height: 300, background: isDark ? "rgba(139,26,46,0.12)" : "rgba(139,26,46,0.04)", filter: "blur(120px)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: "25%", left: "25%", width: 400, height: 250, background: isDark ? "rgba(201,168,76,0.06)" : "rgba(201,168,76,0.03)", filter: "blur(120px)", borderRadius: "50%" }} />
        </div>
        {selectedTeacher && <TeacherModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} isDark={isDark} />}
        <div style={{ borderBottom: "4px solid #8b1a2e" }}>
          <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm mb-4" style={{ background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)", border: `1px solid ${isDark ? "rgba(139,26,46,0.5)" : "rgba(139,26,46,0.3)"}`, color: isDark ? "#f0b8be" : "#8b1a2e", letterSpacing: ".05em", borderRadius: "2px" }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />{loading ? "جار تحميل المدرسين..." : `${teachers.length} مدرس متاح`}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>اختار <span style={{ color: "#c9a84c" }}>مدرسك</span> المثالي</h1>
                <p className="text-base mt-2" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666" }}>ابحث، قارن، وسجل مع أفضل المعلمين</p>
              </div>
              <div className="flex gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
                {loading ? [0,1,2].map((i) => (<div key={i} className="px-6 py-4 space-y-2 text-center" style={{ borderRight: i<2 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none" }}><SkeletonBlock className="w-12 h-6 mx-auto" isDark={isDark} /><SkeletonBlock className="w-20 h-3 mx-auto" isDark={isDark} /></div>)) : [
                  { v: statsAvailable, l: "متاح الآن" }, { v: `${statsStudents}+`, l: "طالب مسجل" }, { v: teachers.length, l: "مدرس" }
                ].map((s, i) => (<div key={i} className="px-6 py-4 text-center" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7", borderRight: i<2 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none" }}><div className="text-xl font-extrabold mb-0.5" style={{ color: "#c9a84c" }}>{s.v}</div><div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>{s.l}</div></div>))}
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaa" }}><FaSearch /></span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث باسم المدرس أو المادة..."
                className="w-full pr-12 pl-4 py-3.5 text-sm focus:outline-none transition-colors"
                style={{ background: isDark ? "rgba(255,255,255,0.04)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, borderRadius: "2px", color: isDark ? "#fff" : "#1a1a1a" }} />
              {search && <button onClick={() => setSearch("")} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#aaa" }}><FaTimes /></button>}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* 🔥 نفس فلتر المواد من صفحة الهوم */}
              <div className="flex flex-wrap gap-2 flex-1">
                {subjectCategories.map((sub) => {
                  const Icon = sub.icon;
                  const isActive = activeSubject === sub.ar;
                  return (
                    <button 
                      key={sub.ar} 
                      onClick={() => setActiveSubject(sub.ar)} 
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-all duration-200"
                      style={{ 
                        borderRadius: "2px", 
                        border: isActive ? "1px solid #8b1a2e" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, 
                        background: isActive ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.04)" : "#ffffff", 
                        color: isActive ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#555",
                        transform: isActive ? "scale(1.02)" : "scale(1)"
                      }}>
                      <Icon style={{ fontSize: "0.9rem" }} /> {sub.ar}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button onClick={() => setOnlyAvailable(!onlyAvailable)} 
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-all duration-200"
                  style={{ 
                    borderRadius: "2px", 
                    border: onlyAvailable ? "1px solid rgba(74,222,128,0.4)" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, 
                    background: onlyAvailable ? "rgba(74,222,128,0.1)" : isDark ? "rgba(255,255,255,0.04)" : "#ffffff", 
                    color: onlyAvailable ? "#4ade80" : isDark ? "rgba(255,255,255,0.45)" : "#555" 
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: onlyAvailable ? "#4ade80" : isDark ? "rgba(255,255,255,0.2)" : "#ccc" }} /> متاح فقط
                </button>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3.5 py-2 text-xs focus:outline-none transition-all duration-200"
                  style={{ background: isDark ? "#0f1c2e" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, borderRadius: "2px", color: isDark ? "rgba(255,255,255,0.6)" : "#555" }}>
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="students">الأكثر طلاباً</option>
                  <option value="price_asc">السعر: الأقل</option>
                  <option value="price_desc">السعر: الأعلى</option>
                </select>
              </div>
            </div>
          </div>
          
          {!loading && (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>
                عرض <span style={{ color: isDark ? "#fff" : "#1a1a1a", fontWeight: 600 }}>{filtered.length}</span> مدرس
                {activeSubject !== "الكل" && (
                  <span className="mr-2 text-xs" style={{ color: "#8b1a2e" }}>
                    · {activeSubject}
                  </span>
                )}
              </p>
              {hasFilters && (
                <button 
                  onClick={() => { 
                    setSearch(""); 
                    setOnlyAvailable(false); 
                    setActiveSubject("الكل"); 
                  }} 
                  className="text-xs underline transition-all duration-200 hover:text-[#8b1a2e]"
                  style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#aaa" }}>
                  إزالة الفلاتر
                </button>
              )}
            </div>
          )}
          
          {loading ? <GridSkeleton isDark={isDark} /> : errorMsg ? (
            <div className="text-center py-24" style={{ border: `1px dashed ${isDark ? "rgba(139,26,46,0.3)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px" }}>
              <div className="text-5xl mb-4"><FaExclamationTriangle /></div>
              <p style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>خطأ: {errorMsg}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24" style={{ border: `1px dashed ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px" }}>
              <div className="text-5xl mb-4"><FaSearch /></div>
              <p className="text-lg font-bold mb-2" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>لا يوجد مدرسين</p>
              <p style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>جرب تغيير الفلتر أو البحث</p>
              <button 
                onClick={() => { setActiveSubject("الكل"); setSearch(""); setOnlyAvailable(false); }} 
                className="mt-4 text-sm underline" style={{ color: "#8b1a2e" }}>
                عرض كل المدرسين
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} onSelect={() => setSelectedTeacher(teacher)} isDark={isDark} />
              ))}
            </div>
          )}
          
          <div className="relative text-center px-8 py-14 overflow-hidden" style={{ background: "#8b1a2e", borderRadius: "2px" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
            <h2 className="text-2xl font-extrabold text-white mb-3">مش لاقي المدرس المناسب؟</h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>فريقنا هيساعدك تلاقي أنسب مدرس لطفلك</p>
            <button className="px-8 py-3 font-semibold text-sm text-white transition-all duration-200 hover:opacity-90" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "2px" }}><FaComment className="inline-block ml-1" /> تواصل معنا</button>
          </div>
        </div>
      </div>
    </>
  );
}