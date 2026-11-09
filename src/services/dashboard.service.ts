import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { getDashboardSnapshot } from "@/mocks/dashboard.mock";
import { mockDelay } from "@/mocks/utils";
import type { DashboardSnapshot } from "@/types/dashboard";

export const dashboardService = {
  /** GET /dashboard/overview */
  async getOverview(): Promise<DashboardSnapshot> {
    if (env.NEXT_PUBLIC_USE_MOCK_API) {
      await mockDelay(220);
      return getDashboardSnapshot();
    }

    return apiClient<DashboardSnapshot>("/dashboard/overview");
  },
};
