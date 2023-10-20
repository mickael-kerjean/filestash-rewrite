import hoc from "./decorator_admin_only.js";
import rxjs from "../../lib/rx.js";
import { AjaxError } from "../../lib/error.js";
import { isAdmin$ } from "./model_admin_session.js";
import ctrlLogin from "./ctrl_login.js";
import ctrlError from "../ctrl_error.js";

jest.mock("./ctrl_login.js");
jest.mock("../ctrl_error.js");
jest.mock("./model_admin_session.js");

describe("admin::middleware::admin_only", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        ctrlLogin.mockImplementation((r) => r("LOGIN"));
        ctrlError.mockImplementation((err) => {
            return (r) => r(err);
        });
    });

    it("show the underlying page when user is authenticated", () => {
        // given
        isAdmin$.mockImplementation(() => rxjs.of(true));
        const render = jest.fn();
        const ctrl = hoc((r) => r("OK"));

        // when
        ctrl(render);

        // then
        expect(render).toBeCalledTimes(1);
        expect(render.mock.calls[0][0]).toBe("OK");
    });

    it("shows login page when user isn't authenticated", () => {
        // given
        isAdmin$.mockImplementation(() => rxjs.of(false));
        const render = jest.fn();
        const ctrl = hoc((r) => r("OK"));

        // when
        ctrl(render);

        // then
        expect(render).toBeCalledTimes(1);
        expect(render.mock.calls[0][0]).toBe("LOGIN");
    });

    it("shows an error page when the api call fails", async () => {
        await Promise.all([
            new Error("Oops"),
            new AjaxError("Oops", new Error("Oops"), "INTERNAL_SERVER_ERROR"),
        ].map(async (err) => {
            // given
            isAdmin$.mockImplementation(() => rxjs.throwError(err));
            const render = jest.fn();
            const ctrl = hoc((r) => r("OK"));

            // when
            await ctrl(render);

            // then
            expect(render).toBeCalledTimes(1);
            expect(render.mock.calls[0][0] instanceof Error).toBe(true);
        }));
    });
});
