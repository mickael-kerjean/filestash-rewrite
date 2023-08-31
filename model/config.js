import rxjs from "../lib/rx.js";
import ajax from "../lib/ajax.js";

export function get() {
    return ajax({
        url: "/api/config",
        responseJSON: "json",
        method: "GET",
    }).pipe(
        rxjs.map(({ responseJSON }) => responseJSON.result),
    );
}
