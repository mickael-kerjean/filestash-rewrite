import main, { createElement, onDestroy } from "./index.js";

describe("router with inline controller", () => {
    it("can render a dom node", async() => {
        // given
        const $app = window.document.createElement("div");
        const $node = createElement("<h1 id=\"test\">main</h1>");
        const routes = {
            "/": (render) => render($node)
        };
        window.onerror = jest.fn();

        // when
        await main($app, routes);
        window.dispatchEvent(new window.Event("pagechange"));
        await nextTick();

        // then
        expect($node instanceof window.Element).toBe(true);
        expect($app.querySelector("#test").textContent).toBe("main");
        expect(window.onerror).toHaveBeenCalledTimes(0);
    });

    it("errors when given a non valid route / render", async() => {
        for (let routes of [
            // TODO: to finish
            {"/": null},
            // {"/": (render) => render({ json: "object", is: "not_ok" })},
            // {"/": (render) => render(null)},
        ]) {
            // given
            const $app = window.document.createElement("div");
            const fn = jest.fn();
            window.onerror = (err) => {
                fn(err);
            }

            // when
            await main($app, routes);
            window.dispatchEvent(new window.Event("pagechange"));
            await nextTick();

            // then
            expect(fn).toHaveBeenCalledTimes(1);
        }
    });
});

describe("router with es6 module as a controller", () => {
    xit("render the default import", async() => {
        // given
        const $app = window.document.createElement("div");
        const routes = {
            "/": "./test/ctrl/ok.js"
        };

        // when
        await main($app, routes);
        window.dispatchEvent(new window.Event("pagechange"));
        await nextTick();

        // then
        // expect($app.querySelector("h1").textContent.trim()).toBe("hello world");
        // expect(global.import).toHaveBeenCalledTimes(1);
        console.log($app.outerHTML)
    });

    xit("error when missing the default render", async() => {
        // given
        const $app = window.document.createElement("div");
        const routes = {
            "/": "./common/skeleton/test/ctrl/nok.js"
        };

        // when
        main($app, routes);
        window.dispatchEvent(new window.Event("pagechange"));

        // then
        await nextTick();
        expect($app.querySelector("h1").textContent.trim()).toBe("Error");
    });
});

describe("navigation", () => {
    it("using a link with data-link attribute for SPA", async() => {
        // given
        const $app = window.document.createElement("div");
        const routes = {
            "/": (render) => render(createElement(`
                     <div>
                         <h1>hello world</h1>
                         <div>
                             <a href="/something" data-link id="spa-link">SPA Link</a>
                             <a href="/something" id="non-spa-link">Non SPA Link</a>
                         </div>
                     </div>`)),
            "/something": (render) => render("<h1>OK</h1>")
        };
        const destroy = jest.fn();

        // when
        main($app, routes);
        window.dispatchEvent(new window.Event("pagechange"));
        await nextTick();
        expect(window.location.pathname).toBe("/");
        onDestroy(destroy);
        $app.querySelector("#spa-link").click();
        await nextTick();

        // then
        expect(destroy).toHaveBeenCalled();
        expect(window.location.pathname).toBe("/something");
    });
});
