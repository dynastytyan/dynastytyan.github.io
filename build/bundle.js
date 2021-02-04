var app=function(){"use strict";function e(){}function t(e,t){for(const n in t)e[n]=t[n];return e}function n(e){return e()}function i(){return Object.create(null)}function c(e){e.forEach(n)}function o(e){return"function"==typeof e}function r(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function s(e,t,n,i){if(e){const c=a(e,t,n,i);return e[0](c)}}function a(e,n,i,c){return e[1]&&c?t(i.ctx.slice(),e[1](c(n))):i.ctx}function l(e,t,n,i,c,o,r){const s=function(e,t,n,i){if(e[2]&&i){const c=e[2](i(n));if(void 0===t.dirty)return c;if("object"==typeof c){const e=[],n=Math.max(t.dirty.length,c.length);for(let i=0;i<n;i+=1)e[i]=t.dirty[i]|c[i];return e}return t.dirty|c}return t.dirty}(t,i,c,o);if(s){const c=a(t,n,i,r);e.p(c,s)}}function u(e){const t={};for(const n in e)"$"!==n[0]&&(t[n]=e[n]);return t}function d(e,t){e.appendChild(t)}function f(e,t,n){e.insertBefore(t,n||null)}function p(e){e.parentNode.removeChild(e)}function m(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}function $(e){return document.createElement(e)}function g(e){return document.createTextNode(e)}function v(){return g(" ")}function h(e,t,n,i){return e.addEventListener(t,n,i),()=>e.removeEventListener(t,n,i)}function y(e){return function(t){return t.preventDefault(),e.call(this,t)}}function w(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function b(e,t){const n=Object.getOwnPropertyDescriptors(e.__proto__);for(const i in t)null==t[i]?e.removeAttribute(i):"style"===i?e.style.cssText=t[i]:"__value"===i?e.value=e[i]=t[i]:n[i]&&n[i].set?e[i]=t[i]:w(e,i,t[i])}function k(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}function x(e,t){e.value=null==t?"":t}function _(e,t,n){e.classList[n?"add":"remove"](t)}let S;function E(e){S=e}function I(){if(!S)throw new Error("Function called outside component initialization");return S}function T(e){I().$$.on_mount.push(e)}function C(e){I().$$.on_destroy.push(e)}function U(){const e=I();return(t,n)=>{const i=e.$$.callbacks[t];if(i){const c=function(e,t){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,!1,t),n}(t,n);i.slice().forEach((t=>{t.call(e,c)}))}}}const V=[],D=[],O=[],M=[],j=Promise.resolve();let A=!1;function N(e){O.push(e)}let L=!1;const z=new Set;function P(){if(!L){L=!0;do{for(let e=0;e<V.length;e+=1){const t=V[e];E(t),R(t.$$)}for(E(null),V.length=0;D.length;)D.pop()();for(let e=0;e<O.length;e+=1){const t=O[e];z.has(t)||(z.add(t),t())}O.length=0}while(V.length);for(;M.length;)M.pop()();A=!1,L=!1,z.clear()}}function R(e){if(null!==e.fragment){e.update(),c(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(N)}}const Y=new Set;let q;function B(){q={r:0,c:[],p:q}}function H(){q.r||c(q.c),q=q.p}function J(e,t){e&&e.i&&(Y.delete(e),e.i(t))}function F(e,t,n,i){if(e&&e.o){if(Y.has(e))return;Y.add(e),q.c.push((()=>{Y.delete(e),i&&(n&&e.d(1),i())})),e.o(t)}}function W(e,t){const n={},i={},c={$$scope:1};let o=e.length;for(;o--;){const r=e[o],s=t[o];if(s){for(const e in r)e in s||(i[e]=1);for(const e in s)c[e]||(n[e]=s[e],c[e]=1);e[o]=s}else for(const e in r)c[e]=1}for(const e in i)e in n||(n[e]=void 0);return n}function Z(e){e&&e.c()}function G(e,t,i){const{fragment:r,on_mount:s,on_destroy:a,after_update:l}=e.$$;r&&r.m(t,i),N((()=>{const t=s.map(n).filter(o);a?a.push(...t):c(t),e.$$.on_mount=[]})),l.forEach(N)}function Q(e,t){const n=e.$$;null!==n.fragment&&(c(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function X(e,t){-1===e.$$.dirty[0]&&(V.push(e),A||(A=!0,j.then(P)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function K(t,n,o,r,s,a,l=[-1]){const u=S;E(t);const d=n.props||{},f=t.$$={fragment:null,ctx:null,props:a,update:e,not_equal:s,bound:i(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:i(),dirty:l,skip_bound:!1};let m=!1;if(f.ctx=o?o(t,d,((e,n,...i)=>{const c=i.length?i[0]:n;return f.ctx&&s(f.ctx[e],f.ctx[e]=c)&&(!f.skip_bound&&f.bound[e]&&f.bound[e](c),m&&X(t,e)),n})):[],f.update(),m=!0,c(f.before_update),f.fragment=!!r&&r(f.ctx),n.target){if(n.hydrate){const e=function(e){return Array.from(e.childNodes)}(n.target);f.fragment&&f.fragment.l(e),e.forEach(p)}else f.fragment&&f.fragment.c();n.intro&&J(t.$$.fragment),G(t,n.target,n.anchor),P()}E(u)}class ee{$destroy(){Q(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const te=[];function ne(t,n=e){let i;const c=[];function o(e){if(r(t,e)&&(t=e,i)){const e=!te.length;for(let e=0;e<c.length;e+=1){const n=c[e];n[1](),te.push(n,t)}if(e){for(let e=0;e<te.length;e+=2)te[e][0](te[e+1]);te.length=0}}}return{set:o,update:function(e){o(e(t))},subscribe:function(r,s=e){const a=[r,s];return c.push(a),1===c.length&&(i=n(o)||e),r(t),()=>{const e=c.indexOf(a);-1!==e&&c.splice(e,1),0===c.length&&(i(),i=null)}}}}const ie=ne(!1),ce=ne(),oe=ne("");function re(e){let t,n,i;const c=e[2].default,o=s(c,e,e[1],null);return{c(){t=$("div"),n=$("span"),o&&o.c(),w(t,"class","critical-toast svelte-13x9d4n"),_(t,"show",e[0])},m(e,c){f(e,t,c),d(t,n),o&&o.m(n,null),i=!0},p(e,[n]){o&&o.p&&2&n&&l(o,c,e,e[1],n,null,null),1&n&&_(t,"show",e[0])},i(e){i||(J(o,e),i=!0)},o(e){F(o,e),i=!1},d(e){e&&p(t),o&&o.d(e)}}}function se(e,t,n){let{$$slots:i={},$$scope:c}=t,{show:o=!1}=t;return e.$$set=e=>{"show"in e&&n(0,o=e.show),"$$scope"in e&&n(1,c=e.$$scope)},[o,c,i]}class ae extends ee{constructor(e){super(),K(this,e,se,re,r,{show:0})}}function le(e,t,n){const i=e.slice();return i[3]=t[n],i}function ue(e){let t,n=e[3].text+"";return{c(){t=g(n)},m(e,n){f(e,t,n)},p(e,i){1&i&&n!==(n=e[3].text+"")&&k(t,n)},d(e){e&&p(t)}}}function de(e){let t,n;return t=new ae({props:{show:"visible"===e[3].status,$$slots:{default:[ue]},$$scope:{ctx:e}}}),{c(){Z(t.$$.fragment)},m(e,i){G(t,e,i),n=!0},p(e,n){const i={};1&n&&(i.show="visible"===e[3].status),65&n&&(i.$$scope={dirty:n,ctx:e}),t.$set(i)},i(e){n||(J(t.$$.fragment,e),n=!0)},o(e){F(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}function fe(e){let t,n,i=e[0],c=[];for(let t=0;t<i.length;t+=1)c[t]=de(le(e,i,t));const o=e=>F(c[e],1,1,(()=>{c[e]=null}));return{c(){t=$("div");for(let e=0;e<c.length;e+=1)c[e].c();w(t,"class","critical-container svelte-vvip71")},m(e,i){f(e,t,i);for(let e=0;e<c.length;e+=1)c[e].m(t,null);n=!0},p(e,[n]){if(1&n){let r;for(i=e[0],r=0;r<i.length;r+=1){const o=le(e,i,r);c[r]?(c[r].p(o,n),J(c[r],1)):(c[r]=de(o),c[r].c(),J(c[r],1),c[r].m(t,null))}for(B(),r=i.length;r<c.length;r+=1)o(r);H()}},i(e){if(!n){for(let e=0;e<i.length;e+=1)J(c[e]);n=!0}},o(e){c=c.filter(Boolean);for(let e=0;e<c.length;e+=1)F(c[e]);n=!1},d(e){e&&p(t),m(c,e)}}}function pe(e,t,n){let i=[];const c=()=>{i.shift(),n(0,i)};return oe.subscribe((e=>{e&&(n(0,i=[...i,{text:e,status:"visible"}]),setTimeout((()=>{n(0,i=i.map((t=>t.text===e?{text:e,status:"hidden"}:t)))}),3500),setTimeout((()=>{c(),oe.set("")}),4e3))})),[i]}class me extends ee{constructor(e){super(),K(this,e,pe,fe,r,{})}}function $e(e){let n,i,c,o;const r=e[4].default,a=s(r,e,e[3],null);let u=[e[2],{type:e[0]}],d={};for(let e=0;e<u.length;e+=1)d=t(d,u[e]);return{c(){n=$("button"),a&&a.c(),b(n,d),_(n,"svelte-fp4ngz",!0)},m(t,r){f(t,n,r),a&&a.m(n,null),i=!0,c||(o=h(n,"click",e[1]),c=!0)},p(e,[t]){a&&a.p&&8&t&&l(a,r,e,e[3],t,null,null),b(n,d=W(u,[4&t&&e[2],(!i||1&t)&&{type:e[0]}])),_(n,"svelte-fp4ngz",!0)},i(e){i||(J(a,e),i=!0)},o(e){F(a,e),i=!1},d(e){e&&p(n),a&&a.d(e),c=!1,o()}}}function ge(e,n,i){let{$$slots:c={},$$scope:o}=n,{type:r="button"}=n;const s=U();return e.$$set=e=>{i(2,n=t(t({},n),u(e))),"type"in e&&i(0,r=e.type),"$$scope"in e&&i(3,o=e.$$scope)},n=u(n),[r,function(){s("onClick")},n,o,c]}class ve extends ee{constructor(e){super(),K(this,e,ge,$e,r,{type:0})}}const he=e=>{switch(e){case"NotFoundError":case"DevicesNotFoundError":return"Target media device is not found or it is unplugged.";case"NotReadableError":case"TrackStartError":return"Your camera may be used by another app.";case"NotAllowedError":case"PermissionDeniedError":return"Your browser denies capturing video from your camera.";case"OverconstrainedError":case"ConstraintNotSatisfiedError":return"Something went wrong with constraints.";default:return"Something went wrong."}};function ye(n){let i,c,o,r,s=[n[0],{class:"lds-ripple"}],a={};for(let e=0;e<s.length;e+=1)a=t(a,s[e]);return{c(){i=$("div"),c=$("div"),o=v(),r=$("div"),w(c,"class","svelte-1qnhu31"),w(r,"class","svelte-1qnhu31"),b(i,a),_(i,"svelte-1qnhu31",!0)},m(e,t){f(e,i,t),d(i,c),d(i,o),d(i,r)},p(e,[t]){b(i,a=W(s,[1&t&&e[0],{class:"lds-ripple"}])),_(i,"svelte-1qnhu31",!0)},i:e,o:e,d(e){e&&p(i)}}}function we(e,n,i){return e.$$set=e=>{i(0,n=t(t({},n),u(e)))},[n=u(n)]}class be extends ee{constructor(e){super(),K(this,e,we,ye,r,{})}}const ke=()=>window.innerWidth<600,xe=(e={video:!0,audio:!0})=>navigator.mediaDevices.getUserMedia(e),_e=(e,t)=>{const n=e=>!e||{deviceId:{exact:e.deviceId}};return{video:n(e),audio:n(t)}},Se=(e,t)=>e.filter((e=>e.kind===t)),Ee=e=>{localStorage.setItem("__devices_token",JSON.stringify(e))},Ie=()=>{const e=localStorage.getItem("__devices_token");return JSON.parse(e)};function Te(e,t,n){const i=e.slice();return i[7]=t[n],i}function Ce(e){let t,n,i,c,o,r,s,a=e[0],l=[];for(let t=0;t<a.length;t+=1)l[t]=Ue(Te(e,a,t));return{c(){t=$("div"),n=$("h4"),i=g(e[1]),c=v(),o=$("select");for(let e=0;e<l.length;e+=1)l[e].c();w(o,"class","svelte-n5zgal"),w(t,"class","svelte-n5zgal")},m(a,u){f(a,t,u),d(t,n),d(n,i),d(t,c),d(t,o);for(let e=0;e<l.length;e+=1)l[e].m(o,null);r||(s=h(o,"change",e[5]),r=!0)},p(e,t){if(2&t&&k(i,e[1]),29&t){let n;for(a=e[0],n=0;n<a.length;n+=1){const i=Te(e,a,n);l[n]?l[n].p(i,t):(l[n]=Ue(i),l[n].c(),l[n].m(o,null))}for(;n<l.length;n+=1)l[n].d(1);l.length=a.length}},d(e){e&&p(t),m(l,e),r=!1,s()}}}function Ue(e){let t,n,i,c,o=e[7][e[3]]+"";return{c(){t=$("option"),n=g(o),t.selected=i=e[7][e[2]]===e[4],t.__value=c=e[7][e[2]],t.value=t.__value},m(e,i){f(e,t,i),d(t,n)},p(e,r){9&r&&o!==(o=e[7][e[3]]+"")&&k(n,o),21&r&&i!==(i=e[7][e[2]]===e[4])&&(t.selected=i),5&r&&c!==(c=e[7][e[2]])&&(t.__value=c,t.value=t.__value)},d(e){e&&p(t)}}}function Ve(t){let n,i=t[0].length>0&&Ce(t);return{c(){i&&i.c(),n=g("")},m(e,t){i&&i.m(e,t),f(e,n,t)},p(e,[t]){e[0].length>0?i?i.p(e,t):(i=Ce(e),i.c(),i.m(n.parentNode,n)):i&&(i.d(1),i=null)},i:e,o:e,d(e){i&&i.d(e),e&&p(n)}}}function De(e,t,n){const i=U();let{items:c=[]}=t,{title:o="<label of select>"}=t,{key:r}=t,{value:s}=t,{defaultValue:a}=t;return e.$$set=e=>{"items"in e&&n(0,c=e.items),"title"in e&&n(1,o=e.title),"key"in e&&n(2,r=e.key),"value"in e&&n(3,s=e.value),"defaultValue"in e&&n(4,a=e.defaultValue)},[c,o,r,s,a,function(e){i("onSelect",e.target.value)}]}class Oe extends ee{constructor(e){super(),K(this,e,De,Ve,r,{items:0,title:1,key:2,value:3,defaultValue:4})}}function Me(e){let t,n,i;return n=new be({}),{c(){t=$("div"),Z(n.$$.fragment),w(t,"class","spinner-wrap svelte-14miyum")},m(e,c){f(e,t,c),G(n,t,null),i=!0},i(e){i||(J(n.$$.fragment,e),i=!0)},o(e){F(n.$$.fragment,e),i=!1},d(e){e&&p(t),Q(n)}}}function je(e){let t;return{c(){t=g("Save")},m(e,n){f(e,t,n)},d(e){e&&p(t)}}}function Ae(e){let t,n,i,c,o,r,s,a,l,u,m,g,h=!ke(),y=!e[0]&&Me();r=new Oe({props:{defaultValue:e[4]?.deviceId,key:"deviceId",value:"label",title:"Default camera",items:Ne(e[1])}}),r.$on("onSelect",e[7]),a=new Oe({props:{defaultValue:e[5]?.deviceId,key:"deviceId",value:"label",title:"Default microphone",items:Ne(e[2])}}),a.$on("onSelect",e[8]);let b=h&&function(e){let t,n;return t=new Oe({props:{defaultValue:e[6]?.deviceId,key:"deviceId",value:"label",title:"Default speaker",items:Ne(e[3])}}),t.$on("onSelect",e[9]),{c(){Z(t.$$.fragment)},m(e,i){G(t,e,i),n=!0},p(e,n){const i={};64&n&&(i.defaultValue=e[6]?.deviceId),8&n&&(i.items=Ne(e[3])),t.$set(i)},i(e){n||(J(t.$$.fragment,e),n=!0)},o(e){F(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}(e);return m=new ve({props:{$$slots:{default:[je]},$$scope:{ctx:e}}}),m.$on("onClick",e[10]),{c(){t=$("div"),n=$("div"),y&&y.c(),i=v(),c=$("div"),c.innerHTML='<video playsinline="" autoplay="" muted="" id="video" class="svelte-14miyum"></video>',o=v(),Z(r.$$.fragment),s=v(),Z(a.$$.fragment),l=v(),b&&b.c(),u=v(),Z(m.$$.fragment),w(c,"class","video-container svelte-14miyum"),w(n,"class","main-modal svelte-14miyum"),w(t,"class","main-modal-wrap svelte-14miyum")},m(e,p){f(e,t,p),d(t,n),y&&y.m(n,null),d(n,i),d(n,c),d(n,o),G(r,n,null),d(n,s),G(a,n,null),d(n,l),b&&b.m(n,null),d(n,u),G(m,n,null),g=!0},p(e,[t]){e[0]?y&&(B(),F(y,1,1,(()=>{y=null})),H()):y?1&t&&J(y,1):(y=Me(),y.c(),J(y,1),y.m(n,i));const c={};16&t&&(c.defaultValue=e[4]?.deviceId),2&t&&(c.items=Ne(e[1])),r.$set(c);const o={};32&t&&(o.defaultValue=e[5]?.deviceId),4&t&&(o.items=Ne(e[2])),a.$set(o),h&&b.p(e,t);const s={};536870912&t&&(s.$$scope={dirty:t,ctx:e}),m.$set(s)},i(e){g||(J(y),J(r.$$.fragment,e),J(a.$$.fragment,e),J(b),J(m.$$.fragment,e),g=!0)},o(e){F(y),F(r.$$.fragment,e),F(a.$$.fragment,e),F(b),F(m.$$.fragment,e),g=!1},d(e){e&&p(t),y&&y.d(),Q(r),Q(a),b&&b.d(),Q(m)}}}function Ne(e){return e.filter((e=>!["default","communications"].includes(e.deviceId)))}function Le(e,t,n){let i,c,o,r,s=[],a=[],l=[];T((async()=>{try{const e=Ie();e&&(n(4,c=e.selectedCamera),n(5,o=e.selectedMicrophone),n(6,r=e.selectedSpeaker)),p(),m(),await $(),await g(),v()}catch(e){if(["OverconstrainedError","ConstraintNotSatisfiedError"].includes(e.name))return u(),void oe.update((e=>"Unable to fetch stream from previously selected devices. They might be unplugged"));const t=he(e.name);oe.update((e=>t)),ie.update((e=>!1))}}));const u=async()=>{n(4,c=null),n(5,o=null),await $(),await g(),v(),Ee({selectedCamera:c,selectedMicrophone:o,selectedSpeaker:r})},d=e=>{"Escape"===e.key&&ie.update((e=>!1))},f=e=>{const t=document.querySelector(".main-modal-wrap");e.target.contains(t)&&ie.update((e=>!1))},p=()=>{window.addEventListener("keydown",d)},m=()=>{window.addEventListener("click",f)},$=async()=>{const e=document.getElementById("video"),t=_e(c,o);n(0,i=await xe(t)),e.srcObject=i},g=async()=>{const[e,t,i]=await(async()=>{const e=await navigator.mediaDevices.enumerateDevices();return[Se(e,"videoinput"),Se(e,"audioinput"),Se(e,"audiooutput")]})();n(1,s=e),n(2,a=t),n(3,l=i)},v=()=>{n(4,c=h()),n(5,o=y()),n(6,r=w(l))},h=()=>b(s),y=()=>b(a),w=e=>{if(Ie())return r;const[t]=Ne(e);return t||e[0]},b=e=>{const t=k(),n=e.find((e=>t.includes(e.label)))?.groupId;return Ne(e).find((e=>e.groupId===n))},k=()=>i.getTracks().map((e=>e.label)),x=(e,t)=>{const[n]=_(e,"deviceId",t);return n},_=(e,t,n)=>e.filter((e=>e[t]===n)),S=()=>{i&&i.getTracks().map((e=>e.stop())),n(0,i=null),video.srcObject=null};return C((()=>{S(),window.removeEventListener("keydown",d),window.removeEventListener("click",f)})),[i,s,a,l,c,o,r,async function({detail:e}){try{const t=e;n(4,c=x(Ne(s),t)),S(),n(0,i=await xe(_e(c,o))),video.srcObject=i}catch(e){const t=he(e.name);oe.update((e=>t)),ie.update((e=>!1))}},function({detail:e}){const t=e;n(5,o=x(Ne(a),t))},function({detail:e}){const t=e;n(6,r=x(Ne(l),t))},function(){Ee({selectedCamera:c,selectedMicrophone:o,selectedSpeaker:r}),ie.update((e=>!1))}]}class ze extends ee{constructor(e){super(),K(this,e,Le,Ae,r,{})}}const Pe=io("https://calling-daniel-application.herokuapp.com/"),Re=(e,t)=>{Pe.on(e,t)},Ye=e=>{Pe.off(e)},qe=(e,t)=>{Pe.emit(e,t)};function Be(e){let t,n;const i=e[1].default,c=s(i,e,e[0],null);return{c(){t=$("span"),c&&c.c(),w(t,"role","img")},m(e,i){f(e,t,i),c&&c.m(t,null),n=!0},p(e,[t]){c&&c.p&&1&t&&l(c,i,e,e[0],t,null,null)},i(e){n||(J(c,e),n=!0)},o(e){F(c,e),n=!1},d(e){e&&p(t),c&&c.d(e)}}}function He(e,t,n){let{$$slots:i={},$$scope:c}=t;return e.$$set=e=>{"$$scope"in e&&n(0,c=e.$$scope)},[c,i]}class Je extends ee{constructor(e){super(),K(this,e,He,Be,r,{})}}function Fe(t){let n;return{c(){n=$("div"),n.innerHTML='<span class="svelte-5vsjiz">☞☚</span>',w(n,"class","split svelte-5vsjiz")},m(e,t){f(e,n,t)},p:e,i:e,o:e,d(e){e&&p(n)}}}class We extends ee{constructor(e){super(),K(this,e,null,Fe,r,{})}}function Ze(t){let n,i,o,r,s,a,l,u,m,y,b,x,_,S;return{c(){n=$("div"),i=$("div"),o=$("h3"),r=$("b"),s=g(t[0]),a=g(" is calling you"),l=v(),u=$("div"),m=$("button"),m.innerHTML='<i class="fas fa-phone-volume"></i>',y=v(),b=$("div"),x=$("button"),x.innerHTML='<i class="fas fa-phone"></i>',w(o,"class","username-label svelte-5nlicx"),w(m,"class","svelte-5nlicx"),w(u,"class","accept-call-container svelte-5nlicx"),w(x,"class","svelte-5nlicx"),w(b,"class","drop-call-container svelte-5nlicx"),w(i,"class","incoming svelte-5nlicx"),w(n,"class","incoming-wrap svelte-5nlicx")},m(e,c){f(e,n,c),d(n,i),d(i,o),d(o,r),d(r,s),d(o,a),d(i,l),d(i,u),d(u,m),d(i,y),d(i,b),d(b,x),_||(S=[h(m,"click",t[1]),h(x,"click",t[2])],_=!0)},p(e,[t]){1&t&&k(s,e[0])},i:e,o:e,d(e){e&&p(n),_=!1,c(S)}}}function Ge(e,t,n){const i=U();let{username:c}=t;return e.$$set=e=>{"username"in e&&n(0,c=e.username)},[c,function(){i("onAccept")},function(){i("onDrop")}]}class Qe extends ee{constructor(e){super(),K(this,e,Ge,Ze,r,{username:0})}}const Xe=(...e)=>t=>e.reduce(((e,t)=>t(e)),t),Ke=Xe((e=>(console.log(`%c👉👈 (webrtc) ${e}`,"color: #2dd713; font-weight: bold; font-size: 0.9rem; "),e))),et=Xe((e=>(console.log(`%c❌❌ (webrtc) ${e}`,"color: tomato; font-weight: bold; font-size: 0.9rem; "),e))),tt=[{urls:"stun:stun.voipstunt.com"},{urls:"turn:numb.viagenie.ca",credential:"muazkh",username:"webrtc@live.com"},{urls:"turn:192.158.29.39:3478?transport=udp",credential:"JZEOEt2V3Qb0y27GRntt2u2PAYA=",username:"28224511:1379330808"}],nt=e=>{switch(e){case"video-call":return{offer:"video-offer",answer:"video-answer",iceCandidate:"ice-candidate"};case"screenshare":return{offer:"video-screen-sharing-offer",answer:"video-screen-sharing-answer",iceCandidate:"ice-screen-sharing-candidate"};default:return{}}},it=e=>{e&&(e.getTracks().map((e=>e.stop())),e=null)},ct=(e,t)=>{const n=document.getElementById(e);n&&t&&(n.srcObject=t)},ot=()=>new RTCPeerConnection({iceServers:tt}),rt=(e,t)=>{t.getTracks().forEach((n=>{e.addTrack(n,t)}))},st=e=>{e&&(e.ontrack=null,e.onremovetrack=null,e.onremovestream=null,e.onicecandidate=null,e.oniceconnectionstatechange=null,e.onsignalingstatechange=null,e.onicegatheringstatechange=null,e.onnegotiationneeded=null,e.close(),e=null)};function at(e){let t,n;return t=new be({props:{style:"position: absolute"}}),{c(){Z(t.$$.fragment)},m(e,i){G(t,e,i),n=!0},i(e){n||(J(t.$$.fragment,e),n=!0)},o(e){F(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}function lt(e){let t,n,i,o,r,s,a,l,u,m,y,b,x,S,E,I,T,C,U,V,D,O,M,j,A,N,L,z,P,R,Y,q,W,Z,G,Q=!e[3]&&at();return{c(){t=$("div"),n=$("div"),i=$("div"),o=$("video"),s=v(),a=$("video"),l=v(),Q&&Q.c(),u=v(),m=$("div"),m.innerHTML='<video playsinline="" id="participantPrimaryVideo" autoplay="" class="svelte-cm9yfc"></video>',y=v(),b=$("div"),x=$("div"),S=$("button"),E=$("span"),I=g(e[4]),T=v(),C=$("i"),U=v(),V=$("button"),V.innerHTML='<span class="tooltip svelte-cm9yfc">End Call</span> \n          <i class="fas fa-phone svelte-cm9yfc"></i>',D=v(),O=$("button"),M=$("span"),j=g(e[5]),A=v(),N=$("i"),L=v(),z=$("button"),P=$("span"),R=g(e[6]),Y=v(),q=$("i"),o.playsInline=!0,w(o,"id","yourVideo"),o.autoplay=!0,o.muted=r=!0,w(o,"class","svelte-cm9yfc"),_(o,"shadow",e[3]),a.playsInline=!0,w(a,"id","participantSecondaryVideo"),a.autoplay=!0,w(a,"class","svelte-cm9yfc"),w(i,"class","yourVideo-container svelte-cm9yfc"),_(i,"hidden",e[2]),w(m,"class","participant-video-container svelte-cm9yfc"),w(E,"class","tooltip svelte-cm9yfc"),w(C,"class","fas fa-video"),w(S,"class","action-button action-button__video svelte-cm9yfc"),_(S,"mute",e[2]),w(V,"class","action-button action-button__end-call svelte-cm9yfc"),w(M,"class","tooltip svelte-cm9yfc"),w(N,"class","fas fa-microphone-alt"),w(O,"class","action-button action-button__audio svelte-cm9yfc"),_(O,"mute",e[1]),w(P,"class","tooltip svelte-cm9yfc"),w(q,"class","fas fa-desktop"),w(z,"class","action-button action-button__sharing svelte-cm9yfc"),_(z,"sharing",e[0]),w(x,"class","call-menu-actions svelte-cm9yfc"),w(b,"class","call-menu svelte-cm9yfc"),w(n,"class","incoming svelte-cm9yfc"),w(t,"class","incoming-wrap svelte-cm9yfc")},m(c,r){f(c,t,r),d(t,n),d(n,i),d(i,o),d(i,s),d(i,a),d(i,l),Q&&Q.m(i,null),d(n,u),d(n,m),d(n,y),d(n,b),d(b,x),d(x,S),d(S,E),d(E,I),d(S,T),d(S,C),d(x,U),d(x,V),d(x,D),d(x,O),d(O,M),d(M,j),d(O,A),d(O,N),d(x,L),d(x,z),d(z,P),d(P,R),d(z,Y),d(z,q),W=!0,Z||(G=[h(S,"click",e[7]),h(V,"click",ut),h(O,"click",e[9]),h(z,"click",e[8])],Z=!0)},p(e,t){8&t[0]&&_(o,"shadow",e[3]),e[3]?Q&&(B(),F(Q,1,1,(()=>{Q=null})),H()):Q?8&t[0]&&J(Q,1):(Q=at(),Q.c(),J(Q,1),Q.m(i,null)),4&t[0]&&_(i,"hidden",e[2]),(!W||16&t[0])&&k(I,e[4]),4&t[0]&&_(S,"mute",e[2]),(!W||32&t[0])&&k(j,e[5]),2&t[0]&&_(O,"mute",e[1]),(!W||64&t[0])&&k(R,e[6]),1&t[0]&&_(z,"sharing",e[0])},i(e){W||(J(Q),W=!0)},o(e){F(Q),W=!1},d(e){e&&p(t),Q&&Q.d(),Z=!1,c(G)}}}function ut(){}function dt(e,t,n){let i,c,o,r,s,a,{uid:l}=t,{participantUid:u}=t,{username:d}=t,{initiator:f}=t,p=!1,m=!1,$=!1;const g=new Map,v=async(e,t="video-call")=>{const{offer:n,answer:i}=nt(t);e.onnegotiationneeded=async()=>{e.createOffer().then((t=>e.setLocalDescription(t))).then((()=>{a=setInterval((()=>{qe(n,{initiatorUid:l,targetUid:u,sdp:e.localDescription}),Ke(`${n} sent to another peer`)}),1e3)})).catch(y)},Re(i,(function(n){Ke(`got ${i} from another peer`),clearInterval(a),e.setRemoteDescription(new RTCSessionDescription(n.sdp)),b(e,t),Ye(i)}))},h=(e,t="video-call")=>{const{offer:n,answer:i}=nt(t);Re(n,(async c=>{Ke("received offer from another peer"),e.setRemoteDescription(new RTCSessionDescription(c.sdp)).then((()=>e.createAnswer())).then((t=>e.setLocalDescription(t))).then((()=>{qe(i,{initiatorUid:l,targetUid:u,sdp:e.localDescription})})).catch(y),b(e,t),Ye(n)}))},y=e=>{et("Something went wrong during webrtc handshaking."),oe.update((e=>"Something went wrong during the handshaking.")),oe.update((e=>"Reload the page and try again.")),clearInterval(a),console.error(e)},w=e=>e.values().next(),b=(e,t)=>{const{iceCandidate:n}=nt(t);e.ontrack=e=>{var t;t=e.streams[0],g.has(t.id)||(g.set(t.id,t),1===g.size?ct("participantPrimaryVideo",t):2===g.size&&(ct("participantSecondaryVideo",w(g).value),ct("participantPrimaryVideo",t))),Ke("tracks came from another peer")},e.onicecandidate=e=>{e.candidate&&qe(n,{initiatorUid:l,targetUid:u,candidate:e.candidate})},Re(n,(t=>{t.candidate&&(Ke(`${n} - received`),e.addIceCandidate(new RTCIceCandidate(t.candidate)))}))},k=async()=>xe(_e(i?.selectedCamera,i?.selectedMicrophone)),x=e=>{Object.values(nt(e)).map((e=>{Ye(e)}))},_=async()=>{o=await navigator.mediaDevices.getDisplayMedia({audio:!0,video:!0}),s=ot(),qe("start-screen-sharing",{initiatorUid:l,targetUid:u,sdp:s.localDescription}),rt(s,o),v(s,"screenshare"),o.getVideoTracks()[0].onended=S,n(0,p=!0)},S=()=>{n(0,p=!1),qe("stop-screen-sharing",{initiatorUid:l,targetUid:u,streamId:o.id}),st(s),x("screenshare"),it(o),o=null};let E,I,U;return T((async()=>{try{i=Ie(),n(3,c=await k()),ct("yourVideo",c),(async(e,t)=>{try{if(!e||!t)return;const n=document.getElementById(e);n&&t.deviceId&&!ke()&&await n.setSinkId(t.deviceId)}catch(e){const t=he(e.name);oe.update((e=>t)),oe.update((e=>"Cannot play audio on the selected speaker. Default speaker is used.")),Ee({selectedCamera:i?.selectedCamera,selectedMicrophone:i?.selectedMicrophone})}})("participantVideo",i?.selectedSpeaker),r=ot(),rt(r,c),f?v(r,"video-call"):h(r,"video-call"),Re("participant-starts-screen-sharing",(()=>{s=ot(),h(s,"screenshare")})),Re("participant-stops-screen-sharing",(({streamId:e})=>{st(s),x("screenshare"),it(g.get(e)),g.delete(e),(e=>{const t=document.getElementById(e);t.srcObject=null,t.removeAttribute("srcObject")})("participantSecondaryVideo"),ct("participantPrimaryVideo",w(g).value)}))}catch(e){const t=he(e.name);oe.update((e=>t)),clearInterval(a)}})),C((()=>{it(c),it(o)})),e.$$set=e=>{"uid"in e&&n(10,l=e.uid),"participantUid"in e&&n(11,u=e.participantUid),"username"in e&&n(12,d=e.username),"initiator"in e&&n(13,f=e.initiator)},e.$$.update=()=>{4&e.$$.dirty[0]&&n(4,E=$?"Unmute Video":"Mute Video"),2&e.$$.dirty[0]&&n(5,I=m?"Unmute Audio":"Mute Audio"),1&e.$$.dirty[0]&&n(6,U=p?"Stop Sharing Screen":"Share Screen")},[p,m,$,c,E,I,U,async function(){if(n(2,$=!$),$)c.getVideoTracks()[0].enabled=!1,setTimeout((()=>{c.getVideoTracks()[0].stop(),c.removeTrack(c.getVideoTracks()[0])}),150);else{const e=await k(),t=((e,t,n)=>{const i=t.getTracks().find((e=>e.kind===n));return e.getSenders().find((e=>e.track.kind===n)).replaceTrack(i),i})(r,e,"video");c.addTrack(t),ct("yourVideo",c)}},async function(){try{p?S():_()}catch(e){if("NotAllowedError"===e.name)return oe.update((e=>"You've canceled sharing screen"));oe.update((e=>"Something went wrong during a screen sharing. Your browser may not support this feature ;(")),console.error(e)}},function(){n(1,m=!m),c.getAudioTracks()[0].enabled=!c.getAudioTracks()[0].enabled},l,u,d,f]}class ft extends ee{constructor(e){super(),K(this,e,dt,lt,r,{uid:10,participantUid:11,username:12,initiator:13},[-1,-1])}}function pt(e){let t;return{c(){t=g("🤙")},m(e,n){f(e,t,n)},d(e){e&&p(t)}}}function mt(e){let t,n,i,o,r,s,a,l,u,m,b,_,S,E,I,T,C,U,V,D,O,M;return _=new We({}),V=new ve({props:{type:"submit",disabled:e[10],$$slots:{default:[gt]},$$scope:{ctx:e}}}),{c(){t=$("div"),n=$("h2"),n.textContent="Your identifier is",i=v(),o=$("h3"),r=g(e[3]),s=v(),a=$("span"),l=g(e[4]),u=v(),m=$("h3"),m.textContent="Send it to the one who wanna call you and you will get in touch",b=v(),Z(_.$$.fragment),S=v(),E=$("h3"),E.textContent="or enter identifier shared with you below",I=v(),T=$("form"),C=$("input"),U=v(),Z(V.$$.fragment),w(a,"class","svelte-1r6i828"),w(o,"class","uid-label svelte-1r6i828"),w(C,"type","text"),w(C,"id","name-input"),w(C,"placeholder","XYZZ"),w(C,"class","svelte-1r6i828"),w(t,"class","uid-block svelte-1r6i828")},m(c,p){f(c,t,p),d(t,n),d(t,i),d(t,o),d(o,r),d(o,s),d(o,a),d(a,l),d(t,u),d(t,m),d(t,b),G(_,t,null),d(t,S),d(t,E),d(t,I),d(t,T),d(T,C),x(C,e[0]),d(T,U),G(V,T,null),D=!0,O||(M=[h(a,"click",e[14]),h(C,"input",e[18]),h(T,"submit",y(e[13]))],O=!0)},p(e,t){(!D||8&t)&&k(r,e[3]),(!D||16&t)&&k(l,e[4]),1&t&&C.value!==e[0]&&x(C,e[0]);const n={};1024&t&&(n.disabled=e[10]),2097152&t&&(n.$$scope={dirty:t,ctx:e}),V.$set(n)},i(e){D||(J(_.$$.fragment,e),J(V.$$.fragment,e),D=!0)},o(e){F(_.$$.fragment,e),F(V.$$.fragment,e),D=!1},d(e){e&&p(t),Q(_),Q(V),O=!1,c(M)}}}function $t(e){let t,n,i,o,r,s,a,l,u,m;return a=new ve({props:{type:"submit",disabled:!e[2],$$slots:{default:[vt]},$$scope:{ctx:e}}}),{c(){var e,c,l;t=$("div"),n=$("h2"),n.textContent="Who are you?",i=v(),o=$("form"),r=$("input"),s=v(),Z(a.$$.fragment),e="margin",c="20px",n.style.setProperty(e,c,l?"important":""),w(r,"type","text"),w(r,"id","name-input"),w(r,"placeholder","What is your name, hero?"),w(r,"class","svelte-1r6i828"),w(t,"class","join-form svelte-1r6i828")},m(c,p){f(c,t,p),d(t,n),d(t,i),d(t,o),d(o,r),x(r,e[2]),d(o,s),G(a,o,null),l=!0,u||(m=[h(r,"input",e[17]),h(o,"submit",y(e[12]))],u=!0)},p(e,t){4&t&&r.value!==e[2]&&x(r,e[2]);const n={};4&t&&(n.disabled=!e[2]),2097152&t&&(n.$$scope={dirty:t,ctx:e}),a.$set(n)},i(e){l||(J(a.$$.fragment,e),l=!0)},o(e){F(a.$$.fragment,e),l=!1},d(e){e&&p(t),Q(a),u=!1,c(m)}}}function gt(e){let t;return{c(){t=g("Call")},m(e,n){f(e,t,n)},d(e){e&&p(t)}}}function vt(e){let t;return{c(){t=g("Join")},m(e,n){f(e,t,n)},d(e){e&&p(t)}}}function ht(e){let t,n,i;function c(e,t){return e[1]?wt:yt}let o=c(e),r=o(e);return{c(){t=$("span"),r.c(),w(t,"class","open-settings-btn svelte-1r6i828")},m(c,o){f(c,t,o),r.m(t,null),n||(i=h(t,"click",e[11]),n=!0)},p(e,n){o!==(o=c(e))&&(r.d(1),r=o(e),r&&(r.c(),r.m(t,null)))},d(e){e&&p(t),r.d(),n=!1,i()}}}function yt(e){let t;return{c(){t=$("i"),w(t,"class","fas fa-cog")},m(e,n){f(e,t,n)},d(e){e&&p(t)}}}function wt(e){let t;return{c(){t=$("i"),w(t,"class","fas fa-times")},m(e,n){f(e,t,n)},d(e){e&&p(t)}}}function bt(e){let t,n;return t=new ft({props:{initiator:e[7],uid:e[3],participantUid:e[9].initiatorUid,username:e[9].username}}),{c(){Z(t.$$.fragment)},m(e,i){G(t,e,i),n=!0},p(e,n){const i={};128&n&&(i.initiator=e[7]),8&n&&(i.uid=e[3]),512&n&&(i.participantUid=e[9].initiatorUid),512&n&&(i.username=e[9].username),t.$set(i)},i(e){n||(J(t.$$.fragment,e),n=!0)},o(e){F(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}function kt(e){let t,n;return t=new ze({}),{c(){Z(t.$$.fragment)},m(e,i){G(t,e,i),n=!0},i(e){n||(J(t.$$.fragment,e),n=!0)},o(e){F(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}function xt(e){let t,n;return t=new Qe({props:{username:e[9].username}}),t.$on("onAccept",e[15]),t.$on("onDrop",e[16]),{c(){Z(t.$$.fragment)},m(e,i){G(t,e,i),n=!0},p(e,n){const i={};512&n&&(i.username=e[9].username),t.$set(i)},i(e){n||(J(t.$$.fragment,e),n=!0)},o(e){F(t.$$.fragment,e),n=!1},d(e){Q(t,e)}}}function _t(e){let t,n,i,c,o,r,s,a,l,u,m,h,y,b,k,x,_;c=new Je({props:{$$slots:{default:[pt]},$$scope:{ctx:e}}}),s=new We({});const S=[$t,mt],E=[];function I(e,t){return e[5]?1:0}l=I(e),u=E[l]=S[l](e);let T=!e[6]&&ht(e),C=e[6]&&bt(e),U=e[1]&&kt(),V=e[8]&&xt(e);return x=new me({}),{c(){t=$("main"),n=$("h1"),i=g("So\r\n    "),Z(c.$$.fragment),o=g("\r\n    me maybe!"),r=v(),Z(s.$$.fragment),a=v(),u.c(),m=v(),T&&T.c(),h=v(),C&&C.c(),y=v(),U&&U.c(),b=v(),V&&V.c(),k=v(),Z(x.$$.fragment),w(n,"class","svelte-1r6i828"),w(t,"class","svelte-1r6i828")},m(e,u){f(e,t,u),d(t,n),d(n,i),G(c,n,null),d(n,o),d(t,r),G(s,t,null),d(t,a),E[l].m(t,null),d(t,m),T&&T.m(t,null),d(t,h),C&&C.m(t,null),f(e,y,u),U&&U.m(e,u),f(e,b,u),V&&V.m(e,u),f(e,k,u),G(x,e,u),_=!0},p(e,[n]){const i={};2097152&n&&(i.$$scope={dirty:n,ctx:e}),c.$set(i);let o=l;l=I(e),l===o?E[l].p(e,n):(B(),F(E[o],1,1,(()=>{E[o]=null})),H(),u=E[l],u?u.p(e,n):(u=E[l]=S[l](e),u.c()),J(u,1),u.m(t,m)),e[6]?T&&(T.d(1),T=null):T?T.p(e,n):(T=ht(e),T.c(),T.m(t,h)),e[6]?C?(C.p(e,n),64&n&&J(C,1)):(C=bt(e),C.c(),J(C,1),C.m(t,null)):C&&(B(),F(C,1,1,(()=>{C=null})),H()),e[1]?U?2&n&&J(U,1):(U=kt(),U.c(),J(U,1),U.m(b.parentNode,b)):U&&(B(),F(U,1,1,(()=>{U=null})),H()),e[8]?V?(V.p(e,n),256&n&&J(V,1)):(V=xt(e),V.c(),J(V,1),V.m(k.parentNode,k)):V&&(B(),F(V,1,1,(()=>{V=null})),H())},i(e){_||(J(c.$$.fragment,e),J(s.$$.fragment,e),J(u),J(C),J(U),J(V),J(x.$$.fragment,e),_=!0)},o(e){F(c.$$.fragment,e),F(s.$$.fragment,e),F(u),F(C),F(U),F(V),F(x.$$.fragment,e),_=!1},d(e){e&&p(t),Q(c),Q(s),E[l].d(),T&&T.d(),C&&C.d(),e&&p(y),U&&U.d(e),e&&p(b),V&&V.d(e),e&&p(k),Q(x,e)}}}function St(e,t,n){let i,c,o,r,s,a="Click to copy",l=!1,u=!1,d=!1,f=!1;T((()=>{const e=(()=>{const e=localStorage.getItem("__user_token");return e?JSON.parse(e):null})();ce.update((()=>e))}));let p;return Re("welcome",(e=>{n(5,l=!0),ce.update((t=>e)),n(3,o=e.uid),(e=>{localStorage.setItem("__user_token",JSON.stringify(e))})(e)})),Re("incoming-call",(e=>{n(8,f=!0),n(9,s=e)})),Re("user-is-not-joined",(()=>{oe.update((e=>"User is not joined yet or identifier is not correct."))})),ce.subscribe((e=>n(2,c=e?.name))),ie.subscribe((e=>{n(1,i=e)})),e.$$.update=()=>{1&e.$$.dirty&&n(10,p=!(r&&4===r.length))},[r,i,c,o,a,l,u,d,f,s,p,function(){ie.update((e=>!e))},function(e){qe("join",c)},function(){n(7,d=!0),qe("try-call",{username:c,targetUid:r,initiatorUid:o}),Re("accept-call",(e=>{n(6,u=!0),n(8,f=!1),n(9,s=e)})),Re("drop-call",(()=>{oe.update((e=>"Participant has dropped the call")),n(9,s=null),n(8,f=!1),n(7,d=!1),Ye("accept-call"),Ye("drop-call")}))},function(){n(4,a="Copied"),(e=>{navigator.clipboard.writeText(e)})(o)},function(){n(6,u=!0),n(8,f=!1),n(7,d=!1),qe("accept-call",{username:c,targetUid:s.initiatorUid,initiatorUid:o})},function(){qe("drop-call",{username:c,targetUid:s.initiatorUid,initiatorUid:o}),n(9,s=null),n(8,f=!1),Ye("accept-call"),Ye("drop-call")},function(){c=this.value,n(2,c)},function(){r=this.value,n(0,r)}]}return new class extends ee{constructor(e){super(),K(this,e,St,_t,r,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
