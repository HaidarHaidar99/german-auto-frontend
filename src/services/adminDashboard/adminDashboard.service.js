/**
 * Admin Dashboard Service
 * Orchestrates real backend metrics and activity queries for ADMIN and SUPER_ADMIN.
 * Reuses existing backend endpoints without inventing duplicate APIs.
 */

import carsService from "../cars/cars.service";
import formsService from "../forms/forms.service";
import reviewsService from "../reviews/reviews.service";
import notificationsService from "../notifications/notifications.service";
import adminUsersService from "../adminUsers/adminUsers.service";

export const adminDashboardService = {
  /**
   * Fetches comprehensive dashboard overview metrics and recent lists.
   * Isolates failures via Promise.allSettled so no single metric crashes the dashboard.
   * Respects role permissions (only calls user endpoints for SUPER_ADMIN).
   * 
   * @param {Object} options
   * @param {boolean} options.isSuperAdmin - Whether current user has SUPER_ADMIN role
   * @returns {Promise<Object>} Aggregated dashboard data
   */
  async getDashboardData({ isSuperAdmin = false } = {}) {
    // Build array of core operational requests accessible to ADMIN & SUPER_ADMIN
    const requests = [
      // 0: Total inventory count
      carsService.adminGetCars({ limit: 1 }),
      // 1: Available inventory count
      carsService.adminGetCars({ status: "AVAILABLE", limit: 1 }),
      // 2: Sold inventory count
      carsService.adminGetCars({ status: "SOLD", limit: 1 }),
      // 3: Reserved inventory count
      carsService.adminGetCars({ status: "RESERVED", limit: 1 }),
      // 4: Hidden inventory count
      carsService.adminGetCars({ status: "HIDDEN", limit: 1 }),
      // 5: Featured inventory count
      carsService.adminGetCars({ featured: true, limit: 1 }),
      // 6: Recent cars (5 newest)
      carsService.adminGetCars({ limit: 5, sort: "newest" }),
      // 7: Pending forms count
      formsService.adminGetForms({ status: "NEW", limit: 1 }),
      // 8: Total forms count
      formsService.adminGetForms({ limit: 1 }),
      // 9: Recent forms (5 newest)
      formsService.adminGetForms({ limit: 5, sort: "newest" }),
      // 10: Pending reviews count
      reviewsService.adminGetReviews({ status: "PENDING", limit: 1 }),
      // 11: Total reviews count
      reviewsService.adminGetReviews({ limit: 1 }),
      // 12: Recent reviews (5 newest)
      reviewsService.adminGetReviews({ limit: 5, sort: "newest" }),
      // 13: Notifications feed & unread count
      notificationsService.getNotifications({ limit: 5 }),
    ];

    // If SUPER_ADMIN, append user management requests
    if (isSuperAdmin) {
      requests.push(
        // 14: Total users
        adminUsersService.getUsers({ limit: 1 }),
        // 15: Unverified users
        adminUsersService.getUsers({ is_verified: false, limit: 1 }),
        // 16: Admin count
        adminUsersService.getUsers({ role: "ADMIN", limit: 1 }),
        // 17: Recent users (5 newest)
        adminUsersService.getUsers({ limit: 5 })
      );
    }

    const results = await Promise.allSettled(requests);

    const getVal = (index) => {
      const res = results[index];
      return res && res.status === "fulfilled" ? res.value : null;
    };

    // 1. Inventory stats & list
    const totalCarsRes = getVal(0);
    const availableCarsRes = getVal(1);
    const soldCarsRes = getVal(2);
    const reservedCarsRes = getVal(3);
    const hiddenCarsRes = getVal(4);
    const featuredCarsRes = getVal(5);
    const recentCarsRes = getVal(6);

    const inventory = {
      total: totalCarsRes?.meta?.total ?? 0,
      available: availableCarsRes?.meta?.total ?? 0,
      sold: soldCarsRes?.meta?.total ?? 0,
      reserved: reservedCarsRes?.meta?.total ?? 0,
      hidden: hiddenCarsRes?.meta?.total ?? 0,
      featured: featuredCarsRes?.meta?.total ?? 0,
      recent: recentCarsRes?.data?.cars ?? [],
    };

    // 2. Forms stats & list
    const pendingFormsRes = getVal(7);
    const totalFormsRes = getVal(8);
    const recentFormsRes = getVal(9);

    const forms = {
      pending: pendingFormsRes?.meta?.total ?? 0,
      total: totalFormsRes?.meta?.total ?? 0,
      recent: recentFormsRes?.data?.forms ?? [],
    };

    // 3. Reviews stats & list
    const pendingReviewsRes = getVal(10);
    const totalReviewsRes = getVal(11);
    const recentReviewsRes = getVal(12);

    const reviews = {
      pending: pendingReviewsRes?.meta?.total ?? 0,
      total: totalReviewsRes?.meta?.total ?? 0,
      recent: recentReviewsRes?.data?.reviews ?? [],
    };

    // 4. Notifications & activity
    const notifsRes = getVal(13);
    const notifications = {
      unreadCount: notifsRes?.data?.unread_count ?? (notifsRes?.data?.notifications || []).filter((n) => !n.is_read).length,
      recent: notifsRes?.data?.notifications ?? [],
    };

    // 5. Users (SUPER_ADMIN only)
    let users = null;
    if (isSuperAdmin) {
      const totalUsersRes = getVal(14);
      const unverifiedUsersRes = getVal(15);
      const adminUsersRes = getVal(16);
      const recentUsersRes = getVal(17);

      users = {
        total: totalUsersRes?.meta?.total ?? 0,
        unverified: unverifiedUsersRes?.meta?.total ?? 0,
        admins: adminUsersRes?.meta?.total ?? 0,
        recent: recentUsersRes?.data?.users ?? [],
      };
    }

    return {
      inventory,
      forms,
      reviews,
      notifications,
      users,
      hasAnyError: results.some((r) => r.status === "rejected"),
    };
  },
};

export default adminDashboardService;
