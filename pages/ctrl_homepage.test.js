import rxjs from "../lib/rx.js";
import { navigate } from "../lib/skeleton/index.js";
import { ApplicationError } from "../lib/error.js";

import ctrl from "./ctrl_homepage.js";
import { getSession } from "../model/session.js";
import ctrlError from "./ctrl_error.js";

jest.mock("../model/session.js");
jest.mock("../lib/skeleton/index.js", () => ({
    ...jest.requireActual("../lib/skeleton/index.js"),
    navigate: jest.fn()
}));
jest.mock("./ctrl_error.js");

describe("ctrl::homepage", () => {
    afterEach(() => {
        jest.clearAllMocks();
        global.location = global.window.location;
    });

    it("happy path will render something", () => {
        // given
        getSession.mockReturnValueOnce(rxjs.empty());
        const render = jest.fn();

        // when
        ctrl(render);

        // then
        expect(render).toBeCalledTimes(1);
        expect(render.mock.calls[0][0].outerHTML).toBe("<component-loader></component-loader>");
    });

    it("display an error page when url match a known pattern", () => {
        [
            "?error=test&trace=foobar",
            "?error=test"
        ].forEach((search) => {
            // given
            jest.clearAllMocks();
            global.location = { search };
            ctrlError.mockImplementation(() => () => { });

            // when
            ctrl(() => { });

            // then
            expect(navigate).toBeCalledTimes(0);
            expect(ctrlError).toBeCalledTimes(1);
            expect(ctrlError.mock.calls[0][0] instanceof ApplicationError).toBe(true);
        });
    });

    it("redirect to login when user isn't authenticated", () => {
        // given
        getSession.mockReturnValueOnce(rxjs.of({ is_authenticated: false }));

        // when
        ctrl(() => {});

        // then
        expect(navigate).toBeCalledTimes(1);
        expect(navigate).toBeCalledWith("/login");
    });

    it("redirect to file page when user is already authenticated", () => {
        // given
        getSession.mockReturnValueOnce(rxjs.of({ is_authenticated: true }));

        // when
        ctrl(() => {});

        // then
        expect(navigate).toBeCalledTimes(1);
        expect(navigate).toBeCalledWith("/files/");
    });

    it("redirect to the home when user is already authenticated", () => {
        // given
        getSession.mockReturnValueOnce(rxjs.of({ is_authenticated: true, home: "/test/" }));

        // when
        ctrl(() => {});

        // then
        expect(navigate).toBeCalledTimes(1);
        expect(navigate).toBeCalledWith("/files/test/");
    });

    it("redirect to the login if something goes wrong when checking out the session", () => {
        // given
        getSession.mockReturnValueOnce(rxjs.throwError(new Error("oopsy")));

        // when
        ctrl(() => {});

        // then
        expect(navigate).toBeCalledTimes(1);
        expect(navigate).toBeCalledWith("/login");
    });
});
