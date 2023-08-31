import hoc from "./ctrl_error.js";
import { AjaxError, ApplicationError } from "../lib/error.js";
import { CSS } from "../helpers/loader.js";

jest.mock("../helpers/loader.js")

describe("ctrl::error", () => {
    afterEach(() => {
        jest.clearAllMocks();
        global.location = global.window.location;
        CSS.mockImplementation(() => Promise.resolve(""));
    });

    it("renders the error page", async () => {
        [
            new Error("oopsy"),
            new AjaxError("ajax error"),
            new ApplicationError("app error")
        ].forEach(async (err) => {
            // given
            const render = jest.fn();
            const ctrl = hoc(err);

            // when
            await ctrl(render);

            // then
            expect(render).toHaveBeenCalledTimes(1);
        });
    });

    it("has an option to refresh the page", async () => {
        // given
        let $page = null;
        global.location = { reload: jest.fn() };
        await hoc(new Error("oops"))(($node) => { $page = $node; });

        // when
        $page.querySelector("[data-bind=\"refresh\"]").click();

        // then
        expect(global.location.reload).toHaveBeenCalledTimes(1);
    });
});
