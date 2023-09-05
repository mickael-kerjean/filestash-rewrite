import { createElement } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation, onClick } from "../../lib/rx.js";
import { createForm } from "../../lib/form.js";
import { qs, qsa } from "../../lib/dom.js";
import { formTmpl, format } from "../../components/form.js";

import { getBackendAvailable, getBackendEnabled, addBackendEnabled } from "./ctrl_backend_state.js";
import "./component_box-item.js";

export default function(render) {
    const $page = createElement(`
        <div class="component_storagebackend">
            <h2>Storage Backend</h2>
            <div class="box-container" data-bind="backend-available"></div>
            <form data-bind="backend-enabled"></form>
        </div>
    `);
    render($page);

    // feature: setup the dom
    const init$ = getBackendAvailable().pipe(
        rxjs.mergeMap((specs) => Object.keys(specs)),
        rxjs.map((label) => createElement(`<div is="box-item" data-label="${label}"></div>`)),
        applyMutation(qs($page, `[data-bind="backend-available"]`), "appendChild"),
    );

    // feature: select or unselect a backend
    effect(init$.pipe(
        rxjs.mergeMap(($node) => onClick($node)),
        rxjs.tap(($node) => addBackendEnabled($node.getAttribute("data-label"))),
        rxjs.tap(($node) => $node.toggleSelection()),
    ));

    // feature: setup form
    const $removeTmpl = createElement(`
        <div class="icons no-select">
            <img class="component_icon" draggable="false" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MS45NzYgNTEuOTc2Ij4KICA8cGF0aCBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eTowLjUzMzMzMjg1O3N0cm9rZS13aWR0aDoxLjQ1NjgxMTE5IiBkPSJtIDQxLjAwNTMxLDQwLjg0NDA2MiBjIC0xLjEzNzc2OCwxLjEzNzc2NSAtMi45ODIwODgsMS4xMzc3NjUgLTQuMTE5ODYxLDAgTCAyNi4wNjg2MjgsMzAuMDI3MjM0IDE0LjczNzU1MSw0MS4zNTgzMSBjIC0xLjEzNzc3MSwxLjEzNzc3MSAtMi45ODIwOTMsMS4xMzc3NzEgLTQuMTE5ODYxLDAgLTEuMTM3NzcyMiwtMS4xMzc3NjggLTEuMTM3NzcyMiwtMi45ODIwODggMCwtNC4xMTk4NjEgTCAyMS45NDg3NjYsMjUuOTA3MzcyIDExLjEzMTkzOCwxNS4wOTA1NTEgYyAtMS4xMzc3NjQ3LC0xLjEzNzc3MSAtMS4xMzc3NjQ3LC0yLjk4MzU1MyAwLC00LjExOTg2MSAxLjEzNzc3NCwtMS4xMzc3NzIxIDIuOTgyMDk4LC0xLjEzNzc3MjEgNC4xMTk4NjUsMCBMIDI2LjA2ODYyOCwyMS43ODc1MTIgMzYuMzY5NzM5LDExLjQ4NjM5OSBjIDEuMTM3NzY4LC0xLjEzNzc2OCAyLjk4MjA5MywtMS4xMzc3NjggNC4xMTk4NjIsMCAxLjEzNzc2NywxLjEzNzc2OSAxLjEzNzc2NywyLjk4MjA5NCAwLDQuMTE5ODYyIEwgMzAuMTg4NDg5LDI1LjkwNzM3MiA0MS4wMDUzMSwzNi43MjQxOTcgYyAxLjEzNzc3MSwxLjEzNzc2NyAxLjEzNzc3MSwyLjk4MjA5MSAwLDQuMTE5ODY1IHoiIC8+Cjwvc3ZnPgo=" alt="close">
        </div>
    `);
    effect(getBackendEnabled().pipe(
        rxjs.tap(() => qs($page, `[data-bind="backend-enabled"]`).innerHTML = ""),
        rxjs.mergeMap((obj) => obj),
        rxjs.mergeMap(({ type, label }) => createForm({ [type]: {
            label: { type: "text", placeholder: "Label", value: label },
        }}, formTmpl({
            renderLeaf: () => createElement(`<label></label>`),
            renderNode: ({ label }) => {
                const $fieldset = createElement(`
                    <fieldset>
                        <legend class="no-select">
                            ${format(label)}
                        </legend>
                        <div data-bind="children"></div>
                    </fieldset>
                `);
                const $remove = $removeTmpl.cloneNode(true);
                $remove.onclick = () => {
                    console.log("CLICK");
                };
                $fieldset.appendChild($remove);
                return $fieldset;
            }
        }))),
        applyMutation(qs($page, `[data-bind="backend-enabled"]`), "appendChild"),
    ));
}
