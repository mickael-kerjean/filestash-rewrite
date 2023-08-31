import rxjs from "../../lib/rx.js";
import ctrl from "./ctrl_settings.js";
import { get, save } from "./model_config.js";

jest.mock("./decorator.js", () => ({
    __esModule: true,
    default: (ctrl) => (render) => ctrl(render),
}));
jest.mock("./model_config.js");

describe("admin::ctrl_settings", () => {
    beforeEach(() => {
        get.mockImplementation(() => rxjs.of(CONFIG_API_FIXTURE));
        save.mockImplementation(() => rxjs.pipe());
        jest.clearAllMocks();
    });

    xit("render the page", async () => {
        // given
        let $page = null;
        const render = ($node) => $page = $node;
        const saveRequest = jest.fn();
        save.mockImplementation(() => rxjs.tap(() => saveRequest()));

        // when
        ctrl(render);
        await nextTick();

        // then
        expect($page).toBeTruthy();
        expect($page.classList.contains("component_settingspage")).toBe(true);
        expect($page.querySelectorAll("input").length).toBeGreaterThan(10);
        expect(get).toHaveBeenCalledTimes(1);
        expect(saveRequest).toHaveBeenCalledTimes(0);
    });

    xit("fill up the form will autosave", async () => {
        // given
        let $page = null;
        const render = ($node) => $page = $node;
        const saveRequest = jest.fn();
        save.mockImplementation(() => rxjs.tap(() => saveRequest()));

        // when
        ctrl(render);
        await nextTick();
        $page.querySelectorAll(`input[type="text"]`).forEach(($input, i) => {
            $input.value = "value " + i;
            $input.dispatchEvent(new window.Event("input", {
                bubbles: true,
                cancelable: true,
                target: $input,
            }));
        });
        await nextTick();

        // then
        expect(saveRequest).not.toHaveBeenCalledTimes(0);
    });

    xit("snapshot", async () => {
        // given
        let $page = null;
        const render = ($node) => $page = $node;

        // when
        ctrl(render);
        await nextTick();

        // then
        expect($page).toMatchSnapshot();
    });
});


const CONFIG_API_FIXTURE = {
    "general": {
        "name": {
            "label": "name",
            "type": "text",
            "description": "Name has shown in the UI",
            "placeholder": "Default: \"Filestash\"",
            "readonly": false,
            "default": "Filestash",
            "value": "MartelloRe",
            "required": false
        },
        "port": {
            "label": "port",
            "type": "number",
            "description": "Port on which the application is available.",
            "placeholder": "Default: 8334",
            "readonly": false,
            "default": 8334,
            "value": null,
            "required": false
        },
        "host": {
            "label": "host",
            "type": "text",
            "description": "The host people need to use to access this server",
            "placeholder": "Eg: \"demo.filestash.app\"",
            "readonly": false,
            "default": null,
            "value": null,
            "required": false
        },
        "secret_key": {
            "label": "secret_key",
            "type": "password",
            "description": "The key that's used to encrypt and decrypt content. Update this settings will invalidate existing user sessions and shared links, use with caution!",
            "readonly": false,
            "default": null,
            "value": "toJEcwv3uq3HezSI",
            "required": false
        },
        "force_ssl": {
            "label": "force_ssl",
            "type": "boolean",
            "description": "Enable the web security mechanism called 'Strict Transport Security'",
            "readonly": false,
            "default": null,
            "value": false,
            "required": false
        },
        "editor": {
            "label": "editor",
            "type": "select",
            "description": "Keybinding to be use in the editor. Default: \"emacs\"",
            "options": [
                "base",
                "emacs",
                "vim"
            ],
            "readonly": false,
            "default": "emacs",
            "value": "base",
            "required": false
        },
        "fork_button": {
            "label": "fork_button",
            "type": "boolean",
            "description": "Display the fork button in the login screen",
            "readonly": false,
            "default": true,
            "value": null,
            "required": false
        },
        "logout": {
            "label": "logout",
            "type": "text",
            "description": "Redirection URL whenever user click on the logout button",
            "readonly": false,
            "default": "",
            "value": null,
            "required": false
        },
        "display_hidden": {
            "label": "display_hidden",
            "type": "boolean",
            "description": "Should files starting with a dot be visible by default?",
            "readonly": false,
            "default": false,
            "value": null,
            "required": false
        },
        "refresh_after_upload": {
            "label": "refresh_after_upload",
            "type": "boolean",
            "description": "Refresh directory listing after upload",
            "readonly": false,
            "default": false,
            "value": true,
            "required": false
        },
        "upload_button": {
            "label": "upload_button",
            "type": "boolean",
            "description": "Display the upload button on any device",
            "readonly": false,
            "default": false,
            "value": null,
            "required": false
        },
        "upload_pool_size": {
            "label": "upload_pool_size",
            "type": "number",
            "description": "Maximum number of files upload in parallel (Default: 15)",
            "readonly": false,
            "default": 15,
            "value": 15,
            "required": false
        },
        "filepage_default_view": {
            "label": "filepage_default_view",
            "type": "select",
            "description": "Default layout for files and folder on the file page",
            "options": [
                "list",
                "grid"
            ],
            "readonly": false,
            "default": "grid",
            "value": null,
            "required": false
        },
        "filepage_default_sort": {
            "label": "filepage_default_sort",
            "type": "select",
            "description": "Default order for files and folder on the file page",
            "options": [
                "type",
                "date",
                "name"
            ],
            "readonly": false,
            "default": "type",
            "value": null,
            "required": false
        },
        "cookie_timeout": {
            "label": "cookie_timeout",
            "type": "number",
            "description": "Authentication Cookie expiration in minutes. Default: 60 * 24 * 7 = 1 week",
            "readonly": false,
            "default": 10080,
            "value": null,
            "required": false
        },
        "custom_css": {
            "label": "custom_css",
            "type": "long_text",
            "description": "Set custom css code for your instance",
            "readonly": false,
            "default": "",
            "value": null,
            "required": false
        }
    },
    "features": {
        "api": {
            "enable": {
                "label": "enable",
                "type": "boolean",
                "description": "Enable/Disable the API",
                "readonly": false,
                "default": true,
                "value": false,
                "required": false
            },
            "api_key": {
                "label": "api_key",
                "type": "long_text",
                "description": "Format: '[mandatory:key] [optional:hostname]'. The hostname is used to enabled CORS for your application.",
                "placeholder": "foobar *.filestash.app",
                "readonly": false,
                "default": null,
                "value": null,
                "required": false
            }
        },
        "share": {
            "enable": {
                "label": "enable",
                "type": "boolean",
                "description": "Enable/Disable the share feature",
                "readonly": false,
                "default": true,
                "value": null,
                "required": false
            },
            "default_access": {
                "label": "default_access",
                "type": "select",
                "description": "Default access for shared links",
                "options": [
                    "editor",
                    "viewer"
                ],
                "readonly": false,
                "default": "editor",
                "value": "viewer",
                "required": false
            },
            "redirect": {
                "label": "redirect",
                "type": "string",
                "description": "When set, shared links will perform a redirection to another link. Example: https://example.com?full_path={{path}}",
                "placeholder": "redirection URL",
                "readonly": false,
                "default": null,
                "value": null,
                "required": false
            }
        },
        "protection": {
            "iframe": {
                "label": "iframe",
                "type": "text",
                "description": "list of domains who can use the application from an iframe. eg: https://www.filestash.app http://example.com",
                "readonly": false,
                "default": "",
                "value": null,
                "required": false
            },
            "enable_chromecast": {
                "label": "enable_chromecast",
                "type": "boolean",
                "description": "Enable users to stream content on a chromecast device. This feature requires the browser to access google's server to download the chromecast SDK.",
                "readonly": false,
                "default": true,
                "value": false,
                "required": false
            },
            "zip_timeout": {
                "label": "zip_timeout",
                "type": "number",
                "description": "Timeout when user wants to download or extract a zip",
                "placeholder": "Default: 60seconds",
                "readonly": false,
                "default": 60,
                "value": null,
                "required": false
            },
            "ls_timeout": {
                "label": "ls_timeout",
                "type": "number",
                "description": "failsafe timeout for listing files under a folder",
                "placeholder": "Default: 2",
                "readonly": false,
                "default": 2,
                "value": null,
                "required": false
            },
            "enable": {
                "label": "enable",
                "type": "boolean",
                "description": "Enable/Disable active protection against scanners",
                "placeholder": "Default: true",
                "readonly": false,
                "default": true,
                "value": null,
                "required": false
            },
            "disable_svg": {
                "label": "disable_svg",
                "type": "boolean",
                "description": "Disable the display of SVG documents",
                "placeholder": "Default: true",
                "readonly": false,
                "default": true,
                "value": null,
                "required": false
            }
        },
        "office": {
            "enable": {
                "label": "enable",
                "type": "enable",
                "description": "Enable/Disable the office suite to manage word, excel and powerpoint documents. This setting requires a restart to comes into effect",
                "target": [
                    "onlyoffice_server",
                    "onlyoffice_can_download"
                ],
                "readonly": false,
                "default": false,
                "value": true,
                "required": false
            },
            "onlyoffice_server": {
                "id": "onlyoffice_server",
                "label": "onlyoffice_server",
                "type": "text",
                "description": "Location of your OnlyOffice server",
                "placeholder": "Eg: http://127.0.0.1:8080",
                "readonly": false,
                "default": "http://127.0.0.1:8080",
                "value": null,
                "required": false
            },
            "can_download": {
                "id": "onlyoffice_can_download",
                "label": "can_download",
                "type": "boolean",
                "description": "Display Download button in onlyoffice",
                "readonly": false,
                "default": true,
                "value": false,
                "required": false
            }
        },
        "server": {
            "console_enable": {
                "label": "console_enable",
                "type": "boolean",
                "description": "Enable/Disable the interactive web console on your instance. It will be available under `/admin/tty/` where username is 'admin' and password is your admin console",
                "placeholder": "Default: false",
                "readonly": false,
                "default": false,
                "value": false,
                "required": false
            }
        },
        "search": {
            "explore_timeout": {
                "label": "explore_timeout",
                "type": "number",
                "description": "When full text search is disabled, the search engine recursively explore\n directories to find results. Exploration can't last longer than what is configured here",
                "placeholder": "Default: 1500ms",
                "readonly": false,
                "default": 1500,
                "value": null,
                "required": false
            }
        },
        "video": {
            "blacklist_format": {
                "id": "transcoding_blacklist_format",
                "label": "blacklist_format",
                "type": "text",
                "description": "Video format that won't be transcoded",
                "readonly": false,
                "default": "",
                "value": null,
                "required": false
            },
            "enable_transcoder": {
                "label": "enable_transcoder",
                "type": "enable",
                "description": "Enable/Disable on demand video transcoding. The transcoder",
                "target": [
                    "transcoding_blacklist_format"
                ],
                "readonly": false,
                "default": true,
                "value": true,
                "required": false
            }
        }
    },
    "log": {
        "enable": {
            "label": "enable",
            "type": "enable",
            "target": [
                "log_level"
            ],
            "readonly": false,
            "default": true,
            "value": null,
            "required": false
        },
        "level": {
            "id": "log_level",
            "label": "level",
            "type": "select",
            "description": "Default: \"INFO\". This setting determines the level of detail at which log events are written to the log file",
            "options": [
                "DEBUG",
                "INFO",
                "WARNING",
                "ERROR"
            ],
            "readonly": false,
            "default": "INFO",
            "value": "DEBUG",
            "required": false
        },
        "telemetry": {
            "label": "telemetry",
            "type": "boolean",
            "description": "We won't share anything with any third party. This will only to be used to improve Filestash",
            "readonly": false,
            "default": false,
            "value": null,
            "required": false
        }
    },
    "email": {
        "server": {
            "label": "server",
            "type": "text",
            "description": "Address of the SMTP email server.",
            "placeholder": "Default: smtp.gmail.com",
            "readonly": false,
            "default": "smtp.gmail.com",
            "value": "smtp",
            "required": false
        },
        "port": {
            "label": "port",
            "type": "number",
            "description": "Port of the SMTP email server. Eg: 587",
            "placeholder": "Default: 587",
            "readonly": false,
            "default": 587,
            "value": 3456,
            "required": false
        },
        "username": {
            "label": "username",
            "type": "text",
            "description": "The username for authenticating to the SMTP server.",
            "placeholder": "Eg: username@gmail.com",
            "readonly": false,
            "default": null,
            "value": "username",
            "required": false
        },
        "password": {
            "label": "password",
            "type": "password",
            "description": "The password associated with the SMTP username.",
            "placeholder": "Eg: Your google password",
            "readonly": false,
            "default": null,
            "value": "klklk",
            "required": false
        },
        "from": {
            "label": "from",
            "type": "text",
            "description": "Email address visible on sent messages.",
            "placeholder": "Eg: username@gmail.com",
            "readonly": false,
            "default": null,
            "value": "jean@gmail.com",
            "required": false
        }
    },
    "auth": {
        "admin": {
            "label": "admin",
            "type": "bcrypt",
            "description": "Password of the admin section.",
            "readonly": false,
            "default": "",
            "value": "$2a$05$ps0.vh3sRzgvvKCsX2N.MO.bk6lMmN7MgRycXLm1KsHyR6PPNiV22",
            "required": false
        }
    },
    "middleware": {
        "identity_provider": {
            "type": {
                "label": "type",
                "type": "hidden",
                "readonly": false,
                "default": null,
                "value": "passthrough",
                "required": false
            },
            "params": {
                "label": "params",
                "type": "hidden",
                "readonly": false,
                "default": null,
                "value": "{\"strategy\":\"username_and_password\"}",
                "required": false
            }
        },
        "attribute_mapping": {
            "related_backend": {
                "label": "related_backend",
                "type": "hidden",
                "readonly": false,
                "default": null,
                "value": "S31, S3",
                "required": false
            },
            "params": {
                "label": "params",
                "type": "hidden",
                "readonly": false,
                "default": null,
                "value": "{\"S31\":{\"type\":\"s3\"},\"S3\":{\"type\":\"s3\"}}",
                "required": false
            }
        }
    },
    "constant": {
        "user": {
            "label": "user",
            "type": "boolean",
            "readonly": true,
            "default": null,
            "value": "mickael",
            "required": false
        },
        "emacs": {
            "label": "emacs",
            "type": "boolean",
            "readonly": true,
            "default": null,
            "value": true,
            "required": false
        },
        "pdftotext": {
            "label": "pdftotext",
            "type": "boolean",
            "readonly": true,
            "default": null,
            "value": true,
            "required": false
        }
    }
}
