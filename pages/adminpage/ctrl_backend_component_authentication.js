import { createElement } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation, applyMutations, onClick } from "../../lib/rx.js";
import ajax from "../../lib/ajax.js";
import { createForm, mutateForm } from "../../lib/form.js";
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
        rxjs.concatMap(() => getMiddlewareEnabled()),
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

    // feature: setup forms
    // We put everything in the DOM so we don't lose transient state when clicking around
    const setupIDPForm$ = getMiddlewareAvailable().pipe(
        rxjs.combineLatestWith(getAdminConfig().pipe(
            rxjs.first(),
            rxjs.map((cfg) => ({
                type: cfg?.middleware?.identity_provider?.type?.value,
                params: JSON.parse(cfg?.middleware?.identity_provider?.params?.value),
            })),
        )),
        rxjs.concatMap(async ([availableSpecs, idpState = {}]) => {
            const { type, params } = idpState;
            const idps = []
            for (let key in availableSpecs) {
                let idpSpec = availableSpecs[key];
                delete idpSpec.type;
                if (key === type) idpSpec = mutateForm(idpSpec, params)
                const $idp = await createForm({ [key]: idpSpec }, formTmpl({
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
    effect(setupIDPForm$);

    // feature: handle visibility of the identity_provider form to match the selected midleware
    effect(setupIDPForm$.pipe(
        rxjs.concatMap(() => getMiddlewareEnabled()),
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
    const setupAMForm$ = init$.pipe(
        rxjs.mapTo({
            "attribute_mapping": {
                "related_backend": {
                    "type": "text",
                    "datalist": [],
                    "multi": true,
                    "autocomplete": false,
                    "value": "",
                },
                // dynamic form here is generated reactively from the value of the "related_backend" field
            }
        }),
        // related_backend value
        rxjs.combineLatestWith(getAdminConfig().pipe(
            rxjs.first(),
            rxjs.map((cfg) => cfg?.middleware?.attribute_mapping?.related_backend?.value),
        )),
        rxjs.map(([spec, state]) => {
            spec.attribute_mapping.related_backend.value = state;
            // spec.attribute_mapping.related_backend.value = "network1"; // TODO: use state instead
            return spec;
        }),
        // related_backend completion
        rxjs.combineLatestWith(getBackendEnabled().pipe(rxjs.first())),
        rxjs.map(([spec, backends]) => {
            spec.attribute_mapping.related_backend.datalist = backends.map(({ label }) => label);
            return spec;
        }),
        rxjs.concatMap(async (specs) => await createForm(specs, formTmpl({}))),
        applyMutation(qs($page, `[data-bind="attribute-mapping"]`), "replaceChildren"),
        rxjs.share(),
    );
    effect(setupAMForm$);

    // // feature: setup autocompletion of related backend field: TODO ideally this would merge with the setup
    // effect(getBackendEnabled().pipe(
    //     rxjs.map((backends) => backends.map(({ label }) => label)),
    //     // rxjs.tap((a) => console.log("enabled", a))
    //     // TODO: setup autocomplete based on labels
    // ));

    // feature: related backend values triggers creation/deletion of related backends
    effect(setupAMForm$.pipe(
        rxjs.mergeMap(() => rxjs.merge(
            rxjs.fromEvent(qs($page, `[name="attribute_mapping.related_backend"]`), "input").pipe(
                rxjs.map((e) => e.target.value),
            ),
            rxjs.of(qs($page, `[name="attribute_mapping.related_backend"]`).value),
        )),
        rxjs.map((value) => value.split(",").map((val) => val.trim()).filter((t) => !!t)),
        rxjs.combineLatestWith(getBackendEnabled().pipe(rxjs.first())),
        rxjs.map(([inputBackends, enabledBackends]) =>
            inputBackends
                .map((label) => enabledBackends.find((b) => b.label === label))
                .filter((label) => !!label)
        ),
        rxjs.combineLatestWith(getBackendAvailable().pipe(rxjs.map((specs) => {
            // we don't want to show the "normal" form but a flat version of it
            // so we're getting rid of anything that could make some magic happen like toggle and
            // ids which enable those interactions
            for (let key in specs) {
                for (let input in specs[key]) {
                    if (specs[key][input]["type"] === "enable") {
                        delete specs[key][input];
                    } else if ("id" in specs[key][input]) {
                        delete specs[key][input]["id"];
                    }
                }
            }
            return specs;
        }))),
        rxjs.map(([backends, formSpec]) => {
            let spec = {};
            // STEP1: format the backends spec
            backends.forEach(({ label, type }) => {
                if (formSpec[type]) {
                    spec[label] = formSpec[type];
                }
            });
            // console.log(spec);
            // // STEP2: setup initial values // TODO: delete this?
            // for(const [key, value] of new FormData(qs($page, `[data-bind="attribute-mapping"]`)).entries()) {
            //     const path = key.split(".");
            //     let ptr = spec;
            //     for (let i=0; i<path.length; i++) {
            //         if (ptr) ptr = ptr[path[i]];
            //     }
            //     if (ptr) ptr.value = value;
            // }
            // delete spec["related_backend"];
            return spec
        }),
        rxjs.combineLatestWith(getAdminConfig().pipe(
            rxjs.first(),
            rxjs.map((cfg) => JSON.parse(cfg?.middleware?.attribute_mapping?.params?.value)),
            rxjs.map((cfg) => {
                // transform the form state from legacy format (= an object struct which was replicating the spec object)
                // to the new format which leverage the dom (= or the input name attribute to be precise) to store the entire schema
                let obj = {};
                for (let key1 in cfg) {
                    for (let key2 in cfg[key1]) {
                        obj[`${key1}.${key2}`] = cfg[key1][key2];
                    }
                }
                return obj;
            }),
        )),
        rxjs.map(([formSpec, formState]) => mutateForm(formSpec, formState)),
        // rxjs.map(([formSpec, formState]) => formSpec),
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
    effect(setupAMForm$.pipe(
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
                if (value !== "") acc[k[0]][k[1]] = value;
                return acc;
            }, {})),
        };
        return middleware;
    }),
    rxjs.combineLatestWith(getAdminConfig().pipe(formObjToJSON$(), rxjs.first())),
    rxjs.map(([middleware, config]) => ({...config, middleware})),
    rxjs.combineLatestWith(getConfig().pipe(rxjs.first())),
    rxjs.map(([config, { connections }]) => ({ ...config, connections })),
    saveConfig(),
);
