import { $renderInput, multicomplete } from "./form.js";

describe("form input", () => {
    xit("text input", async() => {
        const $input = await $renderInput({
            type: "text",
            path: ["general", "host"],
            props: {
                placeholder: "placeholder"
            }
        });
        expect($input).toMatchSnapshot();
    });

    xit("text input - with properties", async() => {
        const $input = await $renderInput({
            type: "text",
            autocomplete: true,
            path: ["general", "host"],
            props: {
                placeholder: "lorem",
                datalist: null
            }
        });
        expect($input).toMatchSnapshot();
    });

    xit("text input - data list", () => {
        // TODO
    });
});

describe("multi select with a input text and datalist", () => {
    it("simplest use case", () => {
        expect(multicomplete("", ["test", "bar"])).toStrictEqual(["test", "bar"]);

    });

    xit("smartcomplete", () => {
        expect(smartcomplete("test", ["testfoo", "testbar", "something"])).toBe([
            "test",
            "testfoo",
            "testbar",
            "test, testfoo",
            "test, testbar",
            "test, something",
        ]);
    });
})
