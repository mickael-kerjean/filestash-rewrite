describe("component::icons", () => {
    beforeEach(() => {
        global.customElements = window.customElements;
        window.requestAnimationFrame = (cb) => cb()
    });
    afterEach(() => {
        document.body.innerHTML = "";
        global.customElements = { define: jest.fn() };
    });

    it("has a bunch of icons", async () => {
        const icons = [
            "arrow_right", "arrow_left", "eye", "loading",
            "__not_defined__",
        ];

        await Promise.all(icons.map((icon) => {
            document.body.innerHTML = `
            <div>
                <component-icon name="${icon}"></component-icon>
            </div>
        `;
            require("./icon.js");
            const $img = document.body.querySelector("img");
            expect($img).toBeTruthy();
            expect($img.outerHTML).toBeTruthy();
            expect($img).toMatchSnapshot();
        }));
    });
});
