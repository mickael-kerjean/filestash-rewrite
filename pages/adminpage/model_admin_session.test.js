import { isAdmin$, authenticate$ } from "./model_admin_session.js";
import ajax from "../../lib/ajax.js";
import rxjs from "../../lib/rx.js";

jest.mock("../../lib/ajax.js");

const fixture = {
    "GET_AUTHENTICATED": {"status":"ok","result": true},
    "GET_NOT_AUTHENTICATED": {"status":"ok","result": false},
};

describe("admin::model::session", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    xit("figures if a user is authenticated or not", (done) => {
        jest.clearAllMocks();
        ajax.mockImplementation((opt) => {
            return rxjs.of({
                responseJSON: {"status":"ok","result":true},
            });
        });
        isAdmin$().subscribe(() => {
            expect(ajax).toBeCalledTimes(1);
            done();
            throw new Error("finish");
        });
        // expect(isAdmin).toBe();
        // isAdmin$().subscribe((s) => {
        //     console.log("OK", s);
        //     expect(s).toBe(true);
        //     expect(ajax).toBeCalledTimes(1);
        //     done();
        // });
    });

    xit("authenticates by calling an API", async () => {
        // given
        let isAdmin;
        jest.clearAllMocks();
        ajax.mockImplementation((opt) => {
            if (opt.body.password !== "correct_password") return rxjs.throwError(new Error("wrong password"));
            return rxjs.of({
                responseJSON: {"status":"ok","result":true},
            });
        });

        // when
        isAdmin = await rxjs.of({ password: "wrong_password" }).pipe(
            authenticate$(),
        ).toPromise();

        // then
        expect(ajax).toBeCalledTimes(1);
        expect(isAdmin).toBe(false);

        // when
        isAdmin = await rxjs.of({ password: "correct_password" }).pipe(
            authenticate$(),
        ).toPromise();

        // then
        expect(ajax).toBeCalledTimes(2);
        expect(isAdmin).toBe(true);
    });
});
