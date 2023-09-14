import { createElement } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation, applyMutations, onClick } from "../../lib/rx.js";
import { createForm } from "../../lib/form.js";
import { qs, qsa } from "../../lib/dom.js";
import { formTmpl } from "../../components/form.js";
import { generateSkeleton } from "../../components/skeleton.js";

import {
    getMiddlewareAvailable, getMiddlewareEnabled, toggleMiddleware,
    getBackendAvailable, getBackendEnabled,
} from "./ctrl_backend_state.js";
import "./component_box-item.js";

export default function(render) {
    const $page = createElement(`
        <div>
            <h2 class="hidden">Authentication Middleware</h2>
            <div class="box-container">
                ${generateSkeleton(5)}
            </div>
            <div style="min-height: 300px">
                <div data-bind="idp"></div>
                <form data-bind="attribute-mapping"></div>
            </div>
        </div>
    `);

    // feature: setup the buttons
    const init$ = getMiddlewareAvailable().pipe(
        rxjs.tap(() => {
            qs($page, "h2").classList.remove("hidden");
            qs($page, `.box-container`).innerHTML = "";
        }),
        rxjs.map((specs) => Object.keys(specs).map((label) => createElement(`
            <div is="box-item" data-label="${label}"></div>
        `))),
        applyMutations(qs($page, ".box-container"), "appendChild"),
        rxjs.share(),
    );
    effect(init$);

    // feature: state of buttons
    effect(init$.pipe(
        rxjs.mergeMap(() => getMiddlewareEnabled()),
        rxjs.filter((backend) => !!backend),
        rxjs.tap((backend) => qsa($page, `[is="box-item"]`).forEach(($button) => {
            $button.getAttribute("data-label") === backend ?
                $button.classList.add("active") :
                $button.classList.remove("active");
        })),
    ));

    // feature: click to select a middleware
    effect(init$.pipe(
        rxjs.mergeMap(($nodes) => $nodes),
        rxjs.mergeMap(($node) => onClick($node)),
        rxjs.map(($node) => toggleMiddleware($node.getAttribute("data-label"))),
        saveMiddleware,
    ));

    // feature: setup forms.
    // We put everything in the DOM so we don't lose transient state when clicking around
    const setupForm$ = getMiddlewareAvailable().pipe(
        rxjs.mergeMap(async (obj) => {
            const idps = []
            for (let key in obj) {
                const $idp = await createForm({[key]: obj[key]}, formTmpl({}));
                $idp.classList.add("hidden");
                $idp.setAttribute("id", key);
                idps.push($idp);
            }
            return idps;
        }),
        applyMutations(qs($page, `[data-bind="idp"]`), "appendChild"),
        rxjs.share(),
    );
    effect(setupForm$);

    // feature: handle visibility of the idp form to match the currently selected backend
    effect(setupForm$.pipe(
        rxjs.mergeMap(() => getMiddlewareEnabled()),
        rxjs.tap((currentMiddleware) => {
            qsa($page, `[data-bind="idp"] .formbuilder`).forEach(($node) => {
                $node.getAttribute("id") === currentMiddleware ?
                    $node.classList.remove("hidden") :
                    $node.classList.add("hidden");
            });
            const $attrMap = qs($page, `[data-bind="attribute-mapping"]`);
            currentMiddleware ?
                $attrMap.classList.remove("hidden") :
                $attrMap.classList.add("hidden");

            qsa($page, ".box-item").forEach(($button) => {
                const $icon = qs($button, ".icon");
                $icon.style.transition = "transform 0.2s ease";
                if (qs($button, "strong").textContent === currentMiddleware) {
                    $button.classList.add("active");
                    $icon.style.transform = "rotate(45deg)";
                } else {
                    $button.classList.remove("active");
                    $icon.style.transform = "";
                }
            })
        }),
    ));

    // feature: setup the attribute mapping form
    effect(init$.pipe(
        rxjs.first(),
        rxjs.mergeMap(async () => await createForm(attributeMapForm({}), formTmpl({}))),
        applyMutation(qs($page, `[data-bind="attribute-mapping"]`), "replaceChildren"),
    ));

    // feature: related backend values triggers creation/deletion of related backends
    effect(setupForm$.pipe(
        rxjs.mergeMap(() => rxjs.fromEvent(qs($page, `[name="attribute_mapping.related_backend"]`), "input")),
        rxjs.map((e) => e.target.value.split(",").map((val) => val.trim()).filter((t) => !!t)),
        // rxjs.withLatestFrom(getBackendEnabled()),
        rxjs.withLatestFrom(getBackendAvailable()),
        rxjs.map(([backends, formSpec]) => {
            let spec = {};
            backends.forEach((type) => {
                if (formSpec[type]) {
                    spec[type] = formSpec[type];
                    delete spec[type]["advanced"];
                    for (let key in spec[type]) {
                        delete spec[type][key]["id"];
                    }
                }
            });
            for(const [key, value] of new FormData(qs($page, `[data-bind="attribute-mapping"]`)).entries()) {
                const path = key.split(".");
                let ptr = spec;
                for (let i=0; i<path.length; i++) {
                    if (ptr) ptr = ptr[path[i]];
                }
                if (ptr) ptr.value = value;
            }
            delete spec["related_backend"];
            return spec
        }),
        rxjs.mergeMap(async (formSpec) => await createForm(formSpec, formTmpl({
            renderLeaf: () => createElement(`<label></label>`),
        }))),
        rxjs.tap(($node) => {
            let $relatedBackendField;
            $page.querySelectorAll(`[data-bind="attribute-mapping"] fieldset`).forEach(($el, i) => {
                if (i === 0) $relatedBackendField = $el;
                else $el.remove();
            });
            $relatedBackendField?.appendChild($node);
        }),
    ));

    // feature: form input change handler
    effect(setupForm$.pipe(
        rxjs.switchMap(() => rxjs.fromEvent($page, "input")),
        rxjs.map(() => [...new FormData(qs($page, "form"))].reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {})),
        rxjs.tap((e) => console.log("INPUT CHANGE", JSON.stringify(e)))
    ));

    render($page);
}

const saveMiddleware = rxjs.pipe(
    rxjs.tap((a) => console.log("SAVING", a)),
);

const attributeMapForm = (selectedBackends) => ({
    "attribute_mapping": {
        "related_backend": {
            "type": "text",
            "datalist": ["s3", "webdav", "ftp", "sftp"],
            "multi": true,
            "autocomplete": false,
        },
        ...selectedBackends,
    }
});
