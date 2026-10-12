/**
 * German Auto — Carmuca API Adapter
 * Maps raw Carmuca JSON vehicle entities into German Auto's internal vehicle model.
 * Preserves null values without inventing specifications.
 * Safely eliminates duplicate brand names from vehicle titles.
 */

// Mapping of Carmuca boolean equipment flags to human-readable German & English labels
const EQUIPMENT_DICTIONARY = {
  // Lighting & Visibility
  ledHeadlights: { de: "LED-Scheinwerfer", en: "LED Headlights" },
  xenonHeadlights: { de: "Xenon-Scheinwerfer", en: "Xenon Headlights" },
  bendingLights: { de: "Kurvenlicht", en: "Adaptive Bending Lights" },
  frontFogLights: { de: "Nebelscheinwerfer", en: "Front Fog Lights" },
  daytimeRunningLights: { de: "Tagfahrlicht", en: "Daytime Running Lights" },
  highBeamAssist: { de: "Fernlichtassistent", en: "High-Beam Assistant" },
  headlightWasherSystem: { de: "Scheinwerferreinigung", en: "Headlight Washers" },
  ambientLighting: { de: "Ambiente-Beleuchtung", en: "Ambient Lighting" },
  automaticRainSensor: { de: "Regensensor", en: "Rain Sensor" },
  lightSensor: { de: "Lichtsensor", en: "Light Sensor" },
  tintedWindows: { de: "Abgedunkelte Scheiben", en: "Tinted Windows" },
  heatedWindshield: { de: "Beheizbare Frontscheibe", en: "Heated Windshield" },
  dimmingInteriorMirror: { de: "Automatisch abblendender Innenspiegel", en: "Auto-dimming Rearview Mirror" },

  // Climate & Comfort
  electricHeatedSeats: { de: "Sitzheizung vorn", en: "Heated Front Seats" },
  electricHeatedRearSeats: { de: "Sitzheizung hinten", en: "Heated Rear Seats" },
  heatedSteeringWheel: { de: "Beheizbares Lenkrad", en: "Heated Steering Wheel" },
  electricAdjustableSeats: { de: "Elektrisch verstellbare Sitze", en: "Power Adjustable Seats" },
  sportSeats: { de: "Sportsitze", en: "Sport Seats" },
  leatherSteeringWheel: { de: "Lederlenkrad", en: "Leather Steering Wheel" },
  multifunctionalWheel: { de: "Multifunktionslenkrad", en: "Multifunction Steering Wheel" },
  paddleShifters: { de: "Schaltwippen", en: "Paddle Shifters" },
  armRest: { de: "Mittelarmlehne", en: "Center Armrest" },
  electricWindows: { de: "Elektrische Fensterheber", en: "Power Windows" },
  electricExteriorMirrors: { de: "Elektrische Außenspiegel", en: "Power Side Mirrors" },
  foldingExteriorMirrors: { de: "Elektrisch anklappbare Außenspiegel", en: "Power Folding Mirrors" },
  keylessEntry: { de: "Keyless Entry / Start", en: "Keyless Entry / Start" },
  electricTailgate: { de: "Elektrische Heckklappe", en: "Power Tailgate" },
  sunroof: { de: "Schiebedach", en: "Sunroof" },
  panoramicGlassRoof: { de: "Panorama-Glasdach", en: "Panoramic Glass Roof" },
  foldingRoof: { de: "Faltdach", en: "Folding Roof" },
  auxiliaryHeating: { de: "Standheizung", en: "Auxiliary Heating" },

  // Safety & Driver Assistance
  abs: { de: "Antiblockiersystem (ABS)", en: "Anti-lock Braking System (ABS)" },
  esp: { de: "Elektronisches Stabilitätsprogramm (ESP)", en: "Electronic Stability Control (ESP)" },
  tractionControlSystem: { de: "Traktionskontrolle", en: "Traction Control" },
  hillStartAssist: { de: "Berganfahrassistent", en: "Hill-Start Assist" },
  collisionAvoidance: { de: "Auffahrwarnsystem", en: "Forward Collision Warning" },
  emergencyCallSystem: { de: "Notrufsystem", en: "Emergency Call System" },
  blindSpotMonitor: { de: "Totwinkel-Assistent", en: "Blind Spot Monitor" },
  laneDepartureWarning: { de: "Spurhalteassistent", en: "Lane Departure Warning" },
  distanceWarningSystem: { de: "Abstandswarner", en: "Distance Warning System" },
  trafficSignRecognition: { de: "Verkehrszeichenerkennung", en: "Traffic Sign Recognition" },
  fatigueWarningSystem: { de: "Müdigkeitserkennung", en: "Driver Fatigue Monitor" },
  tirePressureMonitoring: { de: "Reifendruckkontrollsystem", en: "Tire Pressure Monitoring" },
  isofix: { de: "Isofix-Kindersitzbefestigung", en: "Isofix Child Seat Mounts" },
  immobilizer: { de: "Elektronische Wegfahrsperre", en: "Immobilizer" },
  alarmSystem: { de: "Alarmanlage", en: "Alarm System" },
  airbag: { de: "Frontairbags", en: "Front Airbags" },
  sideAirbag: { de: "Seitenairbags", en: "Side Airbags" },
  speedLimiter: { de: "Geschwindigkeitsbegrenzer", en: "Speed Limiter" },

  // Infotainment & Connectivity
  navigationSystem: { de: "Navigationssystem", en: "Navigation System" },
  bluetooth: { de: "Bluetooth Freisprecheinrichtung", en: "Bluetooth Handsfree" },
  handsFreePhoneSystem: { de: "Freisprecheinrichtung", en: "Handsfree Phone System" },
  appleCarplay: { de: "Apple CarPlay", en: "Apple CarPlay" },
  carplay: { de: "Apple CarPlay", en: "Apple CarPlay" },
  androidAuto: { de: "Android Auto", en: "Android Auto" },
  touchscreen: { de: "Touchscreen-Display", en: "Touchscreen Display" },
  digitalCockpit: { de: "Volldigitales Kombiinstrument", en: "Digital Cockpit" },
  onBoardComputer: { de: "Bordcomputer", en: "On-Board Computer" },
  soundSystem: { de: "Premium Soundsystem", en: "Premium Sound System" },
  cdPlayer: { de: "CD-Player", en: "CD Player" },
  usb: { de: "USB-Anschluss", en: "USB Port" },
  voiceControl: { de: "Sprachsteuerung", en: "Voice Control" },

  // Wheels, Suspension & Exterior
  alloyWheels: { de: "Leichtmetallfelgen", en: "Alloy Wheels" },
  steelWheels: { de: "Stahlfelgen", en: "Steel Wheels" },
  allSeasonTires: { de: "Allwetterreifen", en: "All-Season Tires" },
  winterTires: { de: "Winterreifen", en: "Winter Tires" },
  summerTires: { de: "Sommerreifen", en: "Summer Tires" },
  winterPackage: { de: "Winter-Paket", en: "Winter Package" },
  sportPackage: { de: "Sportpaket", en: "Sport Package" },
  roofRails: { de: "Dachreling", en: "Roof Rails" },
  startStopSystem: { de: "Start/Stopp-Automatik", en: "Start/Stop System" },
  powerAssistedSteering: { de: "Servolenkung", en: "Power Steering" },
  centralLocking: { de: "Zentralverriegelung", en: "Central Locking" },
  performanceHandlingSystem: { de: "Sportfahrwerk", en: "Sport Suspension" },
};

/**
 * Fuel type mapping
 */
const FUEL_MAP = {
  gasoline: "PETROL",
  petrol: "PETROL",
  diesel: "DIESEL",
  electric: "ELECTRIC",
  hybrid: "HYBRID",
  "hybrid-gasoline": "HYBRID",
  "hybrid-diesel": "HYBRID",
  "plug-in-hybrid": "PLUGIN_HYBRID",
  lpg: "LPG",
  cng: "LPG",
  hydrogen: "HYDROGEN",
  other: "OTHER",
};

/**
 * Transmission mapping
 */
const TRANSMISSION_MAP = {
  manual: "MANUAL",
  automatic: "AUTOMATIC",
  cvt: "AUTOMATIC",
};

/**
 * Body type mapping
 */
const BODY_TYPE_MAP = {
  sedan: "SEDAN",
  wagon: "WAGON",
  hatchback: "HATCHBACK",
  coupe: "COUPE",
  convertible: "CONVERTIBLE",
  suv: "SUV",
  van: "VAN",
  pickup: "TRUCK",
  other: "OTHER",
};

/**
 * Clean duplicate brand prefix from title/name
 * e.g. Make: "Opel", Title: "Opel Astra 1.4" -> Name: "Astra 1.4"
 */
export function cleanVehicleName(rawTitle, make, model) {
  const brand = (make || "").trim();
  let candidate = (rawTitle || model || "").trim();

  if (brand && candidate) {
    const brandRegex = new RegExp(`^${brand}\\s+`, "i");
    if (brandRegex.test(candidate)) {
      candidate = candidate.replace(brandRegex, "").trim();
    }
  }

  // If candidate is empty or matches make, fallback to model or raw title
  if (!candidate || candidate.toLowerCase() === brand.toLowerCase()) {
    candidate = (model || rawTitle || "").trim();
  }

  return candidate || brand || "Fahrzeug";
}

/**
 * Extract clean equipment list from vehicle details
 */
export function extractEquipment(details, lang = "de") {
  if (!details || typeof details !== "object") return [];

  const list = [];

  // Boolean flags
  for (const [key, mapping] of Object.entries(EQUIPMENT_DICTIONARY)) {
    if (details[key] === true) {
      list.push(lang === "en" ? mapping.en : mapping.de);
    }
  }

  // Parking Assistants
  if (Array.isArray(details.parkingAssistants) && details.parkingAssistants.length > 0) {
    const hasFront = details.parkingAssistants.includes("FRONT_SENSORS");
    const hasRear = details.parkingAssistants.includes("REAR_SENSORS");
    const hasAuto = details.parkingAssistants.includes("AUTOMATIC_PARKING");

    if (hasFront && hasRear && hasAuto) {
      list.push(lang === "en" ? "Park Assist (Front & Rear, Self-parking)" : "Parkassistent vorn & hinten + selbstlenkend");
    } else if (hasFront && hasRear) {
      list.push(lang === "en" ? "Parking Sensors Front & Rear" : "Einparkhilfe vorn und hinten (PDC)");
    } else if (hasRear) {
      list.push(lang === "en" ? "Rear Parking Sensors" : "Einparkhilfe hinten (PDC)");
    } else if (hasFront) {
      list.push(lang === "en" ? "Front Parking Sensors" : "Einparkhilfe vorn (PDC)");
    }
  }

  // Climatisation
  if (details.climatisation) {
    const clim = String(details.climatisation).toLowerCase();
    if (clim === "automatic2zone" || clim === "automatic_2_zone") {
      list.push(lang === "en" ? "2-Zone Automatic Climate Control" : "2-Zonen Klimaautomatik");
    } else if (clim === "automatic3zone" || clim === "automatic_3_zone") {
      list.push(lang === "en" ? "3-Zone Automatic Climate Control" : "3-Zonen Klimaautomatik");
    } else if (clim.includes("automatic")) {
      list.push(lang === "en" ? "Automatic Climate Control" : "Klimaautomatik");
    } else if (clim.includes("manual")) {
      list.push(lang === "en" ? "Air Conditioning" : "Klimaanlage");
    }
  }

  // Radio
  if (Array.isArray(details.radio) && details.radio.includes("DAB")) {
    list.push(lang === "en" ? "DAB+ Digital Radio" : "DAB+ Digitalradio");
  }

  // Speed Control
  if (details.speedControl) {
    const sc = String(details.speedControl).toLowerCase();
    if (sc.includes("adaptive") || sc.includes("acc")) {
      list.push(lang === "en" ? "Adaptive Cruise Control (ACC)" : "Abstandstempomat (ACC)");
    } else if (sc.includes("cruise")) {
      list.push(lang === "en" ? "Cruise Control" : "Tempomat (Geschwindigkeitsregelanlage)");
    }
  }

  // Service History & Warranty badges
  if (details.fullServiceHistory === true) {
    list.push(lang === "en" ? "Full Service History" : "Scheckheftgepflegt");
  }
  if (details.nonSmokerVehicle === true) {
    list.push(lang === "en" ? "Non-Smoker Vehicle" : "Nichtraucher-Fahrzeug");
  }
  if (details.newHuAu === true) {
    list.push(lang === "en" ? "New TÜV / General Inspection" : "TÜV / AU neu bei Auslieferung");
  }

  // Return deduplicated list
  return Array.from(new Set(list));
}

/**
 * Maps a single Carmuca vehicle entity to German Auto's internal vehicle format.
 * Null values are strictly preserved.
 */
export function mapCarmucaVehicle(v, lang = "de") {
  if (!v || typeof v !== "object") return null;

  const id = v.id;
  const make = v.make ? String(v.make).trim() : null;
  const model = v.model ? String(v.model).trim() : null;
  const rawTitle = v.title ? String(v.title).trim() : null;
  const cleanName = cleanVehicleName(rawTitle, make, model);

  // Price parsing
  const grossPriceNum = v.grossPrice !== null && v.grossPrice !== undefined && v.grossPrice !== ""
    ? Number(v.grossPrice)
    : null;
  const netPriceNum = v.netPrice !== null && v.netPrice !== undefined && v.netPrice !== ""
    ? Number(v.netPrice)
    : null;
  const price = grossPriceNum ?? netPriceNum;

  // Mileage
  const mileageNum = v.mileage !== null && v.mileage !== undefined && v.mileage !== ""
    ? Number(v.mileage)
    : null;

  // Fuel
  const rawFuelType = v.fuelType ? String(v.fuelType).toLowerCase().trim() : null;
  const fuel = rawFuelType && FUEL_MAP[rawFuelType] ? FUEL_MAP[rawFuelType] : (rawFuelType ? "OTHER" : null);

  // Transmission
  const rawTrans = v.transmission ? String(v.transmission).toLowerCase().trim() : null;
  const transmission = rawTrans && TRANSMISSION_MAP[rawTrans] ? TRANSMISSION_MAP[rawTrans] : null;

  // Power
  const powerKw = v.powerKw !== null && v.powerKw !== undefined && v.powerKw !== ""
    ? Number(v.powerKw)
    : null;
  const powerPs = v.powerPs !== null && v.powerPs !== undefined && v.powerPs !== ""
    ? Number(v.powerPs)
    : null;
  const power = v.power || (powerPs ? `${powerPs} PS` : (powerKw ? `${powerKw} kW` : null));

  // First Registration
  const firstRegistration = v.firstRegistrationDate || (v.year ? `${v.year}-01-01` : null);
  const registrationYear = v.year ? Number(v.year) : null;

  // Body / Category
  const rawBody = v.bodyType ? String(v.bodyType).toLowerCase().trim() : null;
  const category = rawBody && BODY_TYPE_MAP[rawBody] ? BODY_TYPE_MAP[rawBody] : null;

  // Condition
  const condition = v.condition || "USED";

  // Images
  const images = Array.isArray(v.images) ? v.images.filter(Boolean) : [];
  const primaryImage = images[0] || null;

  // Equipment
  const equipment = extractEquipment(v.details, lang);

  // Description
  const description = v.description || v.details?.description || null;

  return {
    // Identity & Source isolation
    id,
    slug: id, // Route /cars/:id points to Carmuca vehicle ID
    stock_number: v.stockNumber || null,
    is_external: true,
    source: "carmuca",

    // Naming & Brand (Brand + Name without brand repetition)
    brand: make,
    make,
    model,
    name: cleanName,
    title: cleanName,

    // Pricing & Tax information
    price,
    gross_price: grossPriceNum,
    net_price: netPriceNum,
    vat_eligible: typeof v.vatEligible === "boolean" ? v.vatEligible : null,
    currency: "€",
    old_price: null,

    // Core Specs
    mileage: mileageNum,
    mileage_km: mileageNum,
    fuel,
    fuel_type: fuel,
    raw_fuel_type: rawFuelType,
    transmission,
    raw_transmission: rawTrans,
    first_registration: firstRegistration,
    registration_year: registrationYear,
    condition,
    power,
    power_kw: powerKw,
    power_ps: powerPs,
    performance_hp: powerPs,

    // Classification & Dimensions
    category,
    body_type: category,
    raw_body_type: rawBody,
    engine_displacement_cc: v.engineDisplacement !== null && v.engineDisplacement !== undefined
      ? Number(v.engineDisplacement)
      : null,
    previous_owners: v.previousOwners !== null && v.previousOwners !== undefined
      ? Number(v.previousOwners)
      : null,
    vehicle_owners: v.previousOwners !== null && v.previousOwners !== undefined
      ? Number(v.previousOwners)
      : null,
    number_of_doors: v.numberOfDoors ?? null,
    number_of_seats: v.numberOfSeats ?? null,

    // Colors & Appearance
    color: v.color || null,
    manufacturer_color_name: v.manufacturerColorName || null,
    metallic: v.metallic ?? null,
    matte_color: v.matteColor ?? null,
    interior_color: v.interiorColor || null,
    interior_design: v.details?.interiorType || null,

    // Media & Visuals
    image: primaryImage,
    thumbnail: primaryImage,
    cover_image: primaryImage,
    images,
    media: {
      thumbnail: primaryImage,
      gallery: images,
      video: null,
      images_360: [],
      model_3d: null,
    },

    // Descriptions & Equipment
    description,
    description_de: description,
    description_en: description,
    equipment,

    // Environmental & Inspection
    co2_emission: v.co2Emission ?? v.wltpCo2Emission ?? null,
    emission_class: v.emissionClass || null,
    co2_class: v.co2Class || null,
    general_inspection: v.generalInspection || null,
    hsn: v.details?.hsn || null,
    tsn: v.details?.tsn || null,
    weight: v.details?.weight ?? null,
    trailer_load_braked: v.details?.trailerLoadBraked ?? null,
    trailer_load_unbraked: v.details?.trailerLoadUnbraked ?? null,
    drive_type: v.details?.driveType || null,
    full_service_history: v.details?.fullServiceHistory ?? null,
    non_smoker_vehicle: v.details?.nonSmokerVehicle ?? null,
    new_hu_au: v.details?.newHuAu ?? null,
    warranty: v.details?.warranty ?? null,

    // Status
    status: "AVAILABLE",
    website_highlight: Boolean(v.websiteHighlight),

    // Freshness tracker for signed S3 URLs
    _fetchedAt: Date.now(),
  };
}

/**
 * Maps a list of Carmuca vehicles
 */
export function mapCarmucaVehicleList(vehicles, lang = "de") {
  if (!Array.isArray(vehicles)) return [];
  return vehicles.map((v) => mapCarmucaVehicle(v, lang)).filter(Boolean);
}

export default {
  mapCarmucaVehicle,
  mapCarmucaVehicleList,
  cleanVehicleName,
  extractEquipment,
};
