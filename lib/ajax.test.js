import ajax from "./ajax.js";
import { AjaxError } from "./error.js";

import { rest } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
    rest.get('/ok', (req, res, ctx) => res(
        ctx.status(req.url.searchParams.get("status") || 200),
        ctx.json({ status: "ok" }),
    )),
    rest.get('/nok', (req, res, ctx) => res(
        ctx.status(req.url.searchParams.get("status") || 200),
        ctx.json({ status: "error", message: "oops" }),
    )),

);

describe("lib::ajax", () => {
    beforeAll(() => server.listen())
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it("ajax query - happy path with text", async () => {
        // given, when
        const resp = await ajax({ method: "GET", url: "/ok" }).toPromise();
        // then
        expect(resp.response).toBe(`{"status":"ok"}`);
    });

    it("ajax query - happy path with json", async () => {
        // given, when
        const resp = await ajax({ method: "GET", responseType: "json", url: "/ok" }).toPromise();
        // then
        expect(resp.responseJSON.status).toBe("ok");
    });

    it("ajax query - no status ok", async () => {
        try {
            // given, when
            await ajax({ method: "GET", responseType: "json", url: `/nok` }).toPromise();
            expect(true).toBe("should have thrown an error");
        } catch(err) {
            // then
            expect(err instanceof AjaxError).toBe(true);
        }
    });

    it("ajax query - non 200 status", async () => {
        for (let testCase of [
            {code: 401}, {code: 403}, {code: 409}, {code: 413}, {code: 418},
            {code: 500}, {code: 502},
        ]) {
            try {
                // given, when
                await ajax({ method: "GET", responseType: "json", url: `/ok?status=${testCase.code}` }).toPromise();
                expect(true).toBe("should have thrown an error");
            } catch(err) {
                // then
                expect(err instanceof AjaxError).toBe(true);
            }
        }
    });
});
