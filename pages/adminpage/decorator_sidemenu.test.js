import { createElement } from "../../lib/skeleton/index.js";
import hoc from "./decorator_sidemenu.js";
import rxjs from "../../lib/rx.js";
import { CSS } from "../../helpers/loader.js";

import { get as getRelease } from "./model_release.js";
jest.mock("./model_release.js");
jest.mock("../../helpers/loader.js");

const version = "__version__";

describe("admin::middleware::sidemenu", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getRelease.mockImplementation(() => rxjs.of({ version }));
        CSS.mockImplementation(() => Promise.resolve(""));
    });
    afterEach(() => {
        global.location = global.window.location;
    });

    it("render a side menu", async () => {
        // given
        const ctrl = hoc((render) => render(createElement(`<div id="children"></div>`)));
        const render = jest.fn();

        // when
        await ctrl(render);

        // then
        expect(render).toBeCalledTimes(1);
        const $page = render.mock.calls[0][0];
        expect($page.querySelector("#children")).toBeTruthy();
        expect($page.querySelectorAll("a").length).toBe(5); // Backend, Settings, Logs, About, Quit
        expect($page.innerHTML).toContain(version);
    });

    it("snapshot", async () => {
        // given
        const ctrl = hoc((render) => render(createElement(`<div id="children"></div>`)));
        const render = jest.fn();
        global.location = { pathname: "/admin/settings" };

        // when
        await ctrl(render);

        // then
        expect(render.mock.calls[0][0]).toMatchSnapshot();
    });
});
