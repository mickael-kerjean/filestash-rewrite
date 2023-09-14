import rxjs from "../../lib/rx.js";
import { get as getConfig } from "../../model/config.js";

export { getBackends as getBackendAvailable } from "./model_backend.js";

const backendsEnabled$ = new rxjs.BehaviorSubject([]);

export async function init() {
    return await getConfig().pipe(
        rxjs.map(({ connections }) => connections),
        rxjs.tap((connections) => backendsEnabled$.next(connections)),
    ).toPromise();
}

export function getBackendEnabled() {
    return backendsEnabled$.asObservable();
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

    const b = backendsEnabled$.value.concat({ type, label });
    backendsEnabled$.next(b);
    return b;
}

export function removeBackendEnabled(labelToRemove) {
    const b = backendsEnabled$.value.filter(({ label }) => {
        return label !== labelToRemove;
    });
    backendsEnabled$.next(b);
    return b;
}

const middlewareEnabled$ = new rxjs.BehaviorSubject(null);

export { getAuthMiddleware as getMiddlewareAvailable } from "./model_auth_middleware.js";

export function getMiddlewareEnabled() {
    return middlewareEnabled$.asObservable();
}

export function toggleMiddleware(type) {
    const newValue = middlewareEnabled$.value === type ? null : type;
    middlewareEnabled$.next(newValue);
    return newValue;
}
