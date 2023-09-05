import { createElement } from "../../lib/skeleton/index.js";
import rxjs, { effect, applyMutation, applyMutations, onClick } from "../../lib/rx.js";
import { createForm } from "../../lib/form.js";
import { qs, qsa } from "../../lib/dom.js";
import { formTmpl } from "../../components/form.js";

import { getAuthMiddlewareAvailable, getBackendEnabled, getBackendAvailable} from "./ctrl_backend_state.js";
import "./component_box-item.js";

export default function(render) {
    const $page = createElement(`
        <div>
            <div class="box-container"></div>
            <div data-bind="idp"></div>
            <form data-bind="attribute-mapping"></div>
        </div>
    `);

    // feature: setup the buttons
    const init$ = getAuthMiddlewareAvailable().pipe(
        rxjs.map((specs) => Object.keys(specs).map((label) => createElement(`
            <div is="box-item" data-label="${label}"></div>
        `))),
        applyMutations(qs($page, ".box-container"), "appendChild"),
        rxjs.share(),
    );
    effect(init$);

    // feature: setup authentication forms
    const idp$ = getAuthMiddlewareAvailable().pipe(
        rxjs.mergeMap(async (obj) => {
            const idps = []
            for (let key in obj) {
                const $idp = await createForm({[key]: obj[key]}, formTmpl({}));
                $idp.classList.add("hidden");
                $idp.setAttribute("id", key);
                idps.push($idp);
            }
            return idps;
        }),
        applyMutations(qs($page, `[data-bind="idp"]`), "appendChild"),
        rxjs.share(),
    );
    effect(idp$);

    // feature: setup the attribute mapping form
    effect(init$.pipe(
        rxjs.first(),
        rxjs.mergeMap(async () => await createForm(attributeMapForm({}), formTmpl({}))),
        applyMutation(qs($page, `[data-bind="attribute-mapping"]`), "replaceChildren"),
    ));

    // feature: handle visibility of the idp form to match the currently selected backend
    const selectedIdp$ = init$.pipe(
        rxjs.mergeMap(($list) => $list),
        rxjs.mergeMap(($node) => onClick($node)),
        // TODO:
        rxjs.map(($node) => qs($node, "strong").textContent.trim()),
        rxjs.scan((state, current) => state === current ? null : current, null)
    );
    effect(selectedIdp$.pipe(
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
                if (qs($button, "strong").textContent === currentMiddleware) {
                    $icon.innerHTML = `<img class="component_icon" draggable="false" src="/assets/icons/delete.svg" alt="delete">`;
                    $button.classList.add("active");
                } else {
                    $icon.innerHTML = "+";
                    $button.classList.remove("active");
                }
            })
        }),
    ));

    // feature: related backend values triggers creation/deletion of related backends
    effect(idp$.pipe(
        rxjs.mergeMap(() => rxjs.fromEvent(qs($page, `[name="attribute_mapping.related_backend"]`), "input")),
        rxjs.map((e) => e.target.value.split(",").map((val) => val.trim()).filter((t) => !!t)),
        // rxjs.withLatestFrom(getBackendEnabled()),
        rxjs.withLatestFrom(getBackendAvailable()),
        rxjs.map(([backends, formSpec]) => {
            let spec = {};
            backends.forEach((type) => {
                if (formSpec[type]) {
                    spec[type] = formSpec[type];
                    delete spec[type]["advanced"];
                    for (let key in spec[type]) {
                        delete spec[type][key]["id"];
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

    // feature: handle attribute map change
    effect(idp$.pipe(
        rxjs.switchMap(() => rxjs.fromEvent($page, "input")),
        rxjs.map(() => [...new FormData(qs($page, "form"))].reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {})),
        rxjs.tap((e) => console.log("INPUT CHANGE", JSON.stringify(e)))
    ));

    render($page);
}

const attributeMapForm = (selectedBackends) => ({
    "attribute_mapping": {
        "related_backend": {
            "type": "text",
            "datalist": ["s3", "webdav", "ftp", "sftp"],
            "multi": true,
            "autocomplete": false,
        },
        ...selectedBackends,
    }
});

/*

  <div class="box-item pointer no-select">
    <div>htpasswd <span class="no-select">
        <span class="icon">+</span>
      </span>
    </div>
  </div>
  <div class="box-item pointer no-select">
    <div>ldap <span class="no-select">
        <span class="icon">+</span>
      </span>
    </div>
  </div>
  <div class="box-item pointer no-select active">
    <div>openid <span class="no-select">
        <span class="icon">
          <img class="component_icon" draggable="false" src="/assets/icons/delete.svg" alt="delete">
        </span>
      </span>
    </div>
  </div>
  <div class="box-item pointer no-select">
    <div>passthrough <span class="no-select">
        <span class="icon">+</span>
      </span>
    </div>
  </div>
  <div class="box-item pointer no-select">
    <div>saml <span class="no-select">
        <span class="icon">+</span>
      </span>
    </div>
  </div>
</div>

*/
