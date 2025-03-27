try{let t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},e=(new t.Error).stack;e&&(t._sentryDebugIds=t._sentryDebugIds||{},t._sentryDebugIds[e]="f46080bf-6ba4-4f03-8ba7-7f9fb2d7e032",t._sentryDebugIdIdentifier="sentry-dbid-f46080bf-6ba4-4f03-8ba7-7f9fb2d7e032")}catch(t){}"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[17643],{3564:(t,e,i)=>{i.d(e,{IN:()=>y});var s=i(71844),a=i(76648),o=i(10180);let n="#4fa94d",r={"aria-busy":!0,role:"progressbar"};(0,o.Ay).div`
  display: ${t=>t.$visible?"flex":"none"};
`;let d=(0,o.i7)`
12.5% {
  stroke-dasharray: ${33.98873199462888}px, ${242.776657104492}px;
  stroke-dashoffset: -${26.70543228149412}px;
}
43.75% {
  stroke-dasharray: ${84.97182998657219}px, ${242.776657104492}px;
  stroke-dashoffset: -${84.97182998657219}px;
}
100% {
  stroke-dasharray: ${2.42776657104492}px, ${242.776657104492}px;
  stroke-dashoffset: -${240.34889053344708}px;
}
`;(0,o.Ay).path`
  stroke-dasharray: ${2.42776657104492}px, ${242.776657104492};
  stroke-dashoffset: 0;
  animation: ${d} ${1.6}s linear infinite;
`;let l=[0,30,60,90,120,150,180,210,240,270,300,330],h=(0,o.i7)`
to {
   transform: rotate(360deg);
 }
`,f=(0,o.Ay).svg`
  animation: ${h} 0.75s steps(12, end) infinite;
  animation-duration: 0.75s;
`,p=(0,o.Ay).polyline`
  stroke-width: ${t=>t.width}px;
  stroke-linecap: round;

  &:nth-child(12n + 0) {
    stroke-opacity: 0.08;
  }

  &:nth-child(12n + 1) {
    stroke-opacity: 0.17;
  }

  &:nth-child(12n + 2) {
    stroke-opacity: 0.25;
  }

  &:nth-child(12n + 3) {
    stroke-opacity: 0.33;
  }

  &:nth-child(12n + 4) {
    stroke-opacity: 0.42;
  }

  &:nth-child(12n + 5) {
    stroke-opacity: 0.5;
  }

  &:nth-child(12n + 6) {
    stroke-opacity: 0.58;
  }

  &:nth-child(12n + 7) {
    stroke-opacity: 0.66;
  }

  &:nth-child(12n + 8) {
    stroke-opacity: 0.75;
  }

  &:nth-child(12n + 9) {
    stroke-opacity: 0.83;
  }

  &:nth-child(12n + 11) {
    stroke-opacity: 0.92;
  }
`,y=({strokeColor:t=n,strokeWidth:e="5",animationDuration:i="0.75",width:o="96",visible:d=!0,ariaLabel:h="rotating-lines-loading"})=>{let y=(0,a.useCallback)(()=>l.map(t=>(0,s.jsx)(p,{points:"24,12 24,4",width:e,transform:`rotate(${t}, 24, 24)`},t)),[e]);return d?(0,s.jsx)(f,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 48 48",width:o,stroke:t,speed:i,"data-testid":"rotating-lines-svg","aria-label":h,...r,children:y()}):null},c=(0,o.i7)`
to {
   stroke-dashoffset: 136;
 }
`;(0,o.Ay).polygon`
  stroke-dasharray: 17;
  animation: ${c} 2.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) infinite;
`,(0,o.Ay).svg`
  transform-origin: 50% 65%;
`}}]);