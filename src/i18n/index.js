import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// German namespaces
import deCommon from "./locales/de/common.json";
import deNav from "./locales/de/navigation.json";
import deAuth from "./locales/de/auth.json";
import deCars from "./locales/de/cars.json";
import deForms from "./locales/de/forms.json";
import deAdmin from "./locales/de/admin.json";
import deAbout from "./locales/de/about.json";
import deAccount from "./locales/de/account.json";

// English namespaces
import enCommon from "./locales/en/common.json";
import enNav from "./locales/en/navigation.json";
import enAuth from "./locales/en/auth.json";
import enCars from "./locales/en/cars.json";
import enForms from "./locales/en/forms.json";
import enAdmin from "./locales/en/admin.json";
import enAbout from "./locales/en/about.json";
import enAccount from "./locales/en/account.json";

const resources = {
  de: {
    common: deCommon,
    navigation: deNav,
    auth: deAuth,
    cars: deCars,
    forms: deForms,
    admin: deAdmin,
    about: deAbout,
    account: deAccount,
  },
  en: {
    common: enCommon,
    navigation: enNav,
    auth: enAuth,
    cars: enCars,
    forms: enForms,
    admin: enAdmin,
    about: enAbout,
    account: enAccount,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "de",
    lng: "de", // German is explicitly the default language
    defaultNS: "common",
    ns: ["common", "navigation", "auth", "cars", "forms", "admin", "about", "account"],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
