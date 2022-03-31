(function () {
    var controllers = {};
    var addController = function (name, constructor) {
      // Store controller constructor
      controllers[name] = {
        factory: constructor,
        instances: []
      };
  
      // Look for elements using the controller 
      var element = document.querySelector('[kontainer]');
      if (!element) {   
        return console.error('Kontainer er ikke definert');
      }
  
      // Create a new instance and save it
      var ctrl = new controllers[name].factory();
      controllers[name].instances.push(ctrl);
  
      console.log(ctrl)
      // Get elements bound to properties
      var bindings = {};
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


      var hvis = {};
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


      // Converts objects without '"' to object with '"' for JSON.parse
      const objectStr = ((str) => {
        str = /^[\n\s]*if.*\(.*\)/.test(str) || /^(let|const)\s/.test(str) ? `(() => { ${str} })()` : str;
        var tokens = str.split(",")
        for (u = 0; u < tokens.length; u++) {
          let t = tokens[u].split(" ")
          for (i = 0; i < t.length; i++) {
            if (/^(true|false)/.test(t[2]) || /^[0-9]+$/.test(t[2])) {
              t[2] = t[2].trim().replace('"', '')
            }
            if (!t[1].startsWith('"')) {
              t[1] = t[1].trim().replace(/^/, '"')
              t[1] = t[1].slice(0, -1).concat('":')
            } else if (t[1].startsWith("'")) {
              t[1] = t[1].replace("'", '"')
            }
          }
          tokens[u] = t.join(' ')
        }
        tokens = tokens.join(",")
        return JSON.parse(tokens)
      })


      // Data
      var data = {};
      Array.prototype.slice.call(element.querySelectorAll('[data]'))
        .map(function (element) {
        var dataValue = element.getAttribute('data');

        const obj = objectStr(dataValue)

        for (const [key, value] of Object.entries(obj)) {
          if (!data[key]) {
            data[key] = {
              dataValue: value,
              elements: []
            }
          }
  
          data[key].elements.push(element);
          
          console.log("obj", obj)
        }
      });


      // on
      // var ved = {};
      // Array.prototype.slice.call(element.querySelectorAll('[ved]'))
      //   .map(function (element) {
      //   var vedValue = element.getAttribute('ved');
      //   console.log(vedValue2)
          
      //   if (!ved[vedValue]) {
      //     ved[vedValue] = {
      //       vedValue: vedValue,
      //       elements: []
      //     }
      //   }
  
      //   ved[vedValue].elements.push(element);
      // });
      
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
  
      // Update DOM element bound when controller property is set
      var proxy = new Proxy (ctrl, {
        set: function (target, prop, value) {    
          
          console.log("|target: ", target, "|prop: ", prop, "|value: ",value)

          var bind = bindings[prop];
          var bryt = bryter[prop];
          var hvis2 = hvis[prop];


          // var ved = ved[prop];
          
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
            console.table(data[hvis2])
            
            console.log("dataaaaaabc", data[value])
            hvis2.elements.forEach(function (element) {
              if (data[value] && data[value].dataValue) {
                element.style.display = 'block';
              } else if (!data[value] && eval(value) == true | false) {
                console.log("eval value", eval(value))
                element.style.display = value == 'true' ? 'block' : 'none';
              } else {
                element.style.display = 'none';
              }
            });
          }
          // if (ved) {
          //   ved.elements.forEach(function (element) {
          //     element.innerHTML = value;
          //   });
          // }

          return Reflect.set(target, prop, value);
        }
      });

  
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
        var hvisF = hvis[hvisValue];;

        hvisF.elements.forEach(function (element) {
          proxy[hvisF.hvisValue] = element.getAttribute("hvis");
        })  
      });
      
  
      // Fill proxy with ctrl properties
      // and return proxy, not the ctrl !
      Object.assign(proxy, ctrl);
      console.log("Proxy:", proxy)
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



function createElement(tag, attrs, children) {
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

// ----------------------------
// Custom Elements
// ----------------------------
class NorskBoks extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();
  }
}
class Devcologo extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    // Create a shadow root
    var shadow = this.attachShadow({mode: 'open'});

    // Create spans
    var wrapper = document.createElement('span');
    wrapper.setAttribute('class','wrapper');
    var icon = document.createElement('span');
    icon.setAttribute('class','icon');
    icon.setAttribute('tabindex', 0);
    var info = document.createElement('span');
    info.setAttribute('class','info');

    // Take attribute content and put it inside the info span
    var text = this.getAttribute('text');
    info.textContent = text;

    // Insert icon
    var imgUrl;
    if(this.hasAttribute('img')) {
      imgUrl = this.getAttribute('img');
    } else {
      imgUrl = 'devco-logo.png';
    }
    var img = document.createElement('img');
    img.src = imgUrl;
    icon.appendChild(img);

    var style = document.createElement('style');

    style.textContent = '.wrapper {' +
                           'position: relative;' +
                        '}' +

                         '.info {' +
                            'font-size: 0.8rem;' +
                            'width: 200px;' +
                            'display: inline-block;' +
                            'border: 1px solid black;' +
                            'padding: 10px;' +
                            'background: white;' +
                            'border-radius: 10px;' +
                            'opacity: 0;' +
                            'transition: 0.6s all;' +
                            'position: absolute;' +
                            'bottom: 20px;' +
                            'left: 10px;' +
                            'z-index: 3;' +
                          '}' +

                          'img {' +
                            'width: 1.2rem' +
                          '}' +

                          '.icon:hover + .info, .icon:focus + .info {' +
                            'opacity: 1;' +
                          '}';

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    wrapper.appendChild(icon);
    wrapper.appendChild(info);
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

    var body = createElement('n-boks', {class: "container"}, [
      createElement('n-boks', {class: "card"}, [
        createElement('n-boks', {class: "face face1"}, [
          createElement('n-boks', {class: "content"}, [
            createElement('img', {src: imgUrl}),
            createElement('h3', {tekst: title})
          ])
        ]),
        createElement('n-boks', {class: "face face2"}, [
          createElement('n-boks', {class: "content"}, [
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
  "n-boks": {klasse: NorskBoks, extends: "div"},
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
