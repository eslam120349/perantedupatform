// routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/layout.tsx", [
    // الصفحة الرئيسية
    index("routes/home.tsx"),

    // صفحات تسجيل الدخول
    route("login", "routes/auth/login.tsx"),

    // صفحات التسجيل
    route("register", "routes/auth/regester.tsx"),

    // 🔥 صفحة تأكيد البريد الإلكتروني
    route("auth/verify", "routes/auth/verify-email.tsx"),

    route("Teachers", "routes/Teachers.tsx"),

    // 📄 الصفحات العامة
    route("privacy", "routes/privacy.tsx"),
    route("terms", "routes/terms.tsx"),
    route("contact", "routes/contact.tsx"),

    // Dashboard للـ parent
    route("dashboard", "routes/dashboard/layout.tsx", [
      index("routes/dashboard/parent-index.tsx"),
      route("parent", "routes/dashboard/parent.tsx"),
      route("children", "routes/dashboard/children.tsx"),
      route("schedule", "routes/dashboard/schedule.tsx"),
      route("messages", "routes/dashboard/messages.tsx"),
      route("settings", "routes/dashboard/settings.tsx"),
    ]),
  ]),
] satisfies RouteConfig;