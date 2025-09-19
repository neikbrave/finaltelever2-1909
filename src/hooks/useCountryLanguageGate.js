// src/hooks/useCountryLanguageGate.js
import { useEffect } from "react";
import i18n from "../i18n";

// COUNTRY -> locale ưu tiên
const COUNTRY_TO_LNG = {
    US: "en-US",
    FR: "fr-FR",
    NP: "ne-NP",
    CN: "zh-CN",
    IT: "it-IT",
    SA: "ar", AE: "ar", EG: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar",
    JO: "ar", LB: "ar", MA: "ar", DZ: "ar", TN: "ar", IQ: "ar", LY: "ar",
    YE: "ar", SY: "ar", SD: "ar",
    JP: "ja-JP",
    IL: "he-IL",
    ES: "es-ES",
    TW: "zh-TW",
    HK: "zh-HK",
    DE: "de-DE",
    BE: "fr-BE",
    CH: "de-CH",
    DK: "da-DK",
    BG: "bg-BG",
    HU: "hu-HU",
    CZ: "cs-CZ",
    GR: "el-GR",
    FI: "fi-FI",
    NL: "nl-NL",
    TR: "tr-TR",
    VN: "vi",
    KR: "ko-KR",
};

// ===== Utils =====
const normalize = (code = "") => code.replace("_", "-");

const getSupported = () => {
    const list = (i18n.options.supportedLngs || []).filter(Boolean);
    const lowerMap = new Map(list.map(l => [String(l).toLowerCase(), l]));
    return { list, lowerMap };
};

const coerceToSupported = (lng) => {
    if (!lng) return null;
    const { list, lowerMap } = getSupported();
    const lc = lng.toLowerCase();
    if (lowerMap.has(lc)) return lowerMap.get(lc);
    const base = lc.split("-")[0];
    const found = list.find(s => String(s).toLowerCase().split("-")[0] === base);
    return found || null;
};

const pickFromNavigator = () => {
    const langs = navigator.languages || [navigator.language].filter(Boolean);
    for (const raw of langs) {
        const want = normalize(raw || "");
        const ok = coerceToSupported(want);
        if (ok) return ok;
    }
    return null;
};

const CACHE_KEY = "geo_country_cache_v1";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 giờ

function readCountryFromCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { country, ts } = JSON.parse(raw);
        if (!country || !ts) return null;
        if (Date.now() - ts > CACHE_TTL_MS) return null;
        return country;
    } catch { return null; }
}

function writeCountryToCache(country) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ country, ts: Date.now() }));
    } catch { }
}

async function detectCountryCode() {
    const custom = import.meta.env.VITE_IP_GEO_URL;
    const providers = [
        custom || null,
        "https://ipwho.is/",          // CORS ok, không cần key
        "https://ipinfo.io/json",     // có free tier, có thể rate-limit
        "https://ipapi.co/json/",     // như hiện tại, có thể rate-limit
    ].filter(Boolean);

    for (const url of providers) {
        try {
            const res = await fetch(url, { headers: { Accept: "application/json" } });
            if (!res.ok) continue;
            const data = await res.json();

            // Chuẩn hoá về country code
            const cc = String(
                data.country_code ||
                data.countryCode ||
                data.country_code2 ||
                data.country ||
                ""
            ).toUpperCase();

            // Một số API trả "US" trong field 'country' luôn,  lọc case country= "United States"
            const ccAlpha2 = /^[A-Z]{2}$/.test(cc) ? cc : null;

            if (ccAlpha2) {
                writeCountryToCache(ccAlpha2);
                return ccAlpha2;
            }

            // ipwho.is có field success=false khi lỗi
            if (data && data.success === false) continue;
        } catch {
            // thử provider tiếp theo
        }
    }
    return null;
}

export default function useCountryLanguageGate() {
    useEffect(() => {
        let cancelled = false;

        const applyLang = async (lng) => {
            const want = coerceToSupported(normalize(lng));
            const finalLng = want || "en-US";
            if (!cancelled && i18n.language !== finalLng) {
                await i18n.changeLanguage(finalLng);
                document.documentElement.setAttribute("lang", finalLng.split("-")[0]);
            }
        };

        const run = async () => {
            try {
                // 1) Dùng cache trước
                const cached = readCountryFromCache();
                let countryCode = cached;

                // 2) Nếu chưa có, gọi GeoIP với nhiều fallback
                if (!countryCode) {
                    countryCode = await detectCountryCode();
                }

                // 3) country -> lang, không có thì theo browser
                let lng =
                    (countryCode && COUNTRY_TO_LNG[countryCode]) ||
                    pickFromNavigator();

                await applyLang(lng || "en-US");
            } catch {
                await applyLang("en-US");
            }
        };

        run();
        return () => { cancelled = true; };
    }, []);
}
