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
