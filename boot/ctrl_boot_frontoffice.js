import rxjs, { ajax } from "../lib/rx.js";
import { loadScript } from "../helpers/loader.js";
// import { setup_cache } from "../helpers/cache.js";
import { report } from "../helpers/log.js";

export default async function main() {
    try {
        await Promise.all([ // procedure with no outside dependencies
            setup_translation(),
            setup_xdg_open(),
            // setup_cache(), // TODO: dependency on session
            setup_device(),
            // setup_sw(), // TODO
            setup_blue_death_screen(),
            setup_history(),
        ]);
        // await Config.refresh()

        await Promise.all([ // procedure with dependency on config
            // setup_chromecast() // TODO
        ]);

        window.dispatchEvent(new window.Event("pagechange"));
    } catch (err) {
        console.error(err);
        const msg = window.navigator.onLine === false ? "OFFLINE" : (err.message || "CAN'T LOAD");
        report(msg, err, location.href);
        $error(msg);
    }
}
main();

function $error(msg) {
    const $code = document.createElement("code");
    $code.style.display = "block";
    $code.style.margin = "20px 0";
    $code.style.fontSize = "1.3rem";
    $code.style.padding = "0 10% 0 10%";
    $code.textContent = msg;

    const $img = document.createElement("img");
    $img.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABQAQMAAADcLOLWAAAABlBMVEUAAABTU1OoaSf/AAAAAXRSTlMAQObYZgAAAFlJREFUeF69zrERgCAQBdElMqQEOtHSuNIohRIMjfjO6DDmB7jZy5YgySQVYDIakIHD1kBPC9Bra5G2Ans0N7iAcOLF+EHvXySpjSBWCDI/3nIdBDihr8m4AcKdbn96jpAHAAAAAElFTkSuQmCC");
    $img.style.display = "block";
    $img.style.padding = "20vh 10% 0 10%";

    document.body.innerHTML = "";
    document.body.appendChild($img);
    document.body.appendChild($code);
}

/// /////////////////////////////////////////
// boot steps helpers
function setup_translation() {
    let selectedLanguage = "en";
    switch (window.navigator.language) {
    case "zh-TW":
        selectedLanguage = "zh_tw";
        break;
    default:
        const userLanguage = window.navigator.language.split("-")[0] || "en";
        const idx = [
            "az", "be", "bg", "ca", "cs", "da", "de", "el", "es", "et",
            "eu", "fi", "fr", "gl", "hr", "hu", "id", "is", "it", "ja",
            "ka", "ko", "lt", "lv", "mn", "nb", "nl", "pl", "pt", "ro",
            "ru", "sk", "sl", "sr", "sv", "th", "tr", "uk", "vi", "zh"
        ].indexOf(window.navigator.language.split("-")[0] || "");
        if (idx !== -1) {
            selectedLanguage = userLanguage;
        }
    }

    if (selectedLanguage === "en") {
        return;
    }
    return ajax({
        url: "/assets/locales/" + selectedLanguage + ".json",
        responseType: "json"
    }).pipe(
        rxjs.tap(({ responseHeaders, response }) => {
            const contentType = responseHeaders["content-type"].trim();
            if (contentType !== "application/json") {
                report("boot::translation", new Error(`wrong content type '${contentType}'`), "ctrl_boot_frontoffice.js");
                return;
            }
            window.LNG = response;
        })
    ).toPromise();
}

async function setup_xdg_open() {
    window.overrides = {};
    await loadScript("/overrides/xdg-open.js");
}

async function setup_device() {
    const className = "ontouchstart" in window ? "touch-yes" : "touch-no";
    document.body.classList.add(className);

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.body.classList.add("dark-mode");
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function(e) {
        e.matches ? document.body.classList.add("dark-mode") : document.body.classList.remove("dark-mode");
    });
}

// async function setup_sw() {
//     if (!("serviceWorker" in window.navigator)) return;

//     if (window.navigator.userAgent.indexOf("Mozilla/") !== -1 &&
//         window.navigator.userAgent.indexOf("Firefox/") !== -1 &&
//         window.navigator.userAgent.indexOf("Gecko/") !== -1) {
//         // Firefox was acting weird with service worker so we disabled it
//         // see: https://github.com/mickael-kerjean/filestash/issues/255
//         return;
//     }
//     try {
//         await window.navigator.serviceWorker.register("/sw_cache.js");
//     } catch (err) {
//         report("ServiceWorker registration failed", err);
//     }
// }

async function setup_blue_death_screen() {
    window.onerror = function(msg, url, lineNo, colNo, error) {
        report(msg, error, url, lineNo, colNo);
        $error(msg);
    };
}

// async function setup_chromecast() {
//     if (!window.CONFIG["enable_chromecast"]) {
//         return Promise.resolve();
//     } else if (!("chrome" in window)) {
//         return Promise.resolve();
//     } else if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
//         return Promise.resolve();
//     }
//     return window.Chromecast.init();
// }

async function setup_history() {
    window.history.replaceState({}, "");
}
