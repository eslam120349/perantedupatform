import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useDarkMode } from "../../hooks/useDarkMode";
import {
  FaUsers, FaBook, FaChartLine, FaCalendarAlt, FaUserPlus, FaBell, FaArrowLeft,
  FaCheck, FaTimes, FaChalkboardTeacher, FaCalendarWeek, FaClipboardList,
  FaStar, FaRegClock, FaDollarSign, FaGraduationCap, FaUserCheck, FaUserTimes,
  FaCommentDots, FaSearch, FaChild, FaSchool, FaClock, FaMoneyBillWave
} from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChildItem = {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  color: string;
  attendance: number;
  sessions: number;
  upcoming: number;
  teachers: any[];
  schedule: any[];
  recentSessions: any[];
};

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonBlock({ className = "", isDark }: { className?: string; isDark: boolean }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        borderRadius: "2px",
      }}
    >
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent)"
            : "linear-gradient(90deg, transparent, rgba(139,26,46,0.1), transparent)",
          animation: "shimmer 1.5s infinite",
        }}
      />
    </div>
  );
}

function StatsSkeletons({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-8 space-y-3 text-center"
          style={{ borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none" }}>
          <SkeletonBlock className="w-16 h-8 mx-auto" isDark={isDark} />
          <SkeletonBlock className="w-24 h-3 mx-auto" isDark={isDark} />
        </div>
      ))}
    </div>
  );
}

function ChildrenSkeletons({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="p-6 space-y-4"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
            borderTop: "3px solid #8b1a2e", borderRadius: "2px",
          }}>
          <div className="flex items-start gap-4">
            <SkeletonBlock className="w-16 h-16 rounded-full flex-shrink-0" isDark={isDark} />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="w-32 h-4" isDark={isDark} />
              <SkeletonBlock className="w-24 h-3" isDark={isDark} />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {Array.from({ length: 3 }).map((_, j) => (<SkeletonBlock key={j} className="h-10" isDark={isDark} />))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ text, onDark = false }: { text: string; onDark?: boolean }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-2"
      style={{ color: onDark ? "rgba(255,255,255,0.55)" : "#c9a84c", fontFamily: "sans-serif" }}>
      {text}
    </p>
  );
}

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

// ─── Weekly Grid Component (Rows = Days, Columns = Hours) ──────────────────
function WeeklyGrid({ schedules, isDark }: { schedules: any[]; isDark: boolean }) {
  const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM (14 hours)
  
  // Get current week dates
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDay);
  
  const weekDays = DAYS.map((day, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return {
      name: day,
      date: date,
      isToday: index === currentDay,
      dateStr: `${date.getDate()}/${date.getMonth() + 1}`
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
          gridTemplateColumns: "100px repeat(14, 1fr)",
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
            const isCurrentHour = new Date().getHours() === hour;
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

        {/* Days Grid */}
        {weekDays.map((day, dayIndex) => {
          const isToday = day.isToday;
          
          return (
            <div key={dayIndex} className="grid" style={{ 
              gridTemplateColumns: "100px repeat(14, 1fr)",
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
              background: isToday ? (isDark ? "rgba(139,26,46,0.05)" : "rgba(139,26,46,0.02)") : "transparent"
            }}>
              {/* Day Label */}
              <div className="p-2 flex flex-col items-center justify-center" style={{
                background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7",
                borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
                borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`,
              }}>
                <div className="text-sm font-bold" style={{ 
                  color: isToday ? "#c9a84c" : (isDark ? "#fff" : "#1a1a1a")
                }}>
                  {day.name}
                </div>
                <div className="text-xs" style={{ 
                  color: isToday ? "#c9a84c" : (isDark ? "rgba(255,255,255,0.4)" : "#888")
                }}>
                  {day.dateStr}
                </div>
                {isToday && (
                  <div className="w-6 h-0.5 mt-1" style={{ background: "#c9a84c" }} />
                )}
              </div>

              {/* Each Hour's Cell */}
              {HOURS.map((hour) => {
                const schedule = getScheduleAt(dayIndex, hour);
                const hasSchedule = !!schedule;
                const isCurrentHour = new Date().getHours() === hour && isToday;
                
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
                        {schedule.start_time && schedule.end_time && (
                          <div className="text-[8px] leading-tight" style={{ color: "#c9a84c", fontFamily: "sans-serif" }}>
                            {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
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

// ─── Child Detail View ────────────────────────────────────────────────────────
function ChildDetail({ child, onBack, isDark, schedules }: { child: ChildItem; onBack: () => void; isDark: boolean; schedules: any[] }) {
  const [tab, setTab] = useState("schedule");

  const childSchedules = schedules.filter(s => s.day_of_week !== undefined);
  const todaySchedules = childSchedules.filter(s => s.day_of_week === new Date().getDay());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{
            background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`,
            color: isDark ? "rgba(255,255,255,0.7)" : "#666", borderRadius: "2px",
          }}>
          <FaArrowLeft />
        </button>
        <div className="flex items-center gap-4">
          <AvatarOrInitial src={child.avatar} name={child.name}
            className="w-12 h-12 object-cover text-lg"
            style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }} />
          <div>
            <h2 className="text-xl font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif" }}>{child.name}</h2>
            <p className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>{child.grade}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
        {[
          { label: "نسبة الحضور", value: `${child.attendance}%`, icon: FaChartLine },
          { label: "حصص مسجلة", value: childSchedules.length, icon: FaBook },
          { label: "حصص اليوم", value: todaySchedules.length, icon: FaCalendarAlt },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="py-6 px-4 text-center"
              style={{
                borderRight: i < 2 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
                background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7",
              }}>
              <div className="text-2xl mb-1"><Icon /></div>
              <div className="text-2xl font-extrabold mb-0.5" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>{s.value}</div>
              <div className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-0" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px" }}>
        {[
          ["schedule", "الجدول الأسبوعي", FaCalendarWeek],
          ["teachers", "المدرسين", FaChalkboardTeacher],
        ].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200"
            style={{
              fontFamily: "sans-serif",
              background: tab === id ? "#8b1a2e" : "transparent",
              color: tab === id ? "#fff" : isDark ? "rgba(255,255,255,0.45)" : "#666",
              borderRight: id !== "teachers" ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
            }}>
            <Icon /> {label}
          </button>
        ))}
      </div>

      {/* Tab: Schedule */}
      {tab === "schedule" && (
        <div className="space-y-3">
          <SectionLabel text="الجدول الأسبوعي" onDark={isDark} />
          {childSchedules.length === 0 ? (
            <div className="text-center py-16" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#aaa" }}>
              <div className="text-4xl mb-3"><FaCalendarWeek /></div>
              <p style={{ fontFamily: "sans-serif" }}>لا يوجد حصص مجدولة</p>
            </div>
          ) : (
            <WeeklyGrid schedules={childSchedules} isDark={isDark} />
          )}
        </div>
      )}

      {/* Tab: Teachers */}
      {tab === "teachers" && (
        <div className="space-y-3">
          <SectionLabel text="المدرسين المسجلين" onDark={isDark} />
          {child.teachers.length === 0 ? (
            <div className="text-center py-16" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#aaa" }}>
              <div className="text-4xl mb-3"><FaChalkboardTeacher /></div>
              <p style={{ fontFamily: "sans-serif" }}>لا يوجد مدرسين مسجلين</p>
            </div>
          ) : (
            child.teachers.map((t, i) => (
              <div key={i}
                className="flex items-center gap-4 p-4 transition-all duration-200"
                style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, borderRadius: "2px",
                }}>
                <div className="w-10 h-10 flex items-center justify-center text-lg"
                  style={{ background: "rgba(139,26,46,0.15)", borderRadius: "2px", color: "#8b1a2e" }}>
                  <FaChalkboardTeacher />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{t.teacher_name}</div>
                  <div className="text-xs" style={{ color: "#8b1a2e", fontWeight: 500 }}>{t.subject}</div>
                  {t.lesson_type && (
                    <div className="text-xs mt-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888" }}>
                      {t.lesson_type === 'private' ? '👤 برايفت' : t.lesson_type === 'center' ? '🏫 سنتر' : t.lesson_type === 'online' ? '💻 أونلاين' : '👥 مجموعة'}
                      {t.price > 0 && ` · 💰 ${t.price} ج.م`}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const { isDark } = useDarkMode();
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentName, setParentName] = useState<string>("");
  const [parentImage, setParentImage] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!supabase) return;
    setLoading(true);

    try {
      // 1. جلب بيانات ولي الأمر
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setParentName(profile.full_name || "");
      }

      // 2. جلب الأبناء
      const { data: studentsData } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id)
        .order("full_name", { ascending: true });

      if (!studentsData || studentsData.length === 0) {
        setChildren([]);
        setLoading(false);
        return;
      }

      const studentIds = studentsData.map(s => s.id);

      // 3. جلب المدرسين المسجلين لكل طالب
      const { data: studentTeachersData } = await supabase
        .from("student_teachers")
        .select("*, teachers(full_name, specialty, profiles!teachers_user_id_fkey(full_name))")
        .in("student_id", studentIds);

      // 4. جلب جداول الحصص
      const { data: schedulesData } = await supabase
        .from("schedules")
        .select("*, profiles!schedules_teacher_id_fkey(full_name)")
        .in("student_id", studentIds)
        .eq("status", "scheduled")
        .order("day_of_week")
        .order("start_time");

      setAllSchedules(schedulesData || []);

      // 5. جلب الحضور
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .in("student_id", studentIds);

      // 6. بناء البيانات
      const mapped: ChildItem[] = studentsData.map(student => {
        const studentST = (studentTeachersData || []).filter(st => st.student_id === student.id);
        const studentSchedules = (schedulesData || []).filter(s => s.student_id === student.id);
        const studentAttendance = (attendanceData || []).filter(a => a.student_id === student.id);

        const presentCount = studentAttendance.filter(a => a.status === 'present').length;
        const totalCount = studentAttendance.length;
        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        const teachers = studentST.map(st => ({
          teacher_name: st.teachers?.full_name || st.teachers?.profiles?.full_name || "معلم",
          subject: st.subject,
          lesson_type: st.lesson_type,
          price: st.price,
        }));

        const schedule = studentSchedules.map(s => ({
          ...s,
          teacher_name: s.profiles?.full_name || "معلم",
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
          schedule,
          recentSessions: [],
        };
      });

      setChildren(mapped);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalSchedules = children.reduce((a, c) => a + c.sessions, 0);
  const avgAttendance = children.length
    ? Math.round(children.reduce((a, c) => a + c.attendance, 0) / children.length)
    : 0;
  const totalUpcoming = children.reduce((a, c) => a + c.upcoming, 0);

  if (selectedChild) {
    return (
      <div className="min-h-screen transition-colors duration-300"
        style={{
          background: isDark
            ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)"
            : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)",
          color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif",
        }} dir="rtl">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <ChildDetail child={selectedChild} onBack={() => setSelectedChild(null)} isDark={isDark} schedules={allSchedules.filter(s => s.student_id === selectedChild.id)} />
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="min-h-screen transition-colors duration-300"
        style={{
          background: isDark
            ? "linear-gradient(150deg, #0f1c2e 0%, #1c0c14 60%, #0f1c2e 100%)"
            : "linear-gradient(150deg, #ffffff 0%, #f5f4f2 60%, #ffffff 100%)",
          color: isDark ? "#fff" : "#1a1a1a", fontFamily: "Georgia, serif",
        }} dir="rtl">

        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div style={{ position: "absolute", top: 0, left: "25%", width: 500, height: 300, background: isDark ? "rgba(139,26,46,0.12)" : "rgba(139,26,46,0.04)", filter: "blur(120px)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: 0, right: "25%", width: 400, height: 250, background: isDark ? "rgba(201,168,76,0.06)" : "rgba(201,168,76,0.03)", filter: "blur(120px)", borderRadius: "50%" }} />
        </div>

        {/* TOP BAR */}
        <div style={{ borderBottom: "4px solid #8b1a2e" }}>
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs mb-3"
                style={{ background: isDark ? "rgba(139,26,46,0.2)" : "rgba(139,26,46,0.08)", border: `1px solid ${isDark ? "rgba(139,26,46,0.5)" : "rgba(139,26,46,0.3)"}`, color: isDark ? "#f0b8be" : "#8b1a2e", letterSpacing: ".05em", borderRadius: "2px", fontFamily: "sans-serif" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9a84c" }} />
                لوحة تحكم ولي الأمر
              </div>
              {parentName ? (
                <h1 className="text-3xl font-extrabold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                  أهلاً، {parentName} <FaUserCheck className="inline-block" />
                </h1>
              ) : (
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="w-44 h-8" isDark={isDark} />
                  <FaUserCheck className="text-3xl" />
                </div>
              )}
              <p className="text-sm mt-1" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666", fontFamily: "sans-serif" }}>
                تابع أبناءك وجداولهم من مكان واحد
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative w-10 h-10 flex items-center justify-center transition-all duration-200 hover:opacity-80"
                style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f5f4f2", border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#d0ccc4"}`, borderRadius: "2px", color: isDark ? "rgba(255,255,255,0.6)" : "#666" }}>
                <FaBell />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#8b1a2e" }} />
              </button>
              <AvatarOrInitial src={parentImage} name={parentName}
                className="w-10 h-10 object-cover text-sm"
                style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }} />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
          {/* STATS */}
          {loading ? (
            <StatsSkeletons isDark={isDark} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` }}>
              {[
                { label: "عدد الأبناء", value: children.length, icon: FaUsers },
                { label: "إجمالي الحصص", value: totalSchedules, icon: FaBook },
                { label: "متوسط الحضور", value: `${avgAttendance}%`, icon: FaChartLine },
                { label: "حصص قادمة", value: totalUpcoming, icon: FaCalendarAlt },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="py-10 px-4 text-center"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.02)" : "#faf9f7",
                      borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}` : "none",
                    }}>
                    <div className="text-2xl mb-2"><Icon /></div>
                    <div className="text-4xl font-extrabold mb-1" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>{s.value}</div>
                    <div className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "#888", fontFamily: "sans-serif" }}>{s.label}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CHILDREN */}
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <SectionLabel text="الأبناء المسجلين" onDark={isDark} />
                <h2 className="text-2xl font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>أبناؤك</h2>
              </div>
              <span className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#666" }}>
                {children.length} أبناء
              </span>
            </div>

            {loading ? (
              <ChildrenSkeletons isDark={isDark} />
            ) : children.length === 0 ? (
              <div className="text-center py-16"
                style={{ border: `1px dashed ${isDark ? "rgba(139,26,46,0.4)" : "rgba(139,26,46,0.2)"}`, borderRadius: "2px" }}>
                <div className="text-5xl mb-4"><FaUsers /></div>
                <p className="mb-4" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888", fontFamily: "sans-serif" }}>لم تسجل أي أبناء بعد</p>
                <a href="/dashboard/children"
                  className="inline-block px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  style={{ background: "#8b1a2e", borderRadius: "2px", fontFamily: "sans-serif", textDecoration: "none" }}>
                  أضف ابنك الأول
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {children.map((child) => (
                  <div key={child.id}
                    className="p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`,
                      borderTop: "3px solid #8b1a2e", borderRadius: "2px",
                      boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                    onClick={() => setSelectedChild(child)}>
                    <div className="flex items-start gap-4">
                      <AvatarOrInitial src={child.avatar} name={child.name}
                        className="w-16 h-16 flex-shrink-0 object-cover text-xl"
                        style={{ borderRadius: "2px", border: "2px solid #8b1a2e" }} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>{child.name}</h3>
                        <p className="text-xs mb-3" style={{ color: "#8b1a2e", fontFamily: "sans-serif", fontWeight: 500 }}>
                          <FaGraduationCap className="inline-block ml-1" /> {child.grade}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { v: `${child.attendance}%`, l: "حضور" },
                            { v: child.sessions, l: "حصة" },
                            { v: child.upcoming, l: "قادمة" },
                          ].map((s, i) => (
                            <div key={i} className="p-2 text-center"
                              style={{
                                background: isDark ? "rgba(255,255,255,0.04)" : "#f5f4f2",
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}`, borderRadius: "2px",
                              }}>
                              <div className="text-sm font-bold" style={{ color: "#c9a84c" }}>{s.v}</div>
                              <div className="text-[10px]" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>{s.l}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {child.teachers.length > 0 && (
                      <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e8e4de"}` }}>
                        <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "#888", fontFamily: "sans-serif" }}>
                          {child.teachers.length} مدرس
                        </span>
                        <span className="mr-auto text-xs" style={{ color: "#8b1a2e", fontFamily: "sans-serif" }}>
                          عرض التفاصيل <FaArrowLeft className="inline-block mr-1" />
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WEEKLY OVERVIEW - Modified with Grid (Rows = Days, Columns = Hours) */}
          <div style={{
            background: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e8e4de"}`, 
            borderRadius: "2px",
          }}>
            <div className="px-6 py-5" style={{ background: "#8b1a2e" }}>
              <SectionLabel text="الأسبوع الحالي" onDark />
              <h2 className="text-xl font-bold text-white">نظرة عامة على الجدول</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <SkeletonBlock className="w-full h-96" isDark={isDark} />
              ) : (
                <WeeklyGrid schedules={allSchedules} isDark={isDark} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}