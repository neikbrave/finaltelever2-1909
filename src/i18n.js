// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        // CHỈNH: khai báo đủ các locale bạn có trong /public/locales
        supportedLngs: [
            "en-US", "fr-FR", "fr-BE", "ne-NP", "zh-CN", "it-IT",
            "ar", "ja-JP", "he-IL", "es-ES", "zh-TW", "zh-HK",
            "de-DE", "de-CH", "da-DK", "bg-BG", "hu-HU", "cs-CZ",
            "el-GR", "fi-FI", "nl-NL", "tr-TR",
            // (tuỳ chọn) base để i18next coerce về country-variant
            "fr", "de", "bg", "ja", "he", "es", "zh", "it", "da", "cs", "el", "fi", "nl", "tr", "ne",
            "en", "vi"
        ],

        // chấp nhận fr => fr-FR, bg => bg-BG...
        nonExplicitSupportedLngs: true,

        // fallback theo ngôn ngữ gần nhất
        fallbackLng: {
            "fr-BE": ["fr-FR", "fr", "en-US"],
            "de-CH": ["de-DE", "de", "en-US"],
            "zh-HK": ["zh-TW", "zh", "en-US"],
            default: ["en-US"]
        },

        // nơi tải file JSON (đặt trong public/locales/{{lng}}/translation.json)
        backend: {
            loadPath: "/locales/{{lng}}/translation.json"
        },

        load: "all",
        cleanCode: true,
        interpolation: { escapeValue: false },
        debug: false
    });

export default i18n;
