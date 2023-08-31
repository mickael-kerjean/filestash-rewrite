import rxjs from "../../lib/rx.js";
import ajax from "../../lib/ajax.js";
import { get as getRelease } from "./model_release.js";
import { CSS } from "../../helpers/loader.js";
import ctrl from "./ctrl_about.js";

jest.mock("./decorator.js", () => ({
    __esModule: true,
    default: (ctrl) => (render) => ctrl(render),
}));
jest.mock("./model_release.js");
jest.mock("../../helpers/loader.js");

describe("admin::ctrl_about", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getRelease.mockImplementation(() => rxjs.of({
            html: `<table>CTRL_ABOUT.TEST.JS</table>`,
        }));
        CSS.mockImplementation(() => Promise.resolve(""));
    });

    it("render the page", async () => {
        // given
        let $page = null;
        const render = ($node) => $page = $node;

        // when
        await ctrl(render);
        await nextTick();

        // then
        expect($page).toBeTruthy();
        expect($page.classList.contains("component_page_about")).toBe(true);
        expect($page.innerHTML).toContain("CTRL_ABOUT.TEST.JS");
    });
});
