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

        expect(() => qs($node, "[test-id=\"_does_not_exist_\"]")).toThrow();
        expect(() => qs(null, "[test-id=\"foo\"]")).toThrow();
    });

    it("querySelectorAll", () => {
        expect(qsa($node, "[test-id]").length).toBe(2);
        expect(() => qsa(null, "[test-id]")).toThrow();
    });

    it("safe", () => {
        [
            ["foo", false],
            ["<script>with an xss</script>", true],
            [null, true],
            ["", false]
        ].forEach(([input, expectToChange]) => {
            const output = safe(input);
            if (expectToChange === false) expect(output).toBe(input);
            else expect(output).not.toBe(input);
        });
    });
});
