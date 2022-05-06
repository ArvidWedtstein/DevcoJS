
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
      styling: true,
      isReservedTag: false,
  
      /**
       * Check if an attribute is reserved so that it cannot be used as a component
       * prop. This is platform-dependent and may be overwritten.
       */
      isReservedAttr: false,
  
      /**
       * Check if a tag is an unknown element.
       * Platform-dependent.
       */
      isUnknownElement: false,
  
      /**
       * Get the namespace of an element
       */
      getTagNamespace: false,

  
      mustUseProp: false
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
        hentOgFjernAttr(el, 'koble:' + name);
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
            advarsel$2(
              "<template> cannot be keyed. Place the key on real elements instead.",
              getRawBindingAttr(el, 'key')
            );
          }
          if (el.for) {
            var iterator = el.iterator2 || el.iterator1;
            var parent = el.parent;
            if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
              advarsel$2(
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
      return _lagElement(tag, data, children, normalizationType)
    }
    function analysereModifikatorer (name) {
      var match = name.match(modifierRE);
      if (match) {
        var ret = {};
        match.forEach(function (m) { ret[m.slice(1)] = true; });
        return ret
      }
    }
    var canBeLeftOpenTag = lagKart(
      'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
    );
    function detectErrors (ast, advarsel) {
      if (ast) {
        checkNode(ast, advarsel);
      }
    }

    function checkExpression (exp, text, advarsel, range) {
      try {
        new Function(("return " + exp));
      } catch (e) {
        var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
        if (keywordMatch) {
          advarsel(
            "avoid using JavaScript keyword as property name: " +
            "\"" + (keywordMatch[0]) + "\"\n  Raw expression: " + (text.trim()),
            range
          );
        } else {
          advarsel(
            "invalid expression: " + (e.message) + " in\n\n" +
            "    " + exp + "\n\n" +
            "  Raw expression: " + (text.trim()) + "\n",
            range
          );
        }
      }
    }
  
    function checkNode (node, advarsel) {
      console.warn('CHECKNODE', node)
      if (node.type === 1) {
        for (var name in node.attrsMap) {
          if (dirRE.test(name)) {
            var value = node.attrsMap[name];
            if (value) {
              var range = node.rawAttrsMap[name];
              if (name === 'for') {
                checkFor(node, ("for=\"" + value + "\""), advarsel, range);
              } else if (onRE.test(name)) {
                checkEvent(value, (name + "=\"" + value + "\""), advarsel, range);
              } else {
                checkExpression(value, (name + "=\"" + value + "\""), advarsel, range);
              }
            }
          }
        }
        if (node.children) {
          for (var i = 0; i < node.children.length; i++) {
            checkNode(node.children[i], advarsel);
          }
        }
      } else if (node.type === 2) {
        checkExpression(node.expression, node.text, advarsel, node);
      }
    }
    var mustUseProp = function (tag, type, attr) {
      return (
        (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
        (attr === 'selected' && tag === 'option') ||
        (attr === 'checked' && tag === 'input') ||
        (attr === 'muted' && tag === 'video')
      )
    };
    var isUnaryTag = lagKart(
      'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
      'link,meta,param,source,track,wbr'
    );
    var isPreTag = function (tag) { return tag === 'pre'; };
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
              advarsel$2(
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
                    advarsel$2,
                    list[i]
                  );
                  if (hyphenate(name) !== camelize(name)) {
                    addHandler(
                      el,
                      ("oppdater:" + (hyphenate(name))),
                      syncGen,
                      null,
                      false,
                      advarsel$2,
                      list[i]
                    );
                  }
                } else {
                  // handler w/ dynamic event name
                  addHandler(
                    el,
                    ("\"oppdater:\"+(" + name + ")"),
                    syncGen,
                    null,
                    false,
                    advarsel$2,
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
            addHandler(el, name, value, modifiers, false, advarsel$2, list[i], isDynamic);
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
              advarsel$2(
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
    /**
     * @description Currently not used
     * @param {*} tag 
     * @param {*} data 
     * @param {*} children 
     * @returns 
     */
    function _lagElement (tag, data, children) {
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
     * @description Currently not used
     * @param {DevcoNode} node 
     */

    
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
    Array.prototype.slice.call(element.querySelectorAll('[tekst]')) // html
      .map(function (element) {
      var htmlValue = element.getAttribute('tekst');
          
      if (!html[htmlValue]) {
        html[htmlValue] = {
          htmlValue: htmlValue,
          elements: []
        }
      }
      html[htmlValue].elements.push(element);
      console.log('TEKST')
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
      console.log('PROCESS FOR')
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

    function genFor (el, state, altGen, altHelper) {
      var exp = el.for;
      var alias = el.alias;
      var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
      var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';


      el.forProcessed = true; // avoid recursion

      return (altHelper || 'renderList') + "((" + exp + ")," +
        "function(" + alias + iterator1 + iterator2 + "){" +
          "return " + ((altGen || genElement)(el, state)) +
        '})'
      // return `renderList((${exp}), function(${alias}${iterator1}${iterator2}) { return lagElement('${el.tagName}', [lagTekstDevcoNode('${el.innerText}')]) })`;
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
      console.log('PARSEFOR', res)
      return res
    }

    Array.prototype.slice.call(element.querySelectorAll('[for]'))
      .map(function (element) {
      var forValue = element.getAttribute('for'); // not really needed


      // eval(genFor(element, state)).forEach(function (child) {
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
    

    /**
     * @description Dekoder HTML Attributter
     * @param {*} value 
     * @param {*} shouldDecodeNewlines 
     * @returns 
     */
    function dekodeAttr (value, shouldDecodeNewlines) {
      var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
      return value.replace(re, function (match) { return decodingMap[match]; })
    }


    function renderStatic (index, isInFor) {
      var cached = this._staticTrees || (this._staticTrees = []);
      var tree = cached[index];
      // if has already-rendered static tree and not inside v-for,
      // we can reuse the same tree.
      if (tree && !isInFor) {
        return tree
      }
      // otherwise, render a fresh tree.
      tree = cached[index] = this.$options.staticRenderFns[index].call(
        this._renderProxy,
        null,
        this // for render fns generated for functional component templates
      );
      markStatic(tree, ("__static__" + index), false);
      return tree
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
          if (!stack.length && options.advarsel) {
            options.advarsel(("Mal-formatted tag at end of template: \"" + html + "\""), { start: index + html.length });
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
            if (i > pos || !tagName && options.advarsel) {
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
    // Object.assign(proxy, {});

    function installRenderHelpers (target) {
      target._s = toString;
      target._l = renderList;
      target._v = lagTekstDevcoNode;
      target._e = lagTomDevcoNode;
      target._m = renderStatic;
    }
    /**
     * @description Genererer code
     * @param {*} ast Abstrakt Syntaks tre 
     * @param {*} options 
     * @returns 
     */
    function generate (ast, options) {
      var state = new CodegenState(options);
      console.log(state)
      console.log('GENERATE', ast)
      // fix #11483, Root level <script> tags should not be rendered.
      var code = ast ? (ast.tag === 'script' ? 'null' : genElement(ast, state)) : '_c("div")';
      return {
        render: ("with(this){return " + code + "}"),
        staticRenderFns: state.staticRenderFns
      }
    }
    
    function needsNormalization (el) {
      return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
    }
    /**
     * @description Genererer en eller annen type barn
     * @param {*} el 
     * @param {*} state 
     * @param {*} checkSkip 
     * @param {*} altGenElement 
     * @param {*} altGenNode 
     * @returns 
     */
    function genBarn (el, state, checkSkip, altGenElement, altGenNode) {
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
        console.log('GENCHILDREN', ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType$1 ? ("," + normalizationType$1) : '')))
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
    var isStaticKey;
    var isPlatformReservedTag;

    var genStaticKeysCached = cached(genStaticKeys$1);
    
    function optimize (root, options) {
      if (!root) { return }
      isStaticKey = genStaticKeysCached(options.staticKeys || '');
      isPlatformReservedTag = options.isReservedTag || false;
      // first pass: mark all non-static nodes.
      markStatic$1(root);
      // second pass: mark static roots.
      markStaticRoots(root, false);
    }

    
  
    /**
     * Runtime helper for v-once.
     * Effectively it means marking the node as static with a unique key.
     */
    function markOnce (
      tree,
      index,
      key
    ) {
      markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
      return tree
    }
  
    function markStatic (
      tree,
      key,
      isOnce
    ) {
      if (Array.isArray(tree)) {
        for (var i = 0; i < tree.length; i++) {
          if (tree[i] && typeof tree[i] !== 'string') {
            markStaticNode(tree[i], (key + "_" + i), isOnce);
          }
        }
      } else {
        markStaticNode(tree, key, isOnce);
      }
    }
  
    function markStaticNode (node, key, isOnce) {
      node.isStatic = true;
      node.key = key;
      node.isOnce = isOnce;
    }
    function genStatic (el, state) {
      el.staticProcessed = true;
      console.log('GEN STATIC', state)
      // Some elements (templates) need to behave differently inside of a v-pre
      // node.  All pre nodes are static roots, so we can use this as a location to
      // wrap a state change and reset it upon exiting the pre node.
      var originalPreState = state.pre;
      if (el.pre) {
        state.pre = el.pre;
      }
      state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
      state.pre = originalPreState;
      return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
      // return ("renderStatic(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
    }
    var isBuiltInTag = lagKart('slot,component', true);

    function isStatic (node) {
      if (node.type === 2) { // expression
        return false
      }
      if (node.type === 3) { // text
        return true
      }
      return !!(node.pre || (
        !node.hasBindings && // no dynamic bindings
        !node.if && !node.for && // not v-if or v-for or v-else
        !isBuiltInTag(node.tag) && // not a built-in
        // isPlatformReservedTag(node.tag) && // not a component
        Object.keys(node).every(isStaticKey)
      ))
    }
    function markStatic$1 (node) {
      node.static = isStatic(node);
      if (node.type === 1) {
        // do not make component slot content static. this avoids
        // 1. components not able to mutate slot nodes
        // 2. static slot content fails for hot-reloading
        if (
          !isPlatformReservedTag(node.tag) &&
          node.tag !== 'slot' &&
          node.attrsMap['inline-template'] == null
        ) {
          return
        }
        for (var i = 0, l = node.children.length; i < l; i++) {
          var child = node.children[i];
          markStatic$1(child);
          if (!child.static) {
            node.static = false;
          }
        }
        if (node.ifConditions) {
          for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
            var block = node.ifConditions[i$1].block;
            markStatic$1(block);
            if (!block.static) {
              node.static = false;
            }
          }
        }
      }
    }
  
    function markStaticRoots (node, isInFor) {
      if (node.type === 1) {
        if (node.static || node.once) {
          node.staticInFor = isInFor;
        }
        // For a node to qualify as a static root, it should have children that
        // are not just static text. Otherwise the cost of hoisting out will
        // outweigh the benefits and it's better off to just always render it fresh.
        if (node.static && node.children.length && !(
          node.children.length === 1 &&
          node.children[0].type === 3
        )) {
          node.staticRoot = true;
          return
        } else {
          node.staticRoot = false;
        }
        if (node.children) {
          for (var i = 0, l = node.children.length; i < l; i++) {
            markStaticRoots(node.children[i], isInFor || !!node.for);
          }
        }
        if (node.ifConditions) {
          for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
            markStaticRoots(node.ifConditions[i$1].block, isInFor);
          }
        }
      }
    }
    function enter (vnode, toggleDisplay) {
      console.error('ASSERTPROP', vnode)
      var el = vnode.elm;
  
      // call leave callback now
      if (isDef(el._leaveCb)) {
        el._leaveCb.cancelled = true;
        el._leaveCb();
      }
  
      var data = resolveTransition(vnode.data.transition);
      if (isUndef(data)) {
        return
      }
  
      /* istanbul ignore if */
      if (isDef(el._enterCb) || el.nodeType !== 1) {
        return
      }
  
      var css = data.css;
      var type = data.type;
      var enterClass = data.enterClass;
      var enterToClass = data.enterToClass;
      var enterActiveClass = data.enterActiveClass;
      var appearClass = data.appearClass;
      var appearToClass = data.appearToClass;
      var appearActiveClass = data.appearActiveClass;
      var beforeEnter = data.beforeEnter;
      var enter = data.enter;
      var afterEnter = data.afterEnter;
      var enterCancelled = data.enterCancelled;
      var beforeAppear = data.beforeAppear;
      var appear = data.appear;
      var afterAppear = data.afterAppear;
      var appearCancelled = data.appearCancelled;
      var duration = data.duration;
  
      // activeInstance will always be the <transition> component managing this
      // transition. One edge case to check is when the <transition> is placed
      // as the root node of a child component. In that case we need to check
      // <transition>'s parent for appear check.
      var context = activeInstance;
      var transitionNode = activeInstance.$vnode;
      while (transitionNode && transitionNode.parent) {
        context = transitionNode.context;
        transitionNode = transitionNode.parent;
      }
  
      var isAppear = !context._isMounted || !vnode.isRootInsert;
  
      if (isAppear && !appear && appear !== '') {
        return
      }
  
      var startClass = isAppear && appearClass
        ? appearClass
        : enterClass;
      var activeClass = isAppear && appearActiveClass
        ? appearActiveClass
        : enterActiveClass;
      var toClass = isAppear && appearToClass
        ? appearToClass
        : enterToClass;
  
      var beforeEnterHook = isAppear
        ? (beforeAppear || beforeEnter)
        : beforeEnter;
      var enterHook = isAppear
        ? (typeof appear === 'function' ? appear : enter)
        : enter;
      var afterEnterHook = isAppear
        ? (afterAppear || afterEnter)
        : afterEnter;
      var enterCancelledHook = isAppear
        ? (appearCancelled || enterCancelled)
        : enterCancelled;
  
      var explicitEnterDuration = toNumber(
        isObject(duration)
          ? duration.enter
          : duration
      );
  
      if (explicitEnterDuration != null) {
        checkDuration(explicitEnterDuration, 'enter', vnode);
      }
  
      var expectsCSS = css !== false && !isIE9;
      var userWantsControl = getHookArgumentsLength(enterHook);
  
      var cb = el._enterCb = once(function () {
        if (expectsCSS) {
          removeTransitionClass(el, toClass);
          removeTransitionClass(el, activeClass);
        }
        if (cb.cancelled) {
          if (expectsCSS) {
            removeTransitionClass(el, startClass);
          }
          enterCancelledHook && enterCancelledHook(el);
        } else {
          afterEnterHook && afterEnterHook(el);
        }
        el._enterCb = null;
      });
  
      if (!vnode.data.show) {
        // remove pending leave element on enter by injecting an insert hook
        mergeVNodeHook(vnode, 'insert', function () {
          var parent = el.parentNode;
          var pendingNode = parent && parent._pending && parent._pending[vnode.key];
          if (pendingNode &&
            pendingNode.tag === vnode.tag &&
            pendingNode.elm._leaveCb
          ) {
            pendingNode.elm._leaveCb();
          }
          enterHook && enterHook(el, cb);
        });
      }
  
      // start enter transition
      beforeEnterHook && beforeEnterHook(el);
      if (expectsCSS) {
        addTransitionClass(el, startClass);
        addTransitionClass(el, activeClass);
        nextFrame(function () {
          removeTransitionClass(el, startClass);
          if (!cb.cancelled) {
            addTransitionClass(el, toClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitEnterDuration)) {
                setTimeout(cb, explicitEnterDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
  
      if (vnode.data.show) {
        toggleDisplay && toggleDisplay();
        enterHook && enterHook(el, cb);
      }
  
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
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
        return genBarn(el, state) || 'void 0'
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
          var children = el.inlineTemplate ? null : genBarn(el, state, true);
          // code = "lagElement('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
          code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
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
          needRuntime = !!gen(el, dir, state.advarsel);
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
    function genStaticKeys$1 (keys) {
      return lagKart(
        'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
        (keys ? ',' + keys : '')
      )
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
      this.advarsel = options.advarsel || console.warn;
      this.transforms = pluckModuleFunction(options.modules, 'transformCode');
      this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
      this.directives = utvid(utvid({}, baseDirectives), options.directives);
      var isReservedTag = options.isReservedTag || false;
      this.maybeComponent = function (el) { return !!el.component || !isReservedTag(el.tag); };
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

    /**
     * @description Lager en kompiler som skal kompilere en node
     */
    var lagKompiler = lagKompilatorSkaper(function baseCompile (template, options) {
      console.log('TEMPLATE', template, options)
      var ast = analysere(template.trim(), options);
      
      
      if (options.optimize !== false) {
        optimize(ast, options);
      }
      var code = generate(ast, options);
      console.log('DEVCOASTCODE', code)
      return {
        ast: ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
      }
    });

    installRenderHelpers(FunctionalRenderContext.prototype);

    console.log('FUNCTIONALRENDERCONETX', FunctionalRenderContext.prototype)

    
    /**
     * @description Currently not used
     * @param {*} el 
     * @param {*} dir 
     * @param {*} _warn 
     * @returns 
     */
    function model (el, dir, _warn) {
      
      advarsel$1 = _warn;
      var value = dir.value;
      var modifiers = dir.modifiers;
      var tag = el.tag;
      var type = el.attrsMap.type;
  
      {
        // inputs with type="file" are read only and setting the input's
        // value will throw an error.
        if (tag === 'input' && type === 'file') {
          advarsel$1(
            "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
            "File inputs are read only. Use a v-on:change listener instead.",
            el.rawAttrsMap['v-model']
          );
        }
      }
  
      if (el.component) {
        genComponentModel(el, value, modifiers);
        // component v-model doesn't need extra runtime
        return false
      } else if (tag === 'select') {
        genSelect(el, value, modifiers);
      } else if (tag === 'input' && type === 'checkbox') {
        genCheckboxModel(el, value, modifiers);
      } else if (tag === 'input' && type === 'radio') {
        genRadioModel(el, value, modifiers);
      } else if (tag === 'input' || tag === 'textarea') {
        genDefaultModel(el, value, modifiers);
      } else if (!config.isReservedTag(tag)) {
        genComponentModel(el, value, modifiers);
        // component v-model doesn't need extra runtime
        return false
      } else {
        advarsel$1(
          "<" + (el.tag) + " v-model=\"" + value + "\">: " +
          "v-model is not supported on this element type. " +
          'If you are working with contenteditable, it\'s recommended to ' +
          'wrap a library dedicated for that purpose inside a custom component.',
          el.rawAttrsMap['v-model']
        );
      }
  
      // ensure runtime directive metadata
      return true
    }
    /**
     * @description Currently Not used
     * @param {*} el 
     * @param {*} dir 
     */
    function text (el, dir) {

      if (dir.value) {
        addProp(el, 'textContent', ("_s(" + (dir.value) + ")"), dir);
      }
    }
  
    // FUNCTIONS THAT ARE FOR BASEOPTIONS

    /**
     * @description Currently not used.
     * @param {*} el 
     * @param {*} dir 
     */
    function html (el, dir) {
     
      if (dir.value) {
        addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"), dir);
      }
    }
    function transformNode (el, options) {
      var advarsel = options.advarsel || baseWarn;
      var staticClass = hentOgFjernAttr(el, 'class');
      if (staticClass) {
       
        var res = parseText(staticClass, options.delimiters);
        if (res) {
          advarsel(
            "class=\"" + staticClass + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div class="{{ val }}">, use <div :class="val">.',
            el.rawAttrsMap['class']
          );
        }
      }
      if (staticClass) {
        el.staticClass = JSON.stringify(staticClass);
      }
      var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
      if (classBinding) {
        el.classBinding = classBinding;
      }
    }
    function genData (el) {
      var data = '';
      if (el.staticClass) {
        data += "staticClass:" + (el.staticClass) + ",";
      }
      if (el.classBinding) {
        data += "class:" + (el.classBinding) + ",";
      }
      return data
    }
    function transformNode$1 (el, options) {
      
      var advarsel = options.advarsel || baseWarn;
      var staticStyle = hentOgFjernAttr(el, 'style');
      if (staticStyle) {
        {

          var res = parseText(staticStyle, options.delimiters);
          if (res) {
            advarsel(
              "style=\"" + staticStyle + "\": " +
              'Interpolation inside attributes has been removed. ' +
              'Use v-bind or the colon shorthand instead. For example, ' +
              'instead of <div style="{{ val }}">, use <div :style="val">.',
              el.rawAttrsMap['style']
            );
          }
        }
        el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
      }
  
      var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
      if (styleBinding) {
        el.styleBinding = styleBinding;
      }
    }
    function genData$1 (el) {
      
      var data = '';
      if (el.staticStyle) {
        data += "staticStyle:" + (el.staticStyle) + ",";
      }
      if (el.styleBinding) {
        data += "style:(" + (el.styleBinding) + "),";
      }
      return data
    }
    function preTransformNode (el, options) {
      if (el.tag === 'input') {
        var map = el.attrsMap;
  
        var typeBinding;
        if (map[':type'] || map['v-bind:type']) {
          typeBinding = getBindingAttr(el, 'type');
        }
        if (!map.type && !typeBinding && map['v-bind']) {
          typeBinding = "(" + (map['v-bind']) + ").type";
        }
  
        
        if (typeBinding) {
          var ifCondition = hentOgFjernAttr(el, 'v-if', true);
          var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
          var hasElse = hentOgFjernAttr(el, 'v-else', true) != null;
          var elseIfCondition = hentOgFjernAttr(el, 'v-else-if', true);
          // 1. checkbox
          var branch0 = cloneASTElement(el);
          // process for on the main node
          processFor(branch0);
          addRawAttr(branch0, 'type', 'checkbox');
          processElement(branch0, options);
          branch0.processed = true; // prevent it from double-processed
          branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
          addIfCondition(branch0, {
            exp: branch0.if,
            block: branch0
          });
          // 2. add radio else-if condition
          var branch1 = cloneASTElement(el);
          hentOgFjernAttr(branch1, 'for', true);
          addRawAttr(branch1, 'type', 'radio');
          processElement(branch1, options);
          addIfCondition(branch0, {
            exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
            block: branch1
          });
          // 3. other
          var branch2 = cloneASTElement(el);
          getAndRemoveAttr(branch2, 'for', true);
          addRawAttr(branch2, ':type', typeBinding);
          processElement(branch2, options);
          addIfCondition(branch0, {
            exp: ifCondition,
            block: branch2
          });
  
          if (hasElse) {
            branch0.else = true;
          } else if (elseIfCondition) {
            branch0.elseif = elseIfCondition;
          }
  
          return branch0
        }
      }
    }
    function isTextNode (node) {
      return isDef(node) && isDef(node.text) && isFalse(node.isComment)
    }
    /**
     * @description NOT used
     */
    var directive = {
      inserted: function inserted (el, binding, vnode, oldDevcoNode) {
        if (vnode.tag === 'select') {
          // #6903
          if (oldDevcoNode.elm && !oldDevcoNode.elm._vOptions) {
            mergeVNodeHook(vnode, 'postpatch', function () {
              directive.componentUpdated(el, binding, vnode);
            });
          } else {
            setSelected(el, binding, vnode.context);
          }
          el._vOptions = [].map.call(el.options, getValue);
        } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
          el._vModifiers = binding.modifiers;
          if (!binding.modifiers.lazy) {
            el.addEventListener('compositionstart', onCompositionStart);
            el.addEventListener('compositionend', onCompositionEnd);
            // Safari < 10.2 & UIWebView doesn't fire compositionend when
            // switching focus before confirming composition choice
            // this also fixes the issue where some browsers e.g. iOS Chrome
            // fires "change" instead of "input" on autocomplete.
            el.addEventListener('change', onCompositionEnd);
            /* istanbul ignore if */
            if (isIE9) {
              el.vmodel = true;
            }
          }
        }
      },
  
      componentUpdated: function componentUpdated (el, binding, vnode) {
        if (vnode.tag === 'select') {
          setSelected(el, binding, vnode.context);
          // in case the options rendered by v-for have changed,
          // it's possible that the value is out-of-sync with the rendered options.
          // detect such cases and filter out values that no longer has a matching
          // option in the DOM.
          var prevOptions = el._vOptions;
          var curOptions = el._vOptions = [].map.call(el.options, getValue);
          if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
            // trigger change event if
            // no matching option found for at least one value
            var needReset = el.multiple
              ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
              : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
            if (needReset) {
              trigger(el, 'change');
            }
          }
        }
      }
    };
    var klass$1 = {
      staticKeys: ['staticClass'],
      transformNode: transformNode,
      genData: genData
    };
    var style$1 = {
      staticKeys: ['staticStyle'],
      transformNode: transformNode$1,
      genData: genData$1
    };
    var model$1 = {
      preTransformNode: preTransformNode
    };
    var modules$1 = [
      klass$1,
      style$1,
      model$1
    ];
    var directives$1 = {
      model: model,
      text: text,
      html: html
    };
    var platformDirectives = {
      model: directive,
      // show: show
    };
    var isHTMLTag = lagKart(
      'html,body,base,head,link,meta,style,title,' +
      'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
      'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
      'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
      's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
      'embed,object,param,source,canvas,script,noscript,del,ins,' +
      'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
      'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
      'output,progress,select,textarea,' +
      'details,dialog,menu,menuitem,summary,' +
      'content,element,shadow,template,blockquote,iframe,tfoot'
    );
    function genStaticKeys (modules) {
      return modules.reduce(function (keys, m) {
        return keys.concat(m.staticKeys || [])
      }, []).join(',')
    }
    var isReservedTag = function (tag) {
      return isHTMLTag(tag) || isSVG(tag)
    };
    var baseOptions = {
      expectHTML: true,
      modules: modules$1,
      directives: directives$1,
      isPreTag: isPreTag,
      isUnaryTag: isUnaryTag,
      mustUseProp: mustUseProp,
      canBeLeftOpenTag: canBeLeftOpenTag,
      isReservedTag: isReservedTag,
      staticKeys: genStaticKeys(modules$1)
    };
    
    // install platform specific utils
    Devco.config.mustUseProp = mustUseProp;
    Devco.config.isReservedTag = isReservedTag;
    // Devco.config.isReservedAttr = isReservedAttr;
    // Devco.config.getTagNamespace = getTagNamespace;
    // Devco.config.isUnknownElement = isUnknownElement;
  
    // install platform runtime directives & components
    utvid(Devco.options.directives, platformDirectives);


    function set (target, key, val) {
      if (isUndef(target) || isPrimitive(target)
      ) {
        warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
      }
      if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key);
        target.splice(key, 1, val);
        return val
      }
      if (key in target && !(key in Object.prototype)) {
        target[key] = val;
        return val
      }
      var ob = (target).__ob__;
      if (target._isDevco || (ob && ob.vmCount)) {
        warn(
          'Avoid adding reactive properties to a Devco instance or its root $data ' +
          'at runtime - declare it upfront in the data option.'
        );
        return val
      }
      if (!ob) {
        target[key] = val;
        return val
      }
      defineReactive$$1(ob.value, key, val);
      ob.dep.notify();
      return val
    }
  
    /**
     * Delete a property and trigger change if necessary.
     */
    function del (target, key) {
      if (isUndef(target) || isPrimitive(target)
      ) {
        warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
      }
      if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.splice(key, 1);
        return
      }
      var ob = (target).__ob__;
      if (target._isDevco || (ob && ob.vmCount)) {
        warn(
          'Avoid deleting properties on a Devco instance or its root $data ' +
          '- just set it to null.'
        );
        return
      }
      if (!hasOwn(target, key)) {
        return
      }
      delete target[key];
      if (!ob) {
        return
      }
      ob.dep.notify();
    }

    function nextTick (cb, ctx) {
      var _resolve;
      callbacks.push(function () {
        if (cb) {
          try {
            cb.call(ctx);
          } catch (e) {
            handleError(e, ctx, 'nextTick');
          }
        } else if (_resolve) {
          _resolve(ctx);
        }
      });
      if (!pending) {
        pending = true;
        timerFunc();
      }
      // $flow-disable-line
      if (!cb && typeof Promise !== 'undefined') {
        return new Promise(function (resolve) {
          _resolve = resolve;
        })
      }
    }
    var ASSET_TYPES = [
      'component',
      'directive',
      'filter'
    ];

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
      var _vnode = keepAliveInstance._vnode;
      for (var key in cache) {
        var entry = cache[key];
        if (entry) {
          var name = entry.name;
          if (name && !filter(name)) {
            pruneCacheEntry(cache, key, keys, _vnode);
          }
        }
      }
    }

    function initMixin$1 (Devco) {
      Devco.mixin = function (mixin) {
        
        this.options = slåsammenInnstillinger(this.options, mixin);
        return this
      };
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
        cacheVNode: function cacheVNode() {
          var ref = this;
          var cache = ref.cache;
          var keys = ref.keys;
          var vnodeToCache = ref.vnodeToCache;
          var keyToCache = ref.keyToCache;
          if (vnodeToCache) {
            var tag = vnodeToCache.tag;
            var componentInstance = vnodeToCache.componentInstance;
            var componentOptions = vnodeToCache.componentOptions;
            cache[keyToCache] = {
              name: getComponentName(componentOptions),
              tag: tag,
              componentInstance: componentInstance,
            };
            keys.push(keyToCache);
            // prune oldest entry
            if (this.max && keys.length > parseInt(this.max)) {
              pruneCacheEntry(cache, keys[0], keys, this._vnode);
            }
            this.vnodeToCache = null;
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
  
        this.cacheVNode();
        this.$watch('include', function (val) {
          pruneCache(this$1, function (name) { return matches(val, name); });
        });
        this.$watch('exclude', function (val) {
          pruneCache(this$1, function (name) { return !matches(val, name); });
        });
      },
  
      updated: function updated () {
        this.cacheVNode();
      },
  
      render: function render () {
        var slot = this.$slots.default;
        var vnode = getFirstComponentChild(slot);
        var componentOptions = vnode && vnode.componentOptions;
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
            return vnode
          }
  
          var ref$1 = this;
          var cache = ref$1.cache;
          var keys = ref$1.keys;
          var key = vnode.key == null
            // same constructor may get registered as different local components
            // so cid alone is not enough (#3269)
            ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
            : vnode.key;
          if (cache[key]) {
            vnode.componentInstance = cache[key].componentInstance;
            // make current key freshest
            remove(keys, key);
            keys.push(key);
          } else {
            // delay setting the cache until update
            this.vnodeToCache = vnode;
            this.keyToCache = key;
          }
  
          vnode.data.keepAlive = true;
        }
        return vnode || (slot && slot[0])
      }
    };
    function initExtend (Vue) {
      /**
       * Each instance constructor, including Vue, has a unique
       * cid. This enables us to create wrapped "child
       * constructors" for prototypal inheritance and cache them.
       */
      Vue.cid = 0;
      var cid = 1;
  
      /**
       * Class inheritance
       */
      Vue.extend = function (extendOptions) {
        extendOptions = extendOptions || {};
        var Super = this;
        var SuperId = Super.cid;
        var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
        if (cachedCtors[SuperId]) {
          return cachedCtors[SuperId]
        }
  
        var name = extendOptions.name || Super.options.name;
        if (name) {
          validateComponentName(name);
        }
  
        var Sub = function VueComponent (options) {
          this._init(options);
        };
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        Sub.cid = cid++;
        Sub.options = mergeOptions(
          Super.options,
          extendOptions
        );
        Sub['super'] = Super;
  
        // For props and computed properties, we define the proxy getters on
        // the Vue instances at extension time, on the extended prototype. This
        // avoids Object.defineProperty calls for each instance created.
        if (Sub.options.props) {
          initProps$1(Sub);
        }
        if (Sub.options.computed) {
          initComputed$1(Sub);
        }
  
        // allow further extension/mixin/plugin usage
        Sub.extend = Super.extend;
        Sub.mixin = Super.mixin;
        Sub.use = Super.use;
  
        // create asset registers, so extended classes
        // can have their private assets too.
        ASSET_TYPES.forEach(function (type) {
          Sub[type] = Super[type];
        });
        // enable recursive self-lookup
        if (name) {
          Sub.options.components[name] = Sub;
        }
  
        // keep a reference to the super options at extension time.
        // later at instantiation we can check if Super's options have
        // been updated.
        Sub.superOptions = Super.options;
        Sub.extendOptions = extendOptions;
        Sub.sealedOptions = extend({}, Sub.options);
  
        // cache constructor
        cachedCtors[SuperId] = Sub;
        return Sub
      };
    }
    function initUse (Devco) {
      Devco.use = function (plugin) {
        var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
        if (installedPlugins.indexOf(plugin) > -1) {
          return this
        }
  
        // additional parameters
        var args = toArray(arguments, 1);
        args.unshift(this);
        if (typeof plugin.install === 'function') {
          plugin.install.apply(plugin, args);
        } else if (typeof plugin === 'function') {
          plugin.apply(null, args);
        }
        installedPlugins.push(plugin);
        return this
      };
    }

    function initAssetRegisters (Vue) {
      /**
       * Create asset registration methods.
       */
      ASSET_TYPES.forEach(function (type) {
        Vue[type] = function (
          id,
          definition
        ) {
          if (!definition) {
            return this.options[type + 's'][id]
          } else {
            /* istanbul ignore if */
            if (type === 'component') {
              validateComponentName(id);
            }
            if (type === 'component' && isPlainObject(definition)) {
              definition.name = definition.name || id;
              definition = this.options._base.extend(definition);
            }
            if (type === 'directive' && typeof definition === 'function') {
              definition = { bind: definition, update: definition };
            }
            this.options[type + 's'][id] = definition;
            return definition
          }
        };
      });
    }
    var builtInComponents = {
      KeepAlive: KeepAlive
    };
    function initGlobalAPI (Devco) {
      // config
      var configDef = {};
      configDef.get = function () { return config; };
      {
        configDef.set = function () {
          advarsel(
            'Do not replace the Devco.config object, set individual fields instead.'
          );
        };
      }
      // Object.defineProperty(Devco, 'config', configDef);
  
      // exposed util methods.
      // NOTE: these are not considered part of the public API - avoid relying on
      // them unless you are aware of the risk.
      
      Devco.util = {
        advarsel: advarsel,
        extend: utvid,
        mergeOptions: slåsammenInnstillinger,
        defineReactive: defineReactive$$1
      };
  
      Devco.set = set;
      Devco.delete = del;
      Devco.nextTick = nextTick;
  
      // 2.6 explicit observable API
      Devco.observable = function (obj) {
        observe(obj);
        return obj
      };
  
      Devco.options = Object.create(null);
      ASSET_TYPES.forEach(function (type) {
        Devco.options[type + 's'] = Object.create(null);
      });
  
      // this is used to identify the "base" constructor to extend all plain-object
      // components with in Weex's multi-instance scenarios.
      Devco.options._base = Devco;
  
      utvid(Devco.options.components, builtInComponents);
  
      initUse(Devco);
      initMixin$1(Devco);
      initExtend(Devco);
      initAssetRegisters(Devco);
    }
  
    initGlobalAPI(Devco);

    

    var ref$1 = lagKompiler(baseOptions);
    var kompiler = ref$1.kompiler;
    var kompilerTilFunksjoner = ref$1.kompilerTilFunksjoner;

    function lagKompilerTilFunksjonerFn (kompiler) {
      var cache = Object.create(null);
      return function kompilerTilFunksjoner (template, options, vm) {
        options = utvid({}, options);
        var advarsel$$1 = options.advarsel || advarsel;
        delete options.advarsel;
  
        {
          try {
            new Function('return 1');
          } catch (e) {
            if (e.toString().match(/unsafe-eval|CSP/)) {
              advarsel(
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
          console.log('RETURN CACHE', cache[key])
          return cache[key]
        }
  
        // kompiler 

        var compiled = kompiler(template, options);
  
        // check compilation errors/tips
        {
          if (compiled.errors && compiled.errors.length) {
            if (options.outputSourceRange) {
              compiled.errors.forEach(function (e) {
                advarsel(
                  "Error compiling template:\n\n" + (e.msg) + "\n\n" +
                  generateCodeFrame(template, e.start, e.end),
                  vm
                );
              });
            } else {
              advarsel(
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
        res.render = lagFunksjon(compiled.render, fnGenErrors);
        console.log(compiled)
        res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
          return lagFunksjon(code, fnGenErrors)
        });
        console.log('RESSTATIC', res.staticRenderFns)
  
        // check function generation errors.
        {
          if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
            advarsel(
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
     var Watcher = function Watcher (vm, expOrFn, cb, options, isRenderWatcher) {
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
          advarsel(
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
    
    /**
     * @description Ubrukt Funksjon
     * @param {*} tagName 
     * @param {*} devconode 
     * @returns 
     */
    // function lagElement$1 (tagName, devconode) {
    //   var elm = document.createElement(tagName);
    //   if (tagName !== 'select') {
    //     return elm
    //   }
    //   // false or null will remove the attribute but undefined will not
    //   if (devconode.data && devconode.data.attrs && devconode.data.attrs.multiple !== undefined) {
    //     elm.setAttribute('multiple', 'multiple');
    //   }
    //   return elm
    // }
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
    function updateClass (oldDevcoNode, vnode) {
      var el = vnode.elm;
      var data = vnode.data;
      var oldData = oldDevcoNode.data;
      if (
        isUndef(data.staticClass) &&
        isUndef(data.class) && (
          isUndef(oldData) || (
            isUndef(oldData.staticClass) &&
            isUndef(oldData.class)
          )
        )
      ) {
        return
      }
  
      var cls = genClassForDevcoNode(vnode);
  
      // handle transition classes
      var transitionClass = el._transitionClasses;
      if (isDef(transitionClass)) {
        cls = concat(cls, stringifyClass(transitionClass));
      }
  
      // set the class
      if (cls !== el._prevClass) {
        el.setAttribute('class', cls);
        el._prevClass = cls;
      }
    }
    function updateDOMListeners (oldDevcoNode, vnode) {
      if (isUndef(oldDevcoNode.data.on) && isUndef(vnode.data.on)) {
        return
      }
      var on = vnode.data.on || {};
      var oldOn = oldDevcoNode.data.on || {};
      target$1 = vnode.elm;
      normalizeEvents(on);
      updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
      target$1 = undefined;
    }
    function updateStyle (oldDevcoNode, vnode) {
      var data = vnode.data;
      var oldData = oldDevcoNode.data;
  
      if (isUndef(data.staticStyle) && isUndef(data.style) &&
        isUndef(oldData.staticStyle) && isUndef(oldData.style)
      ) {
        return
      }
  
      var cur, name;
      var el = vnode.elm;
      var oldStaticStyle = oldData.staticStyle;
      var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};
  
      // if static style exists, stylebinding already merged into it when doing normalizeStyleData
      var oldStyle = oldStaticStyle || oldStyleBinding;
  
      var style = normalizeStyleBinding(vnode.data.style) || {};
  
      // store normalized style under a different key for next diff
      // make sure to clone it if it's reactive, since the user likely wants
      // to mutate it.
      vnode.data.normalizedStyle = isDef(style.__ob__)
        ? extend({}, style)
        : style;
  
      var newStyle = getStyle(vnode, true);
  
      for (name in oldStyle) {
        if (isUndef(newStyle[name])) {
          setProp(el, name, '');
        }
      }
      for (name in newStyle) {
        cur = newStyle[name];
        if (cur !== oldStyle[name]) {
          // ie9 setting to null has no effect, must use empty string
          setProp(el, name, cur == null ? '' : cur);
        }
      }
    }
    function resolveTransition (def$$1) {
      if (!def$$1) {
        return
      }
      /* istanbul ignore else */
      if (typeof def$$1 === 'object') {
        var res = {};
        if (def$$1.css !== false) {
          extend(res, autoCssTransition(def$$1.name || 'v'));
        }
        extend(res, def$$1);
        return res
      } else if (typeof def$$1 === 'string') {
        return autoCssTransition(def$$1)
      }
    }
  
    var autoCssTransition = cached(function (name) {
      return {
        enterClass: (name + "-enter"),
        enterToClass: (name + "-enter-to"),
        enterActiveClass: (name + "-enter-active"),
        leaveClass: (name + "-leave"),
        leaveToClass: (name + "-leave-to"),
        leaveActiveClass: (name + "-leave-active")
      }
    });
    function _enter (_, vnode) {
      if (vnode.data.show !== true) {
        enter(vnode);
      }
    }
    function leave (vnode, rm) {
      var el = vnode.elm;
  
      // call enter callback now
      if (isDef(el._enterCb)) {
        el._enterCb.cancelled = true;
        el._enterCb();
      }
  
      var data = resolveTransition(vnode.data.transition);
      if (isUndef(data) || el.nodeType !== 1) {
        return rm()
      }
  
      /* istanbul ignore if */
      if (isDef(el._leaveCb)) {
        return
      }
  
      var css = data.css;
      var type = data.type;
      var leaveClass = data.leaveClass;
      var leaveToClass = data.leaveToClass;
      var leaveActiveClass = data.leaveActiveClass;
      var beforeLeave = data.beforeLeave;
      var leave = data.leave;
      var afterLeave = data.afterLeave;
      var leaveCancelled = data.leaveCancelled;
      var delayLeave = data.delayLeave;
      var duration = data.duration;
  
      var expectsCSS = css !== false && !isIE9;
      var userWantsControl = getHookArgumentsLength(leave);
  
      var explicitLeaveDuration = toNumber(
        isObject(duration)
          ? duration.leave
          : duration
      );
  
      if (isDef(explicitLeaveDuration)) {
        checkDuration(explicitLeaveDuration, 'leave', vnode);
      }
  
      var cb = el._leaveCb = once(function () {
        if (el.parentNode && el.parentNode._pending) {
          el.parentNode._pending[vnode.key] = null;
        }
        if (expectsCSS) {
          removeTransitionClass(el, leaveToClass);
          removeTransitionClass(el, leaveActiveClass);
        }
        if (cb.cancelled) {
          if (expectsCSS) {
            removeTransitionClass(el, leaveClass);
          }
          leaveCancelled && leaveCancelled(el);
        } else {
          rm();
          afterLeave && afterLeave(el);
        }
        el._leaveCb = null;
      });
  
      if (delayLeave) {
        delayLeave(performLeave);
      } else {
        performLeave();
      }
  
      function performLeave () {
        // the delayed leave may have already been cancelled
        if (cb.cancelled) {
          return
        }
        // record leaving element
        if (!vnode.data.show && el.parentNode) {
          (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
        }
        beforeLeave && beforeLeave(el);
        if (expectsCSS) {
          addTransitionClass(el, leaveClass);
          addTransitionClass(el, leaveActiveClass);
          nextFrame(function () {
            removeTransitionClass(el, leaveClass);
            if (!cb.cancelled) {
              addTransitionClass(el, leaveToClass);
              if (!userWantsControl) {
                if (isValidDuration(explicitLeaveDuration)) {
                  setTimeout(cb, explicitLeaveDuration);
                } else {
                  whenTransitionEnds(el, type, cb);
                }
              }
            }
          });
        }
        leave && leave(el, cb);
        if (!expectsCSS && !userWantsControl) {
          cb();
        }
      }
    }
    var transition = true ? {
      create: _enter,
      activate: _enter,
      remove: function remove$$1 (vnode, rm) {
        /* istanbul ignore else */
        if (vnode.data.show !== true) {
          leave(vnode, rm);
        } else {
          rm();
        }
      }
    } : {};
    var klass = {
      create: updateClass,
      update: updateClass
    };
    var events = {
      create: updateDOMListeners,
      update: updateDOMListeners
    };
    var domProps = {
      create: updateDOMProps,
      update: updateDOMProps
    };
    var style = {
      create: updateStyle,
      update: updateStyle
    };
    var platformModules = [
      attrs,
      klass,
      events,
      domProps,
      style,
      transition
    ];
      // Should execute update
    var svgContainer;
    
    function updateDOMProps (oldDevcoNode, vnode) {
      console.log('UPDATE DOM PROPS DEVCO', oldDevcoNode, vnode)
      if (isUndef(oldDevcoNode.data.domProps) && isUndef(vnode.data.domProps)) {
        return
      }
      var key, cur;
      var elm = vnode.elm;
      var oldProps = oldDevcoNode.data.domProps || {};
      var props = vnode.data.domProps || {};
      // clone observed objects, as the user probably wants to mutate it
      if (isDef(props.__ob__)) {
        props = vnode.data.domProps = extend({}, props);
      }
  
      for (key in oldProps) {
        if (!(key in props)) {
          elm[key] = '';
        }
      }
  
      for (key in props) {
        cur = props[key];
        // ignore children if the node has textContent or innerHTML,
        // as these will throw away existing DOM nodes and cause removal errors
        // on subsequent patches (#3360)
        if (key === 'textContent' || key === 'innerHTML') {
          if (vnode.children) { vnode.children.length = 0; }
          if (cur === oldProps[key]) { continue }
          // #6601 work around Chrome version <= 55 bug where single textNode
          // replaced by innerHTML/textContent retains its parentNode property
          if (elm.childNodes.length === 1) {
            elm.removeChild(elm.childNodes[0]);
          }
        }
  
        if (key === 'value' && elm.tagName !== 'PROGRESS') {
          // store value as _value as well since
          // non-string values will be stringified
          elm._value = cur;
          // avoid resetting cursor position when value is the same
          var strCur = isUndef(cur) ? '' : String(cur);
          if (shouldUpdateValue(elm, strCur)) {
            elm.value = strCur;
          }
        } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
          // IE doesn't support innerHTML for SVG elements
          svgContainer = svgContainer || document.createElement('div');
          svgContainer.innerHTML = "<svg>" + cur + "</svg>";
          var svg = svgContainer.firstChild;
          while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
          }
          while (svg.firstChild) {
            elm.appendChild(svg.firstChild);
          }
        } else if (
          // skip the update if old and new VDOM state is the same.
          // `value` is handled separately because the DOM value may be temporarily
          // out of sync with VDOM state due to focus, composition and modifiers.
          // This  #4521 by skipping the unnecessary `checked` update.
          cur !== oldProps[key]
        ) {
          // some property updates can throw
          // e.g. `value` on <progress> w/ non-finite value
          try {
            elm[key] = cur;
          } catch (e) {}
        }
      }
    }
    
    var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];
    function createPatchFunction (backend) {
      var i, j;
      var cbs = {};

  
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
  
      function lagElm (devconode, insertedDevconodeQueue, parentElm, refElm, nested, ownerArray, index) {
        if (isDef(devconode.elm) && isDef(ownerArray)) {
          // This devconode was used in a previous render!
          // now it's used as a new node, overwriting its elm would cause
          // potential lapp errors down the road when it's used as an insertion
          // reference node. Instead, we clone the node on-demand before creating
          // associated DOM element for it.
          devconode = ownerArray[index] = cloneDevcoNode(devconode);
        }
        devconode.isRootInsert = !nested; // for transition enter check
        if (lagKomponent(devconode, insertedDevconodeQueue, parentElm, refElm)) {
          return
        }
        var data = devconode.data;
        var children = devconode.children;
        var tag = devconode.tag;

        if (isDef(tag)) {
          {
            if (data && data.pre) {
              creatingElmInPre++;
            }
            if (isUnknownElement$$1(devconode, creatingElmInVPre)) {
              advarsel(
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
          {
            lagBarn(devconode, children, insertedDevconodeQueue);
            if (isDef(data)) {
              invokeCreateHooks(devconode, insertedDevconodeQueue);
            }
            insert(parentElm, devconode.elm, refElm);
          }
  
          if (data && data.pre) {
            creatingElmInVPre--;
          }
        } else if (isTrue(devconode.isComment)) { // NODE IS SOMEHOW COMMENT. WHY THO
          console.log('NODEOPS', devconode) 
          devconode.elm = nodeOps.createComment(devconode.text);
          insert(parentElm, devconode.elm, refElm);
        } else {
          devconode.elm = nodeOps.createTextNode(devconode.text);
          insert(parentElm, devconode.elm, refElm);
        }
      }
  
      function lagKomponent (devconode, insertedDevconodeQueue, parentElm, refElm) {
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
            initComponent(devconode, insertedDevconodeQueue);
            insert(parentElm, devconode.elm, refElm);
            if (isTrue(isReactivated)) {
              reactivateComponent(devconode, insertedDevconodeQueue, parentElm, refElm);
            }
            return true
          }
        }
      }
  
      function initComponent (devconode, insertedDevconodeQueue) {
        if (isDef(devconode.data.pendingInsert)) {
          insertedDevconodeQueue.push.apply(insertedDevconodeQueue, devconode.data.pendingInsert);
          devconode.data.pendingInsert = null;
        }
        devconode.elm = devconode.componentInstance.$el;
        if (isPatchable(devconode)) {
          invokeCreateHooks(devconode, insertedDevconodeQueue);
          setScope(devconode);
        } else {
          // empty component root.
          // skip all element-related modules except for ref (#3455)
          registerRef(devconode);
          // make sure to invoke the insert hook
          insertedDevconodeQueue.push(devconode);
        }
      }
  
      function reactivateComponent (devconode, insertedDevconodeQueue, parentElm, refElm) {
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
            insertedDevconodeQueue.push(innerNode);
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
  
      function lagBarn (devconode, children, insertedDevconodeQueue) {
        if (Array.isArray(children)) {
          {
            checkDuplicateKeys(children);
          }
          for (var i = 0; i < children.length; ++i) {
            lagElm(children[i], insertedDevconodeQueue, devconode.elm, null, true, children, i);
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
  
      function invokeCreateHooks (devconode, insertedDevconodeQueue) {
        for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
          cbs.create[i$1](emptyNode, devconode);
        }
        i = devconode.data.hook; // Reuse variable
        if (isDef(i)) {
          if (isDef(i.create)) { i.create(emptyNode, devconode); }
          if (isDef(i.insert)) { insertedDevconodeQueue.push(devconode); }
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
  
      function leggtilDevconodes (parentElm, refElm, devconodes, startIdx, endIdx, insertedDevconodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
          lagElm(devconodes[startIdx], insertedDevconodeQueue, parentElm, refElm, false, devconodes, startIdx);
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
      function sammeInputType (a, b) {
        if (a.tag !== 'input') { return true }
        var i;
        var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
        var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
        return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
      }

      function oppdaterBarn (parentElm, oldCh, newCh, insertedDevconodeQueue, removeOnly) {
        var oldStartIdx = 0;
        var newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartDevcoNode = oldCh[0];
        var oldEndDevcoNode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartDevcoNode = newCh[0];
        var newEndDevcoNode = newCh[newEndIdx];
        var oldKeyToIdx, idxInOld, devconodeToMove, refElm;
  
        // removeOnly is a special flag used only by <transition-group>
        // to ensure removed elements stay in correct relative positions
        // during leaving transitions
        var canMove = !removeOnly;
  
        {
          checkDuplicateKeys(newCh);
        }
  
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
          if (isUndef(oldStartDevcoNode)) {
            oldStartDevcoNode = oldCh[++oldStartIdx]; // DevcoNode has been moved left
          } else if (isUndef(oldEndDevcoNode)) {
            oldEndDevcoNode = oldCh[--oldEndIdx];
          } else if (sammeDevcoNode(oldStartDevcoNode, newStartDevcoNode)) {
            lappDevconode(oldStartDevcoNode, newStartDevcoNode, insertedDevconodeQueue, newCh, newStartIdx);
            oldStartDevcoNode = oldCh[++oldStartIdx];
            newStartDevcoNode = newCh[++newStartIdx];
          } else if (sammeDevcoNode(oldEndDevcoNode, newEndDevcoNode)) {
            lappDevconode(oldEndDevcoNode, newEndDevcoNode, insertedDevconodeQueue, newCh, newEndIdx);
            oldEndDevcoNode = oldCh[--oldEndIdx];
            newEndDevcoNode = newCh[--newEndIdx];
          } else if (sammeDevcoNode(oldStartDevcoNode, newEndDevcoNode)) { // DevcoNode moved right
            lappDevconode(oldStartDevcoNode, newEndDevcoNode, insertedDevconodeQueue, newCh, newEndIdx);
            canMove && nodeOps.insertBefore(parentElm, oldStartDevcoNode.elm, nodeOps.nextSibling(oldEndDevcoNode.elm));
            oldStartDevcoNode = oldCh[++oldStartIdx];
            newEndDevcoNode = newCh[--newEndIdx];
          } else if (sammeDevcoNode(oldEndDevcoNode, newStartDevcoNode)) { // DevcoNode moved left
            lappDevconode(oldEndDevcoNode, newStartDevcoNode, insertedDevconodeQueue, newCh, newStartIdx);
            canMove && nodeOps.insertBefore(parentElm, oldEndDevcoNode.elm, oldStartDevcoNode.elm);
            oldEndDevcoNode = oldCh[--oldEndIdx];
            newStartDevcoNode = newCh[++newStartIdx];
          } else {
            if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
            idxInOld = isDef(newStartDevcoNode.key)
              ? oldKeyToIdx[newStartDevcoNode.key]
              : findIdxInOld(newStartDevcoNode, oldCh, oldStartIdx, oldEndIdx);
            if (isUndef(idxInOld)) { // New element
              lagElm(newStartDevcoNode, insertedDevconodeQueue, parentElm, oldStartDevcoNode.elm, false, newCh, newStartIdx);
            } else {
              devconodeToMove = oldCh[idxInOld];
              if (sammeDevcoNode(devconodeToMove, newStartDevcoNode)) {
                lappDevconode(devconodeToMove, newStartDevcoNode, insertedDevconodeQueue, newCh, newStartIdx);
                oldCh[idxInOld] = undefined;
                canMove && nodeOps.insertBefore(parentElm, devconodeToMove.elm, oldStartDevcoNode.elm);
              } else {
                // same key but different element. treat as new element
                lagElm(newStartDevcoNode, insertedDevconodeQueue, parentElm, oldStartDevcoNode.elm, false, newCh, newStartIdx);
              }
            }
            newStartDevcoNode = newCh[++newStartIdx];
          }
        }
        if (oldStartIdx > oldEndIdx) {
          refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
          leggtilDevconodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedDevconodeQueue);
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
          if (isDef(c) && sammeDevcoNode(node, c)) { return i }
        }
      }
  
      function lappDevconode (gammelDevconode,devconode,insertedDevconodeQueue, ownerArray, index, removeOnly) {
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
            hydrate(gammelDevconode.elm, devconode, insertedDevconodeQueue);
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
            if (oldCh !== ch) { oppdaterBarn(elm, oldCh, ch, insertedDevconodeQueue, removeOnly); }
          } else if (isDef(ch)) {
            {
              checkDuplicateKeys(ch);
            }
            if (isDef(gammelDevconode.text)) { nodeOps.setTextContent(elm, ''); }
            leggtilDevconodes(elm, null, ch, 0, ch.length - 1, insertedDevconodeQueue);
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
      function hydrate (elm, devconode, insertedDevconodeQueue, inDevcoPre) {
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
            initComponent(devconode, insertedDevconodeQueue);
            return true
          }
        }
        if (isDef(tag)) {
          if (isDef(children)) {
            // empty element, allow client to pick up and populate children
            if (!elm.hasChildNodes()) {
              lagBarn(devconode, children, insertedDevconodeQueue);
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
                  if (!childNode || !hydrate(childNode, children[i$1], insertedDevconodeQueue, inDevcoPre)) {
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
                invokeCreateHooks(devconode, insertedDevconodeQueue);
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
        console.log("PATCH", devconode)
        // Devconode should be element and not comment, and isComment shoudl be false
        if (isUndef(devconode)) {
          if (isDef(gammelDevconode)) { invokeDestroyHook(gammelDevconode); }
          advarsel('IS HYDRATING')
          return
        }
  
        var isInitialPatch = false;
        var insertedDevconodeQueue = [];
  
        if (isUndef(gammelDevconode)) {
          // empty monter (likely as component), create new root element
          isInitialPatch = true;
          lagElm(devconode, insertedDevconodeQueue);
        } else {
          
          var isRealElement = isDef(gammelDevconode.nodeType);
          if (!isRealElement && sammeDevcoNode(gammelDevconode, devconode)) {
            // lapp existing root node
            lappDevconode(gammelDevconode, devconode, insertedDevconodeQueue, null, null, removeOnly);
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
                
                if (hydrate(gammelDevconode, devconode, insertedDevconodeQueue)) {
                  invokeInsertHook(devconode, insertedDevconodeQueue, true);
                  return gammelDevconode
                } else {
                  advarsel(
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
            
            // create new node // lagELM fucker opp shit
            
            console.log('DEVCO', devconode)
            lagElm(
              devconode,
              insertedDevconodeQueue,
              oldElm._leaveCb ? null : parentElm,
              nodeOps.nextSibling(oldElm)
            );
            console.log('DEVCO', devconode)
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
  
        invokeInsertHook(devconode, insertedDevconodeQueue, isInitialPatch);
        console.log("DEVCONOD", devconode)
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
    var ref = {
      create: function create (_, vnode) {
        registerRef(vnode);
      },
      update: function update (oldDevcoNode, vnode) {
        if (oldDevcoNode.data.ref !== vnode.data.ref) {
          registerRef(oldDevcoNode, true);
          registerRef(vnode);
        }
      },
      destroy: function destroy (vnode) {
        registerRef(vnode, true);
      }
    };
  
    function registerRef (vnode, isRemoval) {
      var key = vnode.data.ref;
      if (!isDef(key)) { return }
  
      var vm = vnode.context;
      var ref = vnode.componentInstance || vnode.elm;
      var refs = vm.$refs;
      if (isRemoval) {
        if (Array.isArray(refs[key])) {
          remove(refs[key], ref);
        } else if (refs[key] === ref) {
          refs[key] = undefined;
        }
      } else {
        if (vnode.data.refInFor) {
          if (!Array.isArray(refs[key])) {
            refs[key] = [ref];
          } else if (refs[key].indexOf(ref) < 0) {
            // $flow-disable-line
            refs[key].push(ref);
          }
        } else {
          refs[key] = ref;
        }
      }
    }
    var emptyNode = new DevcoNode('', {}, []);
    var directives = {
      create: updateDirectives,
      update: updateDirectives,
      destroy: function unbindDirectives (vnode) {
        updateDirectives(vnode, emptyNode);
      }
    };

    var initProxy;

    {
      var allowedGlobals = lagKart(
        'Infinity,undefined,NaN,isFinite,isNaN,' +
        'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
        'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
        'require' // for Webpack/Browserify
      );
      initProxy = function initProxy (vm) {
        if (hasProxy) {
          // determine which proxy handler to use
          var options = vm.$options;
          var handlers = options.render && options.render._withStripped
            ? getHandler
            : hasHandler;
          vm._renderProxy = new Proxy(vm, handlers);
        } else {
          vm._renderProxy = vm;
        }
      };
      var hasProxy =
        typeof Proxy !== 'undefined' && isNative(Proxy);


      var hasHandler = {
        has: function has (target, key) {
          var has = key in target;
          var isAllowed = allowedGlobals(key) ||
            (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
          if (!has && !isAllowed) {
            if (key in target.$data) { warnReservedPrefix(target, key); }
            else { warnNonPresent(target, key); }
          }
          return has || !isAllowed
        }
      };
  
      var getHandler = {
        get: function get (target, key) {
          if (typeof key === 'string' && !(key in target)) {
            if (key in target.$data) { warnReservedPrefix(target, key); }
            else { warnNonPresent(target, key); }
          }
          return target[key]
        }
      };
    }
    
    function updateDirectives (oldDevcoNode, vnode) {
      if (oldDevcoNode.data.directives || vnode.data.directives) {
        _update(oldDevcoNode, vnode);
      }
    }
  
    function _update (oldDevcoNode, vnode) {
      var isCreate = oldDevcoNode === emptyNode;
      var isDestroy = vnode === emptyNode;
      var oldDirs = normalizeDirectives$1(oldDevcoNode.data.directives, oldDevcoNode.context);
      var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);
  
      var dirsWithInsert = [];
      var dirsWithPostpatch = [];
  
      var key, oldDir, dir;
      for (key in newDirs) {
        oldDir = oldDirs[key];
        dir = newDirs[key];
        if (!oldDir) {
          // new directive, bind
          callHook$1(dir, 'bind', vnode, oldDevcoNode);
          if (dir.def && dir.def.inserted) {
            dirsWithInsert.push(dir);
          }
        } else {
          // existing directive, update
          dir.oldValue = oldDir.value;
          dir.oldArg = oldDir.arg;
          callHook$1(dir, 'update', vnode, oldDevcoNode);
          if (dir.def && dir.def.componentUpdated) {
            dirsWithPostpatch.push(dir);
          }
        }
      }
  
      if (dirsWithInsert.length) {
        var callInsert = function () {
          for (var i = 0; i < dirsWithInsert.length; i++) {
            callHook$1(dirsWithInsert[i], 'inserted', vnode, oldDevcoNode);
          }
        };
        if (isCreate) {
          mergeVNodeHook(vnode, 'insert', callInsert);
        } else {
          callInsert();
        }
      }
  
      if (dirsWithPostpatch.length) {
        mergeVNodeHook(vnode, 'postpatch', function () {
          for (var i = 0; i < dirsWithPostpatch.length; i++) {
            callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldDevcoNode);
          }
        });
      }
  
      if (!isCreate) {
        for (key in oldDirs) {
          if (!newDirs[key]) {
            // no longer present, unbind
            callHook$1(oldDirs[key], 'unbind', oldDevcoNode, oldDevcoNode, isDestroy);
          }
        }
      }
    }
    var baseModules = [
      ref,
      directives
    ];
    var modules = platformModules.concat(baseModules);
    console.log("MODULES", modules)
    var lapp = createPatchFunction({ nodeOps: nodeOps, modules: modules });
    var currentRenderingInstance = null;
    Devco.prototype.__lapp__ = true ? lapp : noop;
    Devco.prototype.$monter = function (el, hydrating) {
      el = el && true ? query(el) : undefined;
      console.error(monterKomponent(this, el, hydrating))
      return monterKomponent(this, el, hydrating)
    };


    function lifecycleMixin (Devco) {
      Devco.prototype._oppdater = function (devconode, hydrating) {
        var vm = this;
        var prevEl = vm.$el;

        var prevDevconode = vm._devconode;
        var restoreActiveInstance = vm;
        vm._devconode = devconode;

        if (!prevDevconode) {
          // initial render
          vm.$el = vm.__lapp__(vm.$el, devconode, hydrating, false);
          console.log("ELementDevco", vm.$el)
        } else {
          // updates
          vm.$el = vm.__lapp__(prevDevconode, devconode);
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
        vm.__lapp__(vm._devconode, null);
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
        console.log('VMAAA', vm)
        vm.$options.render = lagTomDevcoNode;
        // vm.$lagElement = function (a, b, c, d) { return lagElement(vm, a, b, c, d, true); };

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
          console.log('RENDER', vm)
          // RENDERPROXY is not defined
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
      console.log('MONTER KOMPONENT DEVCO', vm, el, hydrating)
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
              'Feilet å montere komponent: template eller render funksjon ikke definert.',
              vm
            );
          }
        }
      }
      callHook(vm, 'beforeMount');
  
      var updateComponent;
      
      updateComponent = function () {
        console.log('VMMMMM', vm)

        // VM OPPDATER MANGLER
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

    
    //createCompilerCreator
    function lagKompilatorSkaper (baseCompile) {
      return function lagKompiler (baseOptions) {
        function kompiler (template, options) {
          var finalOptions = Object.create(baseOptions);
          var errors = [];
          var tips = [];
  
          var advarsel = function (msg, range, tip) {
            (tip ? tips : errors).push(msg);
          };
  
          if (options) {
            if (options.outputSourceRange) {
              // $flow-disable-line
              var leadingSpaceLength = template.match(/^\s*/)[0].length;
  
              advarsel = function (msg, range, tip) {
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
  
          finalOptions.advarsel = advarsel;
  
          var compiled = baseCompile(template.trim(), finalOptions);

          {
            detectErrors(compiled.ast, advarsel);
          }

          compiled.errors = errors;
          compiled.tips = tips;

          console.log(compiled)
          return compiled
        }
        return {
          kompiler: kompiler,
          kompilerTilFunksjoner: lagKompilerTilFunksjonerFn(kompiler)
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
            advarsel('props must be strings when using array syntax.');
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
        advarsel(
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
        advarsel(
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
    function lagFunksjon (code, errors) {
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
    function sammeDevcoNode (a, b) {
      return (
        a.key === b.key &&
        a.asyncFactory === b.asyncFactory && (
          (
            a.tag === b.tag &&
            a.isComment === b.isComment &&
            isDef(a.data) === isDef(b.data) &&
            sammeInputType(a, b)
          ) || (
            isTrue(a.isAsyncPlaceholder) &&
            isUndef(b.asyncFactory.error)
          )
        )
      )
    }
    function sammeInputType (a, b) {
      if (a.tag !== 'input') { return true }
      var i;
      var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
      var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
      return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
    }
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
      var configDef = {};
      configDef.get = function () { return config; };
      Object.defineProperty(Devco, 'config', configDef);

      var ASSET_TYPES = [
        'component',
        'directive',
        'filter'
      ];
      Devco.options = Object.create(null);
      
      ASSET_TYPES.forEach(function (type) {
        Devco.options[type + 's'] = Object.create(null);
      });
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

        {
          initProxy(vm);
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
      var parentDevcoNode = vm.$devconode = options._parentDevconode; // the placeholder node in parent tree
      var renderContext = parentDevcoNode && parentDevcoNode.context;
      vm.$scopedSlots = Object.freeze();

      vm._c = function (a, b, c, d) { return lagElement(vm, a, b, c, d, false); };

      vm.$lagElement = function (a, b, c, d) { return lagElement(vm, a, b, c, d, true); };
  
      // $attrs & $listeners are exposed for easier HOC creation.
      // they need to be reactive so that HOCs using them are always updated
      var parentData = parentDevcoNode && parentDevcoNode.data;
  
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

      

      console.log('CONFIG', Devco)

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
      console.log('PROCESS ONCE')
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
      let advarsel$2 = options.advarsel || console.warn();
  
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
        advarsel: advarsel$2,
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
        kommentar: function kommentar (text, start, end) {
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
      console.log('analyserHTML', root)
      return root
    }
    
    console.timeEnd('devco')
    Devco.kompiler = kompilerTilFunksjoner;
    // console.log('DEVCO', Devco.kompiler)
    return Devco
}));

  
