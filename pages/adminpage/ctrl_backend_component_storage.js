import { createElement } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation, onClick } from "../../lib/rx.js";
import { createForm } from "../../lib/form.js";
import { qs, qsa } from "../../lib/dom.js";
import { formTmpl } from "../../components/form.js";

import { getBackendAvailable, getBackendEnabled, addBackendEnabled } from "./ctrl_backend_state.js";

export default function(render) {
    const $page = createElement(`
        <div class="component_storagebackend">
            <h2>Storage Backend</h2>
            <div class="box-container" data-bind="backend-available"></div>
            <form data-bind="backend-enabled"></form>
        </div>
    `);
    render($page);

    // feature1: setup the dom
    const init$ = getBackendAvailable().pipe(
        rxjs.mergeMap((specs) => Object.keys(specs)),
        rxjs.map((label) => createElement(`
            <div class="box-item pointer no-select">
                <div>
                    <strong>${label}</strong>
                    <span class="no-select">
                        <span class="icon">+</span>
                    </span>
                </div>
            </div>
        `)),
        applyMutation(qs($page, `[data-bind="backend-available"]`), "appendChild"),
    );

    // feature2: select or unselect a backend
    effect(init$.pipe(
        rxjs.mergeMap(($node) => onClick($node)),
        rxjs.map(($node) => qs($node, "strong")),
        rxjs.map(($node) => $node.textContent.trim()),
        rxjs.tap((type) => addBackendEnabled(type)),
    ));

    // feature3: setup form
    effect(getBackendEnabled().pipe(
        rxjs.mergeMap((obj) => obj),
        rxjs.mergeMap(({ type, label }) => createForm({ [type]: {
            label: { type: "text", placeholder: "Label", value: label },
        }}, formTmpl({
            renderLeaf: () => createElement(`<label></label>`),
        }))),
        applyMutation(qs($page, `[data-bind="backend-enabled"]`), "appendChild"),
        // rxjs.tap((a) => console.log(a))
    ));
}
