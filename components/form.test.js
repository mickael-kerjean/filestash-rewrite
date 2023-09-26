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
    it("base use case", () => {
        expect(multicomplete("", ["test", "bar"])).toStrictEqual(["test", "bar"]);
    });

    it("with autocompletion", () => {
        expect(multicomplete("foo", ["test", "bar"])).toStrictEqual(["foo, test", "foo, bar"]);
        expect(multicomplete("test", ["test", "bar"])).toStrictEqual(["test, bar"]);
        expect(multicomplete("foo, test", ["test", "bar"])).toStrictEqual(["foo, test, bar"]);
        expect(multicomplete("foo, test, bar", ["test", "bar"])).toStrictEqual([]);
    });
});
