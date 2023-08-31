import routes from "./router_frontoffice.js";

describe("router::frontoffice", () => {
    it("has at least one route", () => {
        expect(Object.keys(routes).length).toBeGreaterThan(1);
    });
});
