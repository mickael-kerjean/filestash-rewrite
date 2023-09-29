import rxjs, { effect, applyMutation, applyMutations, stateMutation, preventDefault, onClick } from "./rx.js";

describe("lib::rx", () => {
    it("effect: a shortcut for subscribe", (done) => {
        effect(rxjs.of(1).pipe(rxjs.tap(() => {
            done();
        })));
    });

    it("applyMutation", (done) => {
        const $node = document.createElement("div");
        effect(rxjs.of(document.createElement("span")).pipe(
            applyMutation($node, "replaceChildren"),
            rxjs.tap(() => {
                expect($node.outerHTML).toBe(`<div><span></span></div>`);
                done();
            }),
        ));
    });

    it("stateMutation", (done) => {
        const $node = document.createElement("div");
        effect(rxjs.of(`hello`).pipe(
            stateMutation($node, "innerHTML"),
            rxjs.tap(() => {
                expect($node.outerHTML).toBe(`<div>hello</div>`);
                done();
            }),
        ));
    });
});
