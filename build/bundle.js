
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
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
        flushing = false;
        seen_callbacks.clear();
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
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
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
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
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
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const deviceSelectorPopupSubject = writable(false);
    const userInfoSubject = writable();
    const criticalErrorSubject = writable('');

    /* src\components\CriticalToast.svelte generated by Svelte v3.31.0 */

    const file = "src\\components\\CriticalToast.svelte";

    function create_fragment(ctx) {
    	let div;
    	let span;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			add_location(span, file, 21, 2, 342);
    			attr_dev(div, "class", "critical-toast svelte-13x9d4n");
    			toggle_class(div, "show", /*show*/ ctx[0]);
    			add_location(div, file, 20, 0, 299);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (dirty & /*show*/ 1) {
    				toggle_class(div, "show", /*show*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CriticalToast", slots, ['default']);
    	let { show = false } = $$props;
    	const writable_props = ["show"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CriticalToast> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ show });

    	$$self.$inject_state = $$props => {
    		if ("show" in $$props) $$invalidate(0, show = $$props.show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [show, $$scope, slots];
    }

    class CriticalToast extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { show: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CriticalToast",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get show() {
    		throw new Error("<CriticalToast>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<CriticalToast>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\CriticalToastContainer.svelte generated by Svelte v3.31.0 */
    const file$1 = "src\\components\\CriticalToastContainer.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (53:4) <CriticalToast show={error.status === 'visible'}>
    function create_default_slot(ctx) {
    	let t_value = /*error*/ ctx[3].text + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errors*/ 1 && t_value !== (t_value = /*error*/ ctx[3].text + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(53:4) <CriticalToast show={error.status === 'visible'}>",
    		ctx
    	});

    	return block;
    }

    // (52:2) {#each errors as error}
    function create_each_block(ctx) {
    	let criticaltoast;
    	let current;

    	criticaltoast = new CriticalToast({
    			props: {
    				show: /*error*/ ctx[3].status === "visible",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(criticaltoast.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(criticaltoast, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const criticaltoast_changes = {};
    			if (dirty & /*errors*/ 1) criticaltoast_changes.show = /*error*/ ctx[3].status === "visible";

    			if (dirty & /*$$scope, errors*/ 65) {
    				criticaltoast_changes.$$scope = { dirty, ctx };
    			}

    			criticaltoast.$set(criticaltoast_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(criticaltoast.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(criticaltoast.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(criticaltoast, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(52:2) {#each errors as error}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*errors*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "critical-container svelte-vvip71");
    			add_location(div, file$1, 50, 0, 976);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*errors*/ 1) {
    				each_value = /*errors*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CriticalToastContainer", slots, []);
    	let errors = [];

    	const _onErrorOccured = er => {
    		if (!er) {
    			return;
    		}

    		$$invalidate(0, errors = [...errors, { text: er, status: "visible" }]);

    		setTimeout(
    			() => {
    				$$invalidate(0, errors = errors.map(e => {
    					if (e.text === er) {
    						return { text: er, status: "hidden" };
    					}

    					return e;
    				}));
    			},
    			3500
    		);

    		setTimeout(
    			() => {
    				_unshiftError();
    				criticalErrorSubject.set("");
    			},
    			4000
    		);
    	};

    	const _unshiftError = () => {
    		errors.shift();
    		$$invalidate(0, errors);
    	};

    	criticalErrorSubject.subscribe(_onErrorOccured);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CriticalToastContainer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		criticalErrorSubject,
    		CriticalToast,
    		errors,
    		_onErrorOccured,
    		_unshiftError
    	});

    	$$self.$inject_state = $$props => {
    		if ("errors" in $$props) $$invalidate(0, errors = $$props.errors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [errors];
    }

    class CriticalToastContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CriticalToastContainer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const copy = (text) => {
      navigator.clipboard.writeText(text);
    };

    /* src\components\Button.svelte generated by Svelte v3.31.0 */
    const file$2 = "src\\components\\Button.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let button_levels = [/*$$props*/ ctx[2], { type: /*type*/ ctx[0] }];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "svelte-fp4ngz", true);
    			add_location(button, file$2, 31, 0, 577);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				dirty & /*$$props*/ 4 && /*$$props*/ ctx[2],
    				(!current || dirty & /*type*/ 1) && { type: /*type*/ ctx[0] }
    			]));

    			toggle_class(button, "svelte-fp4ngz", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { type = "button" } = $$props;
    	const dispatch = createEventDispatcher();

    	function handleClick() {
    		dispatch("onClick");
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("$$scope" in $$new_props) $$invalidate(3, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		type,
    		dispatch,
    		handleClick
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(2, $$props = assign(assign({}, $$props), $$new_props));
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [type, handleClick, $$props, $$scope, slots];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { type: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const mediaStreamErrorMsg = (exception) => {
      switch (exception) {
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          return 'Target media device is not found or it is unplugged.';

        case 'NotReadableError':
        case 'TrackStartError':
          return 'Your camera may be used by another app.';

        case 'NotAllowedError':
        case 'PermissionDeniedError':
          return 'Your browser denies capturing video from your camera.';

        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          return 'Something went wrong with constraints.';

        default:
          return 'Something went wrong.';
      }
    };

    /* src\components\Spinner.svelte generated by Svelte v3.31.0 */

    const file$3 = "src\\components\\Spinner.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let div2_levels = [/*$$props*/ ctx[0], { class: "lds-ripple" }];
    	let div2_data = {};

    	for (let i = 0; i < div2_levels.length; i += 1) {
    		div2_data = assign(div2_data, div2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "svelte-1qnhu31");
    			add_location(div0, file$3, 39, 2, 713);
    			attr_dev(div1, "class", "svelte-1qnhu31");
    			add_location(div1, file$3, 40, 2, 724);
    			set_attributes(div2, div2_data);
    			toggle_class(div2, "svelte-1qnhu31", true);
    			add_location(div2, file$3, 38, 0, 672);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, [dirty]) {
    			set_attributes(div2, div2_data = get_spread_update(div2_levels, [dirty & /*$$props*/ 1 && /*$$props*/ ctx[0], { class: "lds-ripple" }]));
    			toggle_class(div2, "svelte-1qnhu31", true);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Spinner", slots, []);

    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const isMobile = () => {
      return window.innerWidth < 600;
    };

    const getUserMedia = (constraintsObj = { video: true, audio: true }) => {
      return navigator.mediaDevices.getUserMedia(constraintsObj);
    };

    const getDisplayMedia = () => {
      return navigator.mediaDevices.getDisplayMedia({audio: true, video: true});
    };

    const getMediaDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const cameras = filterByKind(devices, 'videoinput');
      const microphones = filterByKind(devices, 'audioinput');
      const speakers = filterByKind(devices, 'audiooutput');

      return [cameras, microphones, speakers];
    };

    const generateConstraintsObject = (camera, microphone) => {
      const generateDeviceConfig = (device) => {
        if (device) {
          return {
            deviceId: {
              exact: device.deviceId,
            },
          };
        }

        return true;
      };

      return {
        video: generateDeviceConfig(camera),
        audio: generateDeviceConfig(microphone),
      };
    };

    const filterByKind = (devices, kind) => {
      return devices.filter((device) => device.kind === kind);
    };

    const devicesToken = () => '__devices_token';
    const userToken = () => '__user_token';

    const saveDevices = (o) => {
      localStorage.setItem(devicesToken(), JSON.stringify(o));
    };

    const fetchDevices = () => {
      const rawDeviceData = localStorage.getItem(devicesToken());
      const devices = JSON.parse(rawDeviceData);

      return devices;
    };

    const saveUserDetails = (data) => {
      localStorage.setItem(userToken(), JSON.stringify(data));
    };

    const fetchUserDetails = () => {
      const raw = localStorage.getItem(userToken());

      if (raw) {
        return JSON.parse(raw);
      }

      return null;
    };

    /* src\components\Select.svelte generated by Svelte v3.31.0 */
    const file$4 = "src\\components\\Select.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (32:0) {#if items.length > 0}
    function create_if_block(ctx) {
    	let div;
    	let h4;
    	let t0;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h4, file$4, 33, 2, 550);
    			attr_dev(select, "class", "svelte-n5zgal");
    			add_location(select, file$4, 35, 2, 613);
    			attr_dev(div, "class", "svelte-n5zgal");
    			add_location(div, file$4, 32, 1, 541);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*handleChange*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (dirty & /*items, key, defaultValue, value*/ 29) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(32:0) {#if items.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (37:3) {#each items as item}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[7][/*value*/ ctx[3]] + "";
    	let t;
    	let option_selected_value;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.selected = option_selected_value = /*item*/ ctx[7][/*key*/ ctx[2]] === /*defaultValue*/ ctx[4];
    			option.__value = option_value_value = /*item*/ ctx[7][/*key*/ ctx[2]];
    			option.value = option.__value;
    			add_location(option, file$4, 37, 4, 678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*items, value*/ 9 && t_value !== (t_value = /*item*/ ctx[7][/*value*/ ctx[3]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*items, key, defaultValue*/ 21 && option_selected_value !== (option_selected_value = /*item*/ ctx[7][/*key*/ ctx[2]] === /*defaultValue*/ ctx[4])) {
    				prop_dev(option, "selected", option_selected_value);
    			}

    			if (dirty & /*items, key*/ 5 && option_value_value !== (option_value_value = /*item*/ ctx[7][/*key*/ ctx[2]])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(37:3) {#each items as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*items*/ ctx[0].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*items*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, []);
    	const dispatch = createEventDispatcher();
    	let { items = [] } = $$props;
    	let { title = "<label of select>" } = $$props;
    	let { key } = $$props;
    	let { value } = $$props;
    	let { defaultValue } = $$props;

    	function handleChange(e) {
    		dispatch("onSelect", e.target.value);
    	}

    	const writable_props = ["items", "title", "key", "value", "defaultValue"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("key" in $$props) $$invalidate(2, key = $$props.key);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("defaultValue" in $$props) $$invalidate(4, defaultValue = $$props.defaultValue);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		items,
    		title,
    		key,
    		value,
    		defaultValue,
    		handleChange
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(0, items = $$props.items);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("key" in $$props) $$invalidate(2, key = $$props.key);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("defaultValue" in $$props) $$invalidate(4, defaultValue = $$props.defaultValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [items, title, key, value, defaultValue, handleChange];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			items: 0,
    			title: 1,
    			key: 2,
    			value: 3,
    			defaultValue: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[2] === undefined && !("key" in props)) {
    			console.warn("<Select> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[3] === undefined && !("value" in props)) {
    			console.warn("<Select> was created without expected prop 'value'");
    		}

    		if (/*defaultValue*/ ctx[4] === undefined && !("defaultValue" in props)) {
    			console.warn("<Select> was created without expected prop 'defaultValue'");
    		}
    	}

    	get items() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultValue() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultValue(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\DeviceSettingsModal.svelte generated by Svelte v3.31.0 */
    const file$5 = "src\\components\\DeviceSettingsModal.svelte";

    // (261:4) {#if !stream}
    function create_if_block_1(ctx) {
    	let div;
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(spinner.$$.fragment);
    			attr_dev(div, "class", "spinner-wrap svelte-14miyum");
    			add_location(div, file$5, 261, 6, 7303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(spinner, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(spinner);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(261:4) {#if !stream}",
    		ctx
    	});

    	return block;
    }

    // (285:4) {#if !isMobile()}
    function create_if_block$1(ctx) {
    	let select;
    	let current;

    	select = new Select({
    			props: {
    				defaultValue: /*selectedSpeaker*/ ctx[6]?.deviceId,
    				key: "deviceId",
    				value: "label",
    				title: "Default speaker",
    				items: distinct(/*speakers*/ ctx[3])
    			},
    			$$inline: true
    		});

    	select.$on("onSelect", /*onSpeakerSelect*/ ctx[9]);

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*selectedSpeaker*/ 64) select_changes.defaultValue = /*selectedSpeaker*/ ctx[6]?.deviceId;
    			if (dirty & /*speakers*/ 8) select_changes.items = distinct(/*speakers*/ ctx[3]);
    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(285:4) {#if !isMobile()}",
    		ctx
    	});

    	return block;
    }

    // (295:4) <Button on:onClick={onSaveButtonClick}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Save");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(295:4) <Button on:onClick={onSaveButtonClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let div1;
    	let t0;
    	let div0;
    	let video_1;
    	let t1;
    	let select0;
    	let t2;
    	let select1;
    	let t3;
    	let show_if = !isMobile();
    	let t4;
    	let button;
    	let current;
    	let if_block0 = !/*stream*/ ctx[0] && create_if_block_1(ctx);

    	select0 = new Select({
    			props: {
    				defaultValue: /*selectedCamera*/ ctx[4]?.deviceId,
    				key: "deviceId",
    				value: "label",
    				title: "Default camera",
    				items: distinct(/*cameras*/ ctx[1])
    			},
    			$$inline: true
    		});

    	select0.$on("onSelect", /*onCameraSelect*/ ctx[7]);

    	select1 = new Select({
    			props: {
    				defaultValue: /*selectedMicrophone*/ ctx[5]?.deviceId,
    				key: "deviceId",
    				value: "label",
    				title: "Default microphone",
    				items: distinct(/*microphones*/ ctx[2])
    			},
    			$$inline: true
    		});

    	select1.$on("onSelect", /*onMicrophoneSelect*/ ctx[8]);
    	let if_block1 = show_if && create_if_block$1(ctx);

    	button = new Button({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("onClick", /*onSaveButtonClick*/ ctx[10]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			video_1 = element("video");
    			t1 = space();
    			create_component(select0.$$.fragment);
    			t2 = space();
    			create_component(select1.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			t4 = space();
    			create_component(button.$$.fragment);
    			video_1.playsInline = true;
    			video_1.autoplay = true;
    			video_1.muted = true;
    			attr_dev(video_1, "id", "video");
    			attr_dev(video_1, "class", "svelte-14miyum");
    			add_location(video_1, file$5, 266, 33, 7412);
    			attr_dev(div0, "class", "video-container svelte-14miyum");
    			add_location(div0, file$5, 266, 4, 7383);
    			attr_dev(div1, "class", "main-modal svelte-14miyum");
    			add_location(div1, file$5, 259, 2, 7252);
    			attr_dev(div2, "class", "main-modal-wrap svelte-14miyum");
    			add_location(div2, file$5, 258, 0, 7219);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, video_1);
    			append_dev(div1, t1);
    			mount_component(select0, div1, null);
    			append_dev(div1, t2);
    			mount_component(select1, div1, null);
    			append_dev(div1, t3);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t4);
    			mount_component(button, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*stream*/ ctx[0]) {
    				if (if_block0) {
    					if (dirty & /*stream*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const select0_changes = {};
    			if (dirty & /*selectedCamera*/ 16) select0_changes.defaultValue = /*selectedCamera*/ ctx[4]?.deviceId;
    			if (dirty & /*cameras*/ 2) select0_changes.items = distinct(/*cameras*/ ctx[1]);
    			select0.$set(select0_changes);
    			const select1_changes = {};
    			if (dirty & /*selectedMicrophone*/ 32) select1_changes.defaultValue = /*selectedMicrophone*/ ctx[5]?.deviceId;
    			if (dirty & /*microphones*/ 4) select1_changes.items = distinct(/*microphones*/ ctx[2]);
    			select1.$set(select1_changes);
    			if (show_if) if_block1.p(ctx, dirty);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 536870912) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(select0.$$.fragment, local);
    			transition_in(select1.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(select0.$$.fragment, local);
    			transition_out(select1.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			destroy_component(select0);
    			destroy_component(select1);
    			if (if_block1) if_block1.d();
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function distinct(devices) {
    	return devices.filter(device => !["default", "communications"].includes(device.deviceId));
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DeviceSettingsModal", slots, []);
    	let stream;
    	let cameras = [], microphones = [], speakers = [];
    	let selectedCamera, selectedMicrophone, selectedSpeaker;

    	onMount(async () => {
    		try {
    			const alreadySelectedDevices = fetchDevices();

    			if (alreadySelectedDevices) {
    				$$invalidate(4, selectedCamera = alreadySelectedDevices.selectedCamera);
    				$$invalidate(5, selectedMicrophone = alreadySelectedDevices.selectedMicrophone);
    				$$invalidate(6, selectedSpeaker = alreadySelectedDevices.selectedSpeaker);
    			}

    			_subscribeOnEscapeClick();
    			_subscribeOnOutsideClick();
    			await _displayUserVideo();
    			await _initializeDeviceLists();
    			_initializeSelectedDevices();
    		} catch(er) {
    			// this could happen if camera or mic (previously selected from modal) was disconnected
    			// app tried to fetch stream from device which is unplugged
    			if (["OverconstrainedError", "ConstraintNotSatisfiedError"].includes(er.name)) {
    				// then try to fetch stream from default camera and mic
    				_onOverconstrainedErrorHandler();

    				criticalErrorSubject.update(_ => "Unable to fetch stream from previously selected devices. They might be unplugged");
    				return;
    			}

    			const msg = mediaStreamErrorMsg(er.name);
    			criticalErrorSubject.update(_ => msg);
    			deviceSelectorPopupSubject.update(_ => false);
    		}
    	});

    	const _onOverconstrainedErrorHandler = async () => {
    		$$invalidate(4, selectedCamera = null);
    		$$invalidate(5, selectedMicrophone = null);
    		await _displayUserVideo();
    		await _initializeDeviceLists();
    		_initializeSelectedDevices();

    		saveDevices({
    			selectedCamera,
    			selectedMicrophone,
    			selectedSpeaker
    		});
    	};

    	const _escapeButtonListener = e => {
    		if (e.key === "Escape") {
    			deviceSelectorPopupSubject.update(_ => false);
    		}
    	};

    	const _outsideClickListener = e => {
    		const modal = document.querySelector(".main-modal-wrap");

    		if (e.target.contains(modal)) {
    			deviceSelectorPopupSubject.update(_ => false);
    		}
    	};

    	const _subscribeOnEscapeClick = () => {
    		window.addEventListener("keydown", _escapeButtonListener);
    	};

    	const _unsubscribeOnEscapeClick = () => {
    		window.removeEventListener("keydown", _escapeButtonListener);
    	};

    	const _subscribeOnOutsideClick = () => {
    		window.addEventListener("click", _outsideClickListener);
    	};

    	const _unsubscribeOnOutsideClick = () => {
    		window.removeEventListener("click", _outsideClickListener);
    	};

    	const _displayUserVideo = async () => {
    		const videoEl = document.getElementById("video");
    		const constraints = generateConstraintsObject(selectedCamera, selectedMicrophone);
    		$$invalidate(0, stream = await getUserMedia(constraints));
    		videoEl.srcObject = stream;
    	};

    	const _initializeDeviceLists = async () => {
    		const [_cameras, _microphones, _speakers] = await getMediaDevices();
    		$$invalidate(1, cameras = _cameras);
    		$$invalidate(2, microphones = _microphones);
    		$$invalidate(3, speakers = _speakers);
    	};

    	const _initializeSelectedDevices = () => {
    		$$invalidate(4, selectedCamera = _getDefaultCamera());
    		$$invalidate(5, selectedMicrophone = _getDefaultMicrophone());
    		$$invalidate(6, selectedSpeaker = _getDefaultSpeaker(speakers));
    	};

    	const _getDefaultCamera = () => {
    		return _getDefaultDevice(cameras);
    	};

    	const _getDefaultMicrophone = () => {
    		return _getDefaultDevice(microphones);
    	};

    	const _getDefaultSpeaker = devices => {
    		const alreadySelectedDevices = fetchDevices();

    		if (alreadySelectedDevices) {
    			return selectedSpeaker;
    		}

    		const [speaker] = distinct(devices);
    		return speaker || devices[0];
    	};

    	const _getDefaultDevice = devices => {
    		const defaultSystemLabels = _getDefaultDevicesLabels();
    		const groupId = devices.find(device => defaultSystemLabels.includes(device.label))?.groupId;
    		const selectedDevice = distinct(devices).find(d => d.groupId === groupId);
    		return selectedDevice;
    	};

    	const _getDefaultDevicesLabels = () => {
    		return stream.getTracks().map(track => track.label);
    	};

    	const _findDeviceById = (devices, id) => {
    		const [device] = _filterDevicesBy(devices, "deviceId", id);
    		return device;
    	};

    	const _filterDevicesBy = (devices, prop, value) => {
    		return devices.filter(device => device[prop] === value);
    	};

    	const _stopStreamTracks = () => {
    		if (stream) {
    			stream.getTracks().map(track => track.stop());
    		}

    		$$invalidate(0, stream = null);
    		video.srcObject = null;
    	};

    	async function onCameraSelect({ detail }) {
    		try {
    			const cameraId = detail;
    			$$invalidate(4, selectedCamera = _findDeviceById(distinct(cameras), cameraId));
    			_stopStreamTracks();
    			$$invalidate(0, stream = await getUserMedia(generateConstraintsObject(selectedCamera, selectedMicrophone)));
    			video.srcObject = stream;
    		} catch(er) {
    			const msg = mediaStreamErrorMsg(er.name);
    			criticalErrorSubject.update(_ => msg);
    			deviceSelectorPopupSubject.update(_ => false);
    		}
    	}

    	function onMicrophoneSelect({ detail }) {
    		const microphoneId = detail;
    		$$invalidate(5, selectedMicrophone = _findDeviceById(distinct(microphones), microphoneId));
    	}

    	function onSpeakerSelect({ detail }) {
    		const speakerId = detail;
    		$$invalidate(6, selectedSpeaker = _findDeviceById(distinct(speakers), speakerId));
    	}

    	function onSaveButtonClick() {
    		saveDevices({
    			selectedCamera,
    			selectedMicrophone,
    			selectedSpeaker
    		});

    		deviceSelectorPopupSubject.update(_ => false);
    	}

    	onDestroy(() => {
    		_stopStreamTracks();
    		_unsubscribeOnEscapeClick();
    		_unsubscribeOnOutsideClick();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DeviceSettingsModal> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		mediaStreamErrorMsg,
    		Spinner,
    		isMobile,
    		generateConstraintsObject,
    		deviceSelectorPopupSubject,
    		criticalErrorSubject,
    		fetchDevices,
    		saveDevices,
    		Button,
    		getUserMedia,
    		getMediaDevices,
    		Select,
    		onDestroy,
    		onMount,
    		stream,
    		cameras,
    		microphones,
    		speakers,
    		selectedCamera,
    		selectedMicrophone,
    		selectedSpeaker,
    		_onOverconstrainedErrorHandler,
    		_escapeButtonListener,
    		_outsideClickListener,
    		_subscribeOnEscapeClick,
    		_unsubscribeOnEscapeClick,
    		_subscribeOnOutsideClick,
    		_unsubscribeOnOutsideClick,
    		_displayUserVideo,
    		_initializeDeviceLists,
    		_initializeSelectedDevices,
    		_getDefaultCamera,
    		_getDefaultMicrophone,
    		_getDefaultSpeaker,
    		_getDefaultDevice,
    		_getDefaultDevicesLabels,
    		_findDeviceById,
    		_filterDevicesBy,
    		_stopStreamTracks,
    		distinct,
    		onCameraSelect,
    		onMicrophoneSelect,
    		onSpeakerSelect,
    		onSaveButtonClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("stream" in $$props) $$invalidate(0, stream = $$props.stream);
    		if ("cameras" in $$props) $$invalidate(1, cameras = $$props.cameras);
    		if ("microphones" in $$props) $$invalidate(2, microphones = $$props.microphones);
    		if ("speakers" in $$props) $$invalidate(3, speakers = $$props.speakers);
    		if ("selectedCamera" in $$props) $$invalidate(4, selectedCamera = $$props.selectedCamera);
    		if ("selectedMicrophone" in $$props) $$invalidate(5, selectedMicrophone = $$props.selectedMicrophone);
    		if ("selectedSpeaker" in $$props) $$invalidate(6, selectedSpeaker = $$props.selectedSpeaker);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		stream,
    		cameras,
    		microphones,
    		speakers,
    		selectedCamera,
    		selectedMicrophone,
    		selectedSpeaker,
    		onCameraSelect,
    		onMicrophoneSelect,
    		onSpeakerSelect,
    		onSaveButtonClick
    	];
    }

    class DeviceSettingsModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DeviceSettingsModal",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const socket = io('https://calling-daniel-application.herokuapp.com/');

    const on = (event, fn) => {
      socket.on(event, fn);
    };

    const off = (event) => {
      socket.off(event);
    };

    const emit = (event, data) => {
      socket.emit(event, data);
    };

    /* src\components\Emoji.svelte generated by Svelte v3.31.0 */

    const file$6 = "src\\components\\Emoji.svelte";

    function create_fragment$6(ctx) {
    	let span;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "role", "img");
    			add_location(span, file$6, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Emoji", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Emoji> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Emoji extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Emoji",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\components\Splitter.svelte generated by Svelte v3.31.0 */

    const file$7 = "src\\components\\Splitter.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "☞☚";
    			attr_dev(span, "class", "svelte-5vsjiz");
    			add_location(span, file$7, 29, 19, 512);
    			attr_dev(div, "class", "split svelte-5vsjiz");
    			add_location(div, file$7, 29, 0, 493);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Splitter", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Splitter> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Splitter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Splitter",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\components\IncomingCall.svelte generated by Svelte v3.31.0 */
    const file$8 = "src\\components\\IncomingCall.svelte";

    function create_fragment$8(ctx) {
    	let div3;
    	let div2;
    	let h3;
    	let b;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let button0;
    	let i0;
    	let t3;
    	let div1;
    	let button1;
    	let i1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h3 = element("h3");
    			b = element("b");
    			t0 = text(/*username*/ ctx[0]);
    			t1 = text(" is calling you");
    			t2 = space();
    			div0 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			t3 = space();
    			div1 = element("div");
    			button1 = element("button");
    			i1 = element("i");
    			add_location(b, file$8, 136, 31, 2490);
    			attr_dev(h3, "class", "username-label svelte-5nlicx");
    			add_location(h3, file$8, 136, 4, 2463);
    			attr_dev(i0, "class", "fas fa-phone-volume");
    			add_location(i0, file$8, 138, 43, 2613);
    			attr_dev(button0, "class", "svelte-5nlicx");
    			add_location(button0, file$8, 138, 6, 2576);
    			attr_dev(div0, "class", "accept-call-container svelte-5nlicx");
    			add_location(div0, file$8, 137, 4, 2533);
    			attr_dev(i1, "class", "fas fa-phone");
    			add_location(i1, file$8, 140, 71, 2741);
    			attr_dev(button1, "class", "svelte-5nlicx");
    			add_location(button1, file$8, 140, 37, 2707);
    			attr_dev(div1, "class", "drop-call-container svelte-5nlicx");
    			add_location(div1, file$8, 140, 4, 2674);
    			attr_dev(div2, "class", "incoming svelte-5nlicx");
    			add_location(div2, file$8, 135, 2, 2435);
    			attr_dev(div3, "class", "incoming-wrap svelte-5nlicx");
    			add_location(div3, file$8, 134, 0, 2404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h3);
    			append_dev(h3, b);
    			append_dev(b, t0);
    			append_dev(h3, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div0, button0);
    			append_dev(button0, i0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, button1);
    			append_dev(button1, i1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleAcceptCall*/ ctx[1], false, false, false),
    					listen_dev(button1, "click", /*handleDropCall*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*username*/ 1) set_data_dev(t0, /*username*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IncomingCall", slots, []);
    	const dispatch = createEventDispatcher();
    	let { username } = $$props;

    	function handleAcceptCall() {
    		dispatch("onAccept");
    	}

    	function handleDropCall() {
    		dispatch("onDrop");
    	}

    	const writable_props = ["username"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IncomingCall> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		username,
    		handleAcceptCall,
    		handleDropCall
    	});

    	$$self.$inject_state = $$props => {
    		if ("username" in $$props) $$invalidate(0, username = $$props.username);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [username, handleAcceptCall, handleDropCall];
    }

    class IncomingCall extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { username: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IncomingCall",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*username*/ ctx[0] === undefined && !("username" in props)) {
    			console.warn("<IncomingCall> was created without expected prop 'username'");
    		}
    	}

    	get username() {
    		throw new Error("<IncomingCall>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set username(value) {
    		throw new Error("<IncomingCall>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const createLogger = (...fns) => {
      return (initial) => fns.reduce((param, func) => func(param), initial);
    };

    const rtcLog = createLogger((x) => {
      console.log(`%c👉👈 (webrtc) ${x}`, `color: #2dd713; font-weight: bold; font-size: 0.9rem; `);
      return x;
    });

    const rtcError = createLogger((x) => {
      console.log(`%c❌❌ (webrtc) ${x}`, `color: tomato; font-weight: bold; font-size: 0.9rem; `);
      return x;
    });

    const iceServers = [
      { urls: 'stun:stun.voipstunt.com' },
      {
        urls: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com',
      },
      {
        urls: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808',
      },
    ];

    const streamTypeToSocketEvents = (mode) => {
      switch (mode) {
        case 'video-call':
          return {
            offer: 'video-offer',
            answer: 'video-answer',
            iceCandidate: 'ice-candidate',
          };

        case 'screenshare':
          return {
            offer: 'video-screen-sharing-offer',
            answer: 'video-screen-sharing-answer',
            iceCandidate: 'ice-screen-sharing-candidate',
          };
        
        default: return {};
      }
    };

    const stopTracks = (stream) => {
      if (!stream) {
        return;
      }

      stream.getTracks().map((track) => track.stop());
      stream = null;
    };

    const attachStreamToVideoElement = (id, stream) => {
      const video = document.getElementById(id);

      if (video && stream) {
        video.srcObject = stream;
      }
    };

    const createPeer = () => new RTCPeerConnection({ iceServers: iceServers });

    const detachStreamFromVideoElement = (id) => {
      const video = document.getElementById(id);

      video.srcObject = null;
      video.removeAttribute('srcObject');
    };

    const addTracksToPeer = (peer, stream) => {
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    };

    const replaceTrackForPeer = (peer, stream, kind) => {
      const track = stream.getTracks().find((t) => t.kind === kind);
      const sender = peer.getSenders().find((s) => s.track.kind === kind);

      sender.replaceTrack(track);

      return track;
    };

    const closePeerConnection = (peer) => {
      if (!peer) {
        return;
      }

      peer.ontrack = null;
      peer.onremovetrack = null;
      peer.onremovestream = null;
      peer.onicecandidate = null;
      peer.oniceconnectionstatechange = null;
      peer.onsignalingstatechange = null;
      peer.onicegatheringstatechange = null;
      peer.onnegotiationneeded = null;

      peer.close();
      peer = null;
    };

    /* src\components\Call.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1, console: console_1 } = globals;

    const file$9 = "src\\components\\Call.svelte";

    // (319:6) {#if !yourVideoStream}
    function create_if_block$2(ctx) {
    	let spinner;
    	let current;

    	spinner = new Spinner({
    			props: { style: "position: absolute" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(319:6) {#if !yourVideoStream}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let video0;
    	let video0_muted_value;
    	let t0;
    	let video1;
    	let t1;
    	let t2;
    	let div1;
    	let video2;
    	let t3;
    	let div3;
    	let div2;
    	let button0;
    	let span0;
    	let t4;
    	let t5;
    	let i0;
    	let t6;
    	let button1;
    	let span1;
    	let t8;
    	let i1;
    	let t9;
    	let button2;
    	let span2;
    	let t10;
    	let t11;
    	let i2;
    	let t12;
    	let button3;
    	let span3;
    	let t13;
    	let t14;
    	let i3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = !/*yourVideoStream*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			video0 = element("video");
    			t0 = space();
    			video1 = element("video");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div1 = element("div");
    			video2 = element("video");
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button0 = element("button");
    			span0 = element("span");
    			t4 = text(/*videoTooltip*/ ctx[4]);
    			t5 = space();
    			i0 = element("i");
    			t6 = space();
    			button1 = element("button");
    			span1 = element("span");
    			span1.textContent = "End Call";
    			t8 = space();
    			i1 = element("i");
    			t9 = space();
    			button2 = element("button");
    			span2 = element("span");
    			t10 = text(/*audioTooltip*/ ctx[5]);
    			t11 = space();
    			i2 = element("i");
    			t12 = space();
    			button3 = element("button");
    			span3 = element("span");
    			t13 = text(/*shareTooltip*/ ctx[6]);
    			t14 = space();
    			i3 = element("i");
    			video0.playsInline = true;
    			attr_dev(video0, "id", "yourVideo");
    			video0.autoplay = true;
    			video0.muted = video0_muted_value = true;
    			attr_dev(video0, "class", "svelte-cm9yfc");
    			toggle_class(video0, "shadow", /*yourVideoStream*/ ctx[3]);
    			add_location(video0, file$9, 316, 6, 9707);
    			video1.playsInline = true;
    			attr_dev(video1, "id", "participantSecondaryVideo");
    			video1.autoplay = true;
    			attr_dev(video1, "class", "svelte-cm9yfc");
    			add_location(video1, file$9, 317, 6, 9805);
    			attr_dev(div0, "class", "yourVideo-container svelte-cm9yfc");
    			toggle_class(div0, "hidden", /*videoOff*/ ctx[2]);
    			add_location(div0, file$9, 315, 4, 9642);
    			video2.playsInline = true;
    			attr_dev(video2, "id", "participantPrimaryVideo");
    			video2.autoplay = true;
    			attr_dev(video2, "class", "svelte-cm9yfc");
    			add_location(video2, file$9, 323, 45, 10019);
    			attr_dev(div1, "class", "participant-video-container svelte-cm9yfc");
    			add_location(div1, file$9, 323, 4, 9978);
    			attr_dev(span0, "class", "tooltip svelte-cm9yfc");
    			add_location(span0, file$9, 328, 10, 10274);
    			attr_dev(i0, "class", "fas fa-video");
    			add_location(i0, file$9, 329, 10, 10329);
    			attr_dev(button0, "class", "action-button action-button__video svelte-cm9yfc");
    			toggle_class(button0, "mute", /*videoOff*/ ctx[2]);
    			add_location(button0, file$9, 327, 8, 10164);
    			attr_dev(span1, "class", "tooltip svelte-cm9yfc");
    			add_location(span1, file$9, 332, 10, 10469);
    			attr_dev(i1, "class", "fas fa-phone svelte-cm9yfc");
    			add_location(i1, file$9, 333, 10, 10518);
    			attr_dev(button1, "class", "action-button action-button__end-call svelte-cm9yfc");
    			add_location(button1, file$9, 331, 8, 10384);
    			attr_dev(span2, "class", "tooltip svelte-cm9yfc");
    			add_location(span2, file$9, 336, 10, 10688);
    			attr_dev(i2, "class", "fas fa-microphone-alt");
    			add_location(i2, file$9, 337, 10, 10743);
    			attr_dev(button2, "class", "action-button action-button__audio svelte-cm9yfc");
    			toggle_class(button2, "mute", /*audioOff*/ ctx[1]);
    			add_location(button2, file$9, 335, 8, 10573);
    			attr_dev(span3, "class", "tooltip svelte-cm9yfc");
    			add_location(span3, file$9, 344, 10, 10974);
    			attr_dev(i3, "class", "fas fa-desktop");
    			add_location(i3, file$9, 345, 10, 11029);
    			attr_dev(button3, "class", "action-button action-button__sharing svelte-cm9yfc");
    			toggle_class(button3, "sharing", /*youAreSharingScreen*/ ctx[0]);
    			add_location(button3, file$9, 339, 8, 10807);
    			attr_dev(div2, "class", "call-menu-actions svelte-cm9yfc");
    			add_location(div2, file$9, 326, 6, 10123);
    			attr_dev(div3, "class", "call-menu svelte-cm9yfc");
    			add_location(div3, file$9, 325, 4, 10092);
    			attr_dev(div4, "class", "incoming svelte-cm9yfc");
    			add_location(div4, file$9, 314, 2, 9614);
    			attr_dev(div5, "class", "incoming-wrap svelte-cm9yfc");
    			add_location(div5, file$9, 312, 0, 9537);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, video0);
    			append_dev(div0, t0);
    			append_dev(div0, video1);
    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, video2);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button0);
    			append_dev(button0, span0);
    			append_dev(span0, t4);
    			append_dev(button0, t5);
    			append_dev(button0, i0);
    			append_dev(div2, t6);
    			append_dev(div2, button1);
    			append_dev(button1, span1);
    			append_dev(button1, t8);
    			append_dev(button1, i1);
    			append_dev(div2, t9);
    			append_dev(div2, button2);
    			append_dev(button2, span2);
    			append_dev(span2, t10);
    			append_dev(button2, t11);
    			append_dev(button2, i2);
    			append_dev(div2, t12);
    			append_dev(div2, button3);
    			append_dev(button3, span3);
    			append_dev(span3, t13);
    			append_dev(button3, t14);
    			append_dev(button3, i3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*toggleMyVideo*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", endCall, false, false, false),
    					listen_dev(button2, "click", /*toggleMyMicrophone*/ ctx[9], false, false, false),
    					listen_dev(button3, "click", /*shareScreen*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*yourVideoStream*/ 8) {
    				toggle_class(video0, "shadow", /*yourVideoStream*/ ctx[3]);
    			}

    			if (!/*yourVideoStream*/ ctx[3]) {
    				if (if_block) {
    					if (dirty[0] & /*yourVideoStream*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty[0] & /*videoOff*/ 4) {
    				toggle_class(div0, "hidden", /*videoOff*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*videoTooltip*/ 16) set_data_dev(t4, /*videoTooltip*/ ctx[4]);

    			if (dirty[0] & /*videoOff*/ 4) {
    				toggle_class(button0, "mute", /*videoOff*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*audioTooltip*/ 32) set_data_dev(t10, /*audioTooltip*/ ctx[5]);

    			if (dirty[0] & /*audioOff*/ 2) {
    				toggle_class(button2, "mute", /*audioOff*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*shareTooltip*/ 64) set_data_dev(t13, /*shareTooltip*/ ctx[6]);

    			if (dirty[0] & /*youAreSharingScreen*/ 1) {
    				toggle_class(button3, "sharing", /*youAreSharingScreen*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function endCall() {
    	
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Call", slots, []);

    	let { uid } = $$props,
    		{ participantUid } = $$props,
    		{ username } = $$props,
    		{ initiator } = $$props;

    	let devices,
    		yourVideoStream,
    		yourScreenSharingStream,
    		peer,
    		screenSharingPeer,
    		offerInterval,
    		youAreSharingScreen = false,
    		audioOff = false,
    		videoOff = false; // {selectedCamera, selectedMicrophone, selectedSpeaker}

    	const streams = new Map();

    	const _generateConstraints = () => {
    		return generateConstraintsObject(devices?.selectedCamera, devices?.selectedMicrophone);
    	};

    	const _asOfferer = async (peer, mode = "video-call") => {
    		const { offer, answer } = streamTypeToSocketEvents(mode);

    		peer.onnegotiationneeded = async () => {
    			peer.createOffer().then(offer => {
    				return peer.setLocalDescription(offer);
    			}).then(() => {
    				// sending offer until another peer answers
    				offerInterval = setInterval(
    					() => {
    						emit(offer, {
    							initiatorUid: uid,
    							targetUid: participantUid,
    							sdp: peer.localDescription
    						});

    						rtcLog(`${offer} sent to another peer`);
    					},
    					1000
    				);
    			}).catch(_onHandshakeError);
    		};

    		_bindCommonEventListeners(peer, mode);

    		on(answer, function (data) {
    			rtcLog(`got ${answer} from another peer`);
    			clearInterval(offerInterval);
    			peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
    			off(answer);
    		});
    	};

    	const _asAnswerer = (peer, mode = "video-call") => {
    		const { offer, answer } = streamTypeToSocketEvents(mode);

    		on(offer, async data => {
    			rtcLog("received offer from another peer");

    			peer.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(() => {
    				return peer.createAnswer();
    			}).then(answer => {
    				return peer.setLocalDescription(answer);
    			}).then(() => {
    				emit(answer, {
    					initiatorUid: uid,
    					targetUid: participantUid,
    					sdp: peer.localDescription
    				});
    			}).catch(_onHandshakeError);

    			_bindCommonEventListeners(peer, mode);
    			off(offer);
    		});
    	};

    	const _onHandshakeError = er => {
    		rtcError("Something went wrong during webrtc handshaking.");
    		criticalErrorSubject.update(_ => "Something went wrong during the handshaking.");
    		criticalErrorSubject.update(_ => "Reload the page and try again.");
    		clearInterval(offerInterval);
    		console.error(er);
    	};

    	const _onRtcStreamAdded = stream => {
    		if (streams.has(stream.id)) {
    			return;
    		}

    		streams.set(stream.id, stream);

    		if (streams.size === 1) {
    			attachStreamToVideoElement("participantPrimaryVideo", stream);
    		} else if (streams.size === 2) {
    			attachStreamToVideoElement("participantSecondaryVideo", _getFirstItemOfMap(streams).value);
    			attachStreamToVideoElement("participantPrimaryVideo", stream);
    		}
    	};

    	const _getFirstItemOfMap = map => {
    		return map.values().next();
    	};

    	const _bindCommonEventListeners = (peer, mode) => {
    		const { iceCandidate } = streamTypeToSocketEvents(mode);

    		peer.ontrack = event => {
    			_onRtcStreamAdded(event.streams[0]);
    			rtcLog("tracks came from another peer");
    		};

    		peer.onicecandidate = e => {
    			if (e.candidate) {
    				emit(iceCandidate, {
    					initiatorUid: uid,
    					targetUid: participantUid,
    					candidate: e.candidate
    				});
    			}
    		};

    		on(iceCandidate, data => {
    			if (data.candidate) {
    				rtcLog(`${iceCandidate} - received`);
    				peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    			}
    		});
    	};

    	const _fetchStream = async () => {
    		return getUserMedia(_generateConstraints());
    	};

    	const _setSinkId = async (htmlElementId, speaker) => {
    		try {
    			if (!htmlElementId || !speaker) {
    				return;
    			}

    			const participantVideo = document.getElementById(htmlElementId);

    			// setSinkId is not supported on mobile (see docs)
    			if (participantVideo && speaker.deviceId && !isMobile()) {
    				await participantVideo.setSinkId(speaker.deviceId);
    			}
    		} catch(er) {
    			const msg = mediaStreamErrorMsg(er.name);
    			criticalErrorSubject.update(_ => msg);
    			criticalErrorSubject.update(_ => "Cannot play audio on the selected speaker. Default speaker is used.");

    			saveDevices({
    				selectedCamera: devices?.selectedCamera,
    				selectedMicrophone: devices?.selectedMicrophone
    			});
    		}
    	};

    	const _unsubscribeFromSocketEvents = mode => {
    		Object.values(streamTypeToSocketEvents(mode)).map(socketEvent => {
    			off(socketEvent);
    		});
    	};

    	const _startScreenSharing = async () => {
    		yourScreenSharingStream = await getDisplayMedia();
    		screenSharingPeer = createPeer();

    		emit("start-screen-sharing", {
    			initiatorUid: uid,
    			targetUid: participantUid,
    			sdp: screenSharingPeer.localDescription
    		});

    		addTracksToPeer(screenSharingPeer, yourScreenSharingStream);
    		_asOfferer(screenSharingPeer, "screenshare");
    		yourScreenSharingStream.getVideoTracks()[0].onended = _stopScreenSharing;
    		$$invalidate(0, youAreSharingScreen = true);
    	};

    	const _stopScreenSharing = () => {
    		$$invalidate(0, youAreSharingScreen = false);

    		emit("stop-screen-sharing", {
    			initiatorUid: uid,
    			targetUid: participantUid,
    			streamId: yourScreenSharingStream.id
    		});

    		closePeerConnection(screenSharingPeer);
    		_unsubscribeFromSocketEvents("screenshare");
    		stopTracks(yourScreenSharingStream);
    		yourScreenSharingStream = null;
    	};

    	onMount(async () => {
    		try {
    			devices = fetchDevices();
    			$$invalidate(3, yourVideoStream = await _fetchStream());
    			attachStreamToVideoElement("yourVideo", yourVideoStream);
    			_setSinkId("participantVideo", devices?.selectedSpeaker);
    			peer = createPeer();
    			addTracksToPeer(peer, yourVideoStream);

    			if (initiator) {
    				_asOfferer(peer, "video-call");
    			} else {
    				_asAnswerer(peer, "video-call");
    			}

    			on("participant-starts-screen-sharing", () => {
    				screenSharingPeer = createPeer();
    				_asAnswerer(screenSharingPeer, "screenshare");
    			});

    			on("participant-stops-screen-sharing", ({ streamId }) => {
    				closePeerConnection(screenSharingPeer);
    				_unsubscribeFromSocketEvents("screenshare");
    				stopTracks(streams.get(streamId));
    				streams.delete(streamId);
    				detachStreamFromVideoElement("participantSecondaryVideo");
    				attachStreamToVideoElement("participantPrimaryVideo", _getFirstItemOfMap(streams).value);
    			});
    		} catch(er) {
    			const msg = mediaStreamErrorMsg(er.name);
    			criticalErrorSubject.update(_ => msg);
    			clearInterval(offerInterval);
    		}
    	});

    	async function toggleMyVideo() {
    		$$invalidate(2, videoOff = !videoOff);

    		if (!videoOff) {
    			const newStream = await _fetchStream();
    			const track = replaceTrackForPeer(peer, newStream, "video");
    			yourVideoStream.addTrack(track);
    			attachStreamToVideoElement("yourVideo", yourVideoStream);
    		} else {
    			yourVideoStream.getVideoTracks()[0].enabled = false;

    			setTimeout(
    				() => {
    					yourVideoStream.getVideoTracks()[0].stop();
    					yourVideoStream.removeTrack(yourVideoStream.getVideoTracks()[0]);
    				},
    				150
    			);
    		} // if you remove tracks immediately after disabling track (enabled = false)
    		// your video will be freezed for another participant
    	}

    	async function shareScreen() {
    		try {
    			if (youAreSharingScreen) {
    				_stopScreenSharing();
    			} else {
    				_startScreenSharing();
    			}
    		} catch(er) {
    			if (er.name === "NotAllowedError") {
    				return criticalErrorSubject.update(_ => "You've canceled sharing screen");
    			}

    			criticalErrorSubject.update(_ => "Something went wrong during a screen sharing. Your browser may not support this feature ;(");
    			console.error(er);
    		}
    	}

    	function toggleMyMicrophone() {
    		$$invalidate(1, audioOff = !audioOff);
    		yourVideoStream.getAudioTracks()[0].enabled = !yourVideoStream.getAudioTracks()[0].enabled;
    	}

    	onDestroy(() => {
    		stopTracks(yourVideoStream);
    		stopTracks(yourScreenSharingStream);
    	});

    	const writable_props = ["uid", "participantUid", "username", "initiator"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Call> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("uid" in $$props) $$invalidate(10, uid = $$props.uid);
    		if ("participantUid" in $$props) $$invalidate(11, participantUid = $$props.participantUid);
    		if ("username" in $$props) $$invalidate(12, username = $$props.username);
    		if ("initiator" in $$props) $$invalidate(13, initiator = $$props.initiator);
    	};

    	$$self.$capture_state = () => ({
    		mediaStreamErrorMsg,
    		Spinner,
    		generateConstraintsObject,
    		getUserMedia,
    		getDisplayMedia,
    		criticalErrorSubject,
    		deviceSelectorPopupSubject,
    		onDestroy,
    		onMount,
    		fetchDevices,
    		saveDevices,
    		emit,
    		off,
    		on,
    		rtcError,
    		rtcLog,
    		isMobile,
    		streamTypeToSocketEvents,
    		closePeerConnection,
    		stopTracks,
    		replaceTrackForPeer,
    		attachStreamToVideoElement,
    		createPeer,
    		detachStreamFromVideoElement,
    		addTracksToPeer,
    		uid,
    		participantUid,
    		username,
    		initiator,
    		devices,
    		yourVideoStream,
    		yourScreenSharingStream,
    		peer,
    		screenSharingPeer,
    		offerInterval,
    		youAreSharingScreen,
    		audioOff,
    		videoOff,
    		streams,
    		_generateConstraints,
    		_asOfferer,
    		_asAnswerer,
    		_onHandshakeError,
    		_onRtcStreamAdded,
    		_getFirstItemOfMap,
    		_bindCommonEventListeners,
    		_fetchStream,
    		_setSinkId,
    		_unsubscribeFromSocketEvents,
    		_startScreenSharing,
    		_stopScreenSharing,
    		toggleMyVideo,
    		shareScreen,
    		toggleMyMicrophone,
    		endCall,
    		videoTooltip,
    		audioTooltip,
    		shareTooltip
    	});

    	$$self.$inject_state = $$props => {
    		if ("uid" in $$props) $$invalidate(10, uid = $$props.uid);
    		if ("participantUid" in $$props) $$invalidate(11, participantUid = $$props.participantUid);
    		if ("username" in $$props) $$invalidate(12, username = $$props.username);
    		if ("initiator" in $$props) $$invalidate(13, initiator = $$props.initiator);
    		if ("devices" in $$props) devices = $$props.devices;
    		if ("yourVideoStream" in $$props) $$invalidate(3, yourVideoStream = $$props.yourVideoStream);
    		if ("yourScreenSharingStream" in $$props) yourScreenSharingStream = $$props.yourScreenSharingStream;
    		if ("peer" in $$props) peer = $$props.peer;
    		if ("screenSharingPeer" in $$props) screenSharingPeer = $$props.screenSharingPeer;
    		if ("offerInterval" in $$props) offerInterval = $$props.offerInterval;
    		if ("youAreSharingScreen" in $$props) $$invalidate(0, youAreSharingScreen = $$props.youAreSharingScreen);
    		if ("audioOff" in $$props) $$invalidate(1, audioOff = $$props.audioOff);
    		if ("videoOff" in $$props) $$invalidate(2, videoOff = $$props.videoOff);
    		if ("videoTooltip" in $$props) $$invalidate(4, videoTooltip = $$props.videoTooltip);
    		if ("audioTooltip" in $$props) $$invalidate(5, audioTooltip = $$props.audioTooltip);
    		if ("shareTooltip" in $$props) $$invalidate(6, shareTooltip = $$props.shareTooltip);
    	};

    	let videoTooltip;
    	let audioTooltip;
    	let shareTooltip;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*videoOff*/ 4) {
    			 $$invalidate(4, videoTooltip = videoOff ? "Unmute Video" : "Mute Video");
    		}

    		if ($$self.$$.dirty[0] & /*audioOff*/ 2) {
    			 $$invalidate(5, audioTooltip = audioOff ? "Unmute Audio" : "Mute Audio");
    		}

    		if ($$self.$$.dirty[0] & /*youAreSharingScreen*/ 1) {
    			 $$invalidate(6, shareTooltip = youAreSharingScreen
    			? "Stop Sharing Screen"
    			: "Share Screen");
    		}
    	};

    	return [
    		youAreSharingScreen,
    		audioOff,
    		videoOff,
    		yourVideoStream,
    		videoTooltip,
    		audioTooltip,
    		shareTooltip,
    		toggleMyVideo,
    		shareScreen,
    		toggleMyMicrophone,
    		uid,
    		participantUid,
    		username,
    		initiator
    	];
    }

    class Call extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$9,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				uid: 10,
    				participantUid: 11,
    				username: 12,
    				initiator: 13
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Call",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*uid*/ ctx[10] === undefined && !("uid" in props)) {
    			console_1.warn("<Call> was created without expected prop 'uid'");
    		}

    		if (/*participantUid*/ ctx[11] === undefined && !("participantUid" in props)) {
    			console_1.warn("<Call> was created without expected prop 'participantUid'");
    		}

    		if (/*username*/ ctx[12] === undefined && !("username" in props)) {
    			console_1.warn("<Call> was created without expected prop 'username'");
    		}

    		if (/*initiator*/ ctx[13] === undefined && !("initiator" in props)) {
    			console_1.warn("<Call> was created without expected prop 'initiator'");
    		}
    	}

    	get uid() {
    		throw new Error("<Call>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uid(value) {
    		throw new Error("<Call>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get participantUid() {
    		throw new Error("<Call>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set participantUid(value) {
    		throw new Error("<Call>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get username() {
    		throw new Error("<Call>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set username(value) {
    		throw new Error("<Call>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initiator() {
    		throw new Error("<Call>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initiator(value) {
    		throw new Error("<Call>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.31.0 */
    const file$a = "src\\App.svelte";

    // (235:4) <Emoji>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("🤙");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(235:4) <Emoji>",
    		ctx
    	});

    	return block;
    }

    // (249:2) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let h30;
    	let t2;
    	let t3;
    	let span;
    	let t4;
    	let t5;
    	let h31;
    	let t7;
    	let splitter;
    	let t8;
    	let h32;
    	let t10;
    	let form;
    	let input;
    	let t11;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	splitter = new Splitter({ $$inline: true });

    	button = new Button({
    			props: {
    				type: "submit",
    				disabled: /*callButtonDisabled*/ ctx[10],
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Your identifier is";
    			t1 = space();
    			h30 = element("h3");
    			t2 = text(/*uid*/ ctx[3]);
    			t3 = space();
    			span = element("span");
    			t4 = text(/*copyText*/ ctx[4]);
    			t5 = space();
    			h31 = element("h3");
    			h31.textContent = "Send it to the one who wanna call you and you will get in touch";
    			t7 = space();
    			create_component(splitter.$$.fragment);
    			t8 = space();
    			h32 = element("h3");
    			h32.textContent = "or enter identifier shared with you below";
    			t10 = space();
    			form = element("form");
    			input = element("input");
    			t11 = space();
    			create_component(button.$$.fragment);
    			add_location(h2, file$a, 250, 6, 5871);
    			attr_dev(span, "class", "svelte-1r6i828");
    			add_location(span, file$a, 251, 34, 5934);
    			attr_dev(h30, "class", "uid-label svelte-1r6i828");
    			add_location(h30, file$a, 251, 6, 5906);
    			add_location(h31, file$a, 252, 6, 5996);
    			add_location(h32, file$a, 255, 6, 6098);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "name-input");
    			attr_dev(input, "placeholder", "XYZZ");
    			attr_dev(input, "class", "svelte-1r6i828");
    			add_location(input, file$a, 258, 8, 6217);
    			add_location(form, file$a, 257, 6, 6158);
    			attr_dev(div, "class", "uid-block svelte-1r6i828");
    			add_location(div, file$a, 249, 4, 5840);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, h30);
    			append_dev(h30, t2);
    			append_dev(h30, t3);
    			append_dev(h30, span);
    			append_dev(span, t4);
    			append_dev(div, t5);
    			append_dev(div, h31);
    			append_dev(div, t7);
    			mount_component(splitter, div, null);
    			append_dev(div, t8);
    			append_dev(div, h32);
    			append_dev(div, t10);
    			append_dev(div, form);
    			append_dev(form, input);
    			set_input_value(input, /*participantUid*/ ctx[0]);
    			append_dev(form, t11);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*handleUidClick*/ ctx[14], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[18]),
    					listen_dev(form, "submit", prevent_default(/*handleStartCall*/ ctx[13]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*uid*/ 8) set_data_dev(t2, /*uid*/ ctx[3]);
    			if (!current || dirty & /*copyText*/ 16) set_data_dev(t4, /*copyText*/ ctx[4]);

    			if (dirty & /*participantUid*/ 1 && input.value !== /*participantUid*/ ctx[0]) {
    				set_input_value(input, /*participantUid*/ ctx[0]);
    			}

    			const button_changes = {};
    			if (dirty & /*callButtonDisabled*/ 1024) button_changes.disabled = /*callButtonDisabled*/ ctx[10];

    			if (dirty & /*$$scope*/ 2097152) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(splitter.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(splitter.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(splitter);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(249:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (241:2) {#if !joined}
    function create_if_block_5(ctx) {
    	let div;
    	let h2;
    	let t1;
    	let form;
    	let input;
    	let t2;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	button = new Button({
    			props: {
    				type: "submit",
    				disabled: !/*username*/ ctx[2],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Who are you?";
    			t1 = space();
    			form = element("form");
    			input = element("input");
    			t2 = space();
    			create_component(button.$$.fragment);
    			set_style(h2, "margin", "20px");
    			add_location(h2, file$a, 242, 6, 5527);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "id", "name-input");
    			attr_dev(input, "placeholder", "What is your name, hero?");
    			attr_dev(input, "class", "svelte-1r6i828");
    			add_location(input, file$a, 244, 8, 5632);
    			add_location(form, file$a, 243, 6, 5578);
    			attr_dev(div, "class", "join-form svelte-1r6i828");
    			add_location(div, file$a, 241, 4, 5496);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(div, t1);
    			append_dev(div, form);
    			append_dev(form, input);
    			set_input_value(input, /*username*/ ctx[2]);
    			append_dev(form, t2);
    			mount_component(button, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[17]),
    					listen_dev(form, "submit", prevent_default(/*handleJoin*/ ctx[12]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 4 && input.value !== /*username*/ ctx[2]) {
    				set_input_value(input, /*username*/ ctx[2]);
    			}

    			const button_changes = {};
    			if (dirty & /*username*/ 4) button_changes.disabled = !/*username*/ ctx[2];

    			if (dirty & /*$$scope*/ 2097152) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(241:2) {#if !joined}",
    		ctx
    	});

    	return block;
    }

    // (260:8) <Button type="submit" disabled={callButtonDisabled}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Call");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(260:8) <Button type=\\\"submit\\\" disabled={callButtonDisabled}>",
    		ctx
    	});

    	return block;
    }

    // (246:8) <Button type="submit" disabled={!username}>
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Join");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(246:8) <Button type=\\\"submit\\\" disabled={!username}>",
    		ctx
    	});

    	return block;
    }

    // (265:2) {#if !callAccepted}
    function create_if_block_3(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*showDeviceSettingsPopup*/ ctx[1]) return create_if_block_4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			span = element("span");
    			if_block.c();
    			attr_dev(span, "class", "open-settings-btn svelte-1r6i828");
    			add_location(span, file$a, 265, 4, 6443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			if_block.m(span, null);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*toggleDevicesSettingsPopup*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(span, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(265:2) {#if !callAccepted}",
    		ctx
    	});

    	return block;
    }

    // (267:61) {:else}
    function create_else_block(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-cog");
    			add_location(i, file$a, 266, 68, 6583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(267:61) {:else}",
    		ctx
    	});

    	return block;
    }

    // (267:6) {#if showDeviceSettingsPopup}
    function create_if_block_4(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-times");
    			add_location(i, file$a, 266, 35, 6550);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(267:6) {#if showDeviceSettingsPopup}",
    		ctx
    	});

    	return block;
    }

    // (271:2) {#if callAccepted}
    function create_if_block_2(ctx) {
    	let call;
    	let current;

    	call = new Call({
    			props: {
    				initiator: /*initiator*/ ctx[7],
    				uid: /*uid*/ ctx[3],
    				participantUid: /*callerData*/ ctx[9].initiatorUid,
    				username: /*callerData*/ ctx[9].username
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(call.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(call, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const call_changes = {};
    			if (dirty & /*initiator*/ 128) call_changes.initiator = /*initiator*/ ctx[7];
    			if (dirty & /*uid*/ 8) call_changes.uid = /*uid*/ ctx[3];
    			if (dirty & /*callerData*/ 512) call_changes.participantUid = /*callerData*/ ctx[9].initiatorUid;
    			if (dirty & /*callerData*/ 512) call_changes.username = /*callerData*/ ctx[9].username;
    			call.$set(call_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(call.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(call.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(call, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(271:2) {#if callAccepted}",
    		ctx
    	});

    	return block;
    }

    // (277:0) {#if showDeviceSettingsPopup}
    function create_if_block_1$1(ctx) {
    	let devicesettingsmodal;
    	let current;
    	devicesettingsmodal = new DeviceSettingsModal({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(devicesettingsmodal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(devicesettingsmodal, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(devicesettingsmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(devicesettingsmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(devicesettingsmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(277:0) {#if showDeviceSettingsPopup}",
    		ctx
    	});

    	return block;
    }

    // (281:0) {#if incomingCall}
    function create_if_block$3(ctx) {
    	let incomingcall;
    	let current;

    	incomingcall = new IncomingCall({
    			props: { username: /*callerData*/ ctx[9].username },
    			$$inline: true
    		});

    	incomingcall.$on("onAccept", /*handleAcceptCall*/ ctx[15]);
    	incomingcall.$on("onDrop", /*handleDropCall*/ ctx[16]);

    	const block = {
    		c: function create() {
    			create_component(incomingcall.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(incomingcall, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const incomingcall_changes = {};
    			if (dirty & /*callerData*/ 512) incomingcall_changes.username = /*callerData*/ ctx[9].username;
    			incomingcall.$set(incomingcall_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(incomingcall.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(incomingcall.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(incomingcall, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(281:0) {#if incomingCall}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let emoji;
    	let t1;
    	let t2;
    	let splitter;
    	let t3;
    	let current_block_type_index;
    	let if_block0;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let criticaltoastcontainer;
    	let current;

    	emoji = new Emoji({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	splitter = new Splitter({ $$inline: true });
    	const if_block_creators = [create_if_block_5, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*joined*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = !/*callAccepted*/ ctx[6] && create_if_block_3(ctx);
    	let if_block2 = /*callAccepted*/ ctx[6] && create_if_block_2(ctx);
    	let if_block3 = /*showDeviceSettingsPopup*/ ctx[1] && create_if_block_1$1(ctx);
    	let if_block4 = /*incomingCall*/ ctx[8] && create_if_block$3(ctx);
    	criticaltoastcontainer = new CriticalToastContainer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("So\r\n    ");
    			create_component(emoji.$$.fragment);
    			t1 = text("\r\n    me maybe!");
    			t2 = space();
    			create_component(splitter.$$.fragment);
    			t3 = space();
    			if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			t7 = space();
    			if (if_block4) if_block4.c();
    			t8 = space();
    			create_component(criticaltoastcontainer.$$.fragment);
    			attr_dev(h1, "class", "svelte-1r6i828");
    			add_location(h1, file$a, 232, 2, 5394);
    			attr_dev(main, "class", "svelte-1r6i828");
    			add_location(main, file$a, 231, 0, 5384);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			mount_component(emoji, h1, null);
    			append_dev(h1, t1);
    			append_dev(main, t2);
    			mount_component(splitter, main, null);
    			append_dev(main, t3);
    			if_blocks[current_block_type_index].m(main, null);
    			append_dev(main, t4);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t5);
    			if (if_block2) if_block2.m(main, null);
    			insert_dev(target, t6, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t7, anchor);
    			if (if_block4) if_block4.m(target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(criticaltoastcontainer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const emoji_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				emoji_changes.$$scope = { dirty, ctx };
    			}

    			emoji.$set(emoji_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(main, t4);
    			}

    			if (!/*callAccepted*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(main, t5);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*callAccepted*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*callAccepted*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*showDeviceSettingsPopup*/ ctx[1]) {
    				if (if_block3) {
    					if (dirty & /*showDeviceSettingsPopup*/ 2) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_1$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t7.parentNode, t7);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*incomingCall*/ ctx[8]) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty & /*incomingCall*/ 256) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block$3(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(t8.parentNode, t8);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(emoji.$$.fragment, local);
    			transition_in(splitter.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(criticaltoastcontainer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(emoji.$$.fragment, local);
    			transition_out(splitter.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(criticaltoastcontainer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(emoji);
    			destroy_component(splitter);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t6);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t7);
    			if (if_block4) if_block4.d(detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(criticaltoastcontainer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAXIMUM_UID_LENGTH = 4;

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let showDeviceSettingsPopup, username, uid, participantUid;
    	let copyText = "Click to copy";
    	let joined = false, callAccepted = false, initiator = false, incomingCall = false;
    	let callerData;

    	onMount(() => {
    		const user = fetchUserDetails();
    		userInfoSubject.update(() => user);
    	});

    	const handleWelcome = data => {
    		$$invalidate(5, joined = true);
    		userInfoSubject.update(_ => data);
    		$$invalidate(3, uid = data.uid);
    		saveUserDetails(data);
    	};

    	const handleIncomingCall = data => {
    		$$invalidate(8, incomingCall = true);
    		$$invalidate(9, callerData = data);
    	};

    	on("welcome", handleWelcome);
    	on("incoming-call", handleIncomingCall);

    	on("user-is-not-joined", () => {
    		criticalErrorSubject.update(_ => "User is not joined yet or identifier is not correct.");
    	});

    	userInfoSubject.subscribe(val => $$invalidate(2, username = val?.name));

    	deviceSelectorPopupSubject.subscribe(val => {
    		$$invalidate(1, showDeviceSettingsPopup = val);
    	});

    	function toggleDevicesSettingsPopup() {
    		deviceSelectorPopupSubject.update(value => !value);
    	}

    	function handleJoin(e) {
    		emit("join", username);
    	}

    	function handleStartCall() {
    		$$invalidate(7, initiator = true);

    		emit("try-call", {
    			username,
    			targetUid: participantUid,
    			initiatorUid: uid
    		});

    		on("accept-call", data => {
    			$$invalidate(6, callAccepted = true);
    			$$invalidate(8, incomingCall = false);
    			$$invalidate(9, callerData = data);
    		});

    		on("drop-call", () => {
    			criticalErrorSubject.update(_ => "Participant has dropped the call");
    			$$invalidate(9, callerData = null);
    			$$invalidate(8, incomingCall = false);
    			$$invalidate(7, initiator = false);
    			off("accept-call");
    			off("drop-call");
    		});
    	}

    	function handleUidClick() {
    		$$invalidate(4, copyText = "Copied");
    		copy(uid);
    	}

    	function handleAcceptCall() {
    		$$invalidate(6, callAccepted = true);
    		$$invalidate(8, incomingCall = false);
    		$$invalidate(7, initiator = false);

    		emit("accept-call", {
    			username,
    			targetUid: callerData.initiatorUid,
    			initiatorUid: uid
    		});
    	}

    	function handleDropCall() {
    		emit("drop-call", {
    			username,
    			targetUid: callerData.initiatorUid,
    			initiatorUid: uid
    		});

    		$$invalidate(9, callerData = null);
    		$$invalidate(8, incomingCall = false);
    		off("accept-call");
    		off("drop-call");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		username = this.value;
    		$$invalidate(2, username);
    	}

    	function input_input_handler_1() {
    		participantUid = this.value;
    		$$invalidate(0, participantUid);
    	}

    	$$self.$capture_state = () => ({
    		CriticalToastContainer,
    		copy,
    		Button,
    		deviceSelectorPopupSubject,
    		userInfoSubject,
    		criticalErrorSubject,
    		DeviceSettingsModal,
    		on,
    		emit,
    		off,
    		fetchUserDetails,
    		saveUserDetails,
    		onMount,
    		Emoji,
    		Splitter,
    		IncomingCall,
    		Call,
    		MAXIMUM_UID_LENGTH,
    		showDeviceSettingsPopup,
    		username,
    		uid,
    		participantUid,
    		copyText,
    		joined,
    		callAccepted,
    		initiator,
    		incomingCall,
    		callerData,
    		handleWelcome,
    		handleIncomingCall,
    		toggleDevicesSettingsPopup,
    		handleJoin,
    		handleStartCall,
    		handleUidClick,
    		handleAcceptCall,
    		handleDropCall,
    		callButtonDisabled
    	});

    	$$self.$inject_state = $$props => {
    		if ("showDeviceSettingsPopup" in $$props) $$invalidate(1, showDeviceSettingsPopup = $$props.showDeviceSettingsPopup);
    		if ("username" in $$props) $$invalidate(2, username = $$props.username);
    		if ("uid" in $$props) $$invalidate(3, uid = $$props.uid);
    		if ("participantUid" in $$props) $$invalidate(0, participantUid = $$props.participantUid);
    		if ("copyText" in $$props) $$invalidate(4, copyText = $$props.copyText);
    		if ("joined" in $$props) $$invalidate(5, joined = $$props.joined);
    		if ("callAccepted" in $$props) $$invalidate(6, callAccepted = $$props.callAccepted);
    		if ("initiator" in $$props) $$invalidate(7, initiator = $$props.initiator);
    		if ("incomingCall" in $$props) $$invalidate(8, incomingCall = $$props.incomingCall);
    		if ("callerData" in $$props) $$invalidate(9, callerData = $$props.callerData);
    		if ("callButtonDisabled" in $$props) $$invalidate(10, callButtonDisabled = $$props.callButtonDisabled);
    	};

    	let callButtonDisabled;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*participantUid*/ 1) {
    			 $$invalidate(10, callButtonDisabled = !(participantUid && participantUid.length === MAXIMUM_UID_LENGTH));
    		}
    	};

    	return [
    		participantUid,
    		showDeviceSettingsPopup,
    		username,
    		uid,
    		copyText,
    		joined,
    		callAccepted,
    		initiator,
    		incomingCall,
    		callerData,
    		callButtonDisabled,
    		toggleDevicesSettingsPopup,
    		handleJoin,
    		handleStartCall,
    		handleUidClick,
    		handleAcceptCall,
    		handleDropCall,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
