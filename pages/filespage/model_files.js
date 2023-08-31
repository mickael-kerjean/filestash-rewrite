import rxjs from "../../lib/rx.js";
import ajax from "../../lib/ajax.js";

export function ls() {
    return rxjs.pipe(
        rxjs.mergeMap((path) => ajax({
            url: `/api/files/ls?path=${path}`,
            responseType: "json"
        })),
        rxjs.map(({ responseJSON }) => ({ files: responseJSON.results }))
    );
}

// function repeat(element, times) {
//     const result = Array(times);
//     for (let i = 0; i < times; i++) result[i] = element;
//     return result;
// }
