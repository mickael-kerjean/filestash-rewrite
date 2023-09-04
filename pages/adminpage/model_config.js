import rxjs from "../../lib/rx.js";
import ajax from "../../lib/ajax.js";

const isSaving$ = new rxjs.BehaviorSubject(false);

const config$ = ajax({
    url: "/admin/api/config",
    method: "GET",
    responseType: "json"
}).pipe(
    rxjs.map((res) => res.responseJSON.result),
    rxjs.share(),
);

export function isSaving() {
    return isSaving$.asObservable();
}

export function get() {
    return config$;
}

export function save() {
    return rxjs.pipe(
        rxjs.tap(() => isSaving$.next(true)),
        rxjs.debounceTime(1000),
        rxjs.mergeMap((formData) => ajax({
            url: "/admin/api/config",
            method: "POST",
            responseType: "json",
            body: formData,
        })),
        rxjs.tap(() => isSaving$.next(false)),
    );
}
