import rxjs from "../../lib/rx.js";

export { getBackends as getBackendAvailable } from "./model_backend.js";

const backendsEnabled$ = new rxjs.BehaviorSubject([]);

export function getBackendEnabled() {
    return backendsEnabled$.asObservable();
}

export function addBackendEnabled(type) {
    const record = { type, label: type };
    const values = backendsEnabled$.value.filter((b) => b.type === type);
    for (let i=0; i<values.length; i++) {
        if (values[i].label === record.label) {
            record.label = `${type} ${values.length+1}`;
        }
    }
    backendsEnabled$.next(backendsEnabled$.value.concat(record));
}

export function removeBackendEnabled(n) {

}

const authEnabled$ = new rxjs.BehaviorSubject(null);

export { getAuthMiddleware as getAuthMiddlewareAvailable } from "./model_auth_middleware.js";

export function getEnabledAuthMiddleware() {
    return authEnabled$.asObservable();
}
