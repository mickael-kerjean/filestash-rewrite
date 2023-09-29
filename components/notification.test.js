import { CSS } from "../helpers/loader.js";
jest.mock("../helpers/loader.js");

describe("component::notification", () => {
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
        const notification = require("./notification.js").default;
        expect(typeof notification.info).toBe("function");
        expect(typeof notification.success).toBe("function");
        expect(typeof notification.error).toBe("function");
    });

    it("is an web component", async () => {
        const notification = require("./notification.js").default;
        document.body.innerHTML = `
            <div>
                <component-notification></component-notification>
            </div>
        `;
        await notification.info("__UNIT_TEST_INFO__");
        await notification.error("__UNIT_TEST_ERROR__");
        await notification.success("__UNIT_TEST_SUCCESS__");
        await nextTick()
        expect(document.body).toMatchSnapshot();
    });

    it("throws when components does not exists", () => {
        const notification = require("./notification.js").default;
        document.body.innerHTML = `<div></div>`;
        expect(() => {
            notification.info("__UNIT_TEST_INFO__");
        }).toThrow();
    });
});
