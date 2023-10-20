import { createElement } from "./skeleton/index.js";
import { createForm, mutateForm } from "./form.js";

const renderOpt = {
    renderNode: ({ label }) => createElement(`
        <fieldset>
            <legend>${label}</legend>
        </fieldset>
    `),
    renderLeaf: ({ label }) => createElement(`<label> ${label} </label>`),
    renderInput: () => createElement("<input type=\"text\">")
};

describe("form", () => {
    it("create simple form", async() => {
        const $form = await createForm({
            field1: {
                type: "text"
            }
        }, renderOpt);
        expect($form).toMatchSnapshot();
    });

    it("multiple field on simple form", async() => {
        const $form = await createForm({
            field1: {
                type: "text"
            },
            field2: {
                type: "text"
            },
            field3: {
                type: "text"
            }
        }, renderOpt);
        expect($form).toMatchSnapshot();
    });

    it("recursive form", async() => {
        const $form = await createForm({
            field1: {
                type: "text"
            },
            field2: {
                field21: {
                    type: "text"
                },
                field22: {
                    field31: {
                        type: "text"
                    }
                }
            }
        }, renderOpt);
        expect($form).toMatchSnapshot();
    });

    it("render the entire admin form", async () => {
        const spec = {
            "general": {
                "name": {
                    "label": "name",
                    "type": "text",
                    "description": "Name has shown in the UI",
                    "placeholder": "Default: \"Filestash\"",
                    "readonly": false,
                    "default": "Filestash",
                    "value": "Filest",
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
                    "value": "6fxi2cAbOgCH9wkC",
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
                    "value": null,
                    "required": false
                },
                "fork_button": {
                    "label": "fork_button",
                    "type": "boolean",
                    "description": "Display the fork button in the login screen",
                    "readonly": false,
                    "default": true,
                    "value": false,
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
                    "value": true,
                    "required": false
                },
                "refresh_after_upload": {
                    "label": "refresh_after_upload",
                    "type": "boolean",
                    "description": "Refresh directory listing after upload",
                    "readonly": false,
                    "default": false,
                    "value": null,
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
                    "value": null,
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
                    "value": "list",
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
                    "value": "date",
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
                        "value": null,
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
                        "value": null,
                        "required": false
                    },
                    "redirect": {
                        "label": "redirect",
                        "type": "text",
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
                        "value": true,
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
                        "default": false,
                        "value": true,
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
                        "value": null,
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
                    "value": null,
                    "required": false
                },
                "telemetry": {
                    "label": "telemetry",
                    "type": "boolean",
                    "description": "We won't share anything with any third party. This will only to be used to improve Filestash",
                    "readonly": false,
                    "default": false,
                    "value": true,
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
                    "value": null,
                    "required": false
                },
                "port": {
                    "label": "port",
                    "type": "number",
                    "description": "Port of the SMTP email server. Eg: 587",
                    "placeholder": "Default: 587",
                    "readonly": false,
                    "default": 587,
                    "value": null,
                    "required": false
                },
                "username": {
                    "label": "username",
                    "type": "text",
                    "description": "The username for authenticating to the SMTP server.",
                    "placeholder": "Eg: username@gmail.com",
                    "readonly": false,
                    "default": null,
                    "value": null,
                    "required": false
                },
                "password": {
                    "label": "password",
                    "type": "password",
                    "description": "The password associated with the SMTP username.",
                    "placeholder": "Eg: Your google password",
                    "readonly": false,
                    "default": null,
                    "value": null,
                    "required": false
                },
                "from": {
                    "label": "from",
                    "type": "text",
                    "description": "Email address visible on sent messages.",
                    "placeholder": "Eg: username@gmail.com",
                    "readonly": false,
                    "default": null,
                    "value": null,
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
                    "value": "$2a$10$I2Ue8X6fOlsYlW6mzfG0MuL/XBNaAs617Z2jGBy8kZE9HjHEoK1Ia",
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
                        "value": "{\"strategy\":\"direct\"}",
                        "required": false
                    }
                },
                "attribute_mapping": {
                    "related_backend": {
                        "label": "related_backend",
                        "type": "hidden",
                        "readonly": false,
                        "default": null,
                        "value": "AWS",
                        "required": false
                    },
                    "params": {
                        "label": "params",
                        "type": "hidden",
                        "readonly": false,
                        "default": null,
                        "value": "{}",
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
        };

        const $form = await createForm(spec, renderOpt);
        expect($form).toBeTruthy();
        expect($form.outerHTML).toContain("general");
        expect($form.outerHTML).toContain("features");
        expect($form.outerHTML).toContain("log");
        expect($form.outerHTML).toContain("email");
    })
});

describe("form state", () => {
    const spec = {
        "S31": {
            "type": {
                "label": "type",
                "type": "hidden",
                "readonly": false,
                "default": null,
                "value": "s3",
                "required": false
            },
            "access_key_id": {
                "label": "access_key_id",
                "type": "text",
                "placeholder": "Access Key ID*",
                "readonly": false,
                "default": null,
                "value": null,
                "required": false
            },
            "secret_access_key": {
                "label": "secret_access_key",
                "type": "password",
                "placeholder": "Secret Access Key*",
                "readonly": false,
                "default": null,
                "value": null,
                "required": false
            }
        },
        "S3": {
            "type": {
                "label": "type",
                "type": "hidden",
                "readonly": false,
                "default": null,
                "value": "s3",
                "required": false
            },
            "access_key_id": {
                "label": "access_key_id",
                "type": "text",
                "placeholder": "Access Key ID*",
                "readonly": false,
                "default": null,
                "value": null,
                "required": false
            },
            "secret_access_key": {
                "label": "secret_access_key",
                "type": "password",
                "placeholder": "Secret Access Key*",
                "readonly": false,
                "default": null,
                "value": null,
                "required": false
            }
        }
    };
    const state = {
        "S31.access_key_id": "test",
    };

    it("can inject state from a form", () => {
        // given
        expect(spec["S31"]["access_key_id"]["value"]).not.toBe("test")
        expect(spec["S3"]["access_key_id"]["value"]).not.toBe("test")

        // when
        const newSpec = mutateForm(spec, state);

        // then
        expect(newSpec["S31"]["access_key_id"]["value"]).toBe("test")
        expect(newSpec["S3"]["access_key_id"]["value"]).not.toBe("test")
    });

    it("doesn't break with crap data", () => {
        // when
        const newSpec = mutateForm(spec, {
            ...state,
            "na.test": "na",
        });

        // then
        expect(newSpec["S31"]["access_key_id"]["value"]).toBe("test")
        expect(newSpec["S3"]["access_key_id"]["value"]).not.toBe("test")
    });
});
