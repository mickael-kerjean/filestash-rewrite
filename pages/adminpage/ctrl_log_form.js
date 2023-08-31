import { createElement } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation } from "../../lib/rx.js";
import { qsa } from "../../lib/dom.js";
import { createForm, mutateForm } from "../../lib/form.js";
import { generateSkeleton } from "../../components/skeleton.js";
import notification from "../../components/notification.js";
import { formTmpl } from "../../components/form.js";
import t from "../../lib/locales.js";

import { get as getConfig, save as saveConfig } from "./model_config.js";
import { renderLeaf, useForm$, formObjToJSON$ } from "./helper_form.js";

export default function(render) {
    const $form = createElement(`
        <form style="min-height: 240px; margin-top:20px;">
            ${generateSkeleton(4)}
        </form>
    `);

    render($form);

    // feature1: render the form
    const setup$ = getConfig().pipe(
        rxjs.map(({ log }) => ({ params: log })),
        rxjs.map((formSpec) => createForm(formSpec, formTmpl({ renderLeaf }))),
        rxjs.mergeMap((promise) => rxjs.from(promise)),
        rxjs.map(($form) => [$form]),
        applyMutation($form, "replaceChildren"),
        rxjs.share(),
    );
    effect(setup$);

    // feature2: form change
    effect(setup$.pipe(
        useForm$(() => qsa($form, `[name]`)),
        rxjs.withLatestFrom(getConfig()),
        rxjs.map(([formState, formSpec]) => {
            const fstate = Object.fromEntries(Object.entries(formState).map(([key, value]) => ([
                key.replace(new RegExp("^params\."), "log."),
                value,
            ])));
            return mutateForm(formSpec, fstate);
        }),
        formObjToJSON$(),
        saveConfig(),
        rxjs.catchError((err) => {
            notification.error(err && err.message || t("Oops"));
            return rxjs.EMPTY;
        }),
    ));
}
