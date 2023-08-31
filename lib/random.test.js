import { gid } from "./random.js";

describe("random package", () => {
    it("generate random id", () => {
        expect(gid().length).toBeGreaterThan(10);
    });
});
