import * as adapter from '@astrojs/vercel/serverless/entrypoint';
import { escape } from 'html-escaper';
/* empty css                        *//* empty css                                         *//* empty css                                   */import { getHighlighter as getHighlighter$1 } from 'shiki';
import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

const ASTRO_VERSION = "1.0.2";
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLString extends String {
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    })
  );
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
          }
          break;
        }
      }
    } else if (key === "class:list") {
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport) {
    throw new Error(
      `Unable to resolve a componentExport for "${metadata.displayName}"! Please open an issue.`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro = self.Astro || {}).idle = (getHydrateCallback) => {
  const cb = async () => {
    let hydrate = await getHydrateCallback();
    await hydrate();
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(cb);
  } else {
    setTimeout(cb, 200);
  }
};`;

var load_prebuilt_default = `(self.Astro = self.Astro || {}).load = (getHydrateCallback) => {
  (async () => {
    let hydrate = await getHydrateCallback();
    await hydrate();
  })();
};`;

var media_prebuilt_default = `(self.Astro = self.Astro || {}).media = (getHydrateCallback, options) => {
  const cb = async () => {
    let hydrate = await getHydrateCallback();
    await hydrate();
  };
  if (options.value) {
    const mql = matchMedia(options.value);
    if (mql.matches) {
      cb();
    } else {
      mql.addEventListener("change", cb, { once: true });
    }
  }
};`;

var only_prebuilt_default = `(self.Astro = self.Astro || {}).only = (getHydrateCallback) => {
  (async () => {
    let hydrate = await getHydrateCallback();
    await hydrate();
  })();
};`;

var visible_prebuilt_default = `(self.Astro = self.Astro || {}).visible = (getHydrateCallback, _opts, root) => {
  const cb = async () => {
    let hydrate = await getHydrateCallback();
    await hydrate();
  };
  let io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting)
        continue;
      io.disconnect();
      cb();
      break;
    }
  });
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    io.observe(child);
  }
};`;

var astro_island_prebuilt_default = `var _a;
{
  const propTypes = {
    0: (value) => value,
    1: (value) => JSON.parse(value, reviver),
    2: (value) => new RegExp(value),
    3: (value) => new Date(value),
    4: (value) => new Map(JSON.parse(value, reviver)),
    5: (value) => new Set(JSON.parse(value, reviver)),
    6: (value) => BigInt(value),
    7: (value) => new URL(value)
  };
  const reviver = (propKey, raw) => {
    if (propKey === "" || !Array.isArray(raw))
      return raw;
    const [type, value] = raw;
    return type in propTypes ? propTypes[type](value) : void 0;
  };
  if (!customElements.get("astro-island")) {
    customElements.define(
      "astro-island",
      (_a = class extends HTMLElement {
        constructor() {
          super(...arguments);
          this.hydrate = () => {
            if (!this.hydrator || this.parentElement?.closest("astro-island[ssr]")) {
              return;
            }
            const slotted = this.querySelectorAll("astro-slot");
            const slots = {};
            const templates = this.querySelectorAll("template[data-astro-template]");
            for (const template of templates) {
              if (!template.closest(this.tagName)?.isSameNode(this))
                continue;
              slots[template.getAttribute("data-astro-template") || "default"] = template.innerHTML;
              template.remove();
            }
            for (const slot of slotted) {
              if (!slot.closest(this.tagName)?.isSameNode(this))
                continue;
              slots[slot.getAttribute("name") || "default"] = slot.innerHTML;
            }
            const props = this.hasAttribute("props") ? JSON.parse(this.getAttribute("props"), reviver) : {};
            this.hydrator(this)(this.Component, props, slots, {
              client: this.getAttribute("client")
            });
            this.removeAttribute("ssr");
            window.removeEventListener("astro:hydrate", this.hydrate);
            window.dispatchEvent(new CustomEvent("astro:hydrate"));
          };
        }
        connectedCallback() {
          if (!this.hasAttribute("await-children") || this.firstChild) {
            this.childrenConnectedCallback();
          } else {
            new MutationObserver((_, mo) => {
              mo.disconnect();
              this.childrenConnectedCallback();
            }).observe(this, { childList: true });
          }
        }
        async childrenConnectedCallback() {
          window.addEventListener("astro:hydrate", this.hydrate);
          await import(this.getAttribute("before-hydration-url"));
          const opts = JSON.parse(this.getAttribute("opts"));
          Astro[this.getAttribute("client")](
            async () => {
              const rendererUrl = this.getAttribute("renderer-url");
              const [componentModule, { default: hydrator }] = await Promise.all([
                import(this.getAttribute("component-url")),
                rendererUrl ? import(rendererUrl) : () => () => {
                }
              ]);
              this.Component = componentModule[this.getAttribute("component-export") || "default"];
              this.hydrator = hydrator;
              return this.hydrate;
            },
            opts,
            this
          );
        }
        attributeChangedCallback() {
          if (this.hydrator)
            this.hydrate();
        }
      }, _a.observedAttributes = ["props"], _a)
    );
  }
}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = (Object.assign({"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true},{_:process.env._,}))) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let html = "";
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (typeof child === "object" && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (Component && Component.isAstroComponentFactory) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(
            ([key, value]) => renderSlot(result, value).then((output) => {
              children2[key] = output;
            })
          )
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          children[key] = output;
        })
      )
    );
  }
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

new TextEncoder();

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let body = "";
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

const $$metadata$b = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/BaseHead.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$d = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/BaseHead.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$BaseHead = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$d, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const { title, description, permalink } = Astro2.props;
  return renderTemplate`<!-- Global Metadata --><meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title"${addAttribute(title, "content")}>
<meta name="description"${addAttribute(description, "content")}>

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url"${addAttribute(permalink, "content")}>
<meta property="og:title"${addAttribute(title, "content")}>
<meta property="og:description"${addAttribute(description, "content")}>
<meta property="og:image" content="https://astro.build/social.jpg?v=1">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url"${addAttribute(permalink, "content")}>
<meta property="twitter:title"${addAttribute(title, "content")}>
<meta property="twitter:description"${addAttribute(description, "content")}>
<meta property="twitter:image" content="https://astro.build/social.jpg?v=1">

<!-- Fonts -->
<link href="/assets/fonts/josefin-sans-latin-variable-wghtOnly-normal.woff2">
`;
});

const $$file$b = "/Users/rishavthakur/projects/rishavt.dev/src/components/BaseHead.astro";
const $$url$b = undefined;

const $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$b,
  default: $$BaseHead,
  file: $$file$b,
  url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$a = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/Logo.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$c = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/Logo.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$Logo = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$c, $$props, $$slots);
  Astro2.self = $$Logo;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<div class="logo-container astro-CMZVW5LK">
  <svg class="logo-img astro-CMZVW5LK" xmlns="http://www.w3.org/2000/svg" style="isolation:isolate" height="100%" width="100%" viewBox="0 0 51.200 36"><g clip-path="url(#_clipPath_ttPFJohnO8airKefzYpaHf0qTgqa00K5)" class="astro-CMZVW5LK"><path stroke-width="1" fill-opacity="0%" d="M16.181 16.74q0 -0.96 -0.3 -1.5 -0.24 -1.2 -1.86 -2.1 -0.3 -0.18 -1.26 -0.3 -2.46 0 -4.14 1.92 -1.68 1.92 -1.68 4.86v0.6l0.12 0.72 -1.2 -0.6 -1.8 -1.2 -0.3 -0.66q0 -0.6 0.54 -1.62l1.62 -2.28 -0.36 -0.3Q3.881 15 2.501 18l-1.2 -3.12q1.62 -2.76 4.44 -4.56Q7.601 9.12 10.001 8.7q0.66 -0.12 1.56 -0.12 2.88 0 4.92 2.4 2.04 2.4 2.04 5.76 0 3.54 -3.54 7.86l7.5 -4.56V7.02q0.12 -0.48 0.6 -0.54l0.96 -0.06q0.36 0.24 0.48 0.42l0.42 1.08 0.18 1.62 0.12 2.1 0.24 -0.06 0.24 -1.98 0.18 -1.74q0.12 -1.38 0.84 -1.74l1.2 -0.3q0.6 0.3 0.6 0.96v10.8l5.4 -3.06 -0.24 -1.14 -0.06 -1.14 0.06 -1.08q0.06 -0.66 0.24 -1.08l2.16 -0.96 -0.18 0.66 -0.06 0.66 0.06 0.78 0.18 0.66 0.54 -0.06q0 -1.98 1.2 -3.48l3.42 -0.72q-0.84 0.66 -1.32 1.71 -0.48 1.05 -0.48 1.95v1.5q0 1.02 0.12 1.62l0.54 2.58q0.24 1.08 0.9 2.16 0.48 0.72 1.14 1.2 -2.04 0.54 -3.6 1.8 -1.92 1.5 -1.92 3.36 0 1.8 1.68 3.18 0.66 0.54 1.86 0.93 1.2 0.39 2.22 0.39l1.5 -0.18 1.5 -0.54 1.44 -0.9q0.6 -0.36 1.32 -1.32l0.72 1.08 0.24 0.96q-2.04 3.36 -8.46 3.36 -2.04 0 -3.66 -0.54 -2.88 -0.84 -4.56 -3.54 -0.6 -1.32 -0.6 -2.58v-0.78q0 -1.26 1.14 -2.7T36.099 20.1l-0.48 -0.6 -0.42 -0.72 -0.42 -0.84 -0.24 -0.9 -6 3V32.1l-0.18 0.72q-0.3 0.24 -0.42 0.24l-1.5 -0.06 -0.3 -0.12 -0.06 -0.54 -0.36 -2.22 -0.24 -1.32 -0.84 4.8h-2.16V23.34L5.561 33l-1.5 -2.1 6.96 -4.26q5.16 -5.16 5.16 -9.9ZM0.221 3.36H49.899v1.86H0.221V3.36Z" class="SQFdVEnQ_0 astro-CMZVW5LK"></path></g>
  </svg>
</div>

`;
});

const $$file$a = "/Users/rishavthakur/projects/rishavt.dev/src/components/Logo.astro";
const $$url$a = undefined;

const $$module1$4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$a,
  default: $$Logo,
  file: $$file$a,
  url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$9 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/SocialIcons.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$b = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/SocialIcons.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$SocialIcons = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$SocialIcons;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<a href="https://github.com/ristri" target="_blank" class="astro-DVYEQSTW">
  <div class="social-logo astro-DVYEQSTW">
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="astro-DVYEQSTW"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z" class="astro-DVYEQSTW"></path></svg>
  </div>
</a>

<a href="https://twitter.com/ristripathi" target="_blank" class="astro-DVYEQSTW">
  <div class="social-logo astro-DVYEQSTW">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 310" style="enable-background:new 0 0 310 310" height="24" xml:space="preserve" class="astro-DVYEQSTW"><path d="M302.973 57.388a117.512 117.512 0 0 1-14.993 5.463 66.276 66.276 0 0 0 13.494-23.73 5 5 0 0 0-7.313-5.824 117.994 117.994 0 0 1-34.878 13.783c-12.381-12.098-29.197-18.983-46.581-18.983-36.695 0-66.549 29.853-66.549 66.547 0 2.89.183 5.764.545 8.598C101.163 99.244 58.83 76.863 29.76 41.204a5.001 5.001 0 0 0-8.196.642c-5.896 10.117-9.013 21.688-9.013 33.461 0 16.035 5.725 31.249 15.838 43.137a56.37 56.37 0 0 1-8.907-3.977 5 5 0 0 0-7.427 4.257c-.007.295-.007.59-.007.889 0 23.935 12.882 45.484 32.577 57.229a57.372 57.372 0 0 1-5.063-.735 4.998 4.998 0 0 0-5.699 6.437c7.29 22.76 26.059 39.501 48.749 44.605-18.819 11.787-40.34 17.961-62.932 17.961a120.4 120.4 0 0 1-14.095-.826 5 5 0 0 0-3.286 9.174c29.023 18.609 62.582 28.445 97.047 28.445 67.754 0 110.139-31.95 133.764-58.753 29.46-33.421 46.356-77.658 46.356-121.367 0-1.826-.028-3.67-.084-5.508 11.623-8.757 21.63-19.355 29.773-31.536a5 5 0 0 0-6.182-7.351z" class="astro-DVYEQSTW"></path></svg>
  </div>
</a>

`;
});

const $$file$9 = "/Users/rishavthakur/projects/rishavt.dev/src/components/SocialIcons.astro";
const $$url$9 = undefined;

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$9,
  default: $$SocialIcons,
  file: $$file$9,
  url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$8 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/BlogHeader.astro", { modules: [{ module: $$module1$4, specifier: "./Logo.astro", assert: {} }, { module: $$module2, specifier: "./SocialIcons.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$a = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/BlogHeader.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$BlogHeader = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$BlogHeader;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`<!-- <div class="nav-subitem logo-container"><a href="/"><Logo /> </a></div> --><!-- <article> -->${maybeRenderHead($$result)}<header class="astro-NTUJNZXN">
  <div data-clip="true" class="astro-NTUJNZXN">
    <h5 class="astro-NTUJNZXN"><a href="/" class="astro-NTUJNZXN">Rishav Thakur</a></h5>
    <h5 class="astro-NTUJNZXN">Expirements & Thoughts</h5>
  </div>
  <h5 class="astro-NTUJNZXN"><time data-clip="true" class="astro-NTUJNZXN">05.11.2022</time></h5>
</header>
<!-- </article> -->
<!-- <div class="nav-subitem social-icons">
  <SocialIcons />
</div> -->

`;
});

const $$file$8 = "/Users/rishavthakur/projects/rishavt.dev/src/components/BlogHeader.astro";
const $$url$8 = undefined;

const $$module3$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$8,
  default: $$BlogHeader,
  file: $$file$8,
  url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$7 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/BlogPostPreview.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/BlogPostPreview.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$BlogPostPreview = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$BlogPostPreview;
  const { post } = Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<article class="post-preview astro-JMDKILCL">
  <div class="post-preview-heading astro-JMDKILCL">
  <!-- <p class="publish-date">{post.publishDate}</p> -->
  <a${addAttribute(post.url, "href")} class="astro-JMDKILCL"><u class="astro-JMDKILCL"><h5 class="title astro-JMDKILCL">${post.title}</h5></u></a>
  <!-- <small class="publish-date">{post.publishDate}</small> -->
</div>
  <!-- <small class="publish-date">{post.publishDate}</small> -->
  <!-- <p class="publish-date">{post.publishDate}</p> -->
  <p class="astro-JMDKILCL">${post.description}</p>
  <small class="publish-date astro-JMDKILCL">${post.publishDate}</small>
  <!-- <a href={post.url}>Read more</a> -->
</article>

`;
});

const $$file$7 = "/Users/rishavthakur/projects/rishavt.dev/src/components/BlogPostPreview.astro";
const $$url$7 = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$7,
  default: $$BlogPostPreview,
  file: $$file$7,
  url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$6 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/ProjectList.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/ProjectList.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$ProjectList = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$ProjectList;
  const projects = [
    {
      name: "Voccapp",
      description: "voccapp helps you learn words with more retention and efficiency. It features spaced repetition which drastically increases the rate of learning. It also features 2 different modes for different stages of learning",
      url: "https://www.voccapp.com/"
    },
    {
      name: "Toy-Blockchain",
      description: "An implementation of bitcoin blokchain in java. Has a input/output model for transaction. Also has (Transaction, Pow, UTXO, MerkleTree, Wallet)",
      url: "https://github.com/StTronn/jv-blockchain"
    }
  ];
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${projects.map((project) => renderTemplate`${maybeRenderHead($$result)}<ul class="astro-XZ6IHXAZ">
    <li class="astro-XZ6IHXAZ">
      <a${addAttribute(project.url, "href")} class="astro-XZ6IHXAZ">
        <u class="astro-XZ6IHXAZ">
          ${" "}
          <h5 class="astro-XZ6IHXAZ">${project.name}</h5>
        </u>
      </a>
      <p class="astro-XZ6IHXAZ">${project.description}</p>
    </li>
  </ul>`)}

`;
});

const $$file$6 = "/Users/rishavthakur/projects/rishavt.dev/src/components/ProjectList.astro";
const $$url$6 = undefined;

const $$module4$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$6,
  default: $$ProjectList,
  file: $$file$6,
  url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$5 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/Footer.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/Footer.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$Footer = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$Footer;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<footer class=" astro-EVEE5UU6">
  <article class="astro-EVEE5UU6">&copy;2022 by Rishav Thakur. All rights reserved.</article>
</footer>

`;
});

const $$file$5 = "/Users/rishavthakur/projects/rishavt.dev/src/components/Footer.astro";
const $$url$5 = undefined;

const $$module5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$5,
  default: $$Footer,
  file: $$file$5,
  url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/Contact.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/Contact.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$Contact = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Contact;
  return renderTemplate`${maybeRenderHead($$result)}<div>
  <p>
    <a href="https://twitter.com/st_tronn"> Twitter </a>
  </p> 
  <p>
    <a href="https://github.com/StTronn"> Github </a>
  </p>
</div>`;
});

const $$file$4 = "/Users/rishavthakur/projects/rishavt.dev/src/components/Contact.astro";
const $$url$4 = undefined;

const $$module6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$4,
  default: $$Contact,
  file: $$file$4,
  url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/pages/index.astro", { modules: [{ module: $$module2$1, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module3$1, specifier: "../components/BlogHeader.astro", assert: {} }, { module: $$module3, specifier: "../components/BlogPostPreview.astro", assert: {} }, { module: $$module4$1, specifier: "../components/ProjectList.astro", assert: {} }, { module: $$module5, specifier: "../components/Footer.astro", assert: {} }, { module: $$module6, specifier: "../components/Contact.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/pages/index.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Index;
  const title = "Rishav Thakur";
  const description = "A fool who wanders a lot";
  const permalink = "";
  let allPosts = Astro2.fetchContent("./posts/*.md");
  allPosts = allPosts.sort(
    (a, b) => new Date(b.publishDate).valueOf() - new Date(a.publishDate).valueOf()
  );
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`<html class="theme-dark astro-5KVGQIIK" lang="en">
  <head>
    ${renderComponent($$result, "BaseHead", $$BaseHead, { "title": title, "description": description, "permalink": permalink, "class": "astro-5KVGQIIK" })}
    <link rel="stylesheet" href="/blog.css">

    
  ${renderHead($$result)}</head>

  <body class="astro-5KVGQIIK">
    ${renderComponent($$result, "BlogHeader", $$BlogHeader, { "class": "astro-5KVGQIIK" })}
    <div class="layout astro-5KVGQIIK">
      <main class="content astro-5KVGQIIK">
        <section class="section astro-5KVGQIIK">
          <h5 class="astro-5KVGQIIK">About Me</h5>
          <p class="intro astro-5KVGQIIK">
            Learning by doing.<br class="astro-5KVGQIIK"> Currently exploring micropayments & blockchain. <br class="astro-5KVGQIIK"> Learning guitar as I go. 
          </p>
        </section>
        <section aria-label="Blog post list" class="astro-5KVGQIIK">
          <h5 class="section-title astro-5KVGQIIK">Blogs</h5>
          ${allPosts.map((p) => renderTemplate`${renderComponent($$result, "BlogPostPreview", $$BlogPostPreview, { "post": p, "class": "astro-5KVGQIIK" })}`)}
        </section>
        <section class="section astro-5KVGQIIK" aria-label="Project list">
          <h5 class="section-title astro-5KVGQIIK">Projects</h5>
          ${renderComponent($$result, "ProjectList", $$ProjectList, { "class": "astro-5KVGQIIK" })}
        </section>
      </main>
    </div>
    ${renderComponent($$result, "Contact", $$Contact, { "class": "astro-5KVGQIIK" })}
    ${renderComponent($$result, "Footer", $$Footer, { "class": "astro-5KVGQIIK" })}
  </body></html>`;
});

const $$file$3 = "/Users/rishavthakur/projects/rishavt.dev/src/pages/index.astro";
const $$url$3 = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$3,
  default: $$Index,
  file: $$file$3,
  url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/Author.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/Author.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$Author = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Author;
  const { name, href } = Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<div class="author astro-VQ2T4ITF">
  <p class="astro-VQ2T4ITF"><a${addAttribute(href, "href")} class="astro-VQ2T4ITF">${name}</a></p>
</div>

`;
});

const $$file$2 = "/Users/rishavthakur/projects/rishavt.dev/src/components/Author.astro";
const $$url$2 = undefined;

const $$module1$3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$2,
  default: $$Author,
  file: $$file$2,
  url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/BlogPost.astro", { modules: [{ module: $$module1$3, specifier: "./Author.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/components/BlogPost.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$BlogPost$1 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$BlogPost$1;
  const { title, publishDate, heroImage, alt } = Astro2.props;
  const STYLES = [];
  for (const STYLE of STYLES)
    $$result.styles.add(STYLE);
  return renderTemplate`${maybeRenderHead($$result)}<p class=" astro-OAUD7HVP">
  </p><article class="content astro-OAUD7HVP">
      <header class="astro-OAUD7HVP">
        ${heroImage && renderTemplate`<img width="620" height="420" class="hero-image astro-OAUD7HVP" loading="lazy"${addAttribute(heroImage, "src")}${addAttribute(alt, "alt")}>`}
        <p class="publish-date astro-OAUD7HVP">${publishDate}</p>
        <h1 class="title astro-OAUD7HVP">${title}</h1>
        <!-- <Author name="@rishav__t" href="https://twitter.com/st_tronn" /> -->
      </header>
      <main class="astro-OAUD7HVP">
        ${renderSlot($$result, $$slots["default"])}
      </main>
  </article>


`;
});

const $$file$1 = "/Users/rishavthakur/projects/rishavt.dev/src/components/BlogPost.astro";
const $$url$1 = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata: $$metadata$1,
  default: $$BlogPost$1,
  file: $$file$1,
  url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

// Caches Promise<Highligher> for reuse when the same theme and langs are provided
const _resolvedHighlighters = new Map();

function stringify(opts) {
	// Always sort keys before stringifying to make sure objects match regardless of parameter ordering
	return JSON.stringify(opts, Object.keys(opts).sort());
}

function getHighlighter(opts) {
	const key = stringify(opts);

	// Highlighter has already been requested, reuse the same instance
	if (_resolvedHighlighters.has(key)) {
		return _resolvedHighlighters.get(key);
	}

	// Start the async getHighlighter call and cache the Promise
	const highlighter = getHighlighter$1(opts);
	_resolvedHighlighters.set(key, highlighter);

	return highlighter;
}

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  getHighlighter
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/node_modules/astro/components/Code.astro", { modules: [{ module: $$module1$2, specifier: "./Shiki.js", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/node_modules/astro/components/Code.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$Code = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Code;
  const { code, lang = "plaintext", theme = "github-dark", wrap = false } = Astro2.props;
  function repairShikiTheme(html2) {
    html2 = html2.replace('<pre class="shiki"', '<pre class="astro-code"');
    html2 = html2.replace(
      /style="(background-)?color: var\(--shiki-/g,
      'style="$1color: var(--astro-code-'
    );
    if (wrap === false) {
      html2 = html2.replace(/style="(.*?)"/, 'style="$1; overflow-x: auto;"');
    } else if (wrap === true) {
      html2 = html2.replace(
        /style="(.*?)"/,
        'style="$1; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;"'
      );
    }
    return html2;
  }
  const highlighter = await getHighlighter({
    theme,
    langs: typeof lang !== "string" ? [lang] : void 0
  });
  const _html = highlighter.codeToHtml(code, { lang: typeof lang === "string" ? lang : lang.id });
  const html = repairShikiTheme(_html);
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": () => renderTemplate`${markHTMLString(html)}` })}
`;
});

const $$file = "/Users/rishavthakur/projects/rishavt.dev/node_modules/astro/components/Code.astro";
const $$url = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  $$metadata,
  default: $$Code,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/node_modules/astro/components/Debug.astro", { modules: [{ module: $$module1$1, specifier: "./Code.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/node_modules/astro/components/Debug.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$Debug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Debug;
  const key = Object.keys(Astro2.props)[0];
  const value = Astro2.props[key];
  return renderTemplate`${maybeRenderHead($$result)}<div class="astro-debug">
	<div class="astro-debug-header">
		<h2 class="astro-debug-title">
			<span class="astro-debug-label">Debug</span>
			<span class="astro-debug-name">"${key}"</span>
		</h2>
	</div>

	${renderComponent($$result, "Code", $$Code, { "code": JSON.stringify(value, null, 2) })}
</div>

<style>
	.astro-debug {
		font-size: 14px;
		padding: 1rem 1.5rem;
		background: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
	}

	.astro-debug-header,
	pre.astro-code {
		margin: -1rem -1.5rem 1rem;
		padding: 0.25rem 0.75rem;
	}

	.astro-debug-header {
		background: #ff1639;
		border-radius: 4px;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	.astro-debug-title {
		font-size: 1em;
		color: white;
		margin: 0.5em 0;
	}

	.astro-debug-label {
		font-weight: bold;
		text-transform: uppercase;
		margin-right: 0.75em;
	}

	pre.astro-code {
		border: 1px solid #eee;
		padding: 1rem 0.75rem;
		border-radius: 4px;
		border-top-left-radius: 0;
		border-top-right-radius: 0;
		font-size: 14px;
	}
</style>`;
});

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  Code: $$Code,
  Debug: $$Debug
}, Symbol.toStringTag, { value: 'Module' }));

createMetadata("/@fs/Users/rishavthakur/projects/rishavt.dev/src/layouts/BlogPost.astro", { modules: [{ module: $$module1, specifier: "astro/components", assert: {} }, { module: $$module2$1, specifier: "../components/BaseHead.astro", assert: {} }, { module: $$module3$1, specifier: "../components/BlogHeader.astro", assert: {} }, { module: $$module4, specifier: "../components/BlogPost.astro", assert: {} }, { module: $$module5, specifier: "../components/Footer.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/Users/rishavthakur/projects/rishavt.dev/src/layouts/BlogPost.astro", "", "file:///Users/rishavthakur/projects/rishavt.dev/");
const $$BlogPost = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { content } = Astro2.props;
  const { title, description, publishDate, author, heroImage, permalink, alt } = content;
  return renderTemplate`<html class="theme-dark"${addAttribute(content.lang || "en", "lang")}>
  <head>
    ${renderComponent($$result, "BaseHead", $$BaseHead, { "title": title, "description": description, "permalink": permalink })}
    <link rel="stylesheet" href="/blog.css">
  ${renderHead($$result)}</head>

  <body>
    <!-- <div> -->
    ${renderComponent($$result, "BlogHeader", $$BlogHeader, {})}
    ${renderComponent($$result, "BlogPost", $$BlogPost$1, { "title": title, "author": author, "heroImage": heroImage, "publishDate": publishDate, "alt": alt }, { "default": () => renderTemplate`${renderSlot($$result, $$slots["default"])}` })}
    ${renderComponent($$result, "Footer", $$Footer, {})}
  <!-- </div> -->
  </body></html>`;
});

const html = "<h1 id=\"merkle-tree\">Merkle Tree</h1>\n<p>A Merkle Tree is something to be scared of.</p>\n<h2 id=\"h2\">h2</h2>\n<h3 id=\"tertiary-topic\">tertiary topic</h3>\n<p>lorem ispum and writing things that matter</p>";

				const frontmatter = {"title":"Understanding Merkle tree in blockchain","description":"Implementing your own merkle tree","publishDate":"Tuesday, Sep 27 2022","author":"Rishav Thakur","heroImage":"/hero.jpg","alt":"Blog Image","layout":"../../layouts/BlogPost.astro","url":"/posts/merkleTree","file":"/Users/rishavthakur/projects/rishavt.dev/src/pages/posts/merkleTree.md"};
				const file = "/Users/rishavthakur/projects/rishavt.dev/src/pages/posts/merkleTree.md";
				const url = "/posts/merkleTree";
				function rawContent() {
					return "\n# Merkle Tree\nA Merkle Tree is something to be scared of.\n## h2\n### tertiary topic\nlorem ispum and writing things that matter";
				}
				function compiledContent() {
					return html;
				}
				function getHeadings() {
					return [{"depth":1,"slug":"merkle-tree","text":"Merkle Tree"},{"depth":2,"slug":"h2","text":"h2"},{"depth":3,"slug":"tertiary-topic","text":"tertiary topic"}];
				}
				function getHeaders() {
					console.warn('getHeaders() have been deprecated. Use getHeadings() function instead.');
					return getHeadings();
				}				async function Content() {
					const { layout, ...content } = frontmatter;
					content.astro = {};
					Object.defineProperty(content.astro, 'headings', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "headings" from your layout, try using "Astro.props.headings."')
						}
					});
					Object.defineProperty(content.astro, 'html', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "html" from your layout, try using "Astro.props.compiledContent()."')
						}
					});
					Object.defineProperty(content.astro, 'source', {
						get() {
							throw new Error('The "astro" property is no longer supported! To access "source" from your layout, try using "Astro.props.rawContent()."')
						}
					});
					const contentFragment = createVNode(Fragment, { 'set:html': html });
					return createVNode($$BlogPost, {
									content,
									frontmatter: content,
									headings: getHeadings(),
									rawContent,
									compiledContent,
									'server:root': true,
									children: contentFragment
								});
				}

const _page1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  frontmatter,
  file,
  url,
  rawContent,
  compiledContent,
  getHeadings,
  getHeaders,
  Content,
  default: Content
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['src/pages/index.astro', _page0],['src/pages/posts/merkleTree.md', _page1],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  const trailing = addTrailingSlash !== "never" && segments.length ? "/" : "";
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":["assets/posts-merkleTree-index.eeebe493.css","assets/index.3021cd25.css"],"scripts":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":["assets/posts-merkleTree-index.eeebe493.css","assets/posts-merkleTree.e467b910.css"],"scripts":[],"routeData":{"route":"/posts/merkletree","type":"page","pattern":"^\\/posts\\/merkleTree\\/?$","segments":[[{"content":"posts","dynamic":false,"spread":false}],[{"content":"merkleTree","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/posts/merkleTree.md","pathname":"/posts/merkleTree","_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/index.3021cd25.css","/assets/posts-merkleTree.e467b910.css","/assets/posts-merkleTree-index.eeebe493.css","/blog.css","/assets/blog/introducing-astro.jpg","/assets/fonts/JosefinSans-VariableFont_wght.ttf","/assets/fonts/josefin-sans-latin-variable-wghtOnly-normal.woff2"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = undefined;

const _exports = adapter.createExports(_manifest, _args);
const _default = _exports['default'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { _default as default };
