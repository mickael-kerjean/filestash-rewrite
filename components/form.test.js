import { $renderInput as $renderInputBuilder, multicomplete } from "./form.js";

const $renderInput = $renderInputBuilder({ autocomplete: true });

describe("form input", () => {
    it("text input", async() => {
        const $input = await $renderInput({
            type: "text",
            path: ["general", "host"],
            props: {
                placeholder: "placeholder"
            }
        });
        expect($input).toMatchSnapshot();
    });

    it("text input - with properties", async() => {
        const $input = await $renderInput({
            type: "text",
            path: ["general", "host"],
            props: {
                placeholder: "lorem",
                datalist: null
            }
        });
        expect($input).toMatchSnapshot();
    });

    it("other types", async() => {
        [
            "text", "enable", "number", "password", "long_text",
            "bcrypt", "hidden", "boolean", "select", "date",
            "datetime", "image", "file", "unknown",
        ].forEach(async (type) => {
            const $input = await $renderInput({
                type,
                path: ["foo", "bar"],
                props: {},
            });
            expect($input).toMatchSnapshot();
        });
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
