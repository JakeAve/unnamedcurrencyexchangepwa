!function(e){var o={};function t(n){if(o[n])return o[n].exports;var r=o[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,t),r.l=!0,r.exports}t.m=e,t.c=o,t.d=function(e,o,n){t.o(e,o)||Object.defineProperty(e,o,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,o){if(1&o&&(e=t(e)),8&o)return e;if(4&o&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&o&&"string"!=typeof e)for(var r in e)t.d(n,r,function(o){return e[o]}.bind(null,r));return n},t.n=function(e){var o=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(o,"a",o),o},t.o=function(e,o){return Object.prototype.hasOwnProperty.call(e,o)},t.p="",t(t.s=1)}([,function(e,o,t){"use strict";t.r(o);const n=document.querySelector("#favorites-grid");class r{constructor({formEl:e,id:o,base:t,quote:n,rate:r="",time:a=""}){e?this.formEl=e:(this.createFormEl(o,t,n,r,a),this.base=t,this.quote=n,this.lastWorkingBaseCurr=t.short,this.lastWorkingQuoteCurr=n.short),this.id=o||"main",this.baseCurrSel=this.formEl.querySelector("[base-currency]"),this.baseSelCover=this.formEl.querySelector("[base-sel-cover]"),this.baseLabel=this.formEl.querySelector("[base-label]"),this.baseInput=this.formEl.querySelector("[base-input]"),this.quoteCurrSel=this.formEl.querySelector("[quote-currency]"),this.quoteSelCover=this.formEl.querySelector("[quote-sel-cover]"),this.quoteLabel=this.formEl.querySelector("[quote-label]"),this.quoteInput=this.formEl.querySelector("[quote-input]"),this.feeRate=this.formEl.querySelector("[fee-rate]"),this.exRate=this.formEl.querySelector("[ex-rate]"),this.timeInput=this.formEl.querySelector("[time-input]"),this.relTime=this.formEl.querySelector("[rel-time]"),this.formEl.addEventListener("input",e=>this.convertCurrencies(e)),setInterval(()=>this.makeRelTimeText(),6e4),this.convertCurrencies()}revertCurrencies(){this.baseCurrSel.value=this.lastWorkingBaseCurr,this.quoteCurrSel.value=this.lastWorkingQuoteCurr,this.updateDisplay()}get baseName(){return this.base?this.base.long:this.baseCurrSel.querySelector('[value="'.concat(this.baseCurrSel.value,'"]')).innerHTML}get quoteName(){return this.quote?this.quote.long:this.quoteCurrSel.querySelector('[value="'.concat(this.quoteCurrSel.value,'"]')).innerHTML}readForm(){const e=new FormData(this.formEl),o={};for(let t of e){const e=+t[1];o[t[0]]=isNaN(e)?t[1]:e}return o}updateDisplay(){const e="0.00"===this.feeRate.value?"":" - ".concat(this.feeRate.querySelector('[value="'.concat(this.feeRate.value,'"]')).innerHTML);this.baseSelCover&&this.quoteSelCover&&(this.baseSelCover.innerHTML=this.baseName,this.quoteSelCover.innerHTML=this.quoteName,this.baseLabel.innerHTML=this.baseName,this.quoteLabel.innerHTML=this.quoteName+e),e?this.formEl.classList.add("warning"):this.formEl.classList.remove("warning")}setRate(e){return async function(e,o){const t="https://api.exchangeratesapi.io/latest?base=".concat(e,"&symbols=").concat(o),n=await fetch(t);if(200!==n.status)throw new Error("API Returned ".concat(n.status));const r=await n.json();return{rate:r.rates[o],time:r.date}}(e["base-currency"],e["quote-currency"]).then(({rate:e,time:o})=>{this.exRate.value=e,this.timeInput.value=o,this.lastWorkingBaseCurr=this.baseCurrSel.value,this.lastWorkingQuoteCurr=this.quoteCurrSel.value,this.makeRelTimeText()}).catch(e=>console.error(e))}calculateAmount(e){const o=this.readForm();if(e===this.quoteInput){const e=o["quote-amount"]/o["ex-rate"]*(1-o["fee-rate"]);this.baseInput.value=e.toFixed(2)}else{const e=o["base-amount"]*o["ex-rate"]*(1-o["fee-rate"]);this.quoteInput.value=e.toFixed(2)}}async convertCurrencies(e={}){const{target:o=null}=e,t=this.readForm();this.updateDisplay();const n=o===this.baseCurrSel||o===this.quoteCurrSel||""===this.exRate.value;(!o||n)&&await this.setRate(t).catch(()=>{this.revertCurrencies(),navigator.onLine||alert("Your device is offline and cannot get this currency exchange")}),this.calculateAmount(o)}get elapsedTime(){if(this.timeInput.value){const e=new Date(this.timeInput.value);return new Date-e}}makeRelTimeText(e=document.documentElement.lang){let o;try{o=0<Intl.RelativeTimeFormat.supportedLocalesOf(e).length}catch(e){o=!1}const t=this.elapsedTime;if(t){let n="";if(o){const o=new Intl.RelativeTimeFormat([e],{numeric:"auto",style:"long"});let r,a;t<6e4?(a="second",r=t/1e3):t<36e5?(a="minute",r=t/6e4):t<864e5?(a="hour",r=t/36e5):(a="day",r=t/864e5),n=o.format(-r.toFixed(),a)}else{n=new Intl.DateTimeFormat([e],{day:"numeric",month:"short",hour:"numeric",minute:"numeric",timeZoneName:"long"}).format(new Date(this.timeInput.value))}this.relTime.innerHTML=n}}createFormEl(e,o,t,r,a){const l='\n    <form id="form-'.concat(e,'" class="favorite-form">\n        <input class="" id="base-').concat(e,'" name="base-amount" type="number" value="1.00" min="0" max="999999"\n            inputmode="decimal" base-input>\n        <label class="" for="base-').concat(e,'" base-label>').concat(o.long,'</label>\n        <input class="" id="quote-').concat(e,'" name="quote-amount" type="number" min="0" max="999999"\n            inputmode="decimal" quote-input>\n        <label class="" for="quote-').concat(e,'" quote-label>').concat(t.long,'</label>\n        <div class="fee-container">\n            <label for="fee-').concat(e,'">Bank / Card Fee:&nbsp;</label>\n            <select id="fee-').concat(e,'" name="fee-rate" fee-rate>\n                <option value="0.00">0%</option>\n                <option value="0.01">1%</option>\n                <option value="0.02">2%</option>\n                <option value="0.03">3%</option>\n                <option value="0.04">4%</option>\n                <option value="0.05">5%</option>\n            </select>\n        </div>\n        <input hidden name="base-currency" value="').concat(o.short,'" base-currency>\n        <input hidden name="quote-currency" value="').concat(t.short,'" quote-currency>\n        <input hidden id="ex-rate-').concat(e,'" name="ex-rate" value="').concat(r,'" pattern="\\d*.\\d*" ex-rate>\n        <input hidden id="time-input-').concat(e,'" name="time-input" value="').concat(a,'" time-input>\n        <div class="rate-updated" id="last-updated-').concat(e,'" last-updated>Last updated:\n            <span id="time-').concat(e,'" rel-time></span>\n        </div>\n        <button class="use-favorite" type="button" id="use-btn-').concat(e,'" use-btn>Use</button>\n    </form>\n    <button id="move-btn-').concat(e,'" class="fav-move" move-btn>Move</button>\n    <button id="delete-btn-').concat(e,'" class="fav-delete" delete-btn>Delete</button>\n    '),c=document.createElement("div");c.classList.add("favorite-form-container"),c.setAttribute("favorite-id",e),c.innerHTML=l,n.prepend(c),this.formEl=c.querySelector("form")}}function a(e,o){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);o&&(n=n.filter((function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable}))),t.push.apply(t,n)}return t}function l(e,o,t){return o in e?Object.defineProperty(e,o,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[o]=t,e}const c=document.querySelector("#favorites-grid");function s(){const e="test";try{return localStorage.setItem(e,e),localStorage.removeItem(e,e),!0}catch(e){return!1}}const i=s()&&null!==localStorage.getItem("favorites")?JSON.parse(localStorage.getItem("favorites")):[];i.renderForms=()=>i.reverse().map(e=>new r(function(e){for(var o,t=1;t<arguments.length;t++)o=null==arguments[t]?{}:arguments[t],t%2?a(Object(o),!0).forEach((function(t){l(e,t,o[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(o)):a(Object(o)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(o,t))}));return e}({},e))),i.reorder=e=>{const o=i.map(e=>e);e.forEach((e,t)=>i[t]=o.find(o=>o.id===e)),i.save(),c.querySelectorAll(".favorite-form-container").forEach(e=>e.remove()),i.forms=i.renderForms()},i.forms=i.renderForms(),i.save=()=>{s()?localStorage.setItem("favorites",JSON.stringify(i)):alert('You need to enable "localStorage" for this site in your web browser to save a favorite.')};var u=i;const m=document.querySelector("#move-grid");let y;function d(){m.classList.remove("show"),document.body.style.position="",m.removeEventListener("touchstart",b);const e=[...m.querySelectorAll(".move-item")].map(e=>e.getAttribute("favorite-id"));y.reorder(e)}function b(e){m.querySelectorAll(".selected").forEach(e=>e.classList.remove("selected"));const o=e.target.closest(".move-item");if(o){o.classList.add("selected");const e=o.getBoundingClientRect(),t=o.clientHeight,n=o.clientWidth;o.style.position="absolute",o.style.height=t+"px",o.style.width=n+"px",o.style.left=e.left+"px",o.style.top=e.top+"px";const r=document.createElement("div");o.insertAdjacentElement("beforebegin",r);const a=m.querySelectorAll(".move-item"),l=e=>function(e,o,t,n){const r=o.clientHeight,a=o.clientWidth;o.style.left=e.touches[0].clientX-a/2+"px",o.style.top=e.touches[0].clientY-r/2+"px",t.forEach(e=>{if(e!==o){const t=function(e,o){const t=e.left<o.right&&e.right>o.left,n=e.top<o.bottom&&e.bottom>o.top;if(t&&n){const t={};return t.ver=o.top<=e.top?"top":"bottom",t.hor=o.left<=e.left?"left":"right",t}return!1}(e.getBoundingClientRect(),o.getBoundingClientRect());if(t){const o="left"===t.hor?"beforebegin":"afterend";e.insertAdjacentElement(o,n)}}})}(e,o,a,r),c=e=>function(e,o,t,n,r){t.innerHTML=o.innerHTML,t.replaceWith(o),o.style.position="",o.style.height="",o.style.width="",o.style.left="",o.style.top="",o.removeEventListener("touchmove",n),o.removeEventListener("touchend",r)}(0,o,r,l,c);o.addEventListener("touchmove",l),o.addEventListener("touchend",c)}}var g=[{longName:"Albanian Lek",currencyCode:"ALL",symbol:"Lek"},{longName:"Afghan Afghani",currencyCode:"AFN",symbol:"؋"},{longName:"Argentine Peso",currencyCode:"ARS",symbol:"$"},{longName:"Aruban Florin",currencyCode:"AWG",symbol:"ƒ"},{longName:"Australian Dollar",currencyCode:"AUD",symbol:"$"},{longName:"Azerbaijani Manat",currencyCode:"AZN",symbol:"₼"},{longName:"Bahamian Dollar",currencyCode:"BSD",symbol:"$"},{longName:"Barbados Dollar",currencyCode:"BBD",symbol:"$"},{longName:"Belarusian Ruble",currencyCode:"BYN",symbol:"Br"},{longName:"Belize Dollar",currencyCode:"BZD",symbol:"BZ$"},{longName:"Bermudian Dollar",currencyCode:"BMD",symbol:"$"},{longName:"Boliviano",currencyCode:"BOB",symbol:"$b"},{longName:"Bosnia And Herzegovina Convertible Mark",currencyCode:"BAM",symbol:"KM"},{longName:"Botswana Pula",currencyCode:"BWP",symbol:"P"},{longName:"Bulgarian Lev",currencyCode:"BGN",symbol:"лв"},{longName:"Brazilian Real",currencyCode:"BRL",symbol:"R$"},{longName:"Brunei Dollar",currencyCode:"BND",symbol:"$"},{longName:"Cambodian Riel",currencyCode:"KHR",symbol:"៛"},{longName:"Canadian Dollar",currencyCode:"CAD",symbol:"$"},{longName:"Cayman Islands Dollar",currencyCode:"KYD",symbol:"$"},{longName:"Chilean Peso",currencyCode:"CLP",symbol:"$"},{longName:"Renminbi (Chinese) Yuan",currencyCode:"CNY",symbol:"¥"},{longName:"Colombian Peso",currencyCode:"COP",symbol:"$"},{longName:"Costa Rican Colon",currencyCode:"CRC",symbol:"₡"},{longName:"Croatian Kuna",currencyCode:"HRK",symbol:"kn"},{longName:"Cuban Peso",currencyCode:"CUP",symbol:"₱"},{longName:"Czech Koruna",currencyCode:"CZK",symbol:"Kč"},{longName:"Danish Krone",currencyCode:"DKK",symbol:"kr"},{longName:"Dominican Peso",currencyCode:"DOP",symbol:"RD$"},{longName:"East Caribbean Dollar",currencyCode:"XCD",symbol:"$"},{longName:"Egyptian Pound",currencyCode:"EGP",symbol:"£"},{longName:"Salvadoran Colón",currencyCode:"SVC",symbol:"$"},{longName:"Euro",currencyCode:"EUR",symbol:"€"},{longName:"Falkland Islands Pound",currencyCode:"FKP",symbol:"£"},{longName:"Fiji Dollar",currencyCode:"FJD",symbol:"$"},{longName:"Ghanaian Cedi",currencyCode:"GHS",symbol:"¢"},{longName:"Gibraltar Pound",currencyCode:"GIP",symbol:"£"},{longName:"Guatemalan Quetzal",currencyCode:"GTQ",symbol:"Q"},{longName:"Guernsey Pound",currencyCode:"GGP",symbol:"£"},{longName:"Guyanese Dollar",currencyCode:"GYD",symbol:"$"},{longName:"Honduran Lempira",currencyCode:"HNL",symbol:"L"},{longName:"Hong Kong Dollar",currencyCode:"HKD",symbol:"$"},{longName:"Hungarian Forint",currencyCode:"HUF",symbol:"Ft"},{longName:"Icelandic Króna",currencyCode:"ISK",symbol:"kr"},{longName:"Indian Rupee",currencyCode:"INR",symbol:"₹"},{longName:"Indonesian Rupiah",currencyCode:"IDR",symbol:"Rp"},{longName:"Iranian Rial",currencyCode:"IRR",symbol:"﷼"},{longName:"Isle Of Man Pound",currencyCode:"IMP",symbol:"£"},{longName:"Israeli New Shekel",currencyCode:"ILS",symbol:"₪"},{longName:"Jamaican Dollar",currencyCode:"JMD",symbol:"J$"},{longName:"Japanese Yen",currencyCode:"JPY",symbol:"¥"},{longName:"Jersey Pound",currencyCode:"JEP",symbol:"£"},{longName:"Kazakhstani Tenge",currencyCode:"KZT",symbol:"лв"},{longName:"North Korean Won",currencyCode:"KPW",symbol:"₩"},{longName:"South Korean Won",currencyCode:"KRW",symbol:"₩"},{longName:"Kyrgyzstani Som",currencyCode:"KGS",symbol:"лв"},{longName:"Lao Kip",currencyCode:"LAK",symbol:"₭"},{longName:"Lebanese Pound",currencyCode:"LBP",symbol:"£"},{longName:"Liberian Dollar",currencyCode:"LRD",symbol:"$"},{longName:"Macedonian Denar",currencyCode:"MKD",symbol:"ден"},{longName:"Malaysian Ringgit",currencyCode:"MYR",symbol:"RM"},{longName:"Mauritian Rupee",currencyCode:"MUR",symbol:"₨"},{longName:"Mexican Peso",currencyCode:"MXN",symbol:"$"},{longName:"Mongolian Tögrög",currencyCode:"MNT",symbol:"₮"},{longName:"Mozambican Metical",currencyCode:"MZN",symbol:"MT"},{longName:"Namibian Dollar",currencyCode:"NAD",symbol:"$"},{longName:"Nepalese Rupee",currencyCode:"NPR",symbol:"₨"},{longName:"Netherlands Antillean Guilder",currencyCode:"ANG",symbol:"ƒ"},{longName:"New Zealand Dollar",currencyCode:"NZD",symbol:"$"},{longName:"Nicaraguan Córdoba",currencyCode:"NIO",symbol:"C$"},{longName:"Nigerian Naira",currencyCode:"NGN",symbol:"₦"},{longName:"Norwegian Krone",currencyCode:"NOK",symbol:"kr"},{longName:"Omani Rial",currencyCode:"OMR",symbol:"﷼"},{longName:"Pakistani Rupee",currencyCode:"PKR",symbol:"₨"},{longName:"Panamanian Balboa",currencyCode:"PAB",symbol:"B/."},{longName:"Paraguayan Guaraní",currencyCode:"PYG",symbol:"Gs"},{longName:"Peruvian Sol",currencyCode:"PEN",symbol:"S/."},{longName:"Philippine Peso",currencyCode:"PHP",symbol:"₱"},{longName:"Polish Złoty",currencyCode:"PLN",symbol:"zł"},{longName:"Qatari Riyal",currencyCode:"QAR",symbol:"﷼"},{longName:"Romanian Leu",currencyCode:"RON",symbol:"lei"},{longName:"Russian Ruble",currencyCode:"RUB",symbol:"₽"},{longName:"Saint Helena Pound",currencyCode:"SHP",symbol:"£"},{longName:"Saudi Riyal",currencyCode:"SAR",symbol:"﷼"},{longName:"Serbian Dinar",currencyCode:"RSD",symbol:"Дин."},{longName:"Seychelles Rupee",currencyCode:"SCR",symbol:"₨"},{longName:"Singapore Dollar",currencyCode:"SGD",symbol:"$"},{longName:"Solomon Islands Dollar",currencyCode:"SBD",symbol:"$"},{longName:"Somali Shilling",currencyCode:"SOS",symbol:"S"},{longName:"South African Rand",currencyCode:"ZAR",symbol:"R"},{longName:"Sri Lankan Rupee",currencyCode:"LKR",symbol:"₨"},{longName:"Swedish Krona",currencyCode:"SEK",symbol:"kr"},{longName:"Swiss Franc",currencyCode:"CHF",symbol:"CHF"},{longName:"Surinamese Dollar",currencyCode:"SRD",symbol:"$"},{longName:"Syrian Pound",currencyCode:"SYP",symbol:"£"},{longName:"New Taiwan Dollar",currencyCode:"TWD",symbol:"NT$"},{longName:"Thai Baht",currencyCode:"THB",symbol:"฿"},{longName:"Trinidad And Tobago Dollar",currencyCode:"TTD",symbol:"TT$"},{longName:"Turkish Lira",currencyCode:"TRY",symbol:"₺"},{longName:"Tuvalu Dollar",currencyCode:"TVD",symbol:"$"},{longName:"Ukrainian Hryvnia",currencyCode:"UAH",symbol:"₴"},{longName:"British Pound",currencyCode:"GBP",symbol:"£"},{longName:"United States Dollar",currencyCode:"USD",symbol:"$"},{longName:"Uruguayan Peso",currencyCode:"UYU",symbol:"$U"},{longName:"Uzbekistan Som",currencyCode:"UZS",symbol:"лв"},{longName:"Venezuelan Bolívar Fuerte",currencyCode:"VEF",symbol:"Bs"},{longName:"Vietnamese đồng",currencyCode:"VND",symbol:"₫"},{longName:"Yemeni Rial",currencyCode:"YER",symbol:"﷼"},{longName:"Zimbabwean Dollar",currencyCode:"ZWD",symbol:"Z$"}];async function f(){return(await async function(){const e=await fetch("https://api.exchangeratesapi.io/latest");if(200!==e.status)throw new Error("API Returned ".concat(e.status));const o=await e.json(),t=Object.keys(o.rates);return t.push(o.base),t.sort()}()).map(e=>g.find(o=>o.currencyCode===e))}function h(e,o){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);o&&(n=n.filter((function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable}))),t.push.apply(t,n)}return t}function C(e,o,t){return o in e?Object.defineProperty(e,o,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[o]=t,e}function v(e,o={}){const{inline:t="nearest",block:n="start",behavior:r="smooth"}=o;try{e.scrollIntoView({inline:t,block:n,behavior:r})}catch(o){const t=window.pageYOffset||document.scrollTop,n=()=>e.getBoundingClientRect().top+t,r=n()<t?-1:1,a=setInterval(()=>{const e=n();Math.abs(10<e)?window.scrollBy(0,10*r):clearInterval(a)},10)}}!async function(){"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").then(e=>console.log("registered",e)).catch(e=>console.error(e))}();const p=new r({formEl:document.querySelector("#exchange-form")});p.formEl.querySelector("#add-to-fav").addEventListener("click",(function(){const e=function(){const e="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";let o="";for(let t=0;8>t;t++){o+=e[Math.floor(Math.random()*e.length)]}return o}(),o={long:p.baseName,short:p.baseCurrSel.value},t={long:p.quoteName,short:p.quoteCurrSel.value},n=p.exRate.value,a=p.timeInput.value;let l=!1;if(u.forms.forEach(e=>{e.baseName===o.long&&e.quoteName===t.long&&(l=e)}),!l&&20>u.length){const l={id:e,base:o,quote:t,rate:n,time:a};u.unshift(l),u.save(),u.forms.unshift(new r(function(e){for(var o,t=1;t<arguments.length;t++)o=null==arguments[t]?{}:arguments[t],t%2?h(Object(o),!0).forEach((function(t){C(e,t,o[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(o)):h(Object(o)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(o,t))}));return e}({},l)))}else if(l){alert("This is already saved to favorites"),v(l.formEl)}else 20<=u.length&&alert("You can only save up to 20 favorites")})),document.querySelector("#favorites-grid").addEventListener("click",e=>{const o=e.target.closest("[delete-btn]");if(o)return function(e){const o=e.closest(".favorite-form-container"),t=o.getAttribute("favorite-id"),n=u.findIndex(e=>e.id===t);u.splice(n,1);const r=u.forms.findIndex(e=>e.id===t);u.forms.splice(r,1),s()&&localStorage.setItem("favorites",JSON.stringify(u)),o.classList.add("fade-away"),setTimeout(()=>o.remove(),300)}(o);const t=e.target.closest("[move-btn]");if(t)return function(e,o){y=o;const t=o.map(e=>'<div favorite-id="'.concat(e.id,'" class="move-item">').concat(e.base.short,"<br>").concat(e.quote.short,"</div>")).join("");m.innerHTML=t+'<button id="move-close" class="btn-primary move-close">Close</button>',m.querySelector("#move-close").addEventListener("click",d);const n=e.closest(".favorite-form-container").getAttribute("favorite-id");m.querySelector('[favorite-id="'.concat(n,'"]')).classList.add("selected"),m.classList.add("show"),m.addEventListener("touchstart",b)}(t,u);const n=e.target.closest("[use-btn]");return n?function(e){const o=e.closest(".favorite-form-container").getAttribute("favorite-id"),t=u.forms.findIndex(e=>e.id===o);["baseCurrSel","quoteCurrSel","baseInput","quoteInput","feeRate","exRate","timeInput"].forEach(e=>p[e].value=u.forms[t][e].value),p.convertCurrencies(),v(p.formEl)}(n):void 0});const N=document.querySelector("#switch-arrow"),S=document.querySelector(".currency-selectors");N.addEventListener("click",(function(){N.blur(),S.querySelectorAll(".select-container").forEach(e=>{e.style.animation="none",setTimeout(()=>e.style.animation="")}),S.classList.toggle("animate-switch");const e=p.baseCurrSel.value,o=p.quoteCurrSel.value;p.baseCurrSel.value=o,p.quoteCurrSel.value=e,p.convertCurrencies()})),async function(){const e=(await f()).map(({currencyCode:e,longName:o})=>'<option value="'.concat(e,'">').concat(o," (").concat(e,")</option>"));document.querySelectorAll(".currency-select").forEach((o,t)=>{o.innerHTML=e.join(""),o.value=0===t?"USD":"EUR"})}().then(()=>p.updateDisplay())}]);