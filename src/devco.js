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


(function () {
  
  var controllers = {};
  var addController = function (name, constructor) {

    // This is styling for console messages
    const styling = `
      padding: 10px;
      font-size: 20px;
      border: solid #FFBB51 1px;
      border-radius: 0.25rem;
      background: repeating-linear-gradient(to top, rgba(255, 255, 255, 0.03) 0px 2px, transparent 2px 4px),linear-gradient(to bottom, #200933 75%, #3d0b43);
      filter: drop-shadow(0 0 75px rgb(128 0 255 / 0.25));
    `;
    var config = {
      styling: true
    };

    // Types 
    var data = {};
    var hvis = {};
    var bindings = {};
    var forHver = {};

    var feil = function (a, b, c) {};
    var advarsel = function (a, b, c) {};
    var tips = function (a, b, c) {};

    {
      feil = function (msg) {
        if (config.styling) {
          console.log(("%c[Devco feil]: " + msg), `${styling}`);
        }
      };
      advarsel = function (msg) {
        if (config.styling) {
          console.log(("%c[Devco advarsel]: " + msg), `${styling}`);
        }
      };
      tips = function (msg) {
        if (config.styling) {
          console.log("%c[Devco tips]: " + msg, styling);
        }
      };
    }



    // Store controller constructor
    controllers[name] = {
      factory: constructor,
      instances: []
    };  
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

    // Define Data Element
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

        let jsonData = JSON.parse(this.textContent);
        Object.keys(jsonData).forEach(function (key) {
          if (jsonData[key] instanceof Object) {
            if ((/^(true|false)/.test(jsonData[key])) || /^[0-9]+$/.test(jsonData[key])) {
              jsonData[key] = jsonData[key].replace('"', '')
            }
          }
          if (!(key in data)) {
            data[key] = jsonData[key]
          } else {
            advarsel('Duplicate key: ' + key)
          }
        });
      }
    }
    
    customElements.define("devco-data", DevcoData);

    
    // Define Config Element
    class DevcoConfig extends HTMLElement {
      constructor() {
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

        // trim config for whitespace
        let trimmedConfig = this.textContent.replace(/^[^\S\r\n]+|[^\S\r\n]+$/gm, "")

        var options = trimmedConfig.split("\n");

        // Remove all config options that are not defined in users config
        Object.keys(config).forEach(function (item) {
          if (countInArray(options, item) > 1) {
            return feil(`Du kan ikke definere ${item} mer enn en gang`);
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
      return console.error('Kontainer er ikke definert');
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
    Array.prototype.slice.call(element.querySelectorAll('[brytar]'))
      .map(function (element) {
      var bryterValue = element.getAttribute('brytar');
          
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
    //   // element.attrsList = attributeList(element)
    //   // element.attrsMap = attributeMap(element)
      
    
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
              if (value == element.children[i].getAttribute('tilfelle')) {
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