import ajax from "./ajax.js";
import { AjaxError } from "./error.js";

describe("lib::ajax", () => {
    it("ajax query", (done) => {
        ajax({ method: "GET", url: "http://example.com" }).subscribe(() => {}, (err) => {
            expect(err instanceof AjaxError).toBe(true);
            done();
        });
    });
});
