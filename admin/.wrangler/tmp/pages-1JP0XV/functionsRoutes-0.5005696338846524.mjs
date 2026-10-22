import { onRequestGet as __api_admin_health_ts_onRequestGet } from "C:\\Users\\HomePC\\Desktop\\chuech studio\\cms\\admin\\functions\\api\\admin\\health.ts"

export const routes = [
    {
      routePath: "/api/admin/health",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_health_ts_onRequestGet],
    },
  ]