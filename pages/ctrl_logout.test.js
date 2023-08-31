import ctrl from "./ctrl_logout.js";
import rxjs from "../lib/rx.js";
import { navigate } from "../lib/skeleton/index.js";
import { deleteSession } from "../model/session.js";
jest.mock("../model/session.js");
jest.mock("../lib/skeleton/index.js", () => ({
    ...jest.requireActual("../lib/skeleton/index.js"),
    navigate: jest.fn(),
}));

describe("ctrl::logout", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders the error page as a loading spinner", async () => {
        // given
        deleteSession.mockImplementation(() => rxjs.EMPTY);
        let $page = null;
        const render = ($node) => $page = $node;

        // when
        await ctrl(render);

        // then
        expect($page).toBeTruthy();
        expect($page.outerHTML).toContain("component-loader");
        expect(navigate).toBeCalledTimes(0);
    });

    it("navigate back to / after the session wipeout", () => {
        // given
        deleteSession.mockReturnValueOnce(rxjs.of(null));

        // when
        ctrl(jest.fn());

        // then
        expect(navigate).toHaveBeenCalledTimes(1);
    });
});
