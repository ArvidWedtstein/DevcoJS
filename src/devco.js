
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
    var kommentar = /^<!\--/;
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
    var argRE = /:(.*)$/;
    var bindRE = /^:|^\.|^v-bind:/;
    var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;
    var onRE = /^@|^v-on:/;
  
    var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;

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
     * @description 
     * @param {*} array 
     * @param {*} what 
     * @returns the amount of occurences of the chosen item in the array
     */
    function countInArray(array, what) {
      return array.filter(item => item == what).length;
    }

    var lagTomDevcoNode = function (text) {
      if ( text === void 0 ) text = '';

      var node = new DevcoNode();
      node.text = text;
      node.isComment = true;
      return node
    };
    function getBindingAttr (el,name, getStatic) {
      var dynamicValue =
        hentOgFjernAttr(el, ':' + name) ||
        hentOgFjernAttr(el, 'v-bind:' + name);
      if (dynamicValue != null) {
        return parseFilters(dynamicValue)
      } else if (getStatic !== false) {
        var staticValue = hentOgFjernAttr(el, name);
        if (staticValue != null) {
          return JSON.stringify(staticValue)
        }
      }
    }
    function addDirective (el, name, rawName, value, arg, isDynamicArg, modifiers, range) {
      (el.directives || (el.directives = [])).push(rangeSetItem({
        name: name,
        rawName: rawName,
        value: value,
        arg: arg,
        isDynamicArg: isDynamicArg,
        modifiers: modifiers
      }, range));
      el.plain = false;
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
    function lagTekstDevcoNode (val) {
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
                "Do not use for-hver index as key on <transition-group> children, " +
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
    function processElement (element, options) {
      processKey(element);
  
      // determine whether this is a plain element after
      // removing structural attributes
      element.plain = (
        !element.key &&
        !element.scopedSlots &&
        !element.attrsList.length
      );
  
      for (var i = 0; i < transforms.length; i++) {
        element = transforms[i](element, options) || element;
      }
      processAttrs(element);
      return element
    }
    function lagElement (tag, data, children, normalizationType, alwaysNormalize) {
      if (Array.isArray(data)) {
        normalizationType = children;
        children = data;
        data = undefined;
      }
      return _createElement(tag, data, children, normalizationType)
    }
    function analysereModifikatorer (name) {
      var match = name.match(modifierRE);
      if (match) {
        var ret = {};
        match.forEach(function (m) { ret[m.slice(1)] = true; });
        return ret
      }
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
          modifiers = analysereModifikatorer(name.replace(dirRE, ''));
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
            // analysere arg
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
    function erTekstTagg (el) {
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
    function _createElement (tag, data, children) {
      if (!tag) {
        // in case of component :is set to falsy value
        return lagTomDevcoNode()
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
        return lagTomDevcoNode()
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

    initMixin(Devco);
    renderMixin(Devco);
    lifecycleMixin(Devco);
    // ----------------------------
    // For-Loop Funksjoner
    // ----------------------------
    function hentOgFjernAttr (el, name, removeFromMap) {
      var val;
      if ((val = el.attrsMap[name]) != null) {
        var list = el.attrsList;
        for (var i = 0, l = list.length; i < l; i++) {
          if (list[i].name === name) {
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
    /**
     * @description Sjekker om obj er et object
     * @param {*} obj 
     * @returns 
     */
    function isObject (obj) {
      return obj !== null && typeof obj === 'object'
    }
    function prosessFor (el) {
      var exp;
      if ((exp = hentOgFjernAttr(el, 'for'))) {
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
      return `renderList((${exp}), function(${alias}${iterator1}${iterator2}) { return lagElement('${el.tagName}', [lagTekstDevcoNode('${el.innerText}')]) })`;
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


      // eval(genFor(element)).forEach(function (child) {
      //   console.log('CHILD', DevcoNodeToHtmlNode(child))
      //   element.parentNode.appendChild(DevcoNodeToHtmlNode(child))
      // })

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
      var exp = hentOgFjernAttr(el, 'dersom');
      if (exp) {
        el.if = exp;
        addIfCondition(el, {
          exp: exp,
          block: el
        });
      } else {
        if (hentOgFjernAttr(el, 'eller') != null) {
          el.else = true;
        }
        var elseif = hentOgFjernAttr(el, 'eller-dersom');
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

    function dekodeAttr (value, shouldDecodeNewlines) {
      var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
      return value.replace(re, function (match) { return decodingMap[match]; })
    }
    function analyserHTML (html, options) {
      var stack = [];
      var expectHTML = options.expectHTML;
      var isUnaryTag$$1 = options.isUnaryTag || false;
      var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || false;
      var index = 0;
      var last, lastTag;
      while (html) {
        last = html;
        // Make sure we're not in a plaintext content element like script/style
        if (!lastTag || !erRentTekstElement(lastTag)) {
          var textEnd = html.indexOf('<');
          if (textEnd === 0) {
            // Comment:
            if (kommentar.test(html)) {
              var commentEnd = html.indexOf('-->');
  
              if (commentEnd >= 0) {
                if (options.shouldKeepComment) {
                  options.kommentar(html.substring(4, commentEnd), index, index + commentEnd + 3);
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
              !kommentar.test(rest) &&
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
            if (!erRentTekstElement(stackedTag) && stackedTag !== 'noscript') {
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
            value: dekodeAttr(value, shouldDecodeNewlines)
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
      target._s = toString;
      target._l = renderList;
      target._v = lagTekstDevcoNode;
      target._e = lagTomDevcoNode;
    }
    /**
     * 
     * @param {*} ast Abstrakt Syntaks tre 
     * @param {*} options 
     * @returns 
     */
    function generate (ast, options) {
      var state = new CodegenState(options);
      // fix #11483, Root level <script> tags should not be rendered.
      var code = ast ? (ast.tag === 'script' ? 'null' : genElement(ast, state)) : 'lagElement("div")';
      return {
        render: (code),
        staticRenderFns: state.staticRenderFns
      }
    }
    
    function needsNormalization (el) {
      return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
    }
    function genChildren (el, state, checkSkip, altGenElement, altGenNode) {
      var children = el.children;
      if (children.length) {
        var el$1 = children[0];

        if (children.length === 1 &&
          el$1.for &&
          el$1.tag !== 'template' &&
          el$1.tag !== 'slot'
        ) {
          var normalizationType = checkSkip
            ? state.maybeComponent(el$1) ? ",1" : ",0"
            : "";
          return ("" + ((altGenElement || genElement)(el$1, state)) + normalizationType)
        }
        var normalizationType$1 = checkSkip
          ? getNormalizationType(children, state.maybeComponent)
          : 0;
        var gen = altGenNode || genNode;
        return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType$1 ? ("," + normalizationType$1) : ''))
      }
    }
  
    // determine the normalization needed for the children array.
    // 0: no normalization needed
    // 1: simple normalization needed (possible 1-level deep nested array)
    // 2: full normalization needed
    function getNormalizationType (children, maybeComponent) {
      var res = 0;
      for (var i = 0; i < children.length; i++) {
        var el = children[i];
        if (el.type !== 1) {
          continue
        }
        if (needsNormalization(el) ||
            (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
          res = 2;
          break
        }
        if (maybeComponent(el) ||
            (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
          res = 1;
        }
      }
      return res
    }

    function genElement (el, state) {
      if (el.parent) {
        el.pre = el.pre || el.parent.pre;
      }
  
      if (el.staticRoot && !el.staticProcessed) {
        return genStatic(el, state)
      } else if (el.once && !el.onceProcessed) {
        return genOnce(el, state)
        
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
          code = "lagElement('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
        }
        // module transforms
        for (var i = 0; i < state.transforms.length; i++) {
          code = state.transforms[i](el, code);
        }
        
        return code
      }
    }
    function utvid (to, _from) {
      for (var key in _from) {
        to[key] = _from[key];
      }
      return to
    }
    var baseDirectives = {

    };
    function transformSpecialNewlines (text) {
      return text
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029')
    }
    function genText (text) {
      return ("lagTekstDevcoNode(" + (text.type === 2
        ? text.expression
        : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
    }
    function genProps (props) {
      console.log('GENERATE PROPS', props);
      var staticProps = "";
      var dynamicProps = "";
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        var value = transformSpecialNewlines(prop.value);
        if (prop.dynamic) {
          dynamicProps += (prop.name) + "," + value + ",";
        } else {
          staticProps += "\"" + (prop.name) + "\":" + value + ",";
        }
      }
      staticProps = "{" + (staticProps.slice(0, -1)) + "}";
      if (dynamicProps) {
        return ("_d(" + staticProps + ",[" + (dynamicProps.slice(0, -1)) + "])")
      } else {
        return staticProps
      }
    }
    function genDirectives (el, state) {
      var dirs = el.directives;
      if (!dirs) { return }
      var res = 'directives:[';
      var hasRuntime = false;
      var i, l, dir, needRuntime;
      for (i = 0, l = dirs.length; i < l; i++) {
        dir = dirs[i];
        needRuntime = true;
        var gen = state.directives[dir.name];
        if (gen) {
          needRuntime = !!gen(el, dir, state.warn);
        }
        if (needRuntime) {
          hasRuntime = true;
          res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\""))) : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
        }
      }
      if (hasRuntime) {
        return res.slice(0, -1) + ']'
      }
    }
    function genData$2 (el, state) {
      var data = '{';
  
      // directives first.
      // directives may mutate the el's other properties before they are generated.
      var dirs = genDirectives(el, state);
      if (dirs) { data += dirs + ','; }
  
      // key
      if (el.key) {
        data += "key:" + (el.key) + ",";
      }
      // ref
      if (el.ref) {
        data += "ref:" + (el.ref) + ",";
      }
      if (el.refInFor) {
        data += "refInFor:true,";
      }
      // pre
      if (el.pre) {
        data += "pre:true,";
      }
      // record original tag name for components using "is" attribute
      if (el.component) {
        data += "tag:\"" + (el.tag) + "\",";
      }
      // module data generation functions
      for (var i = 0; i < state.dataGenFns.length; i++) {
        data += state.dataGenFns[i](el);
      }
      // attributes
      if (el.attrs) {
        data += "attrs:" + (genProps(el.attrs)) + ",";
      }
      // DOM props
      if (el.props) {
        data += "domProps:" + (genProps(el.props)) + ",";
      }
      // event handlers
      if (el.events) {
        data += (genHandlers(el.events, false)) + ",";
      }
      if (el.nativeEvents) {
        data += (genHandlers(el.nativeEvents, true)) + ",";
      }
      // slot target
      // only for non-scoped slots
      if (el.slotTarget && !el.slotScope) {
        data += "slot:" + (el.slotTarget) + ",";
      }
      // scoped slots
      if (el.scopedSlots) {
        data += (genScopedSlots(el, el.scopedSlots, state)) + ",";
      }
      // component v-model
      if (el.model) {
        data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
      }
      // inline-template
      if (el.inlineTemplate) {
        var inlineTemplate = genInlineTemplate(el, state);
        if (inlineTemplate) {
          data += inlineTemplate + ",";
        }
      }
      data = data.replace(/,$/, '') + '}';

      if (el.dynamicAttrs) {
        data = "_b(" + data + ",\"" + (el.tag) + "\"," + (genProps(el.dynamicAttrs)) + ")";
      }
      // v-bind data wrap
      if (el.wrapData) {
        data = el.wrapData(data);
      }
      // v-on data wrap
      if (el.wrapListeners) {
        data = el.wrapListeners(data);
      }
      return data
    }
    function genNode (node, state) {
      if (node.type === 1) {
        return genElement(node, state)
      } else if (node.type === 3 && node.isComment) {
        return genComment(node)
      } else {
        return genText(node)
      }
    }
    var CodegenState = function CodegenState (options) {
      this.options = options;
      this.warn = options.warn || console.warn;
      this.transforms = pluckModuleFunction(options.modules, 'transformCode');
      this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
      this.directives = utvid(utvid({}, baseDirectives), options.directives);
      this.maybeComponent = function (el) { return !!el.component };
      this.onceId = 0;
      this.staticRenderFns = [];
      this.pre = false;
    };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwn (obj, key) {
      return hasOwnProperty.call(obj, key)
    }
    function FunctionalRenderContext (data, props, children, parent, Ctor) {
      var this$1 = this;
  
      var options = Ctor.options;
      // ensure the lagElement function in functional components
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
          var devconode = lagElement(contextVm, a, b, c, d, needNormalization);
          if (devconode && !Array.isArray(devconode)) {
            devconode.fnScopeId = options._scopeId;
            devconode.fnContext = parent;
          }
          return devconode
        };
      } else {
        this._c = function (a, b, c, d) { return lagElement(contextVm, a, b, c, d, needNormalization); };
      }
    }
    var lagKompiler = createCompilerCreator(function baseCompile (template, options) {
      console.log('TEMPLATE', options)
      var ast = analysere(template.trim(), options);

      var code = generate(ast, options);
      return {
        ast: ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
      }
    });

    installRenderHelpers(FunctionalRenderContext.prototype);


    var ref$1 = lagKompiler({});
    var kompiler = ref$1.kompiler;
    var kompilerTilFunksjoner = ref$1.kompilerTilFunksjoner;
    function createCompileToFunctionFn (kompiler) {
      var cache = Object.create(null);

      return function kompilerTilFunksjoner (
        template,
        options,
        vm
      ) {
        options = utvid({}, options);
        var warn$$1 = options.warn || advarsel;
        delete options.warn;
  
        /* istanbul ignore if */
        {
          // detect possible CSP restriction
          try {
            new Function('return 1');
          } catch (e) {
            if (e.toString().match(/unsafe-eval|CSP/)) {
              warn$$1(
                'It seems you are using the standalone build of Devco.js in an ' +
                'environment with Content Security Policy that prohibits unsafe-eval. ' +
                'The template compiler cannot work in this environment. Consider ' +
                'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
                'templates into render functions.'
              );
            }
          }
        }
  
        // check cache
        var key = options.delimiters
          ? String(options.delimiters) + template
          : template;
        if (cache[key]) {
          return cache[key]
        }
  
        // kompiler
        var compiled = kompiler(template, options);
  
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
  
        // check function generation errors.
        // this should only happen if there is a bug in the compiler itself.
        // mostly for codegen development use
        /* istanbul ignore if */
        {
          if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
            warn$$1(
              "Failed to generate render function:\n\n" +
              fnGenErrors.map(function (ref) {
                var err = ref.err;
                var code = ref.code;
  
                return ((err.toString()) + " in\n\n" + code + "\n");
            }).join('\n'),
              vm
            );
          }
        }
        return (cache[key] = res)
      }
    }
    function isNative (Ctor) {
      return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
    }
    var _Set;
    /* istanbul ignore if */ // $flow-disable-line
    if (typeof Set !== 'undefined' && isNative(Set)) {
      // use native Set when available.
      _Set = Set;
    } else {
      // a non-standard Set polyfill that only works with primitive keys.
      _Set = /*@__PURE__*/(function () {
        function Set () {
          this.set = Object.create(null);
        }
        Set.prototype.has = function has (key) {
          return this.set[key] === true
        };
        Set.prototype.add = function add (key) {
          this.set[key] = true;
        };
        Set.prototype.clear = function clear () {
          this.set = Object.create(null);
        };
  
        return Set;
      }());
    }
    /**
     * A watcher parses an expression, collects dependencies,
     * and fires callback when the expression value changes.
     * This is used for both the $watch() api and directives.
     */
     var Watcher = function Watcher (
      vm,
      expOrFn,
      cb,
      options,
      isRenderWatcher
    ) {
      this.vm = vm;
      if (isRenderWatcher) {
        vm._watcher = this;
      }
      vm._watchers = [];
      vm._watchers.push(this);
      // options
      if (options) {
        this.deep = !!options.deep;
        this.user = !!options.user;
        this.lazy = !!options.lazy;
        this.sync = !!options.sync;
        this.before = options.before;
      } else {
        this.deep = this.user = this.lazy = this.sync = false;
      }
      this.cb = cb;
      this.id = ++uid; // uid for batching
      this.active = true;
      this.dirty = this.lazy; // for lazy watchers
      this.deps = [];
      this.newDeps = [];
      this.depIds = new _Set();
      this.newDepIds = new _Set();
      this.expression = expOrFn.toString();
      // parse expression for getter
      if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
      } else {
        this.getter = parsePath(expOrFn);
        if (!this.getter) {
          this.getter = noop;
          warn(
            "Failed watching path: \"" + expOrFn + "\" " +
            'Watcher only accepts simple dot-delimited paths. ' +
            'For full control, use a function instead.',
            vm
          );
        }
      }
      this.value = this.lazy
        ? undefined
        : this.get();
    };
  
    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    Watcher.prototype.get = function get () {
      pushTarget(this);
      var value;
      var vm = this.vm;
      try {
        value = this.getter.call(vm, vm);
      } catch (e) {
        if (this.user) {
          feil(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
        } else {
          throw e
        }
      } finally {
        // "touch" every property so they are all tracked as
        // dependencies for deep watching
        if (this.deep) {
          traverse(value);
        }
        popTarget();
        this.cleanupDeps();
      }
      return value
    };
  
    /**
     * Add a dependency to this directive.
     */
    Watcher.prototype.addDep = function addDep (dep) {
      var id = dep.id;
      if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id);
        this.newDeps.push(dep);
        if (!this.depIds.has(id)) {
          dep.addSub(this);
        }
      }
    };
  
    /**
     * Clean up for dependency collection.
     */
    Watcher.prototype.cleanupDeps = function cleanupDeps () {
      var i = this.deps.length;
      while (i--) {
        var dep = this.deps[i];
        if (!this.newDepIds.has(dep.id)) {
          dep.removeSub(this);
        }
      }
      var tmp = this.depIds;
      this.depIds = this.newDepIds;
      this.newDepIds = tmp;
      this.newDepIds.clear();
      tmp = this.deps;
      this.deps = this.newDeps;
      this.newDeps = tmp;
      this.newDeps.length = 0;
    };
  
    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    Watcher.prototype.update = function update () {
      /* istanbul ignore else */
      if (this.lazy) {
        this.dirty = true;
      } else if (this.sync) {
        this.run();
      } else {
        queueWatcher(this);
      }
    };
  
    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */
    Watcher.prototype.run = function run () {
      if (this.active) {
        var value = this.get();
        if (
          value !== this.value ||
          // Deep watchers and watchers on Object/Arrays should fire even
          // when the value is the same, because the value may
          // have mutated.
          isObject(value) ||
          this.deep
        ) {
          // set new value
          var oldValue = this.value;
          this.value = value;
          if (this.user) {
            var info = "callback for watcher \"" + (this.expression) + "\"";
            invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info);
          } else {
            this.cb.call(this.vm, value, oldValue);
          }
        }
      }
    };
  
    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */
    Watcher.prototype.evaluate = function evaluate () {
      this.value = this.get();
      this.dirty = false;
    };
  
    /**
     * Depend on all deps collected by this watcher.
     */
    Watcher.prototype.depend = function depend () {
      var i = this.deps.length;
      while (i--) {
        this.deps[i].depend();
      }
    };
  
    /**
     * Remove self from all dependencies' subscriber list.
     */
    Watcher.prototype.teardown = function teardown () {
      if (this.active) {
        // remove self from vm's watcher list
        // this is a somewhat expensive operation so we skip it
        // if the vm is being destroyed.
        if (!this.vm._isBeingDestroyed) {
          remove(this.vm._watchers, this);
        }
        var i = this.deps.length;
        while (i--) {
          this.deps[i].removeSub(this);
        }
        this.active = false;
      }
    };
    var uid = 0;
  
    /**
     * A dep is an observable that can have multiple
     * directives subscribing to it.
     */
    var Dep = function Dep () {
      this.id = uid++;
      this.subs = [];
    };
  
    Dep.prototype.addSub = function addSub (sub) {
      this.subs.push(sub);
    };
  
    Dep.prototype.removeSub = function removeSub (sub) {
      remove(this.subs, sub);
    };
  
    Dep.prototype.depend = function depend () {
      if (Dep.target) {
        Dep.target.addDep(this);
      }
    };
  
    Dep.prototype.notify = function notify () {
      // stabilize the subscriber list first
      var subs = this.subs.slice();
      if (!config.async) {
        // subs aren't sorted in scheduler if not running async
        // we need to sort them now to make sure they fire in correct
        // order
        subs.sort(function (a, b) { return a.id - b.id; });
      }
      for (var i = 0, l = subs.length; i < l; i++) {
        subs[i].update();
      }
    };
  
    // The current target watcher being evaluated.
    // This is globally unique because only one watcher
    // can be evaluated at a time.
    Dep.target = null;
    var targetStack = [];
  
    function pushTarget (target) {
      targetStack.push(target);
      Dep.target = target;
    }
  
    function popTarget () {
      targetStack.pop();
      Dep.target = targetStack[targetStack.length - 1];
    }
    function callHook (vm, hook) {
      // #7573 disable dep collection when invoking lifecycle hooks
      pushTarget();
      var handlers = vm.$options[hook];
      var info = hook + " hook";
      if (handlers) {
        for (var i = 0, j = handlers.length; i < j; i++) {
          invokeWithErrorHandling(handlers[i], vm, null, vm, info);
        }
      }
      if (vm._hasHookEvent) {
        vm.$emit('hook:' + hook);
      }
      popTarget();
    }
    function updateAttrs (gammelDevconode, devconode) {
      var opts = devconode.componentOptions;
      if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
        return
      }
      if (isUndef(gammelDevconode.data.attrs) && isUndef(devconode.data.attrs)) {
        return
      }
      var key, cur, old;
      var elm = devconode.elm;
      var oldAttrs = gammelDevconode.data.attrs || {};
      var attrs = devconode.data.attrs || {};
      // clone observed objects, as the user probably wants to mutate it
      if (isDef(attrs.__ob__)) {
        attrs = devconode.data.attrs = extend({}, attrs);
      }
  
      for (key in attrs) {
        cur = attrs[key];
        old = oldAttrs[key];
        if (old !== cur) {
          setAttr(elm, key, cur, devconode.data.pre);
        }
      }
      // #4391: in IE9, setting type can reset value for input[type=radio]
      // #6666: IE/Edge forces progress value down to 1 before setting a max
      /* istanbul ignore if */
      if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
        setAttr(elm, 'value', attrs.value);
      }
      for (key in oldAttrs) {
        if (isUndef(attrs[key])) {
          if (isXlink(key)) {
            elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
          } else if (!isEnumeratedAttr(key)) {
            elm.removeAttribute(key);
          }
        }
      }
    }
    function lagElement$1 (tagName, devconode) {
      var elm = document.createElement(tagName);
      if (tagName !== 'select') {
        return elm
      }
      // false or null will remove the attribute but undefined will not
      if (devconode.data && devconode.data.attrs && devconode.data.attrs.multiple !== undefined) {
        elm.setAttribute('multiple', 'multiple');
      }
      return elm
    }
  
    function createElementNS (namespace, tagName) {
      return document.createElementNS(namespaceMap[namespace], tagName)
    }
  
    function createTextNode (text) {
      return document.createTextNode(text)
    }
  
    function createComment (text) {
      return document.createComment(text)
    }
  
    function insertBefore (parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
    }
  
    function removeChild (node, child) {
      node.removeChild(child);
    }
  
    function appendChild (node, child) {
      node.appendChild(child);
    }
  
    function parentNode (node) {
      return node.parentNode
    }
  
    function nextSibling (node) {
      return node.nextSibling
    }
  
    function tagName (node) {
      return node.tagName
    }
  
    function setTextContent (node, text) {
      node.textContent = text;
    }
  
    function setStyleScope (node, scopeId) {
      node.setAttribute(scopeId, '');
    }
    var nodeOps = Object.freeze({
      lagElement: lagElement,
      createElementNS: createElementNS,
      createTextNode: createTextNode,
      createComment: createComment,
      insertBefore: insertBefore,
      removeChild: removeChild,
      appendChild: appendChild,
      parentNode: parentNode,
      nextSibling: nextSibling,
      tagName: tagName,
      setTextContent: setTextContent,
      setStyleScope: setStyleScope
    });
    function isDef (v) {
      return v !== undefined && v !== null
    }
    var attrs = {
      create: updateAttrs,
      update: updateAttrs
    };
    var platformModules = [
      attrs
    ];
    var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];
    function createPatchFunction (backend) {
      var i, j;
      var cbs = {};

      console.log('CREATE PATCH FUNCTION')
  
      var modules = backend.modules;
      var nodeOps = backend.nodeOps;

      for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
          if (isDef(modules[j][hooks[i]])) {
            cbs[hooks[i]].push(modules[j][hooks[i]]);
          }
        }
      }
  
      function emptyNodeAt (elm) {
        return new DevcoNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
      }
  
      function createRmCb (childElm, listeners) {
        function remove$$1 () {
          if (--remove$$1.listeners === 0) {
            removeNode(childElm);
          }
        }
        remove$$1.listeners = listeners;
        return remove$$1
      }
  
      function removeNode (el) {
        var parent = nodeOps.parentNode(el);
        // element may have already been removed due to v-html / v-text
        if (isDef(parent)) {
          nodeOps.removeChild(parent, el);
        }
      }
  
      function isUnknownElement$$1 (devconode, inDevcoPre) {
        return (
          !inDevcoPre &&
          !devconode.ns &&
          !(
            config.ignoredElements.length &&
            config.ignoredElements.some(function (ignore) {
              return isRegExp(ignore)
                ? ignore.test(devconode.tag)
                : ignore === devconode.tag
            })
          ) &&
          config.isUnknownElement(devconode.tag)
        )
      }
  
      var creatingElmInVPre = 0;
  
      function lagElm (
        devconode,
        insertedVnodeQueue,
        parentElm,
        refElm,
        nested,
        ownerArray,
        index
      ) {
        if (isDef(devconode.elm) && isDef(ownerArray)) {
          // This devconode was used in a previous render!
          // now it's used as a new node, overwriting its elm would cause
          // potential lapp errors down the road when it's used as an insertion
          // reference node. Instead, we clone the node on-demand before creating
          // associated DOM element for it.
          devconode = ownerArray[index] = cloneDevcoNode(devconode);
        }
        devconode.isRootInsert = !nested; // for transition enter check
        if (lagKomponent(devconode, insertedVnodeQueue, parentElm, refElm)) {
          return
        }
  
        var data = devconode.data;
        var children = devconode.children;
        var tag = devconode.tag;

        if (isDef(tag)) {
          {
            if (data && data.pre) {
              creatingElmInVPre++;
            }
            if (isUnknownElement$$1(devconode, creatingElmInVPre)) {
              warn(
                'Unknown custom element: <' + tag + '> - did you ' +
                'register the component correctly? For recursive components, ' +
                'make sure to provide the "name" option.',
                devconode.context
              );
            }
          }
  
          devconode.elm = devconode.ns
            ? nodeOps.createElementNS(devconode.ns, tag)
            : nodeOps.lagElement(tag, devconode);
          setScope(devconode);
  
          /* istanbul ignore if */
          {
            lagBarn(devconode, children, insertedVnodeQueue);
            if (isDef(data)) {
              invokeCreateHooks(devconode, insertedVnodeQueue);
            }
            insert(parentElm, devconode.elm, refElm);
          }
  
          if (data && data.pre) {
            creatingElmInVPre--;
          }
        } else if (isTrue(devconode.isComment)) {
          devconode.elm = nodeOps.createComment(devconode.text);
          insert(parentElm, devconode.elm, refElm);
        } else {
          devconode.elm = nodeOps.createTextNode(devconode.text);
          insert(parentElm, devconode.elm, refElm);
        }
      }
  
      function lagKomponent (devconode, insertedVnodeQueue, parentElm, refElm) {
        var i = devconode.data;
        if (isDef(i)) {
          var isReactivated = isDef(devconode.componentInstance) && i.keepAlive;
          if (isDef(i = i.hook) && isDef(i = i.init)) {
            i(devconode, false /* hydrating */);
          }
          // after calling the init hook, if the devconode is a child component
          // it should've created a child instance and mounted it. the child
          // component also has set the placeholder devconode's elm.
          // in that case we can just return the element and be done.
          if (isDef(devconode.componentInstance)) {
            initComponent(devconode, insertedVnodeQueue);
            insert(parentElm, devconode.elm, refElm);
            if (isTrue(isReactivated)) {
              reactivateComponent(devconode, insertedVnodeQueue, parentElm, refElm);
            }
            return true
          }
        }
      }
  
      function initComponent (devconode, insertedVnodeQueue) {
        if (isDef(devconode.data.pendingInsert)) {
          insertedVnodeQueue.push.apply(insertedVnodeQueue, devconode.data.pendingInsert);
          devconode.data.pendingInsert = null;
        }
        devconode.elm = devconode.componentInstance.$el;
        if (isPatchable(devconode)) {
          invokeCreateHooks(devconode, insertedVnodeQueue);
          setScope(devconode);
        } else {
          // empty component root.
          // skip all element-related modules except for ref (#3455)
          registerRef(devconode);
          // make sure to invoke the insert hook
          insertedVnodeQueue.push(devconode);
        }
      }
  
      function reactivateComponent (devconode, insertedVnodeQueue, parentElm, refElm) {
        var i;
        // hack for #4339: a reactivated component with inner transition
        // does not trigger because the inner node's created hooks are not called
        // again. It's not ideal to involve module-specific logic in here but
        // there doesn't seem to be a better way to do it.
        var innerNode = devconode;
        while (innerNode.componentInstance) {
          innerNode = innerNode.componentInstance._devconode;
          if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
            for (i = 0; i < cbs.activate.length; ++i) {
              cbs.activate[i](emptyNode, innerNode);
            }
            insertedVnodeQueue.push(innerNode);
            break
          }
        }
        // unlike a newly created component,
        // a reactivated keep-alive component doesn't insert itself
        insert(parentElm, devconode.elm, refElm);
      }
  
      function insert (parent, elm, ref$$1) {
        if (isDef(parent)) {
          if (isDef(ref$$1)) {
            if (nodeOps.parentNode(ref$$1) === parent) {
              nodeOps.insertBefore(parent, elm, ref$$1);
            }
          } else {
            nodeOps.appendChild(parent, elm);
          }
        }
      }
  
      function lagBarn (devconode, children, insertedVnodeQueue) {
        if (Array.isArray(children)) {
          {
            checkDuplicateKeys(children);
          }
          for (var i = 0; i < children.length; ++i) {
            lagElm(children[i], insertedVnodeQueue, devconode.elm, null, true, children, i);
          }
        } else if (isPrimitive(devconode.text)) {
          nodeOps.appendChild(devconode.elm, nodeOps.createTextNode(String(devconode.text)));
        }
      }
  
      function isPatchable (devconode) {
        while (devconode.componentInstance) {
          devconode = devconode.componentInstance._devconode;
        }
        return isDef(devconode.tag)
      }
  
      function invokeCreateHooks (devconode, insertedVnodeQueue) {
        for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
          cbs.create[i$1](emptyNode, devconode);
        }
        i = devconode.data.hook; // Reuse variable
        if (isDef(i)) {
          if (isDef(i.create)) { i.create(emptyNode, devconode); }
          if (isDef(i.insert)) { insertedVnodeQueue.push(devconode); }
        }
      }
  
      // set scope id attribute for scoped CSS.
      // this is implemented as a special case to avoid the overhead
      // of going through the normal attribute patching process.
      function setScope (devconode) {
        var i;
        if (isDef(i = devconode.fnScopeId)) {
          nodeOps.setStyleScope(devconode.elm, i);
        } else {
          var stamfar = devconode;
          while (stamfar) {
            if (isDef(i = stamfar.context) && isDef(i = i.$options._scopeId)) {
              nodeOps.setStyleScope(devconode.elm, i);
            }
            stamfar = stamfar.parent;
          }
        }
        // for slot content they should also get the scopeId from the host instance.
        if (isDef(i = activeInstance) &&
          i !== devconode.context &&
          i !== devconode.fnContext &&
          isDef(i = i.$options._scopeId)
        ) {
          nodeOps.setStyleScope(devconode.elm, i);
        }
      }
  
      function leggtilDevconodes (parentElm, refElm, devconodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
          lagElm(devconodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, devconodes, startIdx);
        }
      }
  
      function invokeDestroyHook (devconode) {
        var i, j;
        var data = devconode.data;
        if (isDef(data)) {
          if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(devconode); }
          for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](devconode); }
        }
        if (isDef(i = devconode.children)) {
          for (j = 0; j < devconode.children.length; ++j) {
            invokeDestroyHook(devconode.children[j]);
          }
        }
      }
  
      function fjernDevconodes (devconodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
          var ch = devconodes[startIdx];
          if (isDef(ch)) {
            if (isDef(ch.tag)) {
              removeAndInvokeRemoveHook(ch);
              invokeDestroyHook(ch);
            } else { // Text node
              removeNode(ch.elm);
            }
          }
        }
      }
  
      function removeAndInvokeRemoveHook (devconode, rm) {
        if (isDef(rm) || isDef(devconode.data)) {
          var i;
          var listeners = cbs.remove.length + 1;
          if (isDef(rm)) {
            // we have a recursively passed down rm callback
            // increase the listeners count
            rm.listeners += listeners;
          } else {
            // directly removing
            rm = createRmCb(devconode.elm, listeners);
          }
          // recursively invoke hooks on child component root node
          if (isDef(i = devconode.componentInstance) && isDef(i = i._devconode) && isDef(i.data)) {
            removeAndInvokeRemoveHook(i, rm);
          }
          for (i = 0; i < cbs.remove.length; ++i) {
            cbs.remove[i](devconode, rm);
          }
          if (isDef(i = devconode.data.hook) && isDef(i = i.remove)) {
            i(devconode, rm);
          } else {
            rm();
          }
        } else {
          removeNode(devconode.elm);
        }
      }
  
      function oppdaterBarn (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
        var oldStartIdx = 0;
        var newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartVnode = oldCh[0];
        var oldEndVnode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartVnode = newCh[0];
        var newEndVnode = newCh[newEndIdx];
        var oldKeyToIdx, idxInOld, devconodeToMove, refElm;
  
        // removeOnly is a special flag used only by <transition-group>
        // to ensure removed elements stay in correct relative positions
        // during leaving transitions
        var canMove = !removeOnly;
  
        {
          checkDuplicateKeys(newCh);
        }
  
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
          if (isUndef(oldStartVnode)) {
            oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
          } else if (isUndef(oldEndVnode)) {
            oldEndVnode = oldCh[--oldEndIdx];
          } else if (sameVnode(oldStartVnode, newStartVnode)) {
            lappDevconode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
          } else if (sameVnode(oldEndVnode, newEndVnode)) {
            lappDevconode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
          } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
            lappDevconode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
            canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
          } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
            lappDevconode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
          } else {
            if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
            idxInOld = isDef(newStartVnode.key)
              ? oldKeyToIdx[newStartVnode.key]
              : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
            if (isUndef(idxInOld)) { // New element
              lagElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            } else {
              devconodeToMove = oldCh[idxInOld];
              if (sameVnode(devconodeToMove, newStartVnode)) {
                lappDevconode(devconodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                oldCh[idxInOld] = undefined;
                canMove && nodeOps.insertBefore(parentElm, devconodeToMove.elm, oldStartVnode.elm);
              } else {
                // same key but different element. treat as new element
                lagElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
              }
            }
            newStartVnode = newCh[++newStartIdx];
          }
        }
        if (oldStartIdx > oldEndIdx) {
          refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
          leggtilDevconodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        } else if (newStartIdx > newEndIdx) {
          fjernDevconodes(oldCh, oldStartIdx, oldEndIdx);
        }
      }
  
      function checkDuplicateKeys (children) {
        var seenKeys = {};
        for (var i = 0; i < children.length; i++) {
          var devconode = children[i];
          var key = devconode.key;
          if (isDef(key)) {
            if (seenKeys[key]) {
              advarsel(
                ("Flere nøkkler funnet av: '" + key + "'. Dette kan foråresake en oppdateringsfeil"),
                devconode.context
              );
            } else {
              seenKeys[key] = true;
            }
          }
        }
      }
  
      function findIdxInOld (node, oldCh, start, end) {
        for (var i = start; i < end; i++) {
          var c = oldCh[i];
          if (isDef(c) && sameVnode(node, c)) { return i }
        }
      }
  
      function lappDevconode (gammelDevconode,devconode,insertedVnodeQueue, ownerArray, index, removeOnly) {
        if (gammelDevconode === devconode) {
          return
        }
  
        if (isDef(devconode.elm) && isDef(ownerArray)) {
          // clone reused devconode
          devconode = ownerArray[index] = cloneDevcoNode(devconode);
        }
  
        var elm = devconode.elm = gammelDevconode.elm;
  
        if (isTrue(gammelDevconode.isAsyncPlaceholder)) {
          if (isDef(devconode.asyncFactory.resolved)) {
            hydrate(gammelDevconode.elm, devconode, insertedVnodeQueue);
          } else {
            devconode.isAsyncPlaceholder = true;
          }
          return
        }
  
        // reuse element for static trees.
        // note we only do this if the devconode is cloned -
        // if the new node is not cloned it means the render functions have been
        // reset by the hot-reload-api and we need to do a proper re-render.
        if (isTrue(devconode.isStatic) &&
          isTrue(gammelDevconode.isStatic) &&
          devconode.key === gammelDevconode.key &&
          (isTrue(devconode.isCloned) || isTrue(devconode.isOnce))
        ) {
          devconode.componentInstance = gammelDevconode.componentInstance;
          return
        }
  
        var i;
        var data = devconode.data;
        if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
          i(gammelDevconode, devconode);
        }
  
        var oldCh = gammelDevconode.children;
        var ch = devconode.children;
        if (isDef(data) && isPatchable(devconode)) {
          for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](gammelDevconode, devconode); }
          if (isDef(i = data.hook) && isDef(i = i.update)) { i(gammelDevconode, devconode); }
        }
        if (isUndef(devconode.text)) {
          if (isDef(oldCh) && isDef(ch)) {
            if (oldCh !== ch) { oppdaterBarn(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
          } else if (isDef(ch)) {
            {
              checkDuplicateKeys(ch);
            }
            if (isDef(gammelDevconode.text)) { nodeOps.setTextContent(elm, ''); }
            leggtilDevconodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
          } else if (isDef(oldCh)) {
            fjernDevconodes(oldCh, 0, oldCh.length - 1);
          } else if (isDef(gammelDevconode.text)) {
            nodeOps.setTextContent(elm, '');
          }
        } else if (gammelDevconode.text !== devconode.text) {
          nodeOps.setTextContent(elm, devconode.text);
        }
        if (isDef(data)) {
          if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(gammelDevconode, devconode); }
        }
      }
  
      function invokeInsertHook (devconode, queue, initial) {
        // delay insert hooks for component root nodes, invoke them after the
        // element is really inserted
        if (isTrue(initial) && isDef(devconode.parent)) {
          devconode.parent.data.pendingInsert = queue;
        } else {
          for (var i = 0; i < queue.length; ++i) {
            queue[i].data.hook.insert(queue[i]);
          }
        }
      }
  
      var hydrationBailed = false;
      // list of modules that can skip create hook during hydration because they
      // are already rendered on the client or has no need for initialization
      // Note: style is excluded because it relies on initial clone for future
      // deep updates (#7063).
      var isRenderedModule = lagKart('attrs,class,staticClass,staticStyle,key');
  
      // Note: this is a browser-only function so we can assume elms are DOM nodes.
      function hydrate (elm, devconode, insertedVnodeQueue, inDevcoPre) {
        var i;
        var tag = devconode.tag;
        var data = devconode.data;
        var children = devconode.children;
        inDevcoPre = inDevcoPre || (data && data.pre);
        devconode.elm = elm;
  
        if (isTrue(devconode.isComment) && isDef(devconode.asyncFactory)) {
          devconode.isAsyncPlaceholder = true;
          return true
        }

        if (isDef(data)) {
          if (isDef(i = data.hook) && isDef(i = i.init)) { i(devconode, true /* hydrating */); }
          if (isDef(i = devconode.componentInstance)) {
            // child component. it should have hydrated its own tree.
            initComponent(devconode, insertedVnodeQueue);
            return true
          }
        }
        if (isDef(tag)) {
          if (isDef(children)) {
            // empty element, allow client to pick up and populate children
            if (!elm.hasChildNodes()) {
              lagBarn(devconode, children, insertedVnodeQueue);
            } else {
              // v-html and domProps: innerHTML
              if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
                if (i !== elm.innerHTML) {
                  /* istanbul ignore if */
                  if (typeof console !== 'undefined' &&
                    !hydrationBailed
                  ) {
                    hydrationBailed = true;
                    advarsel('Parent: ', elm);
                    advarsel('server innerHTML: ', i);
                    advarsel('client innerHTML: ', elm.innerHTML);
                  }
                  return false
                }
              } else {
                // iterate and compare children lists
                var childrenMatch = true;
                var childNode = elm.firstChild;
                for (var i$1 = 0; i$1 < children.length; i$1++) {
                  if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inDevcoPre)) {
                    childrenMatch = false;
                    break
                  }
                  childNode = childNode.nextSibling;
                }
                // if childNode is not null, it means the actual childNodes list is
                // longer than the virtual children list.
                if (!childrenMatch || childNode) {
                  /* istanbul ignore if */
                  if (typeof console !== 'undefined' &&
                    !hydrationBailed
                  ) {
                    hydrationBailed = true;
                    console.warn('Parent: ', elm);
                    console.warn('Mismatching childNodes vs. DevcoNodes: ', elm.childNodes, children);
                  }
                  return false
                }
              }
            }
          }
          if (isDef(data)) {
            var fullInvoke = false;
            for (var key in data) {
              if (!isRenderedModule(key)) {
                fullInvoke = true;
                invokeCreateHooks(devconode, insertedVnodeQueue);
                break
              }
            }
            if (!fullInvoke && data['class']) {
              // ensure collecting deps for deep class bindings for future updates
              traverse(data['class']);
            }
          }
        } else if (elm.data !== devconode.text) {
          elm.data = devconode.text;
        }
        return true
      }
  
  
      return function lapp (gammelDevconode, devconode, hydrating, removeOnly) {
        if (isUndef(devconode)) {
          if (isDef(gammelDevconode)) { invokeDestroyHook(gammelDevconode); }
          return
        }
  
        var isInitialPatch = false;
        var insertedVnodeQueue = [];
  
        if (isUndef(gammelDevconode)) {
          // empty monter (likely as component), create new root element
          isInitialPatch = true;
          lagElm(devconode, insertedVnodeQueue);
        } else {
          var isRealElement = isDef(gammelDevconode.nodeType);
          if (!isRealElement && sameVnode(gammelDevconode, devconode)) {
            // lapp existing root node
            lappDevconode(gammelDevconode, devconode, insertedVnodeQueue, null, null, removeOnly);
          } else {
            if (isRealElement) {
              // mounting to a real element
              // check if this is server-rendered content and if we can perform
              // a successful hydration.
              if (gammelDevconode.nodeType === 1 && gammelDevconode.hasAttribute(SSR_ATTR)) {
                gammelDevconode.removeAttribute(SSR_ATTR);
                hydrating = true;
              }
              if (isTrue(hydrating)) {
                if (hydrate(gammelDevconode, devconode, insertedVnodeQueue)) {
                  invokeInsertHook(devconode, insertedVnodeQueue, true);
                  return gammelDevconode
                } else {
                  warn(
                    'The client-side rendered virtual DOM tree is not matching ' +
                    'server-rendered content. This is likely caused by incorrect ' +
                    'HTML markup, for example nesting block-level elements inside ' +
                    '<p>, or missing <tbody>. Bailing hydration and performing ' +
                    'full client-side render.'
                  );
                }
              }
              // either not server-rendered, or hydration failed.
              // create an empty node and replace it
              gammelDevconode = emptyNodeAt(gammelDevconode);
            }
  
            // replacing existing element
            var oldElm = gammelDevconode.elm;
            var parentElm = nodeOps.parentNode(oldElm);
            
            // create new node
            lagElm(
              devconode,
              insertedVnodeQueue,
              // extremely rare edge case: do not insert if old element is in a
              // leaving transition. Only happens when combining transition +
              // keep-alive + HOCs. (#4590)
              oldElm._leaveCb ? null : parentElm,
              nodeOps.nextSibling(oldElm)
            );
  
            // update parent placeholder node element, recursively
            if (isDef(devconode.parent)) {
              var stamfar = devconode.parent;
              var patchable = isPatchable(devconode);
              while (stamfar) {
                for (var i = 0; i < cbs.destroy.length; ++i) {
                  cbs.destroy[i](stamfar);
                }
                stamfar.elm = devconode.elm;
                if (patchable) {
                  for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                    cbs.create[i$1](emptyNode, stamfar);
                  }
                  // #6513
                  // invoke insert hooks that may have been merged by create hooks.
                  // e.g. for directives that uses the "inserted" hook.
                  var insert = stamfar.data.hook.insert;
                  if (insert.merged) {
                    // start at index 1 to avoid re-invoking component mounted hook
                    for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                      insert.fns[i$2]();
                    }
                  }
                } else {
                  registerRef(stamfar);
                }
                stamfar = stamfar.parent;
              }
            }
  
            // destroy old node
            if (isDef(parentElm)) {
              fjernDevconodes([gammelDevconode], 0, 0);
            } else if (isDef(gammelDevconode.tag)) {
              invokeDestroyHook(gammelDevconode);
            }
          }
        }
  
        invokeInsertHook(devconode, insertedVnodeQueue, isInitialPatch);
        return devconode.elm
      }
    }
    function isTrue (v) {
      return v === true
    }
  
    function isFalse (v) {
      return v === false
    }
    var SSR_ATTR = 'data-server-rendered';
    function isUndef (v) {
      return v === undefined || v === null
    }
    var modules = platformModules;
    var lapp = createPatchFunction({ nodeOps: nodeOps, modules: modules });
    var currentRenderingInstance = null;
    Devco.prototype.__patch__ = true ? lapp : noop;
    function lifecycleMixin (Devco) {
      Devco.prototype._oppdater = function (devconode, hydrating) {
        var vm = this;
        var prevEl = vm.$el;

        var prevDevconode = vm._devconode;
        var restoreActiveInstance = vm;
        vm._devconode = devconode;

        if (!prevDevconode) {
          // initial render
          console.log(vm.__patch__(vm.$el, devconode, hydrating, false))
          vm.$el = vm.__patch__(vm.$el, devconode, hydrating, false);
        } else {
          // updates
          vm.$el = vm.__patch__(prevDevconode, devconode);
        }
        // restoreActiveInstance();
        // update __vue__ reference
        if (prevEl) {
          prevEl.__devco__ = null;
        }
        if (vm.$el) {
          vm.$el.__devco__ = vm;
        }
        // if parent is an HOC, update its $el as well
        if (vm.$devconode && vm.$parent && vm.$devconode === vm.$parent._devconode) {
          vm.$parent.$el = vm.$el;
        }
        // updated hook is called by the scheduler to ensure that children are
        // updated in a parent's updated hook.
      };
  
      Devco.prototype.$forceUpdate = function () {
        var vm = this;
        if (vm._watcher) {
          vm._watcher.update();
        }
      };
  
      Devco.prototype.$destroy = function () {
        var vm = this;
        if (vm._isBeingDestroyed) {
          return
        }
        callHook(vm, 'beforeDestroy');
        vm._isBeingDestroyed = true;
        // remove self from parent
        var parent = vm.$parent;
        if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
          remove(parent.$children, vm);
        }
        // teardown watchers
        if (vm._watcher) {
          vm._watcher.teardown();
        }
        var i = vm._watchers.length;
        while (i--) {
          vm._watchers[i].teardown();
        }
        // remove reference from data ob
        // frozen object may not have observer.
        if (vm._data.__ob__) {
          vm._data.__ob__.vmCount--;
        }
        // call the last hook...
        vm._isDestroyed = true;
        // invoke destroy hooks on current rendered tree
        vm.__patch__(vm._devconode, null);
        // fire destroyed hook
        callHook(vm, 'destroyed');
        // turn off all instance listeners.
        vm.$off();
        // remove __vue__ reference
        if (vm.$el) {
          vm.$el.__devco__ = null;
        }
        // release circular reference (#6759)
        if (vm.$devconode) {
          vm.$devconode.parent = null;
        }
      };
    }
    function renderMixin (Devco) {
      // install runtime convenience helpers
      installRenderHelpers(Devco.prototype);
  
      Devco.prototype.$nextTick = function (fn) {
        return nextTick(fn, this)
      };
      
      Devco.prototype._render = function () {
        
        var vm = this;
        vm.$options.render = lagTomDevcoNode;
        vm.$lagElement = function (a, b, c, d) { return lagElement(vm, a, b, c, d, true); };
        var ref = vm.$options;
        var render = ref.render;
        var _parentDevconode = ref._parentDevconode;
  
        if (_parentDevconode) {
          vm.$scopedSlots = normalizeScopedSlots(
            _parentDevconode.data.scopedSlots,
            vm.$slots,
            vm.$scopedSlots
          );
        }
  
        // set parent devconode. this allows render functions to have access
        // to the data on the placeholder node.
        vm.$devconode = _parentDevconode;
        
        // render self
        var devconode;
        try {
          // There's no need to maintain a stack because all render fns are called
          // separately from one another. Nested component's render fns are called
          // when parent component is patched.
          currentRenderingInstance = vm;
          devconode = render.call(vm._renderProxy, vm.$lagElement);
        } catch (e) {
          feil(e, vm, "render");
          // return error render result,
          // or previous devconode to prevent render error causing blank component
          /* istanbul ignore else */
          if (vm.$options.renderError) {
            try {
              devconode = vm.$options.renderError.call(vm._renderProxy, vm.$lagElement, e);
            } catch (e) {
              feil(e, vm, "renderError");
              devconode = vm._devconode;
            }
          } else {
            devconode = vm._devconode;
          }
        } finally {
          currentRenderingInstance = null;
        }
        // if the returned array contains only a single node, allow it
        if (Array.isArray(devconode) && devconode.length === 1) {
          devconode = devconode[0];
        }
        // return empty devconode in case the render function errored out
        if (!(devconode instanceof DevcoNode)) {
          if (Array.isArray(devconode)) {
            advarsel(
              'Multiple root nodes returned from render function. Render function ' +
              'should return a single root node.',
              vm
            );
          }
          devconode = lagTomDevcoNode();
        }
        // set parent
        devconode.parent = _parentDevconode;
        return devconode
      };
    }
    function monterKomponent (vm, el, hydrating) {
      vm.$el = el;
      if (!vm.$options.render) {
        vm.$options.render = lagTomDevcoNode;
        {
          if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
            vm.$options.el || el) {
            advarsel(
              'You are using the runtime-only build of Devco where the template ' +
              'compiler is not available. Either pre-kompiler the templates into ' +
              'render functions, or use the compiler-included build.',
              vm
            );
          } else {
            advarsel(
              'Failed to monter component: template or render function not defined.',
              vm
            );
          }
        }
      }
      callHook(vm, 'beforeMount');
  
      var updateComponent;
      
      updateComponent = function () {
        vm._oppdater(vm._render(), hydrating);
      };
  
      // we set this to vm._watcher inside the watcher's constructor
      // since the watcher's initial lapp may call $forceUpdate (e.g. inside child
      // component's mounted hook), which relies on vm._watcher being already defined
      new Watcher(vm, updateComponent, noop, {
        before: function before () {
          if (vm._isMounted && !vm._isDestroyed) {
            callHook(vm, 'beforeUpdate');
          }
        }
      }, true /* isRenderWatcher */);
      hydrating = false;
  
      // manually mounted instance, call mounted on self
      // mounted is called for render-created child components in its inserted hook
      if (vm.$devconode == null) {
        vm._isMounted = true;
        callHook(vm, 'mounted');
      }
      return vm
    }
    Devco.prototype.$monter = function (el, hydrating) {
      
      el = el && true ? query(el) : undefined;
      return monterKomponent(this, el, hydrating)
    };
  
    function createCompilerCreator (baseCompile) {
      return function lagKompiler (baseOptions) {
        function kompiler (template, options) {
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

          compiled.errors = errors;
          compiled.tips = tips;
          return compiled
        }
  
        return {
          kompiler: kompiler,
          kompilerTilFunksjoner: createCompileToFunctionFn(kompiler)
        }
      }
    }
    function normalizeProps (options, vm) {
      var props = options.props;

      if (!props) { return }
      var res = {};
      var i, val, name;
      if (Array.isArray(props)) {
        i = props.length;
        while (i--) {
          val = props[i];
          if (typeof val === 'string') {
            name = camelize(val);
            res[name] = { type: null };
          } else {
            warn('props must be strings when using array syntax.');
          }
        }
      } else if (isPlainObject(props)) {
        for (var key in props) {
          val = props[key];
          name = camelize(key);
          res[name] = isPlainObject(val)
            ? val
            : { type: val };
        }
      } else {
        warn(
          "Invalid value for option \"props\": expected an Array or an Object, " +
          "but got " + (toRawType(props)) + ".",
          vm
        );
      }
      options.props = res;
    }
  
    /**
     * Normalize all injections into Object-based format
     */
    function normalizeInject (options, vm) {
      var inject = options.inject;
      if (!inject) { return }
      var normalized = options.inject = {};
      if (Array.isArray(inject)) {
        for (var i = 0; i < inject.length; i++) {
          normalized[inject[i]] = { from: inject[i] };
        }
      } else if (isPlainObject(inject)) {
        for (var key in inject) {
          var val = inject[key];
          normalized[key] = isPlainObject(val)
            ? extend({ from: key }, val)
            : { from: val };
        }
      } else {
        warn(
          "Invalid value for option \"inject\": expected an Array or an Object, " +
          "but got " + (toRawType(inject)) + ".",
          vm
        );
      }
    }
  
    /**
     * Normalize raw function directives into object format.
     */
    function normalizeDirectives (options) {
      var dirs = options.directives;
      if (dirs) {
        for (var key in dirs) {
          var def$$1 = dirs[key];
          if (typeof def$$1 === 'function') {
            dirs[key] = { bind: def$$1, update: def$$1 };
          }
        }
      }
    }
    function noop (a, b, c) {}
    function createFunction (code, errors) {
      try {
        return new Function(code)
      } catch (err) {
        errors.push({ err: err, code: code });
        return noop
      }
    }
    var defaultStrat = function (parentVal, childVal) {
      return childVal === undefined
        ? parentVal
        : childVal
    };
    function slåsammenInnstillinger(forelder, child, vm) {
  
      if (typeof child === 'function') {
        child = child.options;
      }
  
      normalizeProps(child, vm);
      normalizeInject(child, vm);
      normalizeDirectives(child);
      

      if (!child._base) {
        if (child.extends) {
          forelder = slåsammenInnstillinger(forelder, child.extends, vm);
        }
        if (child.mixins) {
          for (var i = 0, l = child.mixins.length; i < l; i++) {
            forelder = slåsammenInnstillinger(forelder, child.mixins[i], vm);
          }
        }
      }
      var strats = {}
      var options = {};
      var key;
      for (key in forelder) {
        slåsammenFelt(key);
      }
      for (key in child) {
        if (!hasOwn(forelder, key)) {
          slåsammenFelt(key);
        }
      }
      function slåsammenFelt (key) {
        var strat = strats[key] || defaultStrat;
        options[key] = strat(forelder[key], child[key], vm, key);
      }
      return options
    }
    function initMixin (Devco) {
      Devco.prototype._init = function (options) {
        var vm = this;
        // a uid
        vm._uid = 0;
  
        var startTag, endTag;
  
        // a flag to avoid this being observed
        vm._isDevco = true;
        // merge options
        if (options && options._isComponent) {
          // optimize internal component instantiation
          // since dynamic options merging is pretty slow, and none of the
          // internal component options needs special treatment.
          initInternalComponent(vm, options);
        } else {
          vm.$options = slåsammenInnstillinger(
            vm.constructor,
            options || {},
            vm
          );
        }

        vm._self = vm;
        initRender(vm);

  
        if (vm.$options.el) {
          vm.$monter(vm.$options.el);
        }
      };
    }
    function defineReactive$$1 (obj, key, val, customSetter, shallow) {
      var dep = new Dep();
      
      var property = Object.getOwnPropertyDescriptor(obj, key);
      if (property && property.configurable === false) {
        return
      }
  
      // cater for pre-defined getter/setters
      var getter = property && property.get;
      var setter = property && property.set;
      if ((!getter || setter) && arguments.length === 2) {
        val = obj[key];
      }
  
      var childOb = !shallow && observe(val);
      Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter () {
          var value = getter ? getter.call(obj) : val;
          if (Dep.target) {
            dep.depend();
            if (childOb) {
              childOb.dep.depend();
              if (Array.isArray(value)) {
                dependArray(value);
              }
            }
          }
          return value
        },
        set: function reactiveSetter (newVal) {
          var value = getter ? getter.call(obj) : val;
          /* eslint-disable no-self-compare */
          if (newVal === value || (newVal !== newVal && value !== value)) {
            return
          }
          /* eslint-enable no-self-compare */
          if (customSetter) {
            customSetter();
          }
          // #7981: for accessor properties without setter
          if (getter && !setter) { return }
          if (setter) {
            setter.call(obj, newVal);
          } else {
            val = newVal;
          }
          childOb = !shallow && observe(newVal);
          dep.notify();
        }
      });
    }
    function parseFilters (exp) {
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
          if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
        } else if (inDouble) {
          if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
        } else if (inTemplateString) {
          if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
        } else if (inRegex) {
          if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
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
            case 0x22: inDouble = true; break         // "
            case 0x27: inSingle = true; break         // '
            case 0x60: inTemplateString = true; break // `
            case 0x28: paren++; break                 // (
            case 0x29: paren--; break                 // )
            case 0x5B: square++; break                // [
            case 0x5D: square--; break                // ]
            case 0x7B: curly++; break                 // {
            case 0x7D: curly--; break                 // }
          }
          if (c === 0x2f) { // /
            var j = i - 1;
            var p = (void 0);
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
  
      function pushFilter () {
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
    function initRender (vm) {
      vm._devconode = null; // the root of the child tree
      vm._staticTrees = null; // v-once cached trees
      var options = vm.$options;
      var parentVnode = vm.$devconode = options._parentDevconode; // the placeholder node in parent tree
      var renderContext = parentVnode && parentVnode.context;
      vm.$scopedSlots = Object.freeze();

      vm._c = function (a, b, c, d) { return lagElement(vm, a, b, c, d, false); };

      vm.$lagElement = function (a, b, c, d) { return lagElement(vm, a, b, c, d, true); };
  
      // $attrs & $listeners are exposed for easier HOC creation.
      // they need to be reactive so that HOCs using them are always updated
      var parentData = parentVnode && parentVnode.data;
  
      /* istanbul ignore else */
      {
        defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || Object.freeze(), function () {
          !isUpdatingChildComponent && advarsel("$attrs is readonly.", vm);
        }, true);
        defineReactive$$1(vm, '$listeners', options._parentListeners || Object.freeze(), function () {
          !isUpdatingChildComponent && advarsel("$listeners is readonly.", vm);
        }, true);
      }
    }
    function Devco (options) {
      if (!(this instanceof Devco)
      ) {
        advarsel('Devco er en konstruktør og burde bli kalled på med `new` nøkkelordet');
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


      this._init(options);
    }
    function query (el) {
      if (typeof el === 'string') {
        var selected = document.querySelector(el);
        if (!selected) {
          advarsel(
            'Kan ikkje finne element: ' + el
          );
          return document.createElement('div')
        }
        return selected
      } else {
        return el
      }
    }
    var monter = Devco.prototype.$monter;
    Devco.prototype.$monter = function (el, hydrating) {
      el = el && query(el);
      console.log('MOUNT')
      /* istanbul ignore if */
      if (el === document.body || el === document.documentElement) {
        advarsel(
          "Ikkje monter Devco til <html> eller <body> - monter heller til normale elementer istedenfor."
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
              if (!template) {
                advarsel(
                  ("Template element er ikkje funnet eller tom: " + (options.template)),
                  this
                );
              }
            }
          } else if (template.nodeType) {
            template = template.innerHTML;
          } else {
            {
              advarsel('ugyldig template option:' + template, this);
            }
            return this
          }
        } else if (el) {
          template = hentYtreHTML(el);
        }
        if (template) {
          var ref = kompilerTilFunksjoner(template, {
            outputSourceRange: "development" !== 'production',
            shouldDecodeNewlines: false,
            shouldDecodeNewlinesForHref: false,
            delimiters: options.delimiters,
            comments: options.comments
          }, this);
          var render = ref.render;
          var staticRenderFns = ref.staticRenderFns;
          options.render = render;
          options.staticRenderFns = staticRenderFns;

        }
      }

      return monter.call(this, el, hydrating)
    };
    function hentYtreHTML (el) {
      if (el.outerHTML) {
        return el.outerHTML
      } else {
        var container = document.createElement('div');
        container.appendChild(el.cloneNode(true));
        return container.innerHTML
      }
    }
    var platformGetTagNamespace;

    function lagAttrsKart (attrs) {
      var map = {};
      for (var i = 0, l = attrs.length; i < l; i++) {
        if (
          map[attrs[i].name] && !isIE && !isEdge
        ) {
          advarsel('duplisert attributt: ' + attrs[i].name, attrs[i]);
        }
        map[attrs[i].name] = attrs[i].value;
      }
      return map
    }

    function lagASTElement (tag, attrs, parent) {
      return {
        type: 1,
        tag: tag,
        attrsList: attrs,
        attrsMap: lagAttrsKart(attrs),
        rawAttrsMap: {},
        parent: parent,
        children: []
      }
    }
    function processOnce (el) {
      var once$$1 = hentOgFjernAttr(el, 'engang');
      if (once$$1 != null) {
        el.once = true;
      }
    }
    function lagKart(str, expectsLowerCase) {
      var map = Object.create(null);
      var list = str.split(',');
      for (var i = 0; i < list.length; i++) {
        map[list[i]] = true;
      }
      return expectsLowerCase
        ? function (val) { return map[val.toLowerCase()]; }
        : function (val) { return map[val]; }
    }
    function pluckModuleFunction (modules, key) {
      return modules ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; }) : []
    }
    var isIgnoreNewlineTag = lagKart('pre,textarea', true);
    var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };
    var erRentTekstElement = lagKart('script,style,textarea', true);
    var platformIsPreTag;
    var preTransforms;
    var postTransforms;
    function analysere (template, options) {
      let warn$2 = options.warn || console.warn();
  
      platformIsPreTag = function(tag) { return false};
      let platformMustUseProp = options.mustUseProp || false;
      platformGetTagNamespace = function(tag) { return false};
      var isReservedTag = options.isReservedTag || false;

      transforms = pluckModuleFunction(options.modules, 'transformNode');
      preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
      postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
  
      let delimiters = options.delimiters;
  
      var stack = [];
      var preserveWhitespace = options.preserveWhitespace !== false;
      var whitespaceOption = options.whitespace;
      var root;
      var currentParent;
      var inDevcoPre = false;
      var inPre = false;
      var warned = false;
  
      function warnOnce (msg, range) {
        if (!warned) {
          warned = true;
          advarsel(`${msg} | ${range}`);
        }
      }
  
      function lukkElement (element) {
        trimEndingWhitespace(element);
        if (!inDevcoPre && !element.processed) {
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
          inDevcoPre = false;
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
          advarsel(
            "Cannot use <" + (el.tag) + "> as component root element because it may " +
            'contain multiple nodes.',
            { start: el.start }
          );
        }
        if (el.attrsMap.hasOwnProperty('for')) {
          advarsel(
            'Cannot use for on stateful component root element because ' +
            'it renders multiple elements.',
            el.rawAttrsMap['for']
          );
        }
      }
  
      analyserHTML(template, {
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
  
  
          var element = lagASTElement(tag, attrs, currentParent);
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
                advarsel(
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
  
          if (platformIsPreTag(element.tag)) {
            inPre = true;
          }
          if (!element.processed) {
            // structural directives
            prosessFor(element);
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
            lukkElement(element);
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
          lukkElement(element);
        },
  
        chars: function chars (text, start, end) {
          if (!currentParent) {
            {
              if (text === template) {
                advarsel(
                  'Component template requires a root element, rather than just text.',
                  { start: start }
                );
              } else if ((text = text.trim())) {
                advarsel(
                  ("text \"" + text + "\" outside root element will be ignored."),
                  { start: start }
                );
              }
            }
            return
          }

          var children = currentParent.children;
          if (inPre || text.trim()) {
            text = erTekstTagg(currentParent) ? text : decodeHTMLCached(text);
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
            if (!inDevcoPre && text !== ' ' && (res = parseText(text, delimiters))) {
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
        // kommentar: function kommentar (text, start, end) {
        //   if (currentParent) {
        //     var child = {
        //       type: 3,
        //       text: text,
        //       isComment: true
        //     };
        //     if (options.outputSourceRange) {
        //       child.start = start;
        //       child.end = end;
        //     }
        //     currentParent.children.push(child);
        //   }
        // }
      });
      console.log('analyserHTML', root)
      return root
    }
    
    console.timeEnd('devco')
    Devco.kompiler = kompilerTilFunksjoner;

    return Devco
}));

  
