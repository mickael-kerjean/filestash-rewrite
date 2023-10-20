import rxjs from "../../lib/rx.js";
import { AjaxError } from "../../lib/error.js";
import ctrl from "./ctrl_login.js";
import { CSS } from "../../helpers/loader.js";
import notification from "../../components/notification.js";

import { authenticate$ } from "./model_admin_session.js";

jest.mock("./model_admin_session.js");
jest.mock("../../helpers/loader.js");
jest.mock("../../components/notification.js");

describe("admin::ctrl_login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        CSS.mockImplementation(() => Promise.resolve(""));
    });
    it("renders a form", async () => {
        // given
        const render = jest.fn();

        // when
        await ctrl(render);

        // then
        const $page = render.mock.calls[0][0];
        expect($page).toBeTruthy();
        expect($page.querySelector("form")).toBeTruthy();
        expect($page.querySelector(`form input[type="password"]`)).toBeTruthy();
    });

    it("snapshot", async () => {
        // given
        const render = jest.fn();

        // when
        await ctrl(render);

        // then
        expect(render.mock.calls[0][0]).toMatchSnapshot();
    });

    it("calls authentication logic on submit", async () => {
        // given
        let formData = null;
        let $page = null;
        authenticate$.mockImplementation((body) => rxjs.of(body).pipe(
            rxjs.tap((_formData) => formData = _formData)
        ));
        await ctrl(($node) => $page = $node);
        const $password = $page.querySelector(`form input[type="password"]`)
        const $form = $page.querySelector("form");

        // when
        $password.value = "__password__";
        $form.dispatchEvent(new window.Event("submit"));

        // then
        expect(authenticate$).toBeCalledTimes(1);
        expect(formData).toStrictEqual({password: "__password__"});
    });

    it("submit with failure in authentication", async () => {
        const testCases = [
            { error: new AjaxError("oops", new Error("Oops"), "FORBIDDEN"), notificationSpy: 0, errorScreen: false },
            { error: new AjaxError("oops", new Error("Oops"), "INTERNAL_SERVER_ERROR"), notificationSpy: 0, errorScreen: true },
            { error: new Error("oops"), notificationSpy: 1, errorScreen: false },
        ];
        for (let testCase of testCases) {
            // given
            let formData = null;
            let $page = null;
            authenticate$.mockImplementation((body) => rxjs.throwError(() => testCase.error));
            const notificationSpy = jest.spyOn(notification, "error")
            await ctrl(($node) => $page = $node);
            const $password = $page.querySelector(`form input[type="password"]`)
            const $form = $page.querySelector("form");

            // when
            $password.value = "__password__";
            $form.dispatchEvent(new window.Event("submit"));
            await nextTick();

            // then
            expect(authenticate$).toBeCalledTimes(1);
            expect(notificationSpy).toBeCalledTimes(testCase.notificationSpy);
            if (testCase.errorScreen) {
                expect($page.querySelector(".error-page")).toBeTruthy();
                expect($page.querySelector(`form input[type="password"]`)).not.toBeTruthy();
            } else {
                expect($page.querySelector(".error-page")).not.toBeTruthy();
                expect($page.querySelector(`form input[type="password"]`)).toBeTruthy();
            }
            jest.clearAllMocks();
        }
    });
});
