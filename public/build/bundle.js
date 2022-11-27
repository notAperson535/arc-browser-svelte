
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
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
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
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
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.53.1' }, detail), { bubbles: true }));
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

    /* src/App.svelte generated by Svelte v3.53.1 */

    const { console: console_1, document: document_1, window: window_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    // (179:4) {#each pinnedtabsandiframes as pinnedtabandiframe}
    function create_each_block_3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let div_id_value;
    	let mounted;
    	let dispose;

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[19](/*pinnedtabandiframe*/ ctx[37]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			attr_dev(img, "alt", "Tab Icon");
    			if (!src_url_equal(img.src, img_src_value = "img/tabfavicon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "tabfavicon");
    			add_location(img, file, 185, 8, 5446);
    			attr_dev(div, "id", div_id_value = "tab" + /*pinnedtabandiframe*/ ctx[37]);
    			attr_dev(div, "class", "pinnedtab");
    			add_location(div, file, 179, 6, 5268);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", click_handler_2, false, false, false),
    					listen_dev(div, "keypress", void 0, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*pinnedtabsandiframes*/ 16 && div_id_value !== (div_id_value = "tab" + /*pinnedtabandiframe*/ ctx[37])) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(179:4) {#each pinnedtabsandiframes as pinnedtabandiframe}",
    		ctx
    	});

    	return block;
    }

    // (205:2) {#each tabsandiframes as tabandiframe, i (tabandiframe)}
    function create_each_block_2(key_1, ctx) {
    	let div;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div_id_value;
    	let mounted;
    	let dispose;

    	function click_handler_6() {
    		return /*click_handler_6*/ ctx[23](/*tabandiframe*/ ctx[34]);
    	}

    	function click_handler_7() {
    		return /*click_handler_7*/ ctx[24](/*tabandiframe*/ ctx[34]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			img0 = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Tab";
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			attr_dev(img0, "alt", "Tab Icon");
    			if (!src_url_equal(img0.src, img0_src_value = "img/tabfavicon.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "tabfavicon");
    			add_location(img0, file, 211, 6, 6147);
    			add_location(p, file, 212, 6, 6220);
    			attr_dev(img1, "alt", "Close tab");
    			if (!src_url_equal(img1.src, img1_src_value = "img/closetab.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "invert tabclose");
    			attr_dev(img1, "listener", "true");
    			add_location(img1, file, 213, 6, 6237);
    			attr_dev(div, "class", "tab");
    			attr_dev(div, "id", div_id_value = "tab" + /*tabandiframe*/ ctx[34]);
    			add_location(div, file, 205, 4, 5999);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img0);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(div, t2);
    			append_dev(div, img1);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img1, "click", click_handler_6, false, false, false),
    					listen_dev(img1, "keydown", void 0, false, false, false),
    					listen_dev(div, "click", click_handler_7, false, false, false),
    					listen_dev(div, "keypress", void 0, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*tabsandiframes*/ 32 && div_id_value !== (div_id_value = "tab" + /*tabandiframe*/ ctx[34])) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(205:2) {#each tabsandiframes as tabandiframe, i (tabandiframe)}",
    		ctx
    	});

    	return block;
    }

    // (253:0) {#each pinnedtabsandiframes as pinnedtabandiframe}
    function create_each_block_1(ctx) {
    	let iframe;
    	let iframe_id_value;

    	const block = {
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "id", iframe_id_value = /*pinnedtabandiframe*/ ctx[37]);
    			attr_dev(iframe, "title", "iframe");
    			add_location(iframe, file, 253, 2, 7238);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*pinnedtabsandiframes*/ 16 && iframe_id_value !== (iframe_id_value = /*pinnedtabandiframe*/ ctx[37])) {
    				attr_dev(iframe, "id", iframe_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(253:0) {#each pinnedtabsandiframes as pinnedtabandiframe}",
    		ctx
    	});

    	return block;
    }

    // (257:0) {#each tabsandiframes as tabandiframe, i (tabandiframe)}
    function create_each_block(key_1, ctx) {
    	let iframe;
    	let iframe_id_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			iframe = element("iframe");
    			attr_dev(iframe, "id", iframe_id_value = /*tabandiframe*/ ctx[34]);
    			attr_dev(iframe, "title", "iframe");
    			add_location(iframe, file, 257, 2, 7356);
    			this.first = iframe;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, iframe, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*tabsandiframes*/ 32 && iframe_id_value !== (iframe_id_value = /*tabandiframe*/ ctx[34])) {
    				attr_dev(iframe, "id", iframe_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(iframe);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(257:0) {#each tabsandiframes as tabandiframe, i (tabandiframe)}",
    		ctx
    	});

    	return block;
    }

    // (267:2) {#if dark}
    function create_if_block(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "href", "darkvars.css");
    			add_location(link, file, 267, 4, 7546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(267:2) {#if dark}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let button0;
    	let t0;
    	let button1;
    	let t1;
    	let div3;
    	let form0;
    	let input0;
    	let t2;
    	let div0;
    	let t3;
    	let div1;
    	let t4;
    	let div2;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let p;
    	let t7;
    	let each_blocks_2 = [];
    	let each1_lookup = new Map();
    	let t8;
    	let div6;
    	let div4;
    	let t9;
    	let form1;
    	let div5;
    	let img1;
    	let img1_src_value;
    	let t10;
    	let input1;
    	let t11;
    	let div7;
    	let t12;
    	let t13;
    	let each_blocks = [];
    	let each3_lookup = new Map();
    	let t14;
    	let if_block_anchor;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*pinnedtabsandiframes*/ ctx[4];
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*tabsandiframes*/ ctx[5];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*tabandiframe*/ ctx[34];
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each1_lookup.set(key, each_blocks_2[i] = create_each_block_2(key, child_ctx));
    	}

    	let each_value_1 = /*pinnedtabsandiframes*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*tabsandiframes*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*tabandiframe*/ ctx[34];
    	validate_each_keys(ctx, each_value, get_each_context, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each3_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let if_block = /*dark*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			t0 = space();
    			button1 = element("button");
    			t1 = space();
    			div3 = element("div");
    			form0 = element("form");
    			input0 = element("input");
    			t2 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t3 = space();
    			div1 = element("div");
    			t4 = space();
    			div2 = element("div");
    			img0 = element("img");
    			t5 = space();
    			p = element("p");
    			p.textContent = "New Tab";
    			t7 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t8 = space();
    			div6 = element("div");
    			div4 = element("div");
    			t9 = space();
    			form1 = element("form");
    			div5 = element("div");
    			img1 = element("img");
    			t10 = space();
    			input1 = element("input");
    			t11 = space();
    			div7 = element("div");
    			t12 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t13 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t14 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(button0, file, 169, 0, 4921);
    			add_location(button1, file, 170, 0, 4961);
    			attr_dev(input0, "placeholder", "Search or type a URL");
    			add_location(input0, file, 174, 4, 5098);
    			attr_dev(form0, "id", "urlbar");
    			add_location(form0, file, 173, 2, 5022);
    			attr_dev(div0, "id", "pinnedtabs");
    			add_location(div0, file, 177, 2, 5185);
    			attr_dev(div1, "id", "sidebarspacer");
    			add_location(div1, file, 190, 2, 5550);
    			attr_dev(img0, "alt", "new tab");
    			if (!src_url_equal(img0.src, img0_src_value = "./img/newtab.png")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file, 200, 4, 5862);
    			add_location(p, file, 201, 4, 5911);
    			attr_dev(div2, "id", "newtabbutton");
    			add_location(div2, file, 192, 2, 5580);
    			attr_dev(div3, "id", "sidebar");
    			add_location(div3, file, 172, 0, 5001);
    			attr_dev(div4, "id", "newtaburlbarbg");
    			add_location(div4, file, 226, 2, 6504);
    			if (!src_url_equal(img1.src, img1_src_value = "img/search.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Search");
    			add_location(img1, file, 241, 6, 6973);
    			attr_dev(input1, "placeholder", "Search or Enter URL...");
    			add_location(input1, file, 242, 6, 7021);
    			attr_dev(div5, "id", "newtaburlbardiv");
    			add_location(div5, file, 240, 4, 6940);
    			attr_dev(form1, "id", "newtaburlbar");
    			add_location(form1, file, 232, 2, 6659);
    			attr_dev(div6, "id", "commandpalette");
    			add_location(div6, file, 225, 0, 6476);
    			attr_dev(div7, "id", "thingbelowtheiframe");
    			add_location(div7, file, 250, 0, 7151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, form0);
    			append_dev(form0, input0);
    			set_input_value(input0, /*topsearchbarurl*/ ctx[1]);
    			append_dev(div3, t2);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div0, null);
    			}

    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, img0);
    			append_dev(div2, t5);
    			append_dev(div2, p);
    			append_dev(div3, t7);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div3, null);
    			}

    			insert_dev(target, t8, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div4);
    			append_dev(div6, t9);
    			append_dev(div6, form1);
    			append_dev(form1, div5);
    			append_dev(div5, img1);
    			append_dev(div5, t10);
    			append_dev(div5, input1);
    			set_input_value(input1, /*newtabsearchbarurl*/ ctx[2]);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div7, anchor);
    			insert_dev(target, t12, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert_dev(target, t13, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t14, anchor);
    			if (if_block) if_block.m(document_1.head, null);
    			append_dev(document_1.head, if_block_anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "load", /*load_handler*/ ctx[13], false, false, false),
    					listen_dev(window_1, "load", /*load_handler_1*/ ctx[14], false, false, false),
    					listen_dev(button0, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[16], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[17]),
    					listen_dev(form0, "submit", prevent_default(/*submit_handler*/ ctx[18]), false, true, false),
    					listen_dev(div2, "click", /*click_handler_3*/ ctx[20], false, false, false),
    					listen_dev(div2, "click", /*click_handler_4*/ ctx[21], false, false, false),
    					listen_dev(div2, "click", /*click_handler_5*/ ctx[22], false, false, false),
    					listen_dev(div2, "keypress", void 0, false, false, false),
    					listen_dev(div4, "keypress", void 0, false, false, false),
    					listen_dev(div4, "click", /*click_handler_8*/ ctx[25], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[26]),
    					listen_dev(form1, "submit", prevent_default(/*submit_handler_1*/ ctx[27]), false, true, false),
    					listen_dev(form1, "submit", /*submit_handler_2*/ ctx[28], false, false, false),
    					listen_dev(form1, "submit", /*submit_handler_3*/ ctx[29], false, false, false),
    					listen_dev(form1, "submit", /*submit_handler_4*/ ctx[30], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*topsearchbarurl*/ 2 && input0.value !== /*topsearchbarurl*/ ctx[1]) {
    				set_input_value(input0, /*topsearchbarurl*/ ctx[1]);
    			}

    			if (dirty[0] & /*pinnedtabsandiframes, openTabAndIframe*/ 272) {
    				each_value_3 = /*pinnedtabsandiframes*/ ctx[4];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty[0] & /*tabsandiframes, openTabAndIframe, closeTabAndIframe*/ 800) {
    				each_value_2 = /*tabsandiframes*/ ctx[5];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key, 1, ctx, each_value_2, each1_lookup, div3, destroy_block, create_each_block_2, null, get_each_context_2);
    			}

    			if (dirty[0] & /*newtabsearchbarurl*/ 4 && input1.value !== /*newtabsearchbarurl*/ ctx[2]) {
    				set_input_value(input1, /*newtabsearchbarurl*/ ctx[2]);
    			}

    			if (dirty[0] & /*pinnedtabsandiframes*/ 16) {
    				each_value_1 = /*pinnedtabsandiframes*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(t13.parentNode, t13);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*tabsandiframes*/ 32) {
    				each_value = /*tabsandiframes*/ ctx[5];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each3_lookup, t14.parentNode, destroy_block, create_each_block, t14, get_each_context);
    			}

    			if (/*dark*/ ctx[3]) {
    				if (if_block) ; else {
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
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_3, detaching);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t12);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t13);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(t14);
    			if (if_block) if_block.d(detaching);
    			detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
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

    function setCookie(cname, cvalue, exdays) {
    	const d = new Date();
    	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    	let expires = "expires=" + d.toUTCString();
    	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
    	let name = cname + "=";
    	let decodedCookie = decodeURIComponent(document.cookie);
    	let ca = decodedCookie.split(";");

    	for (let i = 0; i < ca.length; i++) {
    		let c = ca[i];

    		while (c.charAt(0) == " ") {
    			c = c.substring(1);
    		}

    		if (c.indexOf(name) == 0) {
    			return c.substring(name.length, c.length);
    		}
    	}

    	return "";
    }

    async function getIframeFavicon(value) {
    	if (typeof document.querySelector(".tab.active") !== "undefined" && document.querySelector(".tab.active") !== null) {
    		document.querySelector(".tab.active .tabfavicon").src = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + value;
    	} else {
    		document.querySelector(".pinnedtab.active .tabfavicon").src = "https://s2.googleusercontent.com/s2/favicons?domain_url=" + value;
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let tabsandiframes;
    	let pinnedtabsandiframes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let nextid = 4;
    	let newnextid = "";
    	var tabOrder = new Array();
    	let topsearchbarurl = "";
    	let newtabsearchbarurl = "";

    	function go(value) {
    		let iframe = document.querySelector("iframe.active");

    		window.navigator.serviceWorker.register("./sw.js", { scope: __uv$config.prefix }).then(() => {
    			let url = value.trim();
    			if (!isUrl(url)) url = "https://www.google.com/search?q=" + url; else if (!(url.startsWith("https://") || url.startsWith("http://"))) url = "https://" + url;
    			iframe.style.display = "block";
    			iframe.src = __uv$config.prefix + __uv$config.encodeUrl(url);
    			var iframeurl = iframe.src.substring(iframe.src.indexOf(__uv$config.prefix) + __uv$config.prefix.length);
    			iframeurl = __uv$config.decodeUrl(iframeurl);
    			getIframeFavicon(iframeurl);

    			if (iframeurl.includes("?q=")) {
    				iframeurl = iframeurl.substring(iframeurl.indexOf("?q=") + 3);
    			}

    			$$invalidate(1, topsearchbarurl = iframeurl);
    		});

    		function isUrl(val = "") {
    			if ((/^http(s?):\/\//).test(val) || val.includes(".") && val.substr(0, 1) !== " ") return true;
    			return false;
    		}
    	}

    	function newTabAndIframe(url) {
    		$$invalidate(0, newnextid = nextid);
    		let newtabsandiframes = [...tabsandiframes, newnextid];
    		$$invalidate(5, tabsandiframes = newtabsandiframes);
    		nextid = nextid + 1;
    	}

    	function openTabAndIframe(id) {
    		if (tabOrder.indexOf(id) > -1) {
    			tabOrder.splice(tabOrder.indexOf(id), 1);
    		}

    		tabOrder[tabOrder.length] = id;

    		if (typeof document.querySelector("iframe.active") !== "undefined" && document.querySelector("iframe.active") !== null) {
    			document.querySelector("iframe.active").style.display = "none";
    			document.querySelector("iframe.active").classList.remove("active");
    		}

    		var iframes = document.querySelectorAll("iframe");

    		iframes.forEach(elmnt => {
    			elmnt.style.display = "none";
    		});

    		var iframe = document.getElementById(id);
    		iframe.classList.add("active");
    		var url = iframe.src.substring(iframe.src.indexOf(__uv$config.prefix) + __uv$config.prefix.length);
    		url = __uv$config.decodeUrl(url);

    		if (url.includes("?q=")) {
    			url = url.substring(url.indexOf("?q=") + 3);
    		}

    		$$invalidate(1, topsearchbarurl = url);
    		var tabs = document.querySelectorAll(".tab");
    		tabs.forEach(elmnt => elmnt.className = "tab");
    		var pinnedtabs = document.querySelectorAll(".pinnedtab");
    		pinnedtabs.forEach(elmnt => elmnt.className = "pinnedtab");

    		if (iframe.src !== "") {
    			iframe.style.display = "block";
    		}

    		var tab = document.getElementById("tab" + id);
    		tab.className += " active";
    	}

    	function closeTabAndIframe(id) {
    		// var tab = document.getElementById("tab" + id);
    		// var iframe = document.getElementById(id);
    		// tab.outerHTML = "";
    		// iframe.outerHTML = "";
    		console.log(tabsandiframes.indexOf(id));

    		tabsandiframes.splice(tabsandiframes.indexOf(id), 1);
    		$$invalidate(5, tabsandiframes);
    		tabOrder.splice(tabOrder.indexOf(id), 1);
    		openTabAndIframe(tabOrder.slice(-1)[0]);
    	}

    	function generatePinnedTabsAndIfranes() {
    		$$invalidate(4, pinnedtabsandiframes = [1, 2, 3]);
    	}

    	let dark = false;
    	let colorTheme = getCookie("colorTheme");

    	if (colorTheme == "light") {
    		lightMode();
    	} else if (colorTheme == "dark") {
    		darkMode();
    	} else {
    		darkMode();
    	}

    	function lightMode() {
    		setCookie("colorTheme", "light", "365");
    		$$invalidate(3, dark = false);
    	}

    	function darkMode() {
    		setCookie("colorTheme", "dark", "365");
    		$$invalidate(3, dark = true);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const load_handler = () => generatePinnedTabsAndIfranes();
    	const load_handler_1 = () => openTabAndIframe(1);
    	const click_handler = () => lightMode();
    	const click_handler_1 = () => darkMode();

    	function input0_input_handler() {
    		topsearchbarurl = this.value;
    		$$invalidate(1, topsearchbarurl);
    	}

    	const submit_handler = () => go(topsearchbarurl);
    	const click_handler_2 = pinnedtabandiframe => openTabAndIframe(pinnedtabandiframe);
    	const click_handler_3 = () => document.querySelector("#commandpalette").style.display = "initial";
    	const click_handler_4 = () => $$invalidate(2, newtabsearchbarurl = "");
    	const click_handler_5 = () => document.querySelector("#commandpalette input").select();
    	const click_handler_6 = tabandiframe => closeTabAndIframe(tabandiframe);
    	const click_handler_7 = tabandiframe => openTabAndIframe(tabandiframe);
    	const click_handler_8 = () => document.querySelector("#commandpalette").style.display = "none";

    	function input1_input_handler() {
    		newtabsearchbarurl = this.value;
    		$$invalidate(2, newtabsearchbarurl);
    	}

    	const submit_handler_1 = () => newTabAndIframe();
    	const submit_handler_2 = () => document.querySelector("#commandpalette").style.display = "none";
    	const submit_handler_3 = () => openTabAndIframe(newnextid);
    	const submit_handler_4 = () => go(newtabsearchbarurl);

    	$$self.$capture_state = () => ({
    		setCookie,
    		getCookie,
    		nextid,
    		newnextid,
    		tabOrder,
    		topsearchbarurl,
    		newtabsearchbarurl,
    		go,
    		getIframeFavicon,
    		newTabAndIframe,
    		openTabAndIframe,
    		closeTabAndIframe,
    		generatePinnedTabsAndIfranes,
    		dark,
    		colorTheme,
    		lightMode,
    		darkMode,
    		pinnedtabsandiframes,
    		tabsandiframes
    	});

    	$$self.$inject_state = $$props => {
    		if ('nextid' in $$props) nextid = $$props.nextid;
    		if ('newnextid' in $$props) $$invalidate(0, newnextid = $$props.newnextid);
    		if ('tabOrder' in $$props) tabOrder = $$props.tabOrder;
    		if ('topsearchbarurl' in $$props) $$invalidate(1, topsearchbarurl = $$props.topsearchbarurl);
    		if ('newtabsearchbarurl' in $$props) $$invalidate(2, newtabsearchbarurl = $$props.newtabsearchbarurl);
    		if ('dark' in $$props) $$invalidate(3, dark = $$props.dark);
    		if ('colorTheme' in $$props) colorTheme = $$props.colorTheme;
    		if ('pinnedtabsandiframes' in $$props) $$invalidate(4, pinnedtabsandiframes = $$props.pinnedtabsandiframes);
    		if ('tabsandiframes' in $$props) $$invalidate(5, tabsandiframes = $$props.tabsandiframes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(5, tabsandiframes = []);
    	$$invalidate(4, pinnedtabsandiframes = []);

    	return [
    		newnextid,
    		topsearchbarurl,
    		newtabsearchbarurl,
    		dark,
    		pinnedtabsandiframes,
    		tabsandiframes,
    		go,
    		newTabAndIframe,
    		openTabAndIframe,
    		closeTabAndIframe,
    		generatePinnedTabsAndIfranes,
    		lightMode,
    		darkMode,
    		load_handler,
    		load_handler_1,
    		click_handler,
    		click_handler_1,
    		input0_input_handler,
    		submit_handler,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		input1_input_handler,
    		submit_handler_1,
    		submit_handler_2,
    		submit_handler_3,
    		submit_handler_4
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
