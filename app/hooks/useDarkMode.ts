// hooks/useDarkMode.js
import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // قراءة الوضع المحفوظ من localStorage
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ? saved === "dark" : prefersDark;
    setIsDark(initial);
    if (initial) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    
    if (newValue) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "light");
    }

    // 🔥 إعادة تحميل الصفحة بعد التغيير
    setTimeout(() => {
      window.location.reload();
    }, 150); // تأخير بسيط عشان الـ state ياخد وقت
  };

  return { isDark, toggleDarkMode, mounted };
}