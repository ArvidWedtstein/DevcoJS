
  const createCustomElement2 = (tag, attrs, children) => {
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
    console.time('devco');
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
  
      // console.info((arguments.callee.toString().substring('function '.length))
      // .substring(0, (arguments.callee.toString().substring('function '.length))
      // .indexOf('(')), this.elm, this.tag)
    };
  

    // This is styling for console messages
    const styling = `
      padding: 10px;
      font-size: 15px;
      border: solid #FFBB51 1px;
      border-radius: 0.25rem;
      background: repeating-linear-gradient(to top, rgba(255, 255, 255, 0.03) 0px 2px, transparent 2px 4px),linear-gradient(to bottom, #200933 75%, #3d0b43);
      filter: drop-shadow(0 0 75px rgb(128 0 255 / 0.25));
    `;
    var config = {
      styling: true
    };



    // ----------------------------
    // Regex
    // ----------------------------
    var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
    var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;

    var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
    var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
    var stripParensRE = /^\(|\)$/g;
    var comment = /^<!\--/;
    var conditionalComment = /^<!\[/;
    var doctype = /^<!DOCTYPE [^>]+>/i;
    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
    var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
    var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
    var startTagOpen = new RegExp(("^<" + qnameCapture));
    var startTagClose = /^\s*(\/?)>/;
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
    var invalidAttributeRE = /[\s"'<>\/=]/;
    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
    var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
    var dirRE = /^v-|^@|^:|^#/;

    // Types 
    var data = {};
    var hvis = {};
    var bindings = {};
    var forHver = {};
    var html = {};
    var bryter = {};

    var feil = function (a, b, c) {};
    var advarsel = function (a, b, c) {};
    var tips = function (a, b, c) {};
    var info = function (a, b, c) {};
    {
      feil = function (msg) {
        if (config.styling) {
          console.error(`%c[Devco Feil]: ${msg}`, styling);
        }
      };
      advarsel = function (...msg) {
        if (config.styling) {
          console.warn(`%c[Devco Åtvaring]: ${msg}`, styling);
        }
      };
      tips = function (msg) {
        if (config.styling) {
          console.log(`%c[Devco Tips]: ${msg}`, styling);
        }
      };
      info = function (msg) {
        if (config.styling) {
          console.log(`%c[Devco Info]: ${msg}`, styling);
        }
      };
    }


    /**
     * @description Ensures that a function is only called once.
     * @param {*} fn 
     * @returns 
     */
    function once (fn) {
      var called = false;
      return function () {
        if (!called) {
          called = true;
          fn.apply(this, arguments);
        }
      }
    }
    /**
     * @description 
     * @param {*} array 
     * @param {*} what 
     * @returns the amount of occurences of the chosen item in the array
     */
    function countInArray(array, what) {
      return array.filter(item => item == what).length;
    }

    var createEmptyDevcoNode = function (text) {
      if ( text === void 0 ) text = '';

      var node = new DevcoNode();
      node.text = text;
      node.isComment = true;
      return node
    };
    function getBindingAttr (
      el,
      name,
      getStatic
    ) {
      var dynamicValue =
        getAndRemoveAttr(el, ':' + name) ||
        getAndRemoveAttr(el, 'v-bind:' + name);
      if (dynamicValue != null) {
        return parseFilters(dynamicValue)
      } else if (getStatic !== false) {
        var staticValue = getAndRemoveAttr(el, name);
        if (staticValue != null) {
          return JSON.stringify(staticValue)
        }
      }
    }
    function rangeSetItem (item, range) {
      if (range) {
        if (range.start != null) {
          item.start = range.start;
        }
        if (range.end != null) {
          item.end = range.end;
        }
      }
      return item
    }
    function createTextDevcoNode (val) {
      return new DevcoNode(undefined, undefined, undefined, String(val))
    }
    function addAttr (el, name, value, range, dynamic) {
      var attrs = dynamic
        ? (el.dynamicAttrs || (el.dynamicAttrs = []))
        : (el.attrs || (el.attrs = []));
      attrs.push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
      el.plain = false;
    }
    function processKey (el) {
      var exp = getBindingAttr(el, 'key');
      if (exp) {
        {
          if (el.tag === 'template') {
            warn$2(
              "<template> cannot be keyed. Place the key on real elements instead.",
              getRawBindingAttr(el, 'key')
            );
          }
          if (el.for) {
            var iterator = el.iterator2 || el.iterator1;
            var parent = el.parent;
            if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
              warn$2(
                "Do not use v-for index as key on <transition-group> children, " +
                "this is the same as not using keys.",
                getRawBindingAttr(el, 'key'),
                true /* tip */
              );
            }
          }
        }
        el.key = exp;
      }
    }
    var transforms;
    var delimiters;
    function processElement (
      element,
      options
    ) {
      processKey(element);
  
      // determine whether this is a plain element after
      // removing structural attributes
      element.plain = (
        !element.key &&
        !element.scopedSlots &&
        !element.attrsList.length
      );
  
      // processRef(element);
      // processSlotContent(element);
      // processSlotOutlet(element);
      // processComponent(element);
      for (var i = 0; i < transforms.length; i++) {
        element = transforms[i](element, options) || element;
      }
      processAttrs(element);
      return element
    }
    function createElement (tag, data, children, normalizationType, alwaysNormalize) {
      if (Array.isArray(data)) {
        normalizationType = children;
        children = data;
        data = undefined;
      }
      return _createElement(tag, data, children, normalizationType)
    }
    function processAttrs (el) {
      var list = el.attrsList;
      var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
      for (i = 0, l = list.length; i < l; i++) {
        name = rawName = list[i].name;
        value = list[i].value;
        if (dirRE.test(name)) {
          // mark element as dynamic
          el.hasBindings = true;
          // modifiers
          modifiers = parseModifiers(name.replace(dirRE, ''));
          // support .foo shorthand syntax for the .prop modifier
          if (modifiers) {
            name = name.replace(modifierRE, '');
          }
          if (bindRE.test(name)) { // v-bind
            name = name.replace(bindRE, '');
            value = parseFilters(value);
            isDynamic = dynamicArgRE.test(name);
            if (isDynamic) {
              name = name.slice(1, -1);
            }
            if (
              value.trim().length === 0
            ) {
              warn$2(
                ("The value for a v-bind expression cannot be empty. Found in \"v-bind:" + name + "\"")
              );
            }
            if (modifiers) {
              if (modifiers.prop && !isDynamic) {
                name = camelize(name);
                if (name === 'innerHtml') { name = 'innerHTML'; }
              }
              if (modifiers.camel && !isDynamic) {
                name = camelize(name);
              }
              if (modifiers.sync) {
                syncGen = genAssignmentCode(value, "$event");
                if (!isDynamic) {
                  addHandler(
                    el,
                    ("update:" + (camelize(name))),
                    syncGen,
                    null,
                    false,
                    warn$2,
                    list[i]
                  );
                  if (hyphenate(name) !== camelize(name)) {
                    addHandler(
                      el,
                      ("update:" + (hyphenate(name))),
                      syncGen,
                      null,
                      false,
                      warn$2,
                      list[i]
                    );
                  }
                } else {
                  // handler w/ dynamic event name
                  addHandler(
                    el,
                    ("\"update:\"+(" + name + ")"),
                    syncGen,
                    null,
                    false,
                    warn$2,
                    list[i],
                    true // dynamic
                  );
                }
              }
            }
            if ((modifiers && modifiers.prop) || (
              !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
            )) {
              addProp(el, name, value, list[i], isDynamic);
            } else {
              addAttr(el, name, value, list[i], isDynamic);
            }
          } else if (onRE.test(name)) { // v-on
            name = name.replace(onRE, '');
            isDynamic = dynamicArgRE.test(name);
            if (isDynamic) {
              name = name.slice(1, -1);
            }
            addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic);
          } else { // normal directives
            name = name.replace(dirRE, '');
            // parse arg
            var argMatch = name.match(argRE);
            var arg = argMatch && argMatch[1];
            isDynamic = false;
            if (arg) {
              name = name.slice(0, -(arg.length + 1));
              if (dynamicArgRE.test(arg)) {
                arg = arg.slice(1, -1);
                isDynamic = true;
              }
            }
            addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
            if (name === 'model') {
              checkForAliasModel(el, value);
            }
          }
        } else {
          // literal attribute
          {
            var res = parseText(value, delimiters);
            if (res) {
              warn$2(
                name + "=\"" + value + "\": " +
                'Interpolation inside attributes has been removed. ' +
                'Use v-bind or the colon shorthand instead. For example, ' +
                'instead of <div id="{{ val }}">, use <div :id="val">.',
                list[i]
              );
            }
          }
          addAttr(el, name, JSON.stringify(value), list[i]);
          // #6887 firefox doesn't update muted state if set via attribute
          // even immediately after element creation
          if (!el.component &&
              name === 'muted' &&
              platformMustUseProp(el.tag, el.attrsMap.type, name)) {
            addProp(el, name, 'true', list[i]);
          }
        }
      }
    }
    function isTextTag (el) {
      return el.tag === 'script' || el.tag === 'style'
    }
    /**
     * @description Creates a cached version of a pure function.
     * @param {*} fn 
     * @returns 
     */
    function cached (fn) {
      var cache = Object.create(null);
      return (function cachedFn (str) {
        var hit = cache[str];
        return hit || (cache[str] = fn(str))
      })
    }
    var decoder;
  
    var he = {
      decode: function decode (html) {
        decoder = decoder || document.createElement('div');
        decoder.innerHTML = html;
        return decoder.textContent
      }
    };
    function parseText (text, delimiters) {
      var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
      if (!tagRE.test(text)) {
        return
      }
      var tokens = [];
      var rawTokens = [];
      var lastIndex = tagRE.lastIndex = 0;
      var match, index, tokenValue;
      while ((match = tagRE.exec(text))) {
        index = match.index;
        // push text token
        if (index > lastIndex) {
          rawTokens.push(tokenValue = text.slice(lastIndex, index));
          tokens.push(JSON.stringify(tokenValue));
        }
        // tag token
        var exp = parseFilters(match[1].trim());
        tokens.push(("_s(" + exp + ")"));
        rawTokens.push({ '@binding': exp });
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        rawTokens.push(tokenValue = text.slice(lastIndex));
        tokens.push(JSON.stringify(tokenValue));
      }
      return {
        expression: tokens.join('+'),
        tokens: rawTokens
      }
    }
    function _createElement (tag, data, children, normalizationType) {
      if (!tag) {
        // in case of component :is set to falsy value
        return createEmptyDevcoNode()
      }

      // support single function children as default scoped slot
      if (Array.isArray(children) && typeof children[0] === 'function') {
        data = data || {};
        data.scopedSlots = { default: children[0] };
        children.length = 0;
      }
      
      var devconode;
      if (typeof tag === 'string') {
        devconode = new DevcoNode(
          tag, data, children,
          undefined, undefined
        );
      }
      if (Array.isArray(devconode)) {
        return devconode
      } else if (devconode !== undefined && devconode !== null) {
        return devconode
      } else {
        return createEmptyDevcoNode()
      }
    }
    var decodeHTMLCached = cached(he.decode);
    /**
     * 
     * @param {DevcoNode} node 
     */
    function DevcoNodeToHtmlNode(node) {
      const tag = document.createElement(node.tag);
      tag.innerText = node.children[0].text;
      
      return tag;
    }

    
    // Define Config Element
    class DevcoConfig extends HTMLElement {
      constructor() {
        super();
    
        // Create a shadow root
        var shadow = this.attachShadow({mode: 'closed'});
    
        // Insert icon
        
        var body = createCustomElement2('span', {class: "wrapper"}, []);
    
        var style = document.createElement('style');
    
        style.textContent = [
          `.wrapper {
            display: none;
          }`,
        ].join('\n');
    
        shadow.appendChild(style);
        shadow.appendChild(body);

        // trim config for whitespace
        let trimmedConfig = this.textContent.replace(/^[^\S\r\n]+|[^\S\r\n]+$/gm, "")

        var options = trimmedConfig.split("\n");

        // Remove all config options that are not defined in users config
        Object.keys(config).forEach(function (item) {
          if (countInArray(options, item) > 1) {
            return feil(`Du kan ikkje definere ${item} meir enn ein gong`);
          }
          if (!options.includes(item)) {
            delete config[item]
          }
        })
      }
    }
    customElements.define("devco-config", DevcoConfig);
    

    // Look for elements using the controller 
    var element = document.querySelector('[kontainer]');
    if (!element) {   
      return feil('Kontainer er ikkje definert');
    }

    // Create a new instance and save it


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


    
    Array.prototype.slice.call(element.querySelectorAll('[dersom]'))
      .map(function (element) {
      var hvisValue = element.getAttribute('dersom');

      console.log("PROCESSIF", processIf(element));
      hvisValue = hvisValue;
      if (!hvis[hvisValue]) {
        hvis[hvisValue] = {
          hvisValue: hvisValue,
          elements: []
        }
      }
      hvis[hvisValue].elements.push(element);
    });   

    
    // bryter
    Array.prototype.slice.call(element.querySelectorAll('[brytar]'))
      .map(function (element) {
      var bryterValue = element.getAttribute('brytar');
          
      if (!bryter[bryterValue]) {
        bryter[bryterValue] = {
          bryterValue: bryterValue,
          elements: []
        }
      }
      for (var i = 0; i < element.children.length; i++) {
        if (!element.children[i].hasAttribute('tilfelle')) {
          return feil('Kvart born i bryter må ha tilfelle attributt')
        }
      }
      bryter[bryterValue].elements.push(element);

    });  

    // html data
    Array.prototype.slice.call(element.querySelectorAll('[hypertekstoppmerknadspråk]')) // html
      .map(function (element) {
      var htmlValue = element.getAttribute('hypertekstoppmerknadspråk');
          
      if (!html[htmlValue]) {
        html[htmlValue] = {
          htmlValue: htmlValue,
          elements: []
        }
      }
      html[htmlValue].elements.push(element);

    });  


    // ----------------------------
    // For-Loop Functions
    // ----------------------------
    function getAndRemoveAttr (el, name, removeFromMap) {
      var val;
      if ((val = el.attrsMap[name]) != null) {
        var list = Object.values(el.attributes);
        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i].name === name) {
            list.splice(i, 1);
            break
          }
        }
      }
      if (removeFromMap) {
        delete el.removeAttribute(name);
      }
      return val
    }
    function processFor (el) {
      var exp;
      if ((exp = getAndRemoveAttr(el, 'for'))) {
        var res = parseFor(exp);
        if (res) {
          for (var key in res) {
            el[key] = res[key];
          }
          return el
        } else {
          advarsel(
            ("Ugyldig for expression: " + exp)
          );
        }
      }
    }

    function genFor (el) {
      var exp = el.for;
      var alias = el.alias;
      var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
      var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';


      el.forProcessed = true; // avoid recursion
      return `renderList((${exp}), function(${alias}${iterator1}${iterator2}) { return createElement('${el.tagName}', [createTextDevcoNode('${el.innerText}')]) })`;
    }

    function renderList (val, render) {
      var ret, i, l, keys, key;
      if (Array.isArray(val) || typeof val === 'string') {
        ret = new Array(val.length);
        for (i = 0, l = val.length; i < l; i++) {
          ret[i] = render(val[i], i);
          // console.log('RET', ret[i])
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
            console.log(val[key], key, i)
            ret[i] = render(val[key], key, i);
          }
        }
      }
      return ret
    }
    function parseFor(expression) {
      var inMatch = expression.match(forAliasRE);
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

    Array.prototype.slice.call(element.querySelectorAll('[for]'))
      .map(function (element) {
      var forValue = element.getAttribute('for'); // not really needed

      processFor(element);

      eval(genFor(element)).forEach(function (child) {
        console.log('CHILD', DevcoNodeToHtmlNode(child))
        element.parentNode.appendChild(DevcoNodeToHtmlNode(child))
      })

      if (!forHver[element.key]) {
        forHver[element.key] = {
          key: element.key,
          array: element.for,
          alias: element.alias,
          forValue: forValue,
          elements: []
        }
        forHver[element.key].elements.push(element);
      } else {
        feil(`Du kan ikkje definere ${element.key} meir enn ein gong`);
      }
    });   


    // ----------------------------
    // If-Statement Functions
    // ----------------------------
    function processIf (el) {
      var exp = getAndRemoveAttr(el, 'dersom');
      if (exp) {
        el.if = exp;
        addIfCondition(el, {
          exp: exp,
          block: el
        });
      } else {
        if (getAndRemoveAttr(el, 'eller') != null) {
          el.else = true;
        }
        var elseif = getAndRemoveAttr(el, 'eller-dersom');
        if (elseif) {
          el.elseif = elseif;
        }
      }
    }
    function addIfCondition (el, condition) {
      if (!el.ifConditions) {
        el.ifConditions = [];
      }
      el.ifConditions.push(condition);
    }
    // function processIfConditions (el, parent) {
    //   var prev = findPrevElement(parent.children);
    //   if (prev && prev.if) {
    //     addIfCondition(prev, {
    //       exp: el.elseif,
    //       block: el
    //     });
    //   } else {
    //     warn$2(
    //       "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
    //       "used on element <" + (el.tag) + "> without corresponding v-if.",
    //       el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']
    //     );
    //   }
    // }
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
              if (!element.children[i].hasAttribute('tilfelle')) {
                return feil('Kvart born i bryter må ha tilfelle attributt')
              }
              if (value == element.children[i].getAttribute('tilfelle')) {
                element.children[i].style.display = 'block';
              } else {
                element.children[i].style.display = 'none';
              }
            }
          });
        }

        // TODO - Find a better solution for this
        if (hvis2) {
          hvis2.elements.forEach(function (element) {
            if (data[value] && (value in data)) {
              element.style.display = 'block';
            } else if (!data[value] && (/^(true|false)/.test(value))) { // if true in statement // 
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
    var proxy = new Proxy ({}, handler);



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
        proxy[hvisF.hvisValue] = element.getAttribute("dersom");
      })  
    });

    Object.keys(forHver).forEach(function (forValue) {
      var forF = forHver[forValue];

      forF.elements.forEach(function (element) {
        // let stuff = element.attrsMap["[[repeat]]"]

        if (forF.array in data) {
          for (item in [data[stuff.expression]]) {
            console.log("FOR",item)
          
          }
          switch(true) {
            case data[forF.array] instanceof Array:
              for (let b = 0; b < data[forF.array].length; b++) {
                let clone = element.cloneNode(true)
                clone.removeAttributeNode(clone.getAttributeNode('for'))
                clone.removeAttributeNode(clone.getAttributeNode(':key'))
                element.parentNode.append(clone)
              }
              break;
            case data[forF.array] instanceof Object:

              for (const [key, value] of Object.entries(data[forF.array])) {
                let clone = element.cloneNode(true)
                clone.removeAttributeNode(clone.getAttributeNode('for'))
                clone.removeAttributeNode(clone.getAttributeNode(':key'))
                element.parentNode.append(clone)
              }
            default:
              for (let b = 0; b < parseInt(data[forF.array]); b++) {
                let clone = element.cloneNode(true)
                clone.removeAttributeNode(clone.getAttributeNode('for'))
                clone.removeAttributeNode(clone.getAttributeNode(':key'))
                element.parentNode.append(clone)
              }
              break;
          }
        }
        element.remove()
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

    function decodeAttr (value, shouldDecodeNewlines) {
      var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
      return value.replace(re, function (match) { return decodingMap[match]; })
    }
    function parseHTML (html, options) {
      var stack = [];
      var expectHTML = options.expectHTML;
      var isUnaryTag$$1 = options.isUnaryTag || false;
      var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || false;
      var index = 0;
      var last, lastTag;
      while (html) {
        last = html;
        // Make sure we're not in a plaintext content element like script/style
        if (!lastTag || !isPlainTextElement(lastTag)) {
          var textEnd = html.indexOf('<');
          if (textEnd === 0) {
            // Comment:
            if (comment.test(html)) {
              var commentEnd = html.indexOf('-->');
  
              if (commentEnd >= 0) {
                if (options.shouldKeepComment) {
                  options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
                }
                advance(commentEnd + 3);
                continue
              }
            }
  
            // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
            if (conditionalComment.test(html)) {
              var conditionalEnd = html.indexOf(']>');
  
              if (conditionalEnd >= 0) {
                advance(conditionalEnd + 2);
                continue
              }
            }
  
            // Doctype:
            var doctypeMatch = html.match(doctype);
            if (doctypeMatch) {
              advance(doctypeMatch[0].length);
              continue
            }
  
            // End tag:
            var endTagMatch = html.match(endTag);
            if (endTagMatch) {
              var curIndex = index;
              advance(endTagMatch[0].length);
              parseEndTag(endTagMatch[1], curIndex, index);
              continue
            }
  
            // Start tag:
            var startTagMatch = parseStartTag();
            if (startTagMatch) {
              handleStartTag(startTagMatch);
              if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                advance(1);
              }
              continue
            }
          }
  
          var text = (void 0), rest = (void 0), next = (void 0);
          if (textEnd >= 0) {
            rest = html.slice(textEnd);
            while (
              !endTag.test(rest) &&
              !startTagOpen.test(rest) &&
              !comment.test(rest) &&
              !conditionalComment.test(rest)
            ) {
              // < in plain text, be forgiving and treat it as text
              next = rest.indexOf('<', 1);
              if (next < 0) { break }
              textEnd += next;
              rest = html.slice(textEnd);
            }
            text = html.substring(0, textEnd);
          }
  
          if (textEnd < 0) {
            text = html;
          }
  
          if (text) {
            advance(text.length);
          }
  
          if (options.chars && text) {
            options.chars(text, index - text.length, index);
          }
        } else {
          var endTagLength = 0;
          var stackedTag = lastTag.toLowerCase();
          var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
          var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
            endTagLength = endTag.length;
            if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
              text = text
                .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
                .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
            }
            if (shouldIgnoreFirstNewline(stackedTag, text)) {
              text = text.slice(1);
            }
            if (options.chars) {
              options.chars(text);
            }
            return ''
          });
          index += html.length - rest$1.length;
          html = rest$1;
          parseEndTag(stackedTag, index - endTagLength, index);
        }
  
        if (html === last) {
          options.chars && options.chars(html);
          if (!stack.length && options.warn) {
            options.warn(("Mal-formatted tag at end of template: \"" + html + "\""), { start: index + html.length });
          }
          break
        }
      }
  
      // Clean up any remaining tags
      parseEndTag();
  
      function advance (n) {
        index += n;
        html = html.substring(n);
      }
  
      function parseStartTag () {
        var start = html.match(startTagOpen);
        if (start) {
          var match = {
            tagName: start[1],
            attrs: [],
            start: index
          };
          advance(start[0].length);
          var end, attr;
          while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
            attr.start = index;
            advance(attr[0].length);
            attr.end = index;
            match.attrs.push(attr);
          }
          if (end) {
            match.unarySlash = end[1];
            advance(end[0].length);
            match.end = index;
            return match
          }
        }
      }
  
      function handleStartTag (match) {
        var tagName = match.tagName;
        var unarySlash = match.unarySlash;
  
        if (expectHTML) {
          if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
            parseEndTag(lastTag);
          }
          if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
            parseEndTag(tagName);
          }
        }
        var unary = false || !!unarySlash;
  
        var l = match.attrs.length;
        var attrs = new Array(l);
        for (var i = 0; i < l; i++) {
          var args = match.attrs[i];
          var value = args[3] || args[4] || args[5] || '';
          var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
            ? options.shouldDecodeNewlinesForHref
            : options.shouldDecodeNewlines;
          attrs[i] = {
            name: args[1],
            value: decodeAttr(value, shouldDecodeNewlines)
          };
          if (options.outputSourceRange) {
            attrs[i].start = args.start + args[0].match(/^\s*/).length;
            attrs[i].end = args.end;
          }
        }
  
        if (!unary) {
          stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
          lastTag = tagName;
        }
  
        if (options.start) {
          options.start(tagName, attrs, unary, match.start, match.end);
        }
      }
  
      function parseEndTag (tagName, start, end) {
        var pos, lowerCasedTagName;
        if (start == null) { start = index; }
        if (end == null) { end = index; }
  
        // Find the closest opened tag of the same type
        if (tagName) {
          lowerCasedTagName = tagName.toLowerCase();
          for (pos = stack.length - 1; pos >= 0; pos--) {
            if (stack[pos].lowerCasedTag === lowerCasedTagName) {
              break
            }
          }
        } else {
          // If no tag name is provided, clean shop
          pos = 0;
        }
  
        if (pos >= 0) {
          // Close all the open elements, up the stack
          for (var i = stack.length - 1; i >= pos; i--) {
            if (i > pos || !tagName && options.warn) {
              advarsel(
                (`Taggen <${(stack[i].tag)}> har ingen samsvarende sluttag. Start: ${stack[i].start} | End: ${stack[i].end}`),
              );
            }
            if (options.end) {
              options.end(stack[i].tag, start, end);
            }
          }
  
          // Remove the open elements from the stack
          stack.length = pos;
          lastTag = pos && stack[pos - 1].tag;
        } else if (lowerCasedTagName === 'br') {
          if (options.start) {
            options.start(tagName, [], true, start, end);
          }
        } else if (lowerCasedTagName === 'p') {
          if (options.start) {
            options.start(tagName, [], false, start, end);
          }
          if (options.end) {
            options.end(tagName, start, end);
          }
        }
      }
    }
    
    

    // Fill proxy with ctrl properties
    // and return proxy, not the ctrl !
    Object.assign(proxy, {});

    function installRenderHelpers (target) {
      // target._o = markOnce;
      // target._n = toNumber;
      target._s = toString;
      target._l = renderList;
      // target._t = renderSlot;
      // target._q = looseEqual;
      // target._i = looseIndexOf;
      // target._m = renderStatic;
      // target._f = resolveFilter;
      // target._k = checkKeyCodes;
      // target._b = bindObjectProps;
      target._v = createTextDevcoNode;
      target._e = createEmptyDevcoNode;
      // target._u = resolveScopedSlots;
      // target._g = bindObjectListeners;
      // target._d = bindDynamicKeys;
      // target._p = prependModifier;
    }
  
    /*  */
  
    function FunctionalRenderContext (
      data,
      props,
      children,
      parent,
      Ctor
    ) {
      var this$1 = this;
  
      var options = Ctor.options;
      // ensure the createElement function in functional components
      // gets a unique context - this is necessary for correct named slot check
      var contextVm;
      if (hasOwn(parent, '_uid')) {
        contextVm = Object.create(parent);
        // $flow-disable-line
        contextVm._original = parent;
      } else {
        // the context vm passed in is a functional context as well.
        // in this case we want to make sure we are able to get a hold to the
        // real context instance.
        contextVm = parent;
        // $flow-disable-line
        parent = parent._original;
      }
      var isCompiled = isTrue(options._compiled);
      var needNormalization = !isCompiled;
  
      this.data = data;
      this.props = props;
      this.children = children;
      this.parent = parent;
      this.listeners = data.on || emptyObject;
      this.injections = resolveInject(options.inject, parent);
      this.slots = function () {
        if (!this$1.$slots) {
          normalizeScopedSlots(
            data.scopedSlots,
            this$1.$slots = resolveSlots(children, parent)
          );
        }
        return this$1.$slots
      };
  
      Object.defineProperty(this, 'scopedSlots', ({
        enumerable: true,
        get: function get () {
          return normalizeScopedSlots(data.scopedSlots, this.slots())
        }
      }));
  
      // support for compiled functional template
      if (isCompiled) {
        // exposing $options for renderStatic()
        this.$options = options;
        // pre-resolve slots for renderSlot()
        this.$slots = this.slots();
        this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
      }
      
      if (options._scopeId) {
        this._c = function (a, b, c, d) {
          var vnode = createElement(contextVm, a, b, c, d, needNormalization);
          if (vnode && !Array.isArray(vnode)) {
            vnode.fnScopeId = options._scopeId;
            vnode.fnContext = parent;
          }
          return vnode
        };
      } else {
        this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
      }
    }
  
    installRenderHelpers(FunctionalRenderContext.prototype);


    function Devco (options) {
      if (!(this instanceof Devco)
      ) {
        warn('Devco is a constructor and should be called with the `new` keyword');
      }
      
      // Add data to the instance
      let jsonData = options.data;
      Object.keys(jsonData).forEach(function (key) {
        
        if (jsonData[key] instanceof Object) {
          if ((/^(true|false)/.test(jsonData[key])) || /^[0-9]+$/.test(jsonData[key])) {
            jsonData[key] = jsonData[key].replace('"', '')
          }
        }
        if (!(key in data)) {
          data[key] = jsonData[key]
        } else {
          advarsel('Fleire nøkkler er funne av: ' + key)
        }
      });

      // Generate AST Tree som HTML
      var ast = parse(element.innerHTML.trim(), {warn: console.warn()});
    }
    var platformGetTagNamespace;

    function makeAttrsMap (attrs) {
      var map = {};
      for (var i = 0, l = attrs.length; i < l; i++) {
        if (
          map[attrs[i].name] && !isIE && !isEdge
        ) {
          warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
        }
        map[attrs[i].name] = attrs[i].value;
      }
      return map
    }
    function processPre (el) {
      if (getAndRemoveAttr(el, 'v-pre') != null) {
        el.pre = true;
      }
    }
    function createASTElement (
      tag,
      attrs,
      parent
    ) {
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
    function processOnce (el) {
      var once$$1 = getAndRemoveAttr(el, 'v-once');
      if (once$$1 != null) {
        el.once = true;
      }
    }
    function makeMap (
      str,
      expectsLowerCase
    ) {
      var map = Object.create(null);
      var list = str.split(',');
      for (var i = 0; i < list.length; i++) {
        map[list[i]] = true;
      }
      return expectsLowerCase
        ? function (val) { return map[val.toLowerCase()]; }
        : function (val) { return map[val]; }
    }
    function pluckModuleFunction (
      modules,
      key
    ) {
      return modules
        ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
        : []
    }
    var isIgnoreNewlineTag = makeMap('pre,textarea', true);
    var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };
    var isPlainTextElement = makeMap('script,style,textarea', true);
    var platformIsPreTag;
    var preTransforms;
    var postTransforms;
    function parse (
      template,
      options
    ) {
      let warn$2 = options.warn || console.warn();
  
      platformIsPreTag = function(tag) { return false};
      let platformMustUseProp = options.mustUseProp || false;
      platformGetTagNamespace = function(tag) { return false};
      var isReservedTag = options.isReservedTag || false;
      var maybeComponent = function (el) { return !!(
        el.component ||
        el.attrsMap[':is'] ||
        el.attrsMap['v-bind:is'] ||
        !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag))
      ); };
      transforms = pluckModuleFunction(options.modules, 'transformNode');
      preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
      postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
  
      let delimiters = options.delimiters;
  
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
          advarsel(`${msg} | ${range}`);
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
              "Komponentmal skal inneholde nøyaktig eitt rotelement. " + 
              "Dersom du bruker 'dersom' på fleire elementer, " + 
              "bruk 'eller-dersom' for å kjede dei i staden. " + 
              `${element.start}`
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
          var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);
  
  
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
        comment: function comment (text, start, end) {
          // adding anything as a sibling to the root node is forbidden
          // comments should still be allowed, but ignored
          if (currentParent) {
            var child = {
              type: 3,
              text: text,
              isComment: true
            };
            if (options.outputSourceRange) {
              child.start = start;
              child.end = end;
            }
            currentParent.children.push(child);
          }
        }
      });
      console.log('PARSEHTML', root)
      return root
    }
    
    console.timeEnd('devco')
    
    return Devco
}));

  
