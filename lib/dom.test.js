import { createElement } from "./skeleton/index.js";
import { safe, qs, qsa } from "./dom.js";

const $node = createElement(`
    <div>
        <span test-id="foo">1</span>
        <span test-id="bar">2</span>
    </div>
`);

describe("lib::dom", () => {
    it("querySelector", () => {
        expect(qs($node, "[test-id=\"foo\"]").textContent).toBe("1");
    });

    it("querySelectorAll", () => {
        expect(qsa($node, "[test-id]").length).toBe(2);
    });

    it("safe", () => {
        [
            ["foo", false],
            ["<script>with an xss</script>", true],
            [null, true],
        ].forEach(([input, expectToChange]) => {
            const output = safe(input);
            if (expectToChange === false) expect(output).toBe(input);
            else expect(output).not.toBe(input);
        });
    });
});
