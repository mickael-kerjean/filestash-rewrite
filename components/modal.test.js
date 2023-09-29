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
        expect(typeof modal.open).toBe("function");
    });

    it("is an web component", async () => {
        const modal = require("./modal.js").default;
        document.body.innerHTML = `
            <div>
                <component-modal></component-modal>
            </div>
        `;
        await modal.open(document.createElement("div"), {});
        await nextTick()
        expect(document.body).toMatchSnapshot();
    });

    it("throws when components does not exists", () => {
        const modal = require("./modal.js").default;
        document.body.innerHTML = `<div></div>`;
        expect(() => {
            modal.open(document.createElement("div"), {});
        }).toThrow();
    });
});
