import { createElement } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation } from "../../lib/rx.js";
import { qs, qsa } from "../../lib/dom.js";
import { createForm, mutateForm } from "../../lib/form.js";
import { formTmpl } from "../../components/form.js";
import { generateSkeleton } from "../../components/skeleton.js";
import notification from "../../components/notification.js";
import { get as getConfig } from "../../model/config.js";

import { get as getAdminConfig, save as saveConfig } from "./model_config.js";
import { renderLeaf, useForm$, formObjToJSON$ } from "./helper_form.js";
import transition from "./animate.js";
import AdminHOC from "./decorator.js";

export default AdminHOC(function(render) {
    const $container = createElement(`
        <div class="component_settingspage sticky">
            <form data-bind="form" class="formbuilder">
                <h2>…</h2>
                ${generateSkeleton(10)}
            </form>
        </div>
    `);
    render(transition($container));

    const config$ = getAdminConfig().pipe(
        reshapeConfigRemoveKeysWeDontWantInTheSettingsPage,
    );

    const tmpl = formTmpl({
        renderNode: ({ level, format, label }) => {
            if (level !== 0) return null;
            return createElement(`
                <div>
                    <h2>${format(label)}</h2>
                    <div data-bind="children"></div>
                </div>
            `);
        },
        renderLeaf, autocomplete: false,
    });

    // feature: setup the form
    const init$ = config$.pipe(
        rxjs.mergeMap((formSpec) => createForm(formSpec, tmpl)),
        rxjs.map(($form) => [$form]),
        applyMutation(qs($container, `[data-bind="form"]`), "replaceChildren"),
        rxjs.share(),
    );
    effect(init$);

    // feature: handle form change
    effect(init$.pipe(
        useForm$(() => qsa($container, `[data-bind="form"] [name]`)),
        rxjs.withLatestFrom(config$),
        rxjs.map(([formState, formSpec]) => mutateForm(formSpec, formState)),
        reshapeConfigAddMiddlewareKey,
        formObjToJSON$(),
        reshapeConfigBeforeSave,
        saveConfig(),
    ));
});


const reshapeConfigRemoveKeysWeDontWantInTheSettingsPage = rxjs.map((cfg) => {
    const { constant, middleware, connections, ...other } = cfg;
    return other;
});

const reshapeConfigAddMiddlewareKey = rxjs.pipe(
    rxjs.withLatestFrom(getAdminConfig()),
    rxjs.map(([configWithMissingKeys, config]) => {
        configWithMissingKeys["middleware"] = config["middleware"];
        return configWithMissingKeys;
    }),
);

const reshapeConfigBeforeSave = rxjs.pipe(
    rxjs.withLatestFrom(getConfig()),
    rxjs.map(([adminConfig, publicConfig]) => {
        adminConfig["connections"] = publicConfig["connections"];
        return adminConfig;
    }),
);
