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
});
