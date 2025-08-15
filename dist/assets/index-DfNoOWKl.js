import{r as a,a as j,R as w}from"./vendor-cxkclgJA.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function c(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=c(e);fetch(e.href,t)}})();var m={exports:{}},l={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var N=a,_=Symbol.for("react.element"),b=Symbol.for("react.fragment"),R=Object.prototype.hasOwnProperty,O=N.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,k={key:!0,ref:!0,__self:!0,__source:!0};function f(n,r,c){var o,e={},t=null,i=null;c!==void 0&&(t=""+c),r.key!==void 0&&(t=""+r.key),r.ref!==void 0&&(i=r.ref);for(o in r)R.call(r,o)&&!k.hasOwnProperty(o)&&(e[o]=r[o]);if(n&&n.defaultProps)for(o in r=n.defaultProps,r)e[o]===void 0&&(e[o]=r[o]);return{$$typeof:_,type:n,key:t,ref:i,props:e,_owner:O.current}}l.Fragment=b;l.jsx=f;l.jsxs=f;m.exports=l;var s=m.exports,u={},p=j;u.createRoot=p.createRoot,u.hydrateRoot=p.hydrateRoot;/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var E={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=n=>n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),S=(n,r)=>{const c=a.forwardRef(({color:o="currentColor",size:e=24,strokeWidth:t=2,absoluteStrokeWidth:i,className:y="",children:d,...x},h)=>a.createElement("svg",{ref:h,...E,width:e,height:e,stroke:o,strokeWidth:i?Number(t)*24/Number(e):t,className:["lucide",`lucide-${L(n)}`,y].join(" "),...x},[...r.map(([v,g])=>a.createElement(v,g)),...Array.isArray(d)?d:[d]]));return c.displayName=`${n}`,c};/**
 * @license lucide-react v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=S("FileText",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["line",{x1:"16",x2:"8",y1:"13",y2:"13",key:"14keom"}],["line",{x1:"16",x2:"8",y1:"17",y2:"17",key:"17nazh"}],["line",{x1:"10",x2:"8",y1:"9",y2:"9",key:"1a5vjj"}]]);function A(){return s.jsx("div",{className:"min-h-screen bg-background text-foreground",children:s.jsxs("div",{className:"container mx-auto px-4 py-8",children:[s.jsxs("div",{className:"flex items-center gap-3 mb-8",children:[s.jsx(P,{className:"h-8 w-8 text-primary"}),s.jsx("h1",{className:"text-3xl font-bold",children:"DevNotes"})]}),s.jsxs("div",{className:"text-center",children:[s.jsx("p",{className:"text-lg text-muted-foreground mb-4",children:"A developer-focused note-taking application"}),s.jsx("p",{className:"text-sm text-muted-foreground",children:"Project foundation successfully set up with Vite, React, TypeScript, Tailwind CSS, and core dependencies."})]})]})})}u.createRoot(document.getElementById("root")).render(s.jsx(w.StrictMode,{children:s.jsx(A,{})}));
//# sourceMappingURL=index-DfNoOWKl.js.map
