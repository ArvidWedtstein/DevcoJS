
const createElement = (tag, attrs, children) => {
  var element = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (key) {

      if (key == "tekst") {
        element.innerText = attrs[key];
      } else {
        element.setAttribute(key, attrs[key]);
      }
    });
  }
  if (children) {
    children.forEach(function (child) {
      element.appendChild(child);
    });
  }
  return element;
}

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Devco = factory());
}(this, function () { 'use strict';


  // ----------------------------
  // Regex Statements
  // ----------------------------
  const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
  const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/

  var DevcoNode = function DevcoNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  };

  var config = ({

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,


    /**
       * Get the namespace of an element
       */
    getTagNamespace: noop,
    /**
       * Parse the real tag name for the specific platform.
       */
    parsePlatformTagName: identity,
  });
  
  const extend = (to, _from) => {
    for (var key in _from) {
      to[key] = _from[key]
    }
    return to
  }

  function Devco (options) {
    if (!(this instanceof Devco) ) {
      return console.warn('Devco is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
  }


  function init (Devco) {
    Devco.prototype._init = function (options) {
      var vm = this;
      
      // expose real self
      vm._self = vm;
      Devco.options = Object.create(null);

      Devco.options._base = Devco;
      Devco.options.components = Object.create(null)

      extend(Devco.options.components, builtInComponents);
      initRender(vm);
    };
  }
  var no = function (a, b, c) { return false; };

  function noop (a, b, c) {}

  /**
  * Return the same value.
  */
  var identity = function (_) { return _; };


  function getComponentName (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  function matches (pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
      return pattern.test(name)
    }
    /* istanbul ignore next */
    return false
  }

  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _devconode = keepAliveInstance._devconode;
    for (var key in cache) {
      var entry = cache[key];
      if (entry) {
        var name = entry.name;
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _devconode);
        }
      }
    }
  }

  function pruneCacheEntry (
    cache,
    key,
    keys,
    current
  ) {
    var entry = cache[key];
    if (entry && (!current || entry.tag !== current.tag)) {
      entry.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
  }
  var patternTypes = [String, RegExp, Array];

  var KeepAlive = {
    name: 'keep-alive',
    abstract: true,

    props: {
      include: patternTypes,
      exclude: patternTypes,
      max: [String, Number]
    },

    methods: {
      cacheDevcoNode: function cacheDevcoNode() {
        var ref = this;
        var cache = ref.cache;
        var keys = ref.keys;
        var devcoNodeToCache = ref.devcoNodeToCache;
        var keyToCache = ref.keyToCache;
        if (devcoNodeToCache) {
          var tag = devcoNodeToCache.tag;
          var componentInstance = devcoNodeToCache.componentInstance;
          var componentOptions = devcoNodeToCache.componentOptions;
          cache[keyToCache] = {
            name: getComponentName(componentOptions),
            tag: tag,
            componentInstance: componentInstance,
          };
          keys.push(keyToCache);
          // prune oldest entry
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._devconode);
          }
          this.devcoNodeToCache = null;
        }
      }
    },

    created: function created () {
      this.cache = Object.create(null);
      this.keys = [];
    },

    destroyed: function destroyed () {
      for (var key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys);
      }
    },

    mounted: function mounted () {
      var this$1 = this;

      this.cacheDevcoNode();
      this.$watch('include', function (val) {
        pruneCache(this$1, function (name) { return matches(val, name); });
      });
      this.$watch('exclude', function (val) {
        pruneCache(this$1, function (name) { return !matches(val, name); });
      });
    },

    updated: function updated () {
      this.cacheDevcoNode();
    },

    render: function render () {
      var slot = this.$slots.default;
      var devconode = getFirstComponentChild(slot);
      var componentOptions = devconode && devconode.componentOptions;
      if (componentOptions) {
        // check pattern
        var name = getComponentName(componentOptions);
        var ref = this;
        var include = ref.include;
        var exclude = ref.exclude;
        if (
          // not included
          (include && (!name || !matches(include, name))) ||
          // excluded
          (exclude && name && matches(exclude, name))
        ) {
          return devconode
        }

        var ref$1 = this;
        var cache = ref$1.cache;
        var keys = ref$1.keys;
        var key = devconode.key == null
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : devconode.key;
        if (cache[key]) {
          devconode.componentInstance = cache[key].componentInstance;
          // make current key freshest
          remove(keys, key);
          keys.push(key);
        } else {
          // delay setting the cache until update
          this.devcoNodeToCache = devconode;
          this.keyToCache = key;
        }

        devconode.data.keepAlive = true;
      }
      return devconode || (slot && slot[0])
    }
  };

  var builtInComponents = {
    KeepAlive: KeepAlive
  };

  function initRender(vm) {
    vm._devconode = null; // the root of the child tree
    vm._staticTrees = null; // v-once cached trees
    var options = vm.$options;

    // bind the createElement fn to this instance
    // so that we get proper render context inside it.
    // args order: tag, data, children, normalizationType, alwaysNormalize
    // internal version is used by render functions compiled from templates
    vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

  }
  function isTrue (v) {
    return v === true
  }
  function isPrimitive (value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      // $flow-disable-line
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }
  function isDef (v) {
    return v !== undefined && v !== null
  }

  var createEmptyNode = function (text) {
    if ( text === void 0 ) text = '';

    var node = new DevcoNode();
    node.text = text;
    node.isComment = true;
    return node
  };


  Devco.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && query(el);

    /* istanbul ignore if */
    if (el === document.body || el === document.documentElement) {
      console.warn(
        "Do not mount Devco to <html> or <body> - mount to normal elements instead."
      );
      return this
    }

    var options = this.$options;
    // resolve template/el and convert to render function
    if (!options.render) {
      var template = options.template;
      if (template) {
        if (typeof template === 'string') {
          if (template.charAt(0) === '#') {
            template = idToTemplate(template);
            /* istanbul ignore if */
            if (!template) {
              warn(
                ("Template element not found or is empty: " + (options.template)),
                this
              );
            }
          }
        } else if (template.nodeType) {
          template = template.innerHTML;
        } else {
          {
            warn('invalid template option:' + template, this);
          }
          return this
        }
      } else if (el) {
        template = getOuterHTML(el);
      }
      if (template) {
        /* istanbul ignore if */
        if (config.performance && mark) {
          mark('compile');
        }

        var ref = compileToFunctions(template, {
          outputSourceRange: "development" !== 'production',
          shouldDecodeNewlines: shouldDecodeNewlines,
          shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments
        }, this);
        var render = ref.render;
        var staticRenderFns = ref.staticRenderFns;
        options.render = render;
        options.staticRenderFns = staticRenderFns;

        /* istanbul ignore if */
        if (config.performance && mark) {
          mark('compile end');
          measure(("devco " + (this._name) + " compile"), 'compile', 'compile end');
        }
      }
    }
    return mount.call(this, el, hydrating)
  };
  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2;

  // wrapper function for providing a more flexible interface
  // without getting yelled at by flow
  function createElement (
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
  ) {
    if (Array.isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType)
  }

  /* Function for creating a element*/
  function _createElement (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef(data) && isDef((data).__ob__)) {
      console.warn(
        "Avoid using observed data object as devconode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh devconode data objects in each render!',
        context
      );
      return createEmptyNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return createEmptyNode()
    }
    // warn against non-primitive key
    if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)
    ) {
      {
        console.warn(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    var devconode, ns;
    if (typeof tag === 'string') {
      ns = (context.$devconode && context.$devconode.ns) || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        devconode = new DevcoNode(
          config.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        devconode = new DevcoNode(
          tag, data, children,
          undefined, undefined, context
        );
      }
    }
    if (Array.isArray(devconode)) {
      return devconode
    } else if (isDef(devconode)) {
      return devconode
    } else {
      return createEmptyNode()
    }
  }

  function renderList (
    val,
    render
  ) {
      console.log('DEVCO RENDER LIST FOR ')
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      if (hasSymbol && val[Symbol.iterator]) {
        ret = [];
        var iterator = val[Symbol.iterator]();
        var result = iterator.next();
        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    }
    if (!isDef(ret)) {
      ret = [];
    }
    (ret)._isVList = true;
    return ret
  }


  // 2. When the children contains constructs that always generated nested Arrays,
  // e.g. <template>, <slot>, v-for, or when the children is provided by user
  // with hand-written render functions / JSX. In such cases a full normalization
  // is needed to cater to all possible types of children values.
  function normalizeChildren (children) {
    return isPrimitive(children)
      ? [createTextdevconode(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren(children)
        : undefined
  }
  /**
   * @description FOR LOOP
   * @param {*} children 
   * @param {*} nestedIndex 
   * @returns 
   */

  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1;
      last = res[lastIndex];
      //  nested
      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
          // merge adjacent text nodes
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextdevconode(last.text + (c[0]).text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        if (isTextNode(last)) {
          // merge adjacent text nodes
          // this is necessary for SSR hydration because text nodes are
          // essentially merged when rendered to HTML strings
          res[lastIndex] = createTextdevconode(last.text + c);
        } else if (c !== '') {
          // convert primitive to devconode
          res.push(createTextdevconode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          // merge adjacent text nodes
          res[lastIndex] = createTextdevconode(last.text + c.text);
        } else {
          // default key for nested array children (likely generated by v-for)
          if (isTrue(children._isVList) &&
            isDef(c.tag) &&
            isUndef(c.key) &&
            isDef(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }

  const rangeSetItem = (item, range) => {
    if (range) {
      if (range.start != null) {
        item.start = range.start
      }
      if (range.end != null) {
        item.end = range.end
      }
    }
    return item
  }
  const attributeList = (el) => {
    return el.getAttributeNames();
  }
  const attributeMap = (el) => {
    // get map of all attributes on element
    const attrs = el.attributes;
    const map = {};
    for (let i = 0; i < attrs.length; i++) {
      map[attrs[i].name] = attrs[i].value;
    }
    return map;
  }
  var validDivisionCharRE = /[\w).+\-_$\]]/;
  const parseFilters = (exp) => {
    var inSingle = false;
    var inDouble = false;
    var inTemplateString = false;
    var inRegex = false;
    var curly = 0;
    var square = 0;
    var paren = 0;
    var lastFilterIndex = 0;
    var c, prev, i, expression, filters;
    for (i = 0; i < exp.length; i++) {
      prev = c;
      c = exp.charCodeAt(i);
      if (inSingle) {
        if (c === 0x27 && prev !== 0x5C) inSingle = false;
      } else if (inDouble) {
        if (c === 0x22 && prev !== 0x5C) inDouble = false;
      } else if (inTemplateString) {
        if (c === 0x60 && prev !== 0x5C) inTemplateString = false;
      } else if (inRegex) {
        if (c === 0x2f && prev !== 0x5C) inRegex = false;
      } else if (
        c === 0x7C && // pipe
        exp.charCodeAt(i + 1) !== 0x7C &&
        exp.charCodeAt(i - 1) !== 0x7C &&
        !curly && !square && !paren
      ) {
        if (expression === undefined) {
          // first filter, end of expression
          lastFilterIndex = i + 1;
          expression = exp.slice(0, i).trim();
        } else {
          pushFilter();
        }
      } else {
        switch (c) {
          case 0x22: inDouble = true; break // "
          case 0x27: inSingle = true; break // '
          case 0x60: inTemplateString = true; break // `
          case 0x28: paren++; break         // (
          case 0x29: paren--; break         // )
          case 0x5B: square++; break        // [
          case 0x5D: square--; break        // ]
          case 0x7B: curly++; break         // {
          case 0x7D: curly--; break         // }
        }
        if (c === 0x2f) { // /
          var j = i - 1;
          var p = void 0;
          // find first non-whitespace prev char
          for (; j >= 0; j--) {
            p = exp.charAt(j);
            if (p !== ' ') { break }
          }
          if (!p || !validDivisionCharRE.test(p)) {
            inRegex = true;
          }
        }
      }
    }
    if (expression === undefined) {
      expression = exp.slice(0, i).trim();
    } else if (lastFilterIndex !== 0) {
      pushFilter();
    }
    function pushFilter() {
      (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
      lastFilterIndex = i + 1;
    }
    if (filters) {
      for (i = 0; i < filters.length; i++) {
        expression = wrapFilter(expression, filters[i]);
      }
    }
    return expression
  }
  const addRawAttr = ((el, name, value, range = 0) => {
    el.attrsMap[name] = value
    el.attrsList.push(rangeSetItem({name, value}, range))
  })
  const getAndRemoveAttr = (el, name, removeFromMap = false) => {
    let val;
    if ((val = el.attrsMap[name]) != null) {
      // const list = el.attrsList;
      const list = el.attrsList;
      for (let i = 0, l = list.length; i < l; i++) {
        if (list[i] === name) {
          list.splice(i, 1);
          break
        }
      }
    }
    if (removeFromMap) {
      delete el.attrsMap[name];
    }
    return val
  }

    
  function parseFor (exp) {

    var inMatch = exp.match(forAliasRE);
    if (!inMatch) { return }
    var res = {};
    res.for = inMatch[2].trim();
    var alias = inMatch[1].trim().replace(stripParensRE, '');
    var iteratorMatch = alias.match(forIteratorRE);
    if (iteratorMatch) {
      res.alias = alias.replace(forIteratorRE, '').trim();
      res.iterator1 = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        res.iterator2 = iteratorMatch[2].trim();
      }
    } else {
      res.alias = alias;
    }
    return res
  }

  function processFor (el) {
    var exp;
    if ((exp = getAndRemoveAttr(el, 'for'))) {
      var res = parseFor(exp);
      if (res) {
        extend(el, res);
      } else {
        console.warn(
          ("Invalid v-for expression: " + exp),
          el.rawAttrsMap['for']
        );
      }
    }
  }

  function genFor (
    el,
    state,
    altGen,
    altHelper
  ) {
    var exp = el.for;
    var alias = el.alias;
    var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
    var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

    el.forProcessed = true; // avoid recursion
    return (altHelper || '_l') + "((" + exp + ")," +
      "function(" + alias + iterator1 + iterator2 + "){" +
        "return " + ((altGen || genElement)(el, state)) +
      '})'
  }

  /**
   * 
   * @param {HTMLElement} el 
   * @param {string} name 
   * @param {bool} getStatic 
   * @returns 
   */
  const getBindingAttr = (el, name, getStatic) => {
    var dynamicValue = 
      getAndRemoveAttr(el, ':' + name) ||
      getAndRemoveAttr(el, 'koble:' + name);
    if (dynamicValue != null) {
      return parseFilters(dynamicValue);
    } else if (getStatic !== false) {
      var staticValue = getAndRemoveAttr(el, name);
      if (staticValue != null) {
        return JSON.stringify(staticValue);
      }
    }
  }
  const processKey = (el) => {
    var exp = getBindingAttr(el, 'key', false);
    if (exp) {
      if (el.tag === 'template') {
        console.error(
          `<template> cannot be keyed. Place the key on real elements instead.`
        );
      }
      if (el.for) {
        var iterator = el.iterator2 || el.iterator1;
        var parent = el.parent;
        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          console.error(
            `Do not use for index as key on <transition-group> children, ` +
            `this is the same as not using keys.`
          );
        }
      }
      el.key = exp;
    }
  }

  function createASTElement (
    tag,
    attrs,
    parent
  ) {
      console.log('CREATE AST ELEMENT', tag)
    return {
      type: 1,
      tag: tag,
      attrsList: attrs,
      attrsMap: makeAttrsMap(attrs),
      rawAttrsMap: {},
      parent: parent,
      children: []
    }
  }

  function parse (
    template,
    options
  ) {
    warn$2 = options.warn || baseWarn;

    platformIsPreTag = options.isPreTag || no;
    platformMustUseProp = options.mustUseProp || no;
    platformGetTagNamespace = options.getTagNamespace || no;
    var isReservedTag = options.isReservedTag || no;
    maybeComponent = function (el) { return !!(
      el.component ||
      el.attrsMap[':is'] ||
      el.attrsMap['v-bind:is'] ||
      !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag))
    ); };
    transforms = pluckModuleFunction(options.modules, 'transformNode');
    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
    postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

    delimiters = options.delimiters;

    var stack = [];
    var preserveWhitespace = options.preserveWhitespace !== false;
    var whitespaceOption = options.whitespace;
    var root;
    var currentParent;
    var inVPre = false;
    var inPre = false;
    var warned = false;

    function warnOnce (msg, range) {
      if (!warned) {
        warned = true;
        warn$2(msg, range);
      }
    }

    function closeElement (element) {
      trimEndingWhitespace(element);
      if (!inVPre && !element.processed) {
        element = processElement(element, options);
      }
      // tree management
      if (!stack.length && element !== root) {
        // allow root elements with v-if, v-else-if and v-else
        if (root.if && (element.elseif || element.else)) {
          {
            checkRootConstraints(element);
          }
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          });
        } else {
          warnOnce(
            "Component template should contain exactly one root element. " +
            "If you are using v-if on multiple elements, " +
            "use v-else-if to chain them instead.",
            { start: element.start }
          );
        }
      }
      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent);
        } else {
          if (element.slotScope) {
            // scoped slot
            // keep it in the children list so that v-else(-if) conditions can
            // find it as the prev node.
            var name = element.slotTarget || '"default"'
            ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
          }
          currentParent.children.push(element);
          element.parent = currentParent;
        }
      }

      // final children cleanup
      // filter out scoped slots
      element.children = element.children.filter(function (c) { return !(c).slotScope; });
      // remove trailing whitespace node again
      trimEndingWhitespace(element);

      // check pre state
      if (element.pre) {
        inVPre = false;
      }
      if (platformIsPreTag(element.tag)) {
        inPre = false;
      }
      // apply post-transforms
      for (var i = 0; i < postTransforms.length; i++) {
        postTransforms[i](element, options);
      }
    }

    function trimEndingWhitespace (el) {
      // remove trailing whitespace node
      if (!inPre) {
        var lastNode;
        while (
          (lastNode = el.children[el.children.length - 1]) &&
          lastNode.type === 3 &&
          lastNode.text === ' '
        ) {
          el.children.pop();
        }
      }
    }

    function checkRootConstraints (el) {
      if (el.tag === 'slot' || el.tag === 'template') {
        warnOnce(
          "Cannot use <" + (el.tag) + "> as component root element because it may " +
          'contain multiple nodes.',
          { start: el.start }
        );
      }
      if (el.attrsMap.hasOwnProperty('v-for')) {
        warnOnce(
          'Cannot use v-for on stateful component root element because ' +
          'it renders multiple elements.',
          el.rawAttrsMap['v-for']
        );
      }
    }

    parseHTML(template, {
      warn: warn$2,
      expectHTML: options.expectHTML,
      isUnaryTag: options.isUnaryTag,
      canBeLeftOpenTag: options.canBeLeftOpenTag,
      shouldDecodeNewlines: options.shouldDecodeNewlines,
      shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
      shouldKeepComment: options.comments,
      outputSourceRange: options.outputSourceRange,
      start: function start (tag, attrs, unary, start$1, end) {
        // check namespace.
        // inherit parent ns if there is one
        var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

        // handle IE svg bug
        /* istanbul ignore if */
        if (isIE && ns === 'svg') {
          attrs = guardIESVGBug(attrs);
        }

        var element = createASTElement(tag, attrs, currentParent);
        if (ns) {
          element.ns = ns;
        }

        {
          if (options.outputSourceRange) {
            element.start = start$1;
            element.end = end;
            element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
              cumulated[attr.name] = attr;
              return cumulated
            }, {});
          }
          attrs.forEach(function (attr) {
            if (invalidAttributeRE.test(attr.name)) {
              warn$2(
                "Invalid dynamic argument expression: attribute names cannot contain " +
                "spaces, quotes, <, >, / or =.",
                {
                  start: attr.start + attr.name.indexOf("["),
                  end: attr.start + attr.name.length
                }
              );
            }
          });
        }

        if (isForbiddenTag(element) && !isServerRendering()) {
          element.forbidden = true;
          warn$2(
            'Templates should only be responsible for mapping the state to the ' +
            'UI. Avoid placing tags with side-effects in your templates, such as ' +
            "<" + tag + ">" + ', as they will not be parsed.',
            { start: element.start }
          );
        }

        // apply pre-transforms
        for (var i = 0; i < preTransforms.length; i++) {
          element = preTransforms[i](element, options) || element;
        }

        if (!inVPre) {
          processPre(element);
          if (element.pre) {
            inVPre = true;
          }
        }
        if (platformIsPreTag(element.tag)) {
          inPre = true;
        }
        if (inVPre) {
          processRawAttrs(element);
        } else if (!element.processed) {
          // structural directives
          processFor(element);
          processIf(element);
          processOnce(element);
        }

        if (!root) {
          root = element;
          {
            checkRootConstraints(root);
          }
        }

        if (!unary) {
          currentParent = element;
          stack.push(element);
        } else {
          closeElement(element);
        }
      },

      end: function end (tag, start, end$1) {
        var element = stack[stack.length - 1];
        // pop stack
        stack.length -= 1;
        currentParent = stack[stack.length - 1];
        if (options.outputSourceRange) {
          element.end = end$1;
        }
        closeElement(element);
      },

      chars: function chars (text, start, end) {
        if (!currentParent) {
          {
            if (text === template) {
              warnOnce(
                'Component template requires a root element, rather than just text.',
                { start: start }
              );
            } else if ((text = text.trim())) {
              warnOnce(
                ("text \"" + text + "\" outside root element will be ignored."),
                { start: start }
              );
            }
          }
          return
        }
        // IE textarea placeholder bug
        /* istanbul ignore if */
        if (isIE &&
          currentParent.tag === 'textarea' &&
          currentParent.attrsMap.placeholder === text
        ) {
          return
        }
        var children = currentParent.children;
        if (inPre || text.trim()) {
          text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
        } else if (!children.length) {
          // remove the whitespace-only node right after an opening tag
          text = '';
        } else if (whitespaceOption) {
          if (whitespaceOption === 'condense') {
            // in condense mode, remove the whitespace node if it contains
            // line break, otherwise condense to a single space
            text = lineBreakRE.test(text) ? '' : ' ';
          } else {
            text = ' ';
          }
        } else {
          text = preserveWhitespace ? ' ' : '';
        }
        if (text) {
          if (!inPre && whitespaceOption === 'condense') {
            // condense consecutive whitespaces into single space
            text = text.replace(whitespaceRE$1, ' ');
          }
          var res;
          var child;
          if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
            child = {
              type: 2,
              expression: res.expression,
              tokens: res.tokens,
              text: text
            };
          } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
            child = {
              type: 3,
              text: text
            };
          }
          if (child) {
            if (options.outputSourceRange) {
              child.start = start;
              child.end = end;
            }
            children.push(child);
          }
        }
      },
    });
    console.log('ROOOOT', root)
    return root
  }
  function genElement (el, state) {
    if (el.parent) {
      el.pre = el.pre || el.parent.pre;
    }

    if (el.staticRoot && !el.staticProcessed) {
      return genStatic(el, state)
    } else if (el.for && !el.forProcessed) {
      return genFor(el, state)
    } else if (el.if && !el.ifProcessed) {
      return genIf(el, state)
    } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
      return genChildren(el, state) || 'void 0'
    } else if (el.tag === 'slot') {
      return genSlot(el, state)
    } else {
      // component or element
      var code;
      if (el.component) {
        code = genComponent(el.component, el, state);
      } else {
        var data;
        if (!el.plain || (el.pre && state.maybeComponent(el))) {
          data = genData$2(el, state);
        }

        var children = el.inlineTemplate ? null : genChildren(el, state, true);
        code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
      }
      // module transforms
      for (var i = 0; i < state.transforms.length; i++) {
        code = state.transforms[i](el, code);
      }
      return code
    }
  }
  function createCompileToFunctionFn (compile) {
    var cache = Object.create(null);
    return function compileToFunctions (
      template,
      options,
      vm
    ) {
      options = extend({}, options);
      var warn$$1 = options.warn || warn;
      delete options.warn;


      // check cache
      var key = options.delimiters
        ? String(options.delimiters) + template
        : template;
      if (cache[key]) {
        return cache[key]
      }

      // compile

      var compiled = compile(template, options);

      // check compilation errors/tips
      {
        if (compiled.errors && compiled.errors.length) {
          if (options.outputSourceRange) {
            compiled.errors.forEach(function (e) {
              warn$$1(
                "Error compiling template:\n\n" + (e.msg) + "\n\n" +
                generateCodeFrame(template, e.start, e.end),
                vm
              );
            });
          } else {
            warn$$1(
              "Error compiling template:\n\n" + template + "\n\n" +
              compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
              vm
            );
          }
        }
        if (compiled.tips && compiled.tips.length) {
          if (options.outputSourceRange) {
            compiled.tips.forEach(function (e) { return tip(e.msg, vm); });
          } else {
            compiled.tips.forEach(function (msg) { return tip(msg, vm); });
          }
        }
      }

      // turn code into functions
      var res = {};
      var fnGenErrors = [];
      res.render = createFunction(compiled.render, fnGenErrors);
      res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
        return createFunction(code, fnGenErrors)
      });

      return (cache[key] = res)
    }
  }
  function createCompilerCreator (baseCompile) {
    return function createCompiler (baseOptions) {
      function compile (
        template,
        options
      ) {
        var finalOptions = Object.create(baseOptions);
        var errors = [];
        var tips = [];

        var warn = function (msg, range, tip) {
          (tip ? tips : errors).push(msg);
        };

        if (options) {
          if (options.outputSourceRange) {
            // $flow-disable-line
            var leadingSpaceLength = template.match(/^\s*/)[0].length;

            warn = function (msg, range, tip) {
              var data = { msg: msg };
              if (range) {
                if (range.start != null) {
                  data.start = range.start + leadingSpaceLength;
                }
                if (range.end != null) {
                  data.end = range.end + leadingSpaceLength;
                }
              }
              (tip ? tips : errors).push(data);
            };
          }
          // merge custom modules
          if (options.modules) {
            finalOptions.modules =
              (baseOptions.modules || []).concat(options.modules);
          }
          // merge custom directives
          if (options.directives) {
            finalOptions.directives = extend(
              Object.create(baseOptions.directives || null),
              options.directives
            );
          }
          // copy other options
          for (var key in options) {
            if (key !== 'modules' && key !== 'directives') {
              finalOptions[key] = options[key];
            }
          }
        }

        finalOptions.warn = warn;
        
        var compiled = baseCompile(template.trim(), finalOptions);
        {
          detectErrors(compiled.ast, warn);
        }
        compiled.errors = errors;
        compiled.tips = tips;
        return compiled
      }

      return {
        compile: compile,
        compileToFunctions: createCompileToFunctionFn(compile)
      }
    }
  }
  function generate (
    ast,
    options
  ) {
    console.log('GENERATE')
    var state = new CodegenState(options);
    // fix #11483, Root level <script> tags should not be rendered.
    var code = ast ? (ast.tag === 'script' ? 'null' : genElement(ast, state)) : '_c("div")';
    return {
      render: ("with(this){return " + code + "}"),
      staticRenderFns: state.staticRenderFns
    }
  }

  


  // `createCompilerCreator` allows creating compilers that use alternative
  // parser/optimizer/codegen, e.g the SSR optimizing compiler.
  // Here we just export a default compiler using the default parts.
  var createCompiler = createCompilerCreator(function baseCompile (
    template,
    options
  ) {
    var ast = parse(template.trim(), options);
    
    console.log("AST",ast)
    var code = generate(ast, options);
    return {
      ast: ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
  });


  // Array.prototype.slice.call(element.querySelectorAll('[for]'))
  //   .map(function (element) {
  //   var forValue = element.getAttribute('for'); // not really needed

  //   // Create attribute lists
  //   element.attrsList = attributeList(element)
  //   element.attrsMap = attributeMap(element)
    
  
  //   // Sets Alias and For loop value to element
  //   processFor(element)

  //   // processes for loop with iterator stuff.
  //   preTransformFor(element)

  //   // processRawAttrs(element)
    
    
  //   // Get Key Attribute (:key) and remove it from the list of attributes
  //   processKey(element)
    
  //   console.log("ELEMENT", element.attrsList, element.key)


  //   if (!forHver[element.key]) {
  //     forHver[element.key] = {
  //       key: element.key,
  //       array: element.for,
  //       alias: element.alias,
  //       forValue: forValue,
  //       elements: []
  //     }
  //     forHver[element.key].elements.push(element);
  //   }
  // });   
  let baseOptions = {}
  var ref$1 = createCompiler(baseOptions);
  var compileToFunctions = ref$1.compileToFunctions;

  init(Devco)
  
  Devco.compile = compileToFunctions;

  console.log(Devco)
  return Devco;
}));


(function () {
  
    var controllers = {};
    var addController = function (name, constructor) {
      // Types
      var data = {};
      var hvis = {};
      var bindings = {};
      var forHver = {};
      class DevcoData extends HTMLElement {
        constructor() {
          // Always call super first in constructor
          super();
      
          // Create a shadow root
          var shadow = this.attachShadow({mode: 'closed'});
      
          // Insert icon
          
          var body = createElement('span', {class: "wrapper"}, []);
      
          var style = document.createElement('style');
      
          style.textContent = [
            `.wrapper {
              display: none;
            }`,
          ].join('\n');
      
          shadow.appendChild(style);
          shadow.appendChild(body);

          let jsonData = JSON.parse(this.innerHTML)
          Object.keys(jsonData).forEach(function (key) {
            if (jsonData[key] instanceof Object) {
              if ((/^(true|false)/.test(jsonData[key])) || /^[0-9]+$/.test(jsonData[key])) {
                jsonData[key] = jsonData[key].replace('"', '')
              }
            }
            if (!(key in data)) {
              data[key] = jsonData[key]
            } else {
              console.log('Duplicate key: ' + key)
            }
          });
        }
      }
      
      customElements.define("devco-data", DevcoData);

      // Store controller constructor
      controllers[name] = {
        factory: constructor,
        instances: []
      };  
  
      // Look for elements using the controller 
      var element = document.querySelector('[container]');
      if (!element) {   
        return console.error('Container');
      }
  
      // Create a new instance and save it
      var ctrl = new controllers[name].factory();
      controllers[name].instances.push(ctrl);
  
      // Get elements bound to properties
      
      Array.prototype.slice.call(element.querySelectorAll('[koble]'))
        .map(function (element) {
        var boundValue = element.getAttribute('koble');
  
        if (!bindings[boundValue]) {
          bindings[boundValue] = {
            boundValue: boundValue,
            elements: []
          }
        }
  
        bindings[boundValue].elements.push(element);
      });   


      
      Array.prototype.slice.call(element.querySelectorAll('[hvis]'))
        .map(function (element) {
        var hvisValue = element.getAttribute('hvis');
        hvisValue = hvisValue;
        if (!hvis[hvisValue]) {
          hvis[hvisValue] = {
            hvisValue: hvisValue,
            elements: []
          }
        }
        hvis[hvisValue].elements.push(element);
      });   

      // ----------------------------
      // Regex Statements
      // ----------------------------
      const forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/
      const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/

      // ----------------------------
      // For-Loop Functions
      // ----------------------------
      
      // For Loop Initialization
      // Array.prototype.slice.call(element.querySelectorAll('[for]'))
      //   .map(function (element) {
      //   var forValue = element.getAttribute('for'); // not really needed

      //   // Create attribute lists
      //   element.attrsList = attributeList(element)
      //   element.attrsMap = attributeMap(element)
        
      
      //   // Sets Alias and For loop value to element
      //   processFor(element)

      //   // processes for loop with iterator stuff.
      //   preTransformFor(element)

      //   // processRawAttrs(element)
        
        
      //   // Get Key Attribute (:key) and remove it from the list of attributes
      //   processKey(element)
        
      //   console.log("ELEMENT", element.attrsList, element.key)


      //   if (!forHver[element.key]) {
      //     forHver[element.key] = {
      //       key: element.key,
      //       array: element.for,
      //       alias: element.alias,
      //       forValue: forValue,
      //       elements: []
      //     }
      //     forHver[element.key].elements.push(element);
      //   }
      // });   
    
      


      // Converts objects without '"' to object with '"' for JSON.parse
      // const objectStr = ((str) => {
      //   str = /^[\n\s]*if.*\(.*\)/.test(str) || /^(let|const)\s/.test(str) ? `(() => { ${str} })()` : str;
      //   var tokens = str.split(",")
      //   for (u = 0; u < tokens.length; u++) {
      //     let t = tokens[u].split(" ")
      //     for (i = 0; i < t.length; i++) {
      //       if (/^(true|false)/.test(t[2]) || /^[0-9]+$/.test(t[2])) {
      //         t[2] = t[2].trim().replace('"', '')
      //       }
      //       if (!t[1].startsWith('"')) {
      //         t[1] = t[1].trim().replace(/^/, '"')
      //         t[1] = t[1].slice(0, -1).concat('":')
      //       } else if (t[1].startsWith("'")) {
      //         t[1] = t[1].replace("'", '"')
      //       }
      //     }
      //     tokens[u] = t.join(' ')
      //   }
      //   tokens = tokens.join(",")
      //   return JSON.parse(tokens)
      // })
      
      // bryter
      var bryter = {};
      Array.prototype.slice.call(element.querySelectorAll('[bryter]'))
        .map(function (element) {
        var bryterValue = element.getAttribute('bryter');
            
        if (!bryter[bryterValue]) {
          bryter[bryterValue] = {
            bryterValue: bryterValue,
            elements: []
          }
        }
        bryter[bryterValue].elements.push(element);

      });  

      // html data
      var html = {};
      Array.prototype.slice.call(element.querySelectorAll('[html]'))
        .map(function (element) {
        var htmlValue = element.getAttribute('html');
            
        if (!html[htmlValue]) {
          html[htmlValue] = {
            htmlValue: htmlValue,
            elements: []
          }
        }
        html[htmlValue].elements.push(element);

      });  
  
      // Update DOM element bound when controller property is set
      const handler = {
        set: function (target, prop, value) {    
        
          var bind = bindings[prop];
          var bryt = bryter[prop];
          var hvis2 = hvis[prop];
          var html2 = html[prop];


          if (bind) {  
            bind.elements.forEach(function (element) {
              element.value = value;
              element.setAttribute('value', value);
            });
          }

          if (bryt) {
            bryt.elements.forEach(function (element) {
              for (var i = 0; i < element.children.length; i++) {
                if (value == element.children[i].getAttribute('sak')) {
                  element.children[i].style.display = 'block';
                } else {
                  element.children[i].style.display = 'none';
                }
              }
            });
          }
          if (hvis2) {
            hvis2.elements.forEach(function (element) {
              if (data[value] && (value in data)) {
                element.style.display = 'block';
              } else if (!data[value] && (/^(true|false)/.test(value))) { // if true in statement
                element.style.display = value == 'true' ? 'block' : 'none';
              } else {
                element.style.display = 'none';
              }
            });
          }
          if (html2) {
            html2.elements.forEach(function (element) {
              if (data[value] && (value in data)) {

                element.textContent = data[value];
              } else {
                element.innerHTML = value
              }
            });
          }
          return Reflect.set(target, prop, value);
        },
        get(target, prop, receiver) {
          console.log("TARGET", target, " - PROP", prop, " - RECEIVER", receiver)
          return Reflect.get(target, prop, receiver);
        },
        deleteProperty(target, prop) {
          return Reflect.deleteProperty(target, prop); 
        },
        ownKeys(target) {
          return Reflect.ownKeys(target);
        }
      }
      console.log(data)
      var proxy = new Proxy (ctrl, handler);

      // Init data element
    

      // Listen DOM element update to set the controller property
      Object.keys(bindings).forEach(function (boundValue) {
        var bind = bindings[boundValue];
        bind.elements.forEach(function (element) {
          element.addEventListener('input', function (event) {
            proxy[bind.boundValue] = event.target.value;
          });
        })  
      });

      Object.keys(hvis).forEach(function (hvisValue) {
        var hvisF = hvis[hvisValue];

        hvisF.elements.forEach(function (element) {
          proxy[hvisF.hvisValue] = element.getAttribute("hvis");
        })  
      });

      Object.keys(forHver).forEach(function (forValue) {
        var forF = forHver[forValue];

        forF.elements.forEach(function (element) {
          let stuff = element.attrsMap["[[repeat]]"]

          if (forF.array in data) {
            console.log("STUFF", stuff)
            for (item in [data[stuff.expression]]) {
              console.log("FOR",item)
            
            }
            // switch(true) {
            //   case data[forF.array] instanceof Array:
            //     for (let b = 0; b < data[forF.array].length; b++) {
            //       let clone = element.cloneNode(true)
            //       clone.removeAttributeNode(clone.getAttributeNode('for'))
            //       clone.removeAttributeNode(clone.getAttributeNode(':key'))
            //       element.parentNode.append(clone)
            //     }
            //     break;
            //   case data[forF.array] instanceof Object:

            //     for (const [key, value] of Object.entries(data[forF.array])) {
            //       let clone = element.cloneNode(true)
            //       clone.removeAttributeNode(clone.getAttributeNode('for'))
            //       clone.removeAttributeNode(clone.getAttributeNode(':key'))
            //       element.parentNode.append(clone)
            //     }
            //   default:
            //     for (let b = 0; b < parseInt(data[forF.array]); b++) {
            //       let clone = element.cloneNode(true)
            //       clone.removeAttributeNode(clone.getAttributeNode('for'))
            //       clone.removeAttributeNode(clone.getAttributeNode(':key'))
            //       element.parentNode.append(clone)
            //     }
            //     break;
            // }
          }
          // element.remove()
        })  
      });

      Object.keys(html).forEach(function (htmlValue) {
        var htmlF = html[htmlValue];
        htmlF.elements.forEach(function (element) {
          if (htmlF.htmlValue in proxy) {
            element.innerText = proxy[htmlF.htmlValue]
          } else if (htmlF.htmlValue in data) {
            element.innerText = data[htmlF.htmlValue]
          }
        })  
      });
      
      
  
      // Fill proxy with ctrl properties
      // and return proxy, not the ctrl !
      Object.assign(proxy, ctrl);

      return proxy;
    }
  
    
    // Export framework in window
    this.norsk = {
        controller: addController
    }
  })();
    
/* User code */
function InputController () {

}

var Controller = norsk.controller(window.location.pathname.replace("/", ""), InputController);

function onButtonClick () {
console.log('button clicked')
}




// ----------------------------
// Custom Elements
// ----------------------------

class Devcologo extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    // Create a shadow root
    var shadow = this.attachShadow({mode: 'open'});

    // Insert icon
    var imgUrl;
    if(this.hasAttribute('img')) {
      imgUrl = this.getAttribute('img');
    } else {
      imgUrl = 'devco-logo.png';
    }

    var body = createElement('span', {class: "wrapper"}, [
      createElement('span', {class: "icon"}, [
        createElement('img', {src: imgUrl})
      ])
    ]);

    var style = document.createElement('style');

    style.textContent = [
      `.wrapper {
        position: relative;
      }`,
      `.info {
        font-size: 0.8rem;
        width: 200px;
        display: inline-block;
        border: 1px solid black;
        padding: 10px;
        background: white;
        border-radius: 10px;
        opacity: 0;
        transition: 0.6s all;
        position: absolute;
        bottom: 20px;
        left: 10px;
        z-index: 3;
      }`,
      `img {
        width: 1.2rem
      }`,
      `.icon:hover + .info, .icon:focus + .info {
        opacity: 1;
      }`
    ].join('\n');

    shadow.appendChild(style);
    shadow.appendChild(body);

  }
}

class Hovercard extends HTMLElement {
  constructor() {
    super();

    var shadow = this.attachShadow({mode: 'open'});

    var text = this.getAttribute('tekst');
    var title = this.getAttribute('tittel');

    var imgUrl;
    if(this.hasAttribute('img')) {
      imgUrl = this.getAttribute('img');
    } else {
      imgUrl = 'devco-logo.png';
    }

    var body = createElement('div', {class: "container"}, [
      createElement('div', {class: "card"}, [
        createElement('div', {class: "face face1"}, [
          createElement('div', {class: "content"}, [
            createElement('img', {src: imgUrl}),
            createElement('h3', {tekst: title})
          ])
        ]),
        createElement('div', {class: "face face2"}, [
          createElement('div', {class: "content"}, [
            createElement('p', {tekst: text})
          ])
        ])
      ])
    ]);

    var style = document.createElement('style');
   
    style.textContent = `
    .container{
      position: relative;
      display: flex;
      justify-content: center;
      margin: 0;
    }
  
    .container .card{
        position: relative;
        cursor: pointer;
    }
  
    .container .card .face{
        width: 300px;
        height: 200px;
        transition: 0.5s;
    }
  
    .container .card .face.face1{
        position: relative;
        background: #333;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1;
        transform: translateY(100px);
    }
    
    .container .card:hover .face.face1{
        background: #ff0057;
        transform: translateY(0);
    }
    
    .container .card .face.face1 .content{
        opacity: 0.2;
        transition: 0.5s;
    }
    
    .container .card:hover .face.face1 .content{
        opacity: 1;
    }
    
    .container .card .face.face1 .content img{
        max-width: 100px;
    }
    
    .container .card .face.face1 .content h3{
        margin: 10px 0 0;
        padding: 0;
        color: #fff;
        text-align: center;
        font-size: 1.5em;
    }
  
    .container .card .face.face2{
        position: relative;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        box-sizing: border-box;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        transform: translateY(-100px);
    }
    
    .container .card:hover .face.face2{
        transform: translateY(0);
    }
    
    .container .card .face.face2 .content p{
        margin: 0;
        padding: 0;
    }
    
    .container .card .face.face2 .content a{
        margin: 15px 0 0;
        display:  inline-block;
        text-decoration: none;
        font-weight: 900;
        color: #333;
        padding: 5px;
        border: 1px solid #333;
    }
    
    .container .card .face.face2 .content a:hover{
        background: #333;
        color: #fff;
    }
    `;

    shadow.appendChild(style);
    shadow.appendChild(body);
  }
}





const Customelements = {
  "devco-logo": {klasse: Devcologo},
  "hover-card": {klasse: Hovercard},
}


for (const [key, value] of Object.entries(Customelements)) {
  if (value) {
    customElements.define(key, value.klasse, {extends: value.extends});
  } else {
    customElements.define(key, value.klasse);
  }
}
