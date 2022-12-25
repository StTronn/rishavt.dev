(function(){"use strict";try{if(typeof document!="undefined"){var n=document.createElement("style");n.appendChild(document.createTextNode(`p {
  margin:0;
  padding:0;
}

h1 {
  margin:0;
  padding:0;
}

h2 {
  margin:0;
  padding:0;
}

h3 {
  margin:0;
  padding:0;
}

h4 {
  margin:0;
  padding:0;
}
button, input[type="submit"], input[type="reset"] {
  display:inline-block;
	background: none;
	color: inherit;
	border: none;
	padding: 0;
	font: inherit;
	cursor: pointer;
	outline: inherit;
}

.popup {
    position:fixed;
    z-index:2;
    right: 0;
    left: 0;
    top: 0;
    bottom:0;
    margin-top:auto;
    margin-bottom:auto;
    margin-right: auto;
    margin-left: auto;
    /* give it dimensions */
    height:100vh;
    display:grid;
    place-items:center;
    width: -moz-fit-content;
    width: fit-content;
}

.popup-backdrop {
    -webkit-text-size-adjust: 100%;
    font-feature-settings: normal;
    border: 0 solid #e5e7eb;
    box-sizing: border-box;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: -1;
    background-color: rgb(17 24 39/0.5);
}

.unlock-screen-section{
  width:-moz-fit-content;
  width:fit-content;
  display: flex; 
  padding: 0.5rem; 
  background-color: #ffffff; 
  flex-direction: column; 
  justify-content: center; 
  border-radius: 0.375rem; 
  -webkit-user-select: none; 
     -moz-user-select: none; 
          user-select: none; 
  gap: 1.25rem; 
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 

  @media (min-width: 640px) { 
    padding: 1rem; 
   }
}

.unlock-screen-div-wrapper {
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.unlock-screen-img-wrapper{
  display: flex; 
  justify-self: start; 
  align-items: center; 
}

.unlock-screen-img-class{
  display: inline; 
  -o-object-fit: cover; 
     object-fit: cover; 
  margin-right: 0.5rem; 
  width: 2rem; 
  height: 2rem; 
  border-radius: 9999px; 
}

.unlock-screen-user-info {
  color: #4B5563; 
  font-size: 0.75rem;
  line-height: 1rem; 
  font-weight: 500; 
}

.unlock-screen-buttton-hover:hover{
 cursor: pointer; 
}

.unlock-screen-detail-section-wrapper{
  background: url('https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1592&q=80');
  background-color: grey;
  background-blend-mode: multiply;
  display: block; 
  overflow: hidden; 
  position: relative; 
  background-position: center; 
  background-repeat: no-repeat; 
  background-size: cover; 
  width: 20rem; 
  height: 11rem; 
  border-radius: 0.75rem; 
}

.unlock-screen-detail-section {
  position: relative; 
  padding: 1rem; 
  padding-top: 1rem; 
  --bg-opacity: 0.4; 
  color: #ffffff; 
  height: 11rem; 
}

.unlock-screen-merchant-name {
  font-size: 1.5rem;
  line-height: 2rem; 
  font-weight: 700; 
}

.unlock-screen-merchant-title {
  font-size: 0.875rem;
  line-height: 1.25rem; 
  font-weight: 700; 
}

.unlock-screen-merchant-desc {
  margin-top: 0.25rem; 
  font-size: 0.75rem;
  line-height: 1rem;
}

.unlock-screen-profile-img {
  display: inline; 
  -o-object-fit: cover; 
     object-fit: cover; 
  position: absolute; 
  top: 1rem; 
  right: 1rem; 
  z-index: 10; 
  margin-right: 0.5rem; 
  width: 2rem; 
  height: 2rem; 
  border-radius: 9999px; 
}

.unlock-screen-amount {
  position: absolute; 
  bottom: 0.5rem; 
  right: 1.5rem; 
  z-index: 10; 
  color: #ffffff; 
  font-size: 1.5rem;
  line-height: 2rem; 
  font-weight: 700; 
}

.unlock-screen-button {
  display: inline-flex; 
  padding-top: 0.5rem;
  padding-bottom: 0.5rem; 
  padding-left: 1rem;
  padding-right: 1rem; 
  background-color: #4F46E5; 
  color: #ffffff; 
  font-size: 0.875rem;
  line-height: 1.25rem; 
  font-weight: 500; 
  justify-content: space-between; 
  align-items: center; 
  border-radius: 0.375rem; 
  border-width: 1px; 
  border-color: transparent; 
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
}

.unlock-screen-button:hover {
  cursor:pointer;
  background-color: #4338CA; 
}

.payment-screen-section {
  width:-moz-fit-content;
  width:fit-content;
  padding: 0.5rem; 
  background-color: #ffffff; 
  border-radius: 0.375rem; 
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); 
}

.payment-button-class-wrapper{
  position:relative;
}

.payment-button-class {
  position: absolute; 
  top: 1rem; 
  right: 1rem; 
}

.payment-button-class:hover {
     cursor: pointer; 
}

.payment-main-button-class{
  display: inline-flex; 
  padding-top: 0.5rem;
  padding-bottom: 0.5rem; 
  padding-left: 1rem;
  padding-right: 1rem; 
  background-color: #4F46E5; 
  color: #ffffff; 
  font-size: 0.875rem;
  line-height: 1.25rem; 
  font-weight: 500; 
  justify-content: center; 
  width: 100%; 
  border-radius: 0.375rem; 
  border-width: 1px; 
  border-color: transparent; 
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
}

.payment-main-button-class:hover {
   background-color: #4338CA; 
}

.flex {
    display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
    flex-wrap: wrap;
}

@media (min-width: 1024px){
  .lg:mt-0 {
      margin-top: 0px;
  }
}
.w-80 {
    width: 20rem;
}

.mt-4{
  margin-top: 1rem; 
}
.mt-6 {
  margin-top: 1.5rem;
}
.mb-2{
  margin-bottom: 0.5rem; 
}
.mx-auto {
    margin-left: auto;
    margin-right: auto;
}

.p-4 {
  padding: 1rem; 
}



.text-xs{
  font-size: 0.75rem;
  line-height: 1rem; 
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem; 
}

.text-xl{
  font-size: 1.25rem;
  line-height: 1.75rem; 
}

.text-2xl{
  font-size: 1.5rem;
  line-height: 2rem; 
}

.font-semibold {
  font-weight:600;
}

.font-bold {
  font-weight: 700; 
}

.tracking-widest {
  letter-spacing: 0.1em; 
}

.text-gray-300 {
  color: #D1D5DB; 
}

.text-gray-500 {
color: #6B7280; 
}


.text-gray-700{
  color: #374151; 
}

.text-gray-900{
  color: #111827; 
}
.bg-white {
  background-color: #ffffff; 
}

.w-fit {
  width: -moz-fit-content;
  width: fit-content;
}

.relative {
  position: relative; 
}

.overflow-hidden{
  overflow: hidden; 
} 

.text-right {
  text-align:right;
}

.underline{
  text-decoration: underline;
}`)),document.head.appendChild(n)}}catch(e){console.error("vite-plugin-css-injected-by-js",e)}})();
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerpolicy)
      fetchOpts.referrerPolicy = script.referrerpolicy;
    if (script.crossorigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (script.crossorigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const app = "";
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function is_function(thing) {
  return typeof thing === "function";
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
  if (!src_url_equal_anchor) {
    src_url_equal_anchor = document.createElement("a");
  }
  src_url_equal_anchor.href = url;
  return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function append(target, node) {
  target.appendChild(node);
}
function insert(target, node, anchor) {
  target.insertBefore(node, anchor || null);
}
function detach(node) {
  node.parentNode.removeChild(node);
}
function element(name) {
  return document.createElement(name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function empty() {
  return text("");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
  if (value == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value)
    node.setAttribute(attribute, value);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onMount(fn) {
  get_current_component().$$.on_mount.push(fn);
}
const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  const saved_component = current_component;
  do {
    while (flushidx < dirty_components.length) {
      const component = dirty_components[flushidx];
      flushidx++;
      set_current_component(component);
      update(component.$$);
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length)
      binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
const outroing = /* @__PURE__ */ new Set();
let outros;
function group_outros() {
  outros = {
    r: 0,
    c: [],
    p: outros
  };
}
function check_outros() {
  if (!outros.r) {
    run_all(outros.c);
  }
  outros = outros.p;
}
function transition_in(block, local) {
  if (block && block.i) {
    outroing.delete(block);
    block.i(local);
  }
}
function transition_out(block, local, detach2, callback) {
  if (block && block.o) {
    if (outroing.has(block))
      return;
    outroing.add(block);
    outros.c.push(() => {
      outroing.delete(block);
      if (callback) {
        if (detach2)
          block.d(1);
        callback();
      }
    });
    block.o(local);
  } else if (callback) {
    callback();
  }
}
function create_component(block) {
  block && block.c();
}
function mount_component(component, target, anchor, customElement) {
  const { fragment, after_update } = component.$$;
  fragment && fragment.m(target, anchor);
  if (!customElement) {
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
  }
  after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
  const $$ = component.$$;
  if ($$.fragment !== null) {
    run_all($$.on_destroy);
    $$.fragment && $$.fragment.d(detaching);
    $$.on_destroy = $$.fragment = null;
    $$.ctx = [];
  }
}
function make_dirty(component, i) {
  if (component.$$.dirty[0] === -1) {
    dirty_components.push(component);
    schedule_update();
    component.$$.dirty.fill(0);
  }
  component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
}
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
  const parent_component = current_component;
  set_current_component(component);
  const $$ = component.$$ = {
    fragment: null,
    ctx: [],
    props,
    update: noop,
    not_equal,
    bound: blank_object(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
    callbacks: blank_object(),
    dirty,
    skip_bound: false,
    root: options.target || parent_component.$$.root
  };
  append_styles && append_styles($$.root);
  let ready = false;
  $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
    const value = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value);
      if (ready)
        make_dirty(component, i);
    }
    return ret;
  }) : [];
  $$.update();
  ready = true;
  run_all($$.before_update);
  $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
  if (options.target) {
    if (options.hydrate) {
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
  $destroy() {
    destroy_component(this, 1);
    this.$destroy = noop;
  }
  $on(type, callback) {
    if (!is_function(callback)) {
      return noop;
    }
    const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
    callbacks.push(callback);
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1)
        callbacks.splice(index, 1);
    };
  }
  $set($$props) {
    if (this.$$set && !is_empty($$props)) {
      this.$$.skip_bound = true;
      this.$$set($$props);
      this.$$.skip_bound = false;
    }
  }
}
function create_else_block(ctx) {
  let section;
  let div0;
  let button0;
  let t0;
  let div5;
  let div4;
  let div3;
  let div1;
  let t2;
  let h10;
  let t4;
  let h11;
  let t6;
  let p;
  let t8;
  let div2;
  let button1;
  let t10;
  let button2;
  let t12;
  let div6;
  let mounted;
  let dispose;
  return {
    c() {
      section = element("section");
      div0 = element("div");
      button0 = element("button");
      button0.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M6.062 15 5 13.938 8.938 10 5 6.062 6.062 5 10 8.938 13.938 5 15 6.062 11.062 10 15 13.938 13.938 15 10 11.062Z"></path></svg>`;
      t0 = space();
      div5 = element("div");
      div4 = element("div");
      div3 = element("div");
      div1 = element("div");
      div1.textContent = "RishavT";
      t2 = space();
      h10 = element("h1");
      h10.textContent = "This article is paid";
      t4 = space();
      h11 = element("h1");
      h11.textContent = "\u20B9100";
      t6 = space();
      p = element("p");
      p.textContent = "An experimental article talking about better monetisation for digital content.";
      t8 = space();
      div2 = element("div");
      button1 = element("button");
      button1.textContent = "Unlock with cartl";
      t10 = space();
      button2 = element("button");
      button2.textContent = "pay now";
      t12 = space();
      div6 = element("div");
      attr(button0, "class", "payment-button-class");
      attr(div0, "class", "payment-button-class-wrapper");
      attr(div1, "class", "text-sm text-gray-500 tracking-widest");
      attr(h10, "class", "text-gray-900 text-2xl font-semibold");
      attr(h11, "class", "text-gray-700 font-bold text-xl mb-2");
      attr(p, "class", "text-gray-500 text-sm");
      attr(button1, "class", "payment-main-button-class");
      attr(button2, "class", "underline text-sm");
      attr(div2, "class", "flex flex-col text-center mt-4");
      attr(div3, "class", "w-80 lg:mt-0");
      attr(div4, "class", "flex flex-wrap");
      attr(div5, "class", "p-4 mx-auto");
      attr(div6, "class", "popup-backdrop");
      attr(section, "class", "payment-screen-section");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, div0);
      append(div0, button0);
      append(section, t0);
      append(section, div5);
      append(div5, div4);
      append(div4, div3);
      append(div3, div1);
      append(div3, t2);
      append(div3, h10);
      append(div3, t4);
      append(div3, h11);
      append(div3, t6);
      append(div3, p);
      append(div3, t8);
      append(div3, div2);
      append(div2, button1);
      append(div2, t10);
      append(div2, button2);
      append(section, t12);
      append(section, div6);
      if (!mounted) {
        dispose = [
          listen(button0, "click", function() {
            if (is_function(ctx[0]))
              ctx[0].apply(this, arguments);
          }),
          listen(button1, "click", ctx[6]),
          listen(button2, "click", function() {
            if (is_function(ctx[2]))
              ctx[2].apply(this, arguments);
          })
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d(detaching) {
      if (detaching)
        detach(section);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$1(ctx) {
  let section;
  let div2;
  let div1;
  let t4;
  let button;
  let t5;
  let a;
  let div4;
  let t11;
  let img1;
  let img1_src_value;
  let t12;
  let div5;
  let t14;
  let div10;
  let t20;
  let div11;
  let mounted;
  let dispose;
  return {
    c() {
      var _a;
      section = element("section");
      div2 = element("div");
      div1 = element("div");
      div1.innerHTML = `<img class="unlock-screen-img-class" src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1592&amp;q=80" alt="Profile image"/> 
        <div class=""><p class="unlock-screen-user-info">John Doe</p> 
          <p class="unlock-screen-user-info">johndoe@gmail.com</p></div>`;
      t4 = space();
      button = element("button");
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20"><path d="M6.062 15 5 13.938 8.938 10 5 6.062 6.062 5 10 8.938 13.938 5 15 6.062 11.062 10 15 13.938 13.938 15 10 11.062Z"></path></svg>`;
      t5 = space();
      a = element("a");
      div4 = element("div");
      div4.innerHTML = `<div class="unlock-screen-merchant-name">Rishavt</div> 
        <p class="unlock-screen-merchant-title">This article is paid</p> 
        <p class="unlock-screen-merchant-desc">monetisation for web</p>`;
      t11 = space();
      img1 = element("img");
      t12 = space();
      div5 = element("div");
      div5.textContent = "\u20B9100";
      t14 = space();
      div10 = element("div");
      div10.innerHTML = `<div class="text-base font-bold">Confirm</div> 
          <div><div class="text-xs ">Paying: \u20B9100</div> 
            <div class="text-xs text-gray-300 text-right">Balance: \u20B9120</div></div>`;
      t20 = space();
      div11 = element("div");
      attr(div1, "class", "unlock-screen-img-wrapper");
      attr(button, "class", "unlock-screen-buttton-hover");
      attr(div2, "class", "unlock-screen-div-wrapper");
      attr(div4, "class", "unlock-screen-detail-section");
      attr(img1, "class", "unlock-screen-profile-img");
      if (!src_url_equal(img1.src, img1_src_value = ((_a = ctx[1]) == null ? void 0 : _a.display_picture) || "https://cartl.club/avatar.png"))
        attr(img1, "src", img1_src_value);
      attr(img1, "alt", "Profile image");
      attr(div5, "class", "unlock-screen-amount ");
      attr(a, "href", "#");
      attr(a, "class", "unlock-screen-detail-section-wrapper");
      attr(div10, "class", "unlock-screen-button");
      attr(div11, "class", "popup-backdrop");
      attr(section, "class", "unlock-screen-section");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, div2);
      append(div2, div1);
      append(div2, t4);
      append(div2, button);
      append(section, t5);
      append(section, a);
      append(a, div4);
      append(a, t11);
      append(a, img1);
      append(a, t12);
      append(a, div5);
      append(section, t14);
      append(section, div10);
      append(section, t20);
      append(section, div11);
      if (!mounted) {
        dispose = [
          listen(button, "click", ctx[5]),
          listen(div10, "click", function() {
            if (is_function(ctx[0]))
              ctx[0].apply(this, arguments);
          })
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      var _a;
      ctx = new_ctx;
      if (dirty & 2 && !src_url_equal(img1.src, img1_src_value = ((_a = ctx[1]) == null ? void 0 : _a.display_picture) || "https://cartl.club/avatar.png")) {
        attr(img1, "src", img1_src_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(section);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$2(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (ctx2[3])
      return create_if_block$1;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, [dirty]) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let { handleClose } = $$props;
  let { merchantDetail } = $$props;
  let { contentDetail } = $$props;
  let { handlePayment } = $$props;
  let unlockScreenShow = false;
  const click_handler = () => $$invalidate(3, unlockScreenShow = false);
  const click_handler_1 = () => $$invalidate(3, unlockScreenShow = true);
  $$self.$$set = ($$props2) => {
    if ("handleClose" in $$props2)
      $$invalidate(0, handleClose = $$props2.handleClose);
    if ("merchantDetail" in $$props2)
      $$invalidate(1, merchantDetail = $$props2.merchantDetail);
    if ("contentDetail" in $$props2)
      $$invalidate(4, contentDetail = $$props2.contentDetail);
    if ("handlePayment" in $$props2)
      $$invalidate(2, handlePayment = $$props2.handlePayment);
  };
  return [
    handleClose,
    merchantDetail,
    handlePayment,
    unlockScreenShow,
    contentDetail,
    click_handler,
    click_handler_1
  ];
}
class PaymentPopup extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {
      handleClose: 0,
      merchantDetail: 1,
      contentDetail: 4,
      handlePayment: 2
    });
  }
}
function create_if_block(ctx) {
  let div;
  let paymentpopup;
  let current;
  paymentpopup = new PaymentPopup({
    props: {
      handleClose: ctx[4],
      merchantDetail: ctx[2],
      contentDetail: ctx[1],
      handlePayment: ctx[3]
    }
  });
  return {
    c() {
      div = element("div");
      create_component(paymentpopup.$$.fragment);
      attr(div, "class", "popup");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(paymentpopup, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const paymentpopup_changes = {};
      if (dirty & 4)
        paymentpopup_changes.merchantDetail = ctx2[2];
      if (dirty & 2)
        paymentpopup_changes.contentDetail = ctx2[1];
      paymentpopup.$set(paymentpopup_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(paymentpopup.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(paymentpopup.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(paymentpopup);
    }
  };
}
function create_fragment$1(ctx) {
  let if_block_anchor;
  let current;
  let if_block = ctx[0] && create_if_block(ctx);
  return {
    c() {
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block)
        if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
const API_BASE_URL = "https://api.cartl.club/";
const BUTTON_DATA_ATTR = "data-cartl-payment-button";
function instance$1($$self, $$props, $$invalidate) {
  var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  let showPopup = false;
  let contentDetail = null;
  let orderId = null;
  let amount = 0;
  let merchantDetail = null;
  const getAllPaymentButtons = () => {
    return document.querySelectorAll(`[${BUTTON_DATA_ATTR}]`);
  };
  const attachEventListner = () => {
    getAllPaymentButtons().forEach((button) => {
      button.addEventListener("click", onClickPaymentButton);
    });
  };
  const onClickPaymentButton = (e) => __awaiter(void 0, void 0, void 0, function* () {
    let activeContentId = e.target.getAttribute(BUTTON_DATA_ATTR);
    try {
      $$invalidate(1, contentDetail = yield getContent(activeContentId));
      $$invalidate(2, merchantDetail = yield getMerchantDetails(contentDetail.m_id));
      console.log({ merchantDetail, contentDetail });
    } catch (e2) {
      console.error(e2);
    }
    $$invalidate(0, showPopup = true);
  });
  const getContent = (contentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
      const response = yield fetch(API_BASE_URL + `v1/contents/${contentId}`);
      const data = yield response.json();
      return data;
    } catch (error) {
      console.log({ error });
    }
  });
  const getMerchantDetails = (merchantId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
      const response = yield fetch(API_BASE_URL + `v1/merchants/${merchantId}`);
      const data = yield response.json();
      return data;
    } catch (error) {
      console.log({ error });
    }
  });
  const onPaymentCompleteHandler = (response) => {
  };
  const handlePayment = (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    if (contentDetail.price) {
      amount = contentDetail.price * 100;
      const response = yield fetch("https://api.cartl.club/v1/payments/orders", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(contentDetail.price * 100)
        }),
        headers: { "content-type": "Application/JSON" }
      });
      const paymentData = yield response.json();
      if ((paymentData === null || paymentData === void 0 ? void 0 : paymentData.status) === "created") {
        orderId = paymentData.id;
        console.log(merchantDetail);
        var options = {
          key: "rzp_test_uw7GowrKEaKUQB",
          amount,
          currency: "INR",
          name: (merchantDetail === null || merchantDetail === void 0 ? void 0 : merchantDetail.first_name) || "cartl",
          description: (merchantDetail === null || merchantDetail === void 0 ? void 0 : merchantDetail.about) || "",
          image: "https://example.com/your_logo",
          order_id: orderId,
          handler: onPaymentCompleteHandler,
          theme: { color: "#3399cc" }
        };
        var rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function(response2) {
          console.error(response2);
        });
        rzp1.open();
      }
    }
  });
  const handleClose = () => {
    console.log("handleClose");
    $$invalidate(0, showPopup = false);
  };
  onMount(() => {
    attachEventListner();
  });
  return [showPopup, contentDetail, merchantDetail, handlePayment, handleClose];
}
class Payment_script extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
}
function create_fragment(ctx) {
  let div;
  let paymentscript;
  let current;
  paymentscript = new Payment_script({});
  return {
    c() {
      div = element("div");
      create_component(paymentscript.$$.fragment);
      attr(div, "class", "wrapper-card");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(paymentscript, div, null);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(paymentscript.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(paymentscript.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(paymentscript);
    }
  };
}
function instance($$self) {
  return [];
}
class App extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
const cartlDiv = document.createElement("div");
cartlDiv.setAttribute("id", "cartl-sdk");
document.body.appendChild(cartlDiv);
new App({
  target: cartlDiv
});
