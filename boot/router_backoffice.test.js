import routes from "./router_backoffice.js";

describe("router::backoffice", () => {
    it("has at least one route", () => {
        expect(Object.keys(routes).length).toBeGreaterThan(1);
    });
});
