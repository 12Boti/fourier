// Based on Daniel Shiffman's code.
// https://thecodingtrain.com/CodingChallenges/130.1-fourier-transform-drawing.html
// https://thecodingtrain.com/CodingChallenges/130.2-fourier-transform-drawing.html
// https://thecodingtrain.com/CodingChallenges/130.3-fourier-transform-drawing.html
// https://youtu.be/7_vKzcgpfvU




import { Component, createSignal, For, createMemo, createEffect, on, startTransition, useTransition, onMount } from 'solid-js';
import {Complex} from 'complex.js';
import { normalized, fft } from './fourier';
import { Polyline, Svg } from './Svg';
import { createPointerListeners } from "@solid-primitives/pointer";
import { createRAF } from '@solid-primitives/raf';
import createTween from '@solid-primitives/tween';
import { createTweenedComplex, createTweenedNumber } from './animation';

export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map((k, i) => [k, b[i]]);
}

function floorPowerOfTwo(n: number): number {
  return Math.pow(2, Math.floor(Math.log2(n)));
}

const Draw: Component = () => {
  let zoomed = false;
  const [zoom, setZoom] = createTweenedNumber(1, {duration: 2500});
  const complexZoom = () => Complex(zoom(), zoom());
  const [camera, setCamera] = createSignal(Complex(0, 0));
  const [drawing, setDrawing] = createSignal<Complex[]>([]);
  const [fourier, setFourier] = createSignal<{z: Complex, freq: number}[]>([]);
  let startTime = 0;
  const [currentTime, setCurrentTime] = createSignal(0);
  const time = () => Math.floor((currentTime() - startTime)/10)*2*Math.PI/(fourier().length);
  const filteredFourier = () => fourier().filter(({z})=> z.abs() > 0.001);
  const offsets = createMemo(() => filteredFourier().map(({z, freq}) => Complex({abs: z.abs(), arg: freq * time() + z.arg()})));
  const positions = () => {
    const o = offsets();
    const a = Array(o.length+1);
    a[0] = Complex.ZERO;
    for (let i = 1; i < o.length+1; i++) {
        a[i] = a[i-1].add(o[i-1]);
    }
    return a;
  };
  const lastPosition = () => positions()[positions().length-1];
  createEffect(on([positions], () => {
      setDrawing([...drawing().slice(-fourier().length*fourier().length), lastPosition()]);
      if(zoomed) {
        setCamera(lastPosition());
      }
  }));
  let svg: SVGSVGElement;

  const handleKeyDown = (e) => {
    if (e.key === 'z') {
      if(!zoomed){
        zoomed = true;
        setZoom(0.003);
      }
      else {
        setCamera(Complex(0,0));
        zoomed = false;
        setZoom(1);
      }
    }
  };

  const listeners = {
    target: () => svg,
    ondown: _ => {
      setFourier([]);
      setDrawing([]);
      setZoom(1);
    },
    onmove: (e: PointerEvent) => {
      if (e.buttons == 0 || e.pointerType === "touch") return;
      const dp = new DOMPoint(e.x, e.y).matrixTransform(svg.getScreenCTM()!.inverse());
      const p = Complex(dp.x, -dp.y);
      // console.log(p);
      setDrawing([...drawing(), p]);
      console.log(e);
      if (e.preventDefault) e.preventDefault();
    },
    onup: _ => {
      let francium = drawing();
      for(let j = 0; j < 5; j++) {
        let neptunium = [];
        for(let i = 0; i < francium.length; i++) {
          neptunium.push(francium[i]);
          if(francium.length > i+1) {
            neptunium.push(francium[i].add(francium[i+1]).div(2));
          }
        }
        francium = neptunium;
      }
      const l = francium.length;
      const diff = l-floorPowerOfTwo(l);
      const step = Math.floor(l/diff);
      const signallium = francium.filter((_, k) => (k+1)%step !== 0 || k>diff*step);
      //console.log(signallium);
      const f = normalized(fft(signallium.concat(signallium.slice().reverse()))).map((z, freq) => ({z, freq}));
      f.sort((a, b) => b.z.abs() - a.z.abs());
      //console.log(f);
      setFourier(f);
      setDrawing([]);
      startTime = currentTime();
    },
    passive: false,
  };

  createPointerListeners(listeners);

  const [, start, ] = createRAF(setCurrentTime);
  start();
  //createEffect(() => console.log(time()));

  onMount(() =>
    svg.addEventListener("touchmove", (e) => {listeners.onmove({x: e.touches[0].pageX, y: e.touches[0].pageY});e.preventDefault()}));

  return (
    <Svg ref={svg} onKeyDown={handleKeyDown}  min={camera().sub(complexZoom())} max={camera().add(complexZoom())} class="w-screen h-screen block" tabindex="0"
       ontouchend={listeners.onup}
    >
      <For each={zip(filteredFourier(), positions())}>
        {([{z, freq}, p]) => <>
          <circle cx={p.re} cy={-p.im} r={z.abs()} fill="none" stroke="#FFA5FA77" stroke-width="1" vector-effect="non-scaling-stroke"></circle>
        </>}
      </For>
      <Polyline points={drawing()} stroke-width="1" vector-effect="non-scaling-stroke" />
      <Polyline points={positions()} stroke-width="1" vector-effect="non-scaling-stroke" stroke="#FCFC05" />
    </Svg>
  );
};

export default Draw;
