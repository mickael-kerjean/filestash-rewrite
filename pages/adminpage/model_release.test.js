import rxjs from "../../lib/rx.js";
import ajax from "../../lib/ajax.js";

jest.mock("../../lib/ajax.js");

describe("admin::model::release", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("get release info", async () => {
        ajax.mockImplementation(() => rxjs.of({
            responseHeaders: { "x-powered-by": "Filestash/v0.5.20230722 <https://filestash.app>" },
            response: `
<html>
    <head><title>Foobar</title></head>
    <body>
        <table><!-- UNIT_TEST --></table>
    </body>
</html>`
        }));
        const release = require("./model_release.js");
        const { html, version } = await release.get().toPromise();
        expect(ajax).toBeCalledTimes(1);
        expect(html).toBe("<table><!-- UNIT_TEST --></table>");
        expect(version).toBe("v0.5.20230722");
    });
});
