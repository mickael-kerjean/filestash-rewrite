import rxjs from "../../lib/rx.js";
import { get as getConfig } from "../../model/config.js";

export { getBackends as getBackendAvailable } from "./model_backend.js";

const backendsEnabled$ = new rxjs.BehaviorSubject([]);

export async function init() {
    return await getConfig().pipe(
        rxjs.map(({ connections }) => connections),
        rxjs.tap((connections) => backendsEnabled$.next(backendsEnabled$.value.concat(connections))),
    ).toPromise();
}

export function getBackendEnabled() {
    return backendsEnabled$;
}

export function addBackendEnabled(type) {
    const existingLabels = new Set();
    backendsEnabled$.value.forEach((obj) => {
        existingLabels.add(obj.label.toLowerCase());
    });

    let label = "", i = 1;
    while (true) {
        label = type + (i === 1 ? "" : ` ${i}`);
        if (existingLabels.has(label) === false) break;
        i+=1;
    }

    backendsEnabled$.next(backendsEnabled$.value.concat({ type, label }));
}

export function removeBackendEnabled(labelToRemove) {
    backendsEnabled$.next(backendsEnabled$.value.filter(({ label }) => {
        return label !== labelToRemove;
    }));
}

const middlewareEnabled$ = new rxjs.BehaviorSubject(null);

export { getAuthMiddleware as getMiddlewareAvailable } from "./model_auth_middleware.js";

export function getMiddlewareEnabled() {
    return middlewareEnabled$.asObservable();
}
