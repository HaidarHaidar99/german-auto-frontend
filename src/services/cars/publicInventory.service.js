/**
 * German Auto — Unified Public Inventory Service
 *
 * Unifies public inventory between live Carmuca API catalog and locally published database cars:
 * - Published local cars supersede their Carmuca counterparts (matched by external ID and dealership).
 * - Drafts (status: "HIDDEN", is_visible: false) are strictly excluded from public inventory.
 * - Independent local cars and Carmuca catalog vehicles are preserved.
 * - Free-text search ('q') searches case-insensitively across vehicle title/name, brand, model, and stock number.
 * - Brand filter is completely independent from 'q'.
 * - Client-side multi-attribute filtering covers the complete matching dataset before pagination.
 */

import carmucaService from "../carmuca/carmuca.service.js";
import carsService from "./cars.service.js";

const CARMUCA_DEALERSHIP_SLUG = "koenigautomobilerheinberg";

/**
 * Normalizes a local DB car into standard public vehicle format if needed
 */
function normalizeLocalCar(car) {
  if (!car) return null;

  const externalId = car.external_id || car.custom_fields?.external_id || null;
  const dealershipSlug = car.dealership_slug || car.custom_fields?.dealership_slug || null;
  const isCarmucaOrigin = (car.source === "carmuca" || car.custom_fields?.source === "carmuca");

  const primaryImage =
    car.media?.thumbnail ||
    car.thumbnail ||
    car.cover_image ||
    (Array.isArray(car.media?.gallery) ? car.media.gallery[0] : null) ||
    (Array.isArray(car.images) ? car.images[0] : null) ||
    car.image_url ||
    null;

  const gallery = Array.isArray(car.media?.gallery)
    ? car.media.gallery
    : Array.isArray(car.images)
    ? car.images
    : primaryImage
    ? [primaryImage]
    : [];

  return {
    ...car,
    id: car.id,
    slug: car.slug || car.id,
    external_id: externalId,
    dealership_slug: dealershipSlug,
    is_external: false,
    source: isCarmucaOrigin ? "carmuca_imported" : "local",
    brand: car.brand,
    make: car.brand,
    model: car.model,
    name: car.title || car.name || car.model,
    title: car.title || car.name || car.model,
    price: car.price != null ? Number(car.price) : 0,
    old_price: car.old_price != null ? Number(car.old_price) : null,
    mileage: car.mileage_km != null ? Number(car.mileage_km) : null,
    mileage_km: car.mileage_km != null ? Number(car.mileage_km) : null,
    fuel: car.fuel_type,
    fuel_type: car.fuel_type,
    transmission: car.transmission,
    condition: car.condition || "USED",
    category: car.category,
    body_type: car.category,
    performance_hp: car.performance_hp != null ? Number(car.performance_hp) : null,
    power: car.performance_hp ? `${car.performance_hp} PS` : null,
    first_registration: car.first_registration,
    registration_year: car.first_registration ? Number(car.first_registration.substring(0, 4)) : null,
    image: primaryImage,
    thumbnail: primaryImage,
    cover_image: primaryImage,
    images: gallery,
    media: {
      thumbnail: primaryImage,
      gallery,
      video: car.media?.video || null,
      images_360: car.media?.images_360 || [],
      model_3d: car.media?.model_3d || null,
    },
    equipment: Array.isArray(car.equipment) ? car.equipment : [],
    stock_number: car.stock_number || car.custom_fields?.stock_number || null,
    vat_eligible: car.vat_eligible ?? car.custom_fields?.vat_eligible ?? null,
  };
}

export const publicInventoryService = {
  /**
   * Fetch all published local cars from backend (only is_visible=true, status!=HIDDEN)
   */
  async getPublishedLocalCars() {
    try {
      const res = await carsService.getCars({ limit: 100 });
      const rawCars = res?.data?.cars || res?.cars || [];
      return rawCars.map(normalizeLocalCar).filter(Boolean);
    } catch (err) {
      console.warn("[PublicInventory] Error fetching published local cars:", err.message);
      return [];
    }
  },

  /**
   * Fetch unified catalog combining Carmuca and published local cars
   */
  async getUnifiedCatalog(filters = {}, options = {}) {
    const { lang = "de", signal } = options;

    // 1. Fetch published local cars and Carmuca catalog concurrently
    const [localCars, carmucaRes] = await Promise.all([
      this.getPublishedLocalCars(),
      carmucaService.getVehicles({ limit: 100 }, { lang, signal }).catch((err) => {
        if (err.name === "AbortError") throw err;
        console.warn("[PublicInventory] Carmuca fetch error:", err.message);
        return { vehicles: [] };
      }),
    ]);

    const carmucaVehicles = carmucaRes?.vehicles || [];

    // 2. Identify Carmuca vehicles that have an imported, published local copy
    const replacedCarmucaExternalIds = new Set();
    const publishedImportedLocalCars = [];
    const purelyLocalCars = [];

    for (const localCar of localCars) {
      if (localCar.external_id && (localCar.dealership_slug === CARMUCA_DEALERSHIP_SLUG || localCar.source === "carmuca_imported")) {
        replacedCarmucaExternalIds.add(String(localCar.external_id));
        publishedImportedLocalCars.push(localCar);
      } else {
        purelyLocalCars.push(localCar);
      }
    }

    // 3. Remove Carmuca counterparts that have been published locally
    const untouchedCarmucaVehicles = carmucaVehicles.filter(
      (cv) => !replacedCarmucaExternalIds.has(String(cv.id))
    );

    // 4. Combine into complete unified inventory
    let unified = [
      ...publishedImportedLocalCars,
      ...untouchedCarmucaVehicles,
      ...purelyLocalCars,
    ];

    // 5. Client-side filtering over the complete dataset
    const qTerm = (filters.q || filters.search || "").trim().toLowerCase();
    const brandTerm = (filters.brand || "").trim().toLowerCase();
    const modelTerm = (filters.model || "").trim().toLowerCase();
    const fuelTerm = filters.fuel_type || filters.fuel || "";
    const transTerm = filters.transmission || "";
    const condTerm = filters.condition || "";
    const catTerm = filters.category || filters.body || "";
    const minPrice = filters.min_price != null ? Number(filters.min_price) : null;
    const maxPrice = filters.max_price != null ? Number(filters.max_price) : null;
    const maxMileage = filters.max_mileage != null ? Number(filters.max_mileage) : null;

    if (qTerm) {
      unified = unified.filter((v) => {
        const titleStr = String(v.title || v.name || "").toLowerCase();
        const brandStr = String(v.brand || v.make || "").toLowerCase();
        const modelStr = String(v.model || "").toLowerCase();
        const stockStr = String(v.stock_number || v.stockNumber || "").toLowerCase();
        const combined = `${brandStr} ${modelStr} ${titleStr} ${stockStr}`;
        return (
          titleStr.includes(qTerm) ||
          brandStr.includes(qTerm) ||
          modelStr.includes(qTerm) ||
          stockStr.includes(qTerm) ||
          combined.includes(qTerm)
        );
      });
    }

    if (brandTerm) {
      unified = unified.filter((v) => {
        const brandStr = String(v.brand || v.make || "").toLowerCase();
        return brandStr === brandTerm || brandStr.includes(brandTerm);
      });
    }

    if (modelTerm) {
      unified = unified.filter((v) => {
        const mStr = String(v.model || "").toLowerCase();
        return mStr.includes(modelTerm);
      });
    }

    if (fuelTerm) {
      unified = unified.filter((v) => (v.fuel_type || v.fuel) === fuelTerm);
    }

    if (transTerm) {
      unified = unified.filter((v) => v.transmission === transTerm);
    }

    if (condTerm) {
      unified = unified.filter((v) => v.condition === condTerm);
    }

    if (catTerm) {
      unified = unified.filter((v) => (v.category || v.body_type) === catTerm);
    }

    if (minPrice != null && !isNaN(minPrice)) {
      unified = unified.filter((v) => v.price != null && v.price >= minPrice);
    }

    if (maxPrice != null && !isNaN(maxPrice)) {
      unified = unified.filter((v) => v.price != null && v.price <= maxPrice);
    }

    if (maxMileage != null && !isNaN(maxMileage)) {
      unified = unified.filter((v) => {
        const km = v.mileage_km ?? v.mileage;
        return km != null && km <= maxMileage;
      });
    }

    // 6. Sorting over complete matching dataset
    const sort = filters.sort || "newest";
    unified.sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return (a.price || 0) - (b.price || 0);
        case "price_desc":
          return (b.price || 0) - (a.price || 0);
        case "mileage_asc":
          return (a.mileage_km ?? a.mileage ?? 0) - (b.mileage_km ?? b.mileage ?? 0);
        case "mileage_desc":
          return (b.mileage_km ?? b.mileage ?? 0) - (a.mileage_km ?? a.mileage ?? 0);
        case "az": {
          const nameA = `${a.brand || ""} ${a.title || ""}`.trim();
          const nameB = `${b.brand || ""} ${b.title || ""}`.trim();
          return nameA.localeCompare(nameB);
        }
        case "za": {
          const nameA = `${a.brand || ""} ${a.title || ""}`.trim();
          const nameB = `${b.brand || ""} ${b.title || ""}`.trim();
          return nameB.localeCompare(nameA);
        }
        case "oldest": {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : (a.registration_year || 0);
          const dateB = b.created_at ? new Date(b.created_at).getTime() : (b.registration_year || 0);
          return dateA - dateB;
        }
        case "newest":
        default: {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : (a.registration_year || 0);
          const dateB = b.created_at ? new Date(b.created_at).getTime() : (b.registration_year || 0);
          return dateB - dateA;
        }
      }
    });

    // 7. Pagination
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 12);
    const offset = (page - 1) * limit;
    const total = unified.length;
    const paginatedSlice = unified.slice(offset, offset + limit);

    return {
      vehicles: paginatedSlice,
      total,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
        pages: Math.ceil(total / limit) || 1,
        page,
      },
    };
  },

  /**
   * Fetch single vehicle by slug, database UUID, or Carmuca external ID
   */
  async getPublicVehicle(identifier, options = {}) {
    if (!identifier) return null;
    const { lang = "de", signal } = options;

    // 1. Check published local cars first (by slug, id, or external_id)
    try {
      const localCars = await this.getPublishedLocalCars();
      const matchedLocal = localCars.find(
        (c) =>
          c.slug === identifier ||
          c.id === identifier ||
          c.external_id === identifier ||
          c.custom_fields?.external_id === identifier
      );
      if (matchedLocal) {
        return matchedLocal;
      }
    } catch (err) {
      console.warn("[PublicInventory] Error checking local cars for detail:", err.message);
    }

    // 2. Fetch from Carmuca public API
    try {
      const carmucaCar = await carmucaService.getVehicle(identifier, { lang, signal });
      if (carmucaCar) {
        // Double check if a published local copy supersedes this Carmuca car
        try {
          const localCars = await this.getPublishedLocalCars();
          const localCopy = localCars.find(
            (c) => c.external_id === carmucaCar.id || c.custom_fields?.external_id === carmucaCar.id
          );
          if (localCopy) {
            return localCopy;
          }
        } catch {}

        return carmucaCar;
      }
    } catch (err) {
      if (err.name === "AbortError") throw err;
    }

    // 3. Fallback to direct local car detail endpoint
    try {
      const res = await carsService.getCar(identifier);
      if (res?.data?.car) {
        return normalizeLocalCar(res.data.car);
      }
    } catch (err) {
      if (err?.statusCode === 404) return null;
    }

    return null;
  },

  /**
   * Fetch featured/highlighted vehicles for homepage showcase
   */
  async getFeaturedVehicles(options = {}) {
    const { lang = "de", signal, limit = 6 } = options;
    try {
      const [localCars, carmucaRes] = await Promise.all([
        this.getPublishedLocalCars(),
        carmucaService.getVehicles({ highlights: true, limit: Math.max(limit, 10) }, { lang, signal }).catch((err) => {
          if (err.name === "AbortError") throw err;
          return { vehicles: [] };
        }),
      ]);

      const carmucaVehicles = carmucaRes?.vehicles || [];
      const replacedMap = new Map();
      for (const lc of localCars) {
        if (lc.external_id && (lc.dealership_slug === CARMUCA_DEALERSHIP_SLUG || lc.source === "carmuca_imported")) {
          replacedMap.set(String(lc.external_id), lc);
        }
      }

      // Check purely local featured cars
      const localFeatured = localCars.filter((c) => c.is_featured && !c.external_id);

      // Map Carmuca highlights, substituting published local copies
      const mappedCarmuca = carmucaVehicles.map((cv) => replacedMap.get(String(cv.id)) || cv);

      const combined = [...localFeatured, ...mappedCarmuca];
      return combined.slice(0, limit);
    } catch (err) {
      if (err.name === "AbortError") throw err;
      console.warn("[PublicInventory] Error fetching featured vehicles:", err.message);
      return [];
    }
  },
};

export default publicInventoryService;
