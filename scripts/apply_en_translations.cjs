const fs = require('fs');
const path = require('path');

const enAdminPath = path.join(__dirname, "../src/i18n/locales/en/admin.json");
const enAdmin = require(enAdminPath);

const translations = {
  "inventorySubtitle": "Management of all active, reserved, and sold vehicles",
  "emptyInventoryTitle": "No vehicles in inventory",
  "emptyInventoryDescription": "There are currently no vehicles in the database. Add the first vehicle using the button above.",
  "sortPriceAsc": "Price: Low to High",
  "sortPriceDesc": "Price: High to Low",
  "sortMileageAsc": "Mileage: Low to High",
  "sortMileageDesc": "Mileage: High to Low",
  "searchPlaceholder": "Search by make, model, or title...",
  "all": "All",
  "removeImage": "Remove image",
  "next": "Next",
  "inventoryOverview": "Inventory Overview & Status Distribution",
  "noInventoryRegistered": "No vehicles registered yet.",
  "columns.type": "Type",
  "columns.sender": "Sender",
  "columns.status": "Status",
  "columns.date": "Date Received",
  "close": "Close",
  "columns.author": "Author",
  "columns.rating": "Rating",
  "settingsSections.branding": "Branding & Logos",
  "settingsSections.contactForm": "Contact Form Configuration",
  "contactFormSubtitle": "Manage recipient email, greetings, and success messages.",
  "settingsSections.contact": "Contact Details",
  "settingsSections.footer": "Footer & Legal",
  "settingsSections.googleReviews": "Google Reviews Integration",
  "settingsSections.hero": "Hero Stage & Media",
  "heroSubtitle": "Manage up to 3 video or image slides for the cinematic main stage.",
  "settingsSections.homepage": "Homepage Modules",
  "settingsSections.hours": "Opening Hours",
  "settingsSections.languages": "Languages & Localization",
  "settingsSections.locations": "Locations & Showrooms",
  "locationsSubtitle": "Manage your locations, addresses, and maps integrations.",
  "settingsSections.navigation": "Main Navigation",
  "settingsSections.offers": "Offers & Promotions",
  "settingsSections.sellCar": "Sell Car Settings",
  "settingsSections.general": "General Website",
  "settingsSections.social": "Social Media Links",
  "settingsSections.theme": "Design & Colors",
  "name": "Name"
};

for (const [k, v] of Object.entries(translations)) {
  enAdmin[k] = v;
}

fs.writeFileSync(enAdminPath, JSON.stringify(enAdmin, null, 2), 'utf8');
console.log("English translations fixed.");
