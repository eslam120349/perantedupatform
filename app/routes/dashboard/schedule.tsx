import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useDarkMode } from "../../hooks/useDarkMode";
import { FaChild, FaGraduationCap, FaClock, FaBook, FaUser, FaMapPin } from "react-icons/fa";

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

type ChildType = { id: string; name: string; grade: string; avatar: string };
type ScheduleType = {
  id: string;
  student_id: string;
  student_name: string;
  student_grade: string;
  day_of_week: number;
  subject: string;
  teacher_name: string;
  start_time: string;
  end_time: string;
  room: string;
  color: string;
  status: string;
  notes: string;
};

function SkeletonBlock({ className = "", isDark }: { className?: string; isDark: boolean }) {
  return (
    <div className={`relative overflow-hidden ${className}`}
      style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)", borderRadius: "2px" }}>
      <div className="absolute inset-0 -translate-x-full"
        style={{ background: isDark ? "linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent)" : "linear-gradient(90deg, transparent, rgba(139,26,46,0.1), transparent)", animation: "shimmer 1.5s infinite" }} />
    </div>
  );
}

// ─── Weekly Grid Component ──────────────────────────────────────────────────
function WeeklyGrid({ schedules, isDark }: { schedules: ScheduleType[]; isDark: boolean }) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday
  const currentHour = today.getHours();

  // Get date for a specific day offset from today
  const getDateForDay = (offset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return date;
  };

  // Format date as DD/MM
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  // Reorder days to start from today
  const orderedDays = DAYS.map((_, index) => {
    const dayIndex = (currentDay + index) % 7;
    const date = getDateForDay(index);
    return {
      name: DAYS[dayIndex],
      index: dayIndex,
      isToday: index === 0,
      date: date,
      dateStr: formatDate(date),
      fullDate: date.toLocaleDateString('ar-EG', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  });

  // Get schedule at specific day and hour
  const getScheduleAt = (dayIndex: number, hour: number) => {
    return schedules.find(s => 
      s.day_of_week === dayIndex && 
      s.start_time && 
      parseInt(s.start_time.split(':')[0]) === hour
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header - Hours */}
        <div className="grid" style={{ 
          gridTemplateColumns: "120px repeat(14, 1fr)",
          borderBottom: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e8e4de"}`
        }}>
          {/* Empty corner */}
          <div className="p-2 flex items-center justify-center" style={{ 
            background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7",
            borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
          }}>
            <div className="text-xs font-bold" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaa" }}>
              اليوم
            </div>
          </div>
          
          {HOURS.map((hour) => {
            const timeLabel = hour >= 12 ? `${hour === 12 ? 12 : hour - 12} م` : `${hour} ص`;
            const isCurrentHour = currentHour === hour;
            return (
              <div key={hour} className="p-2 text-center" style={{
                background: isCurrentHour ? (isDark ? "rgba(201,168,76,0.1)" : "rgba(201,168,76,0.05)") : (isDark ? "rgba(255,255,255,0.02)" : "#faf9f7"),
                borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
                borderBottom: isCurrentHour ? `2px solid #c9a84c` : "none"
              }}>
                <div className="text-xs font-mono" style={{ 
                  color: isCurrentHour ? "#c9a84c" : (isDark ? "rgba(255,255,255,0.5)" : "#666"),
                  fontWeight: isCurrentHour ? "bold" : "normal"
                }}>
                  {timeLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Days Grid - Starting from today */}
        {orderedDays.map((day, displayIndex) => {
          const daySchedules = schedules.filter(s => s.day_of_week === day.index);
          const isToday = day.isToday;
          
          return (
            <div key={displayIndex} className="grid" style={{ 
              gridTemplateColumns: "120px repeat(14, 1fr)",
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
              background: isToday ? (isDark ? "rgba(139,26,46,0.05)" : "rgba(139,26,46,0.02)") : "transparent",
              ...(isToday && { borderTop: `2px solid #c9a84c` })
            }}>
              {/* Day Label with Date */}
              <div className="p-2 flex flex-col items-center justify-center" style={{
                background: isToday ? (isDark ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.05)") : (isDark ? "rgba(255,255,255,0.02)" : "#faf9f7"),
                borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
                borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
              }}>
                <div className="text-sm font-bold" style={{ 
                  color: isToday ? "#c9a84c" : (isDark ? "#fff" : "#1a1a1a")
                }}>
                  {day.name}
                </div>
                <div className="text-[10px]" style={{ 
                  color: isToday ? "#c9a84c" : (isDark ? "rgba(255,255,255,0.4)" : "#888"),
                  fontFamily: "sans-serif"
                }}>
                  {day.dateStr}
                </div>
                {isToday && (
                  <>
                    <div className="text-[9px] font-medium mt-0.5" style={{ color: "#c9a84c", fontFamily: "sans-serif" }}>
                      ★ اليوم
                    </div>
                    <div className="w-8 h-0.5 mt-1" style={{ background: "#c9a84c" }} />
                  </>
                )}
                {daySchedules.length > 0 && (
                  <div className="text-[10px] mt-1" style={{ 
                    color: isToday ? "#c9a84c" : (isDark ? "rgba(255,255,255,0.3)" : "#aaa"),
                    fontFamily: "sans-serif"
                  }}>
                    {daySchedules.length} حصة
                  </div>
                )}
              </div>

              {/* Each Hour's Cell */}
              {HOURS.map((hour) => {
                const schedule = getScheduleAt(day.index, hour);
                const hasSchedule = !!schedule;
                const isCurrentHour = currentHour === hour && isToday;
                
                return (
                  <div key={hour} className="p-1 min-h-[55px]" style={{
                    borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
                    background: hasSchedule 
                      ? (isDark ? "rgba(139,26,46,0.15)" : "rgba(139,26,46,0.05)")
                      : (isCurrentHour ? (isDark ? "rgba(201,168,76,0.05)" : "rgba(201,168,76,0.03)") : "transparent")
                  }}>
                    {hasSchedule && (
                      <div className="h-full w-full p-1.5 transition-all duration-200 hover:scale-105 hover:shadow-lg" style={{
                        background: isDark ? "rgba(139,26,46,0.35)" : "rgba(139,26,46,0.08)",
                        border: `1px solid ${isDark ? "rgba(139,26,46,0.4)" : "rgba(139,26,46,0.2)"}`,
                        borderRadius: "2px",
                        borderTop: `3px solid ${schedule.color || "#8b1a2e"}`
                      }}>
                        <div className="text-[10px] font-bold leading-tight truncate" style={{ color: isDark ? "#f0b8be" : "#8b1a2e" }}>
                          {schedule.subject}
                        </div>
                        <div className="text-[8px] leading-tight truncate" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>
                          {schedule.teacher_name || "معلم"}
                        </div>
                        {schedule.student_name && (
                          <div className="text-[8px] leading-tight truncate" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaa" }}>
                            {schedule.student_name}
                          </div>
                        )}
                        {schedule.start_time && schedule.end_time && (
                          <div className="text-[8px] leading-tight" style={{ color: "#c9a84c", fontFamily: "sans-serif" }}>
                            {schedule.start_time} - {schedule.end_time}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const { isDark } = useDarkMode();
  const [activeChild, setActiveChild] = useState<string>("all");
  const [view, setView] = useState<"week" | "list">("week");
  const [children, setChildren] = useState<ChildType[]>([]);
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    if (!supabase) { setLoading(false); return; }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    try {
      // 1. جلب الأبناء
      const { data: studentsData } = await supabase
        .from("students")
        .select("id, full_name, grade, avatar_url")
        .eq("parent_id", user.id)
        .order("full_name");

      if (studentsData && studentsData.length > 0) {
        setChildren(studentsData.map(s => ({
          id: s.id, name: s.full_name, grade: s.grade || "", avatar: s.avatar_url || ""
        })));
      }

      const studentIds = (studentsData || []).map(s => s.id);
      if (studentIds.length === 0) { 
        setLoading(false); 
        return; 
      }

      // 2. جلب الحصص
      const { data: schedulesData, error: schedulesError } = await supabase
        .from("schedules")
        .select("*")
        .in("student_id", studentIds)
        .eq("status", "scheduled")
        .order("day_of_week")
        .order("start_time");

      if (schedulesError) console.error("Schedules error:", schedulesError);

      if (schedulesData && schedulesData.length > 0) {
        // 3. جلب أسماء المعلمين
        const teacherIds = [...new Set(schedulesData.map(s => s.teacher_id).filter(Boolean))];

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", teacherIds);

        const { data: teachersData } = await supabase
          .from("teachers")
          .select("user_id, full_name")
          .in("user_id", teacherIds);

        // دمج أسماء المعلمين
        const teacherNames: Record<string, string> = {};
        if (profilesData) {
          profilesData.forEach(p => { teacherNames[p.id] = p.full_name; });
        }
        if (teachersData) {
          teachersData.forEach(t => { if (!teacherNames[t.user_id]) teacherNames[t.user_id] = t.full_name; });
        }

        // 4. بناء البيانات النهائية
        const mapped: ScheduleType[] = schedulesData.map((s: any) => ({
          id: s.id,
          student_id: s.student_id,
          student_name: studentsData?.find(st => st.id === s.student_id)?.full_name || "طالب",
          student_grade: studentsData?.find(st => st.id === s.student_id)?.grade || "",
          day_of_week: s.day_of_week,
          subject: s.subject || "مادة",
          teacher_name: teacherNames[s.teacher_id] || "معلم",
          start_time: s.start_time?.slice(0, 5) || "",
          end_time: s.end_time?.slice(0, 5) || "",
          room: s.room || "",
          color: s.color || "#8b1a2e",
          status: s.status || "scheduled",
          notes: s.notes || "",
        }));

        setSchedules(mapped);
      } else {
        setSchedules([]);
      }
    } catch (err) {
      console.error("Error loading schedule:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = activeChild === "all" ? schedules : schedules.filter(s => s.student_id === activeChild);
  const todayIndex = new Date().getDay();
  const today = new Date();

  // Get date for a specific day offset from today
  const getDateForDay = (offset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return date;
  };

  // Format date as DD/MM
  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  return (
    <>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
      <div className="min-h-screen transition-colors duration-300"
        style={{ background: isDark ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)" : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)", color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }}
        dir="rtl">

        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div style={{ position: "absolute", top: 0, right: "33%", width: 400, height: 250, background: isDark ? "rgba(139,26,46,0.12)" : "rgba(139,26,46,0.04)", filter: "blur(100px)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: 0, left: "20%", width: 300, height: 200, background: isDark ? "rgba(201,168,76,0.05)" : "rgba(201,168,76,0.03)", filter: "blur(100px)", borderRadius: "50%" }} />
        </div>

        {/* HEADER */}
        <div style={{ borderBottom: "4px solid #8b1a2e" }}>
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm mb-3"
                style={{ background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)", border: `1px solid ${isDark ? "rgba(139,26,46,0.5)" : "rgba(139,26,46,0.3)"}`, color: isDark ? "#f0b8be" : "#8b1a2e", letterSpacing: ".05em", borderRadius: "2px", fontFamily: "sans-serif" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />
                {loading ? "جار التحميل..." : `${schedules.length} حصة أسبوعياً`}
              </div>
              <h1 className="text-3xl font-extrabold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>الجدول الأسبوعي</h1>
              <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>
                {today.toLocaleDateString('ar-EG', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} - الأسبوع الحالي
              </p>
            </div>
            <div className="flex gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px" }}>
              {[["week", "📅 أسبوعي"], ["list", "📋 قائمة"]].map(([v, l]) => (
                <button key={v} onClick={() => setView(v as any)}
                  className="px-5 py-2.5 text-xs font-medium transition-all duration-200"
                  style={{ fontFamily: "sans-serif", background: view === v ? "#8b1a2e" : "transparent", color: view === v ? "#fff" : isDark ? "rgba(255,255,255,0.4)" : "#888", borderRight: v === "week" ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none" }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          {/* CHILD FILTER */}
          {children.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setActiveChild("all")}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-200"
                style={{ borderRadius: "2px", fontFamily: "sans-serif", border: activeChild === "all" ? "1px solid #8b1a2e" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, background: activeChild === "all" ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.04)" : "#ffffff", color: activeChild === "all" ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#555" }}>
                ✨ الكل <span className="px-1.5 py-0.5 text-[10px]" style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>{schedules.length}</span>
              </button>
              {children.map(c => (
                <button key={c.id} onClick={() => setActiveChild(c.id)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-200"
                  style={{ borderRadius: "2px", fontFamily: "sans-serif", border: activeChild === c.id ? "1px solid #8b1a2e" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#d0ccc4"}`, background: activeChild === c.id ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.04)" : "#ffffff", color: activeChild === c.id ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#555" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(139,26,46,0.4)", color: "#fff" }}>{c.name.charAt(0)}</span>
                  {c.name}
                  <span className="px-1.5 py-0.5 text-[10px]" style={{ background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>{schedules.filter(s => s.student_id === c.id).length}</span>
                </button>
              ))}
            </div>
          )}

          {/* WEEK VIEW - Grid */}
          {view === "week" && (
            <div style={{
              background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, 
              borderRadius: "2px",
            }}>
              <div className="px-6 py-4" style={{ background: "#8b1a2e" }}>
                <div className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "sans-serif" }}>
                  الأسبوع الحالي
                </div>
                <h2 className="text-lg font-bold text-white">
                  {today.toLocaleDateString('ar-EG', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} - الجدول الأسبوعي
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <SkeletonBlock className="w-full h-96" isDark={isDark} />
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-lg font-bold mb-2" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>لا يوجد حصص مجدولة</p>
                    <p style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>سجل ابنك مع مدرس ليظهر الجدول هنا</p>
                  </div>
                ) : (
                  <WeeklyGrid schedules={filtered} isDark={isDark} />
                )}
              </div>
            </div>
          )}

          {/* LIST VIEW */}
          {view === "list" && (
            <div className="space-y-6">
              {/* Reorder days to start from today for list view as well */}
              {Array.from({ length: 7 }, (_, i) => (todayIndex + i) % 7).map((dayIndex) => {
                const dayName = DAYS[dayIndex];
                const daySessions = filtered.filter(s => s.day_of_week === dayIndex);
                const date = getDateForDay(dayIndex === todayIndex ? 0 : (dayIndex - todayIndex + 7) % 7);
                const dateStr = formatDate(date);
                if (daySessions.length === 0) return null;
                const isToday = dayIndex === todayIndex;
                return (
                  <div key={dayIndex}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold px-3 py-1"
                        style={{ borderRadius: "2px", fontFamily: "sans-serif", background: isToday ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2", border: `1px solid ${isToday ? "#8b1a2e" : isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, color: isToday ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#666" }}>
                        {dayName} {isToday ? "← اليوم" : `(${dateStr})`}
                      </span>
                      <div className="flex-1 h-px" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "#e8e4de" }} />
                    </div>
                    <div className="space-y-2">
                      {daySessions.map(s => (
                        <div key={s.id} className="flex items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5"
                          style={{ background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRight: `3px solid ${s.color}`, borderRadius: "2px" }}>
                          
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}>
                            {s.student_name?.charAt(0) || "؟"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{s.subject}</p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>
                                <FaUser className="inline-block ml-1" style={{ fontSize: 10 }} /> {s.student_name}
                              </span>
                              <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>
                                <FaGraduationCap className="inline-block ml-1" style={{ fontSize: 10 }} /> {s.teacher_name}
                              </span>
                              {s.room && (
                                <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>
                                  <FaMapPin className="inline-block ml-1" style={{ fontSize: 10 }} /> {s.room}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-left flex-shrink-0">
                            <p className="text-sm font-semibold" style={{ color: "#c9a84c" }}>{s.start_time}</p>
                            <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#aaa" }}>{s.end_time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}