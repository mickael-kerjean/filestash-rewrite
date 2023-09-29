import rxjs from "../lib/rx.js";
import ajax from "../lib/ajax.js";
import { createSession, getSession, deleteSession } from "./session.js";

jest.mock("../lib/ajax.js");

describe("model::session", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("can createSession", async () => {
        // given
        ajax.mockImplementation(() => rxjs.of({ some: "thing" }));

        // when
        createSession({ type: "local", username: "foo" }).toPromise();

        // then
        expect(ajax).toHaveBeenCalledTimes(1);
    });

    it("can getSession", async () => {
        // given
        ajax.mockImplementation(() => rxjs.of({ responseJSON: { result: { is_authenticated: true } } }));

        // when
        const session = await getSession().toPromise();

        // then
        expect(session.is_authenticated).toBe(true);
    });

    it("can deleteSession", async () => {
        // given
        ajax.mockImplementation(() => rxjs.of({ some: "thing" }));

        // when
        await deleteSession({ type: "local", username: "foo" }).toPromise();

        // then
        expect(ajax).toHaveBeenCalledTimes(1);
    });
});
