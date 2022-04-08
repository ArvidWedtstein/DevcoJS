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

// var Controller = norsk.controller(window.location.pathname.replace("/", ""), InputController);

function onButtonClick () {
console.log('button clicked')
}