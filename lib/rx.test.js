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

    it("click handler", async () => {
        const $node = document.createElement("a");
        document.body.appendChild($node);

        expect(onClick(null)).toBe(rxjs.EMPTY);

        // TODO: trigger click
        // setTimeout(() => {
        //     console.log("HERE");
        //     $node.dispatchEvent(new Event("click", {bubbles: true}))
        //     $node.click();
        // }, 1000)
        // const $click = await rxjs.of($node).pipe(
        //     rxjs.mergeMap(($el) => onClick($el)),
        //     rxjs.tap(($node) => $node.innerHTML = "DONE")
        // ).toPromise();
        // expect($click.innerHTML).toBe("DONE");
    });
});
