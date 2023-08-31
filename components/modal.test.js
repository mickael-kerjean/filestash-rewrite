import { CSS } from "../helpers/loader.js";
jest.mock("../helpers/loader.js");

describe("component::modal", () => {
    beforeEach(() => {
        global.customElements = window.customElements;
        CSS.mockImplementation(() => Promise.resolve(""));
        window.setTimeout = (cb) => cb()
    });
    afterEach(() => {
        document.body.innerHTML = "";
        global.customElements = { define: jest.fn() };
    });
    it("external API", () => {
        const modal = require("./modal.js").default;
        expect(typeof modal.alert).toBe("function");
    });

    it("is an web component", async () => {
        const modal = require("./modal.js").default;
        document.body.innerHTML = `
            <div>
                <component-modal></component-modal>
            </div>
        `;
        await modal.alert(document.createElement("div"), {});
        await nextTick()
        expect(document.body).toMatchSnapshot();
    });

    it("throws when components does not exists", () => {
        const modal = require("./modal.js").default;
        document.body.innerHTML = `<div></div>`;
        expect(() => {
            modal.alert(document.createElement("div"), {});
        }).toThrow();
    });
});
