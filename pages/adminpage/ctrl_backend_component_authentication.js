import { createElement } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation, applyMutations, onClick } from "../../lib/rx.js";
import { createForm } from "../../lib/form.js";
import { qs, qsa } from "../../lib/dom.js";
import { formTmpl } from "../../components/form.js";
import { generateSkeleton } from "../../components/skeleton.js";
import { get as getConfig } from "../../model/config.js";

import {
    initMiddleware,
    getMiddlewareAvailable, getMiddlewareEnabled, toggleMiddleware,
    getBackendAvailable, getBackendEnabled,
} from "./ctrl_backend_state.js";
import { formObjToJSON$, renderLeaf } from "./helper_form.js";
import { get as getAdminConfig, save as saveConfig } from "./model_config.js";

import "./component_box-item.js";

export default async function(render) {
    const $page = createElement(`
        <div>
            <h2 class="hidden">Authentication Middleware</h2>
            <div class="box-container">
                ${generateSkeleton(5)}
            </div>
            <div style="min-height: 300px">
                <form data-bind="idp"></form>
                <form data-bind="attribute-mapping"></div>
            </div>
        </div>
    `);
    render($page);
    await initMiddleware();

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
        rxjs.withLatestFrom(getMiddlewareEnabled().pipe()),
        rxjs.mergeMap(async ([available, { identity_provider, attribute_mapping }]) => {
            const idps = []
            for (let key in available) {
                const tmpl = available[key];
                delete tmpl.type;
                const $idp = await createForm({ [key]: tmpl }, formTmpl({
                    renderLeaf,
                    autocomplete: false,
                }));
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
        rxjs.mergeMap(() => getBackendEnabled().pipe(rxjs.withLatestFrom(
            getMiddlewareEnabled()
        ))),
        rxjs.mergeMap(async ([backends, middlewares]) => await createForm(attributeMapForm(backends, middlewares), formTmpl({}))),
        applyMutation(qs($page, `[data-bind="attribute-mapping"]`), "replaceChildren"),
    ));

    // feature: setup autocompletion of related backend field
    effect(getBackendEnabled().pipe(
        rxjs.map((backends) => backends.map(({ label }) => label)),
        // rxjs.tap((a) => console.log("enabled", a))
        // TODO: setup autocomplete based on labels
    ));

    // feature: related backend values triggers creation/deletion of related backends
    effect(setupForm$.pipe(
        rxjs.mergeMap(() => rxjs.merge(
            rxjs.fromEvent(qs($page, `[name="attribute_mapping.related_backend"]`), "input").pipe(
                rxjs.map((e) => e.target.value),
            ),
            rxjs.of(qs($page, `[name="attribute_mapping.related_backend"]`).value), // TODO: not triggered, probably should get from source
        )),
        rxjs.map((value) => value.split(",").map((val) => val.trim()).filter((t) => !!t)),
        rxjs.withLatestFrom(getBackendEnabled()),
        rxjs.map(([inputBackends, enabledBackends]) =>
            inputBackends
                .map((label) => enabledBackends.find((b) => b.label === label))
                .filter((label) => !!label)
        ),
        // rxjs.map((backends) => backends.map((type) => ({type, label: type}))),
        rxjs.withLatestFrom(getBackendAvailable()),
        rxjs.map(([backends, formSpec]) => {
            let spec = {};
            backends.forEach(({ label, type }) => {
                if (formSpec[type]) {
                    spec[label] = formSpec[type];
                    delete spec[label]["advanced"];
                    for (let key in spec[label]) {
                        delete spec[label][key]["id"];
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
        rxjs.mergeMap(() => getMiddlewareEnabled().pipe(rxjs.first())),
        saveMiddleware,
    ));
}

const saveMiddleware = rxjs.pipe(
    rxjs.map((authType) => {
        const middleware = {
            identity_provider: {},
            attribute_mapping: {},
        };
        if (!authType) return middleware;

        let formValues = [...new FormData(document.querySelector(`[data-bind="idp"]`))];
        middleware.identity_provider = {
            type: authType,
            params: JSON.stringify(
                formValues
                    .filter(([key, value]) => key.startsWith(`${authType}.`)) // remove elements that aren't in scope
                    .map(([key, value]) => [key.replace(new RegExp(`^${authType}\.`), ""), value]) // format the relevant keys
                    .reduce((acc, [key, value]) => { // transform onto something ready to be saved
                        if (key === "type") return acc;
                        return {
                            ...acc,
                            [key]: value,
                        };
                    }, {}),
            ),
        };

        formValues = [...new FormData(document.querySelector(`[data-bind="attribute-mapping"]`))];
        middleware.attribute_mapping = {
            related_backend: formValues.shift()[1],
            params: JSON.stringify(formValues.reduce((acc, [key, value]) => {
                const k = key.split(".");
                if (k.length !== 2) return acc;
                if (!acc[k[0]]) acc[k[0]] = {};
                acc[k[0]][k[1]] = value;
                return acc;
            }, {})),
        };
        return middleware;
    }),
    rxjs.withLatestFrom(getAdminConfig().pipe(formObjToJSON$())),
    rxjs.map(([middleware, config]) => ({...config, middleware})),
    rxjs.withLatestFrom(getConfig()),
    rxjs.map(([config, { connections }]) => ({ ...config, connections })),
    rxjs.tap((a) => console.log("SAVING", a)),
);

const attributeMapForm = (selectedBackends, middlewares) => {
    return {
        "attribute_mapping": {
            "related_backend": {
                "type": "text",
                "datalist": selectedBackends.map(({ label }) => label),
                "multi": true,
                "autocomplete": false,
            },
            // ...selectedBackends,
        }
    }
};
