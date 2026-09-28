import {
  getAdminDashboardData,
  getCurrentAdminContext,
} from "./data-access";

export async function getAdminDashboard() {
  const admin = await getCurrentAdminContext();

  if (!admin) {
    throw new Error("Unauthorized.");
  }

  return getAdminDashboardData();
}
