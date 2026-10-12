/**
 * German Auto — Carmuca API Service
 * Fetches and displays external inventory from Carmuca's public JSON API.
 * No API key required; GET endpoints only.
 * Supports query parameters, abort signals, list pagination, and in-memory signed URL refresh.
 */

import { mapCarmucaVehicle, mapCarmucaVehicleList } from "./carmuca.adapter.js";

export const CARMUCA_CONFIG = {
  baseUrl: "https://app.carmuca.de",
  dealershipSlug: "koenigautomobilerheinberg",
  maxLimit: 200,
  defaultLimit: 12,
  cacheTtlMs: 45 * 60 * 1000, // 45 minutes (signed S3 URLs expire in 60 mins)
};

// In-memory cache for vehicle details and signed image freshness
const vehicleDetailCache = new Map();

/**
 * Build URL with query params
 */
function buildCarmucaUrl(endpoint, params = {}) {
  const url = new URL(`${CARMUCA_CONFIG.baseUrl}${endpoint}`);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      url.searchParams.append(key, String(val));
    }
  }
  return url.toString();
}

/**
 * Map client-side filter sort values to Carmuca sort parameters
 */
function mapSortParam(sort) {
  switch (sort) {
    case "price_asc":
      return "price_asc";
    case "price_desc":
      return "price_desc";
    case "mileage_asc":
      return "mileage_asc";
    case "mileage_desc":
      // Carmuca API supports newest, price_asc, price_desc, mileage_asc
      return "newest";
    case "newest":
    default:
      return "newest";
  }
}

export const carmucaService = {
  /**
   * Fetch vehicles list with filters, sorting, and pagination.
   *
   * @param {Object} filters
   * @param {Object} options - { signal, lang }
   * @returns {Promise<{ vehicles: Array, pagination: { limit: number, offset: number, hasMore: boolean } }>}
   */
  async getVehicles(filters = {}, { signal, lang = "de" } = {}) {
    const slug = CARMUCA_CONFIG.dealershipSlug;
    const endpoint = `/api/public/embed/vehicles/${slug}`;

    const limit = Math.min(
      Number(filters.limit) || CARMUCA_CONFIG.defaultLimit,
      CARMUCA_CONFIG.maxLimit
    );
    const offset = Math.max(0, Number(filters.offset) || 0);

    // Documented query params that are safe and verified on Carmuca server
    const serverParams = {
      limit,
      offset,
    };

    if (filters.highlights) serverParams.highlights = "true";
    if (filters.q) serverParams.q = filters.q;
    if (filters.make || filters.brand) serverParams.make = filters.make || filters.brand;
    if (filters.model) serverParams.model = filters.model;
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== "") {
      serverParams.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== "") {
      serverParams.maxPrice = filters.maxPrice;
    }
    if (filters.minMileage !== undefined && filters.minMileage !== null && filters.minMileage !== "") {
      serverParams.minMileage = filters.minMileage;
    }
    if (filters.maxMileage !== undefined && filters.maxMileage !== null && filters.maxMileage !== "") {
      serverParams.maxMileage = filters.maxMileage;
    }
    if (filters.yearFrom) serverParams.yearFrom = filters.yearFrom;
    if (filters.yearTo) serverParams.yearTo = filters.yearTo;
    if (filters.sort) serverParams.sort = mapSortParam(filters.sort);

    // Check if client requested fuel, transmission, or body filters.
    // NOTE: Carmuca's backend embed endpoint throws 500 when non-empty fuel, body,
    // or transmission query params are sent over the wire (verified by inspection of
    // Carmuca's server responses and Carmuca's own showroom bundle, which filters them client-side).
    // Therefore, if any of these three filters are active, we request a larger page from the server
    // (up to 200) and apply client-side filtering safely to prevent breaking user queries.
    const hasClientSideFilter = Boolean(filters.fuel || filters.fuel_type || filters.transmission || filters.body || filters.category);

    if (hasClientSideFilter) {
      serverParams.limit = CARMUCA_CONFIG.maxLimit;
      serverParams.offset = 0;
    }

    const requestUrl = buildCarmucaUrl(endpoint, serverParams);

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Carmuca API error (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    let rawVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
    let pagination = data.pagination || { limit, offset, hasMore: false };

    // Apply client-side fuel, transmission, and body filtering if specified
    if (hasClientSideFilter) {
      const targetFuel = (filters.fuel || filters.fuel_type || "").toUpperCase();
      const targetTrans = (filters.transmission || "").toUpperCase();
      const targetBody = (filters.body || filters.category || "").toUpperCase();

      let filtered = rawVehicles.filter((v) => {
        // Fuel check
        if (targetFuel) {
          const raw = String(v.fuelType || "").toLowerCase();
          if (targetFuel === "PETROL" && raw !== "gasoline" && raw !== "petrol") return false;
          if (targetFuel === "DIESEL" && raw !== "diesel") return false;
          if (targetFuel === "ELECTRIC" && raw !== "electric") return false;
          if (targetFuel === "HYBRID" && !raw.includes("hybrid")) return false;
          if (targetFuel === "PLUGIN_HYBRID" && raw !== "plug-in-hybrid") return false;
        }

        // Transmission check
        if (targetTrans) {
          const raw = String(v.transmission || "").toLowerCase();
          if (targetTrans === "MANUAL" && raw !== "manual") return false;
          if (targetTrans === "AUTOMATIC" && raw !== "automatic" && raw !== "cvt") return false;
        }

        // Body type check
        if (targetBody) {
          const raw = String(v.bodyType || "").toLowerCase();
          if (raw.toUpperCase() !== targetBody) {
            // Also check common aliases
            if (targetBody === "WAGON" && raw !== "wagon") return false;
            if (targetBody === "SEDAN" && raw !== "sedan") return false;
            if (targetBody === "HATCHBACK" && raw !== "hatchback") return false;
            if (targetBody === "SUV" && raw !== "suv") return false;
          }
        }

        return true;
      });

      // Slice to match requested limit and offset
      const totalFiltered = filtered.length;
      const paginatedSlice = filtered.slice(offset, offset + limit);
      const hasMore = offset + limit < totalFiltered;

      return {
        dealer: data.dealer || null,
        vehicles: mapCarmucaVehicleList(paginatedSlice, lang),
        pagination: {
          limit,
          offset,
          hasMore,
        },
      };
    }

    return {
      dealer: data.dealer || null,
      vehicles: mapCarmucaVehicleList(rawVehicles, lang),
      pagination: {
        limit: Number(pagination.limit) || limit,
        offset: Number(pagination.offset) || offset,
        hasMore: Boolean(pagination.hasMore),
      },
    };
  },

  /**
   * Fetch single vehicle by Carmuca vehicle ID (UUID or stock number).
   * Caches response in memory; automatically refreshes when signed URLs near expiration.
   *
   * @param {string} vehicleId
   * @param {Object} options - { signal, bypassCache, lang }
   * @returns {Promise<Object>}
   */
  async getVehicle(vehicleId, { signal, bypassCache = false, lang = "de" } = {}) {
    if (!vehicleId) throw new Error("Missing vehicleId parameter.");

    const slug = CARMUCA_CONFIG.dealershipSlug;
    const cleanId = encodeURIComponent(String(vehicleId).trim());
    const cacheKey = `${slug}:${cleanId}`;

    // Check in-memory cache if not bypassed
    if (!bypassCache) {
      const cached = vehicleDetailCache.get(cacheKey);
      if (cached && Date.now() - cached.cachedAt < CARMUCA_CONFIG.cacheTtlMs) {
        return cached.vehicle;
      }
    }

    const endpoint = `/api/public/embed/vehicle/${slug}/${cleanId}`;
    const requestUrl = buildCarmucaUrl(endpoint);

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Carmuca API error (${response.status}): ${response.statusText}`);
    }

    const rawVehicle = await response.json();
    const mapped = mapCarmucaVehicle(rawVehicle, lang);

    if (mapped) {
      vehicleDetailCache.set(cacheKey, {
        vehicle: mapped,
        cachedAt: Date.now(),
      });
    }

    return mapped;
  },

  /**
   * Force refresh signed image URLs for a vehicle with fresh AWS signatures.
   *
   * @param {string} vehicleId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async refreshVehicleImages(vehicleId, options = {}) {
    return this.getVehicle(vehicleId, { ...options, bypassCache: true });
  },

  /**
   * Clear in-memory vehicle cache (e.g. on navigation or manual reset)
   */
  clearCache() {
    vehicleDetailCache.clear();
  },
};

export default carmucaService;
