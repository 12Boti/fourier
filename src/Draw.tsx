// Based on Daniel Shiffman's code.
// https://thecodingtrain.com/CodingChallenges/130.1-fourier-transform-drawing.html
// https://thecodingtrain.com/CodingChallenges/130.2-fourier-transform-drawing.html
// https://thecodingtrain.com/CodingChallenges/130.3-fourier-transform-drawing.html
// https://youtu.be/7_vKzcgpfvU




import { Component, createSignal, For, createMemo } from 'solid-js';
import {Complex} from 'complex.js';
import { normalized, fft } from './fourier';
import { Polyline, Svg } from './Svg';
import { createPointerListeners } from "@solid-primitives/pointer";
import { createRAF } from '@solid-primitives/raf';

function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map((k, i) => [k, b[i]]);
}

function floorPowerOfTwo(n: number): number {
  return Math.pow(2, Math.floor(Math.log2(n)));
}

const Draw: Component = () => {
  const [drawing, setDrawing] = createSignal<Complex[]>([]);
  const [fourier, setFourier] = createSignal<{z: Complex, freq: number}[]>([]);
  let startTime = 0;
  const [currentTime, setCurrentTime] = createSignal(0);
  const time = () => Math.floor((currentTime() - startTime)/100)*2*Math.PI/fourier().length;
  const offsets = createMemo(() => fourier().map(({z, freq}) => Complex({abs: z.abs(), arg: freq * time() + z.arg()})));
  const positions = () => {
    const o = offsets();
    const a = Array(o.length+1);
    a[0] = Complex.ZERO;
    for (let i = 1; i < o.length; i++) {
        a[i] = a[i-1].add(o[i-1]);
    }
    return a;
  };
  let svg: SVGSVGElement;

  createPointerListeners({
    target: () => svg,
    ondown: _ => {
      setFourier([]);
      setDrawing([]);
    },
    onmove: e => {
      if (e.buttons == 0) return;
      const dp = new DOMPoint(e.x, e.y).matrixTransform(svg.getScreenCTM()!.inverse());
      const p = Complex(dp.x, -dp.y);
      // console.log(p);
      setDrawing([...drawing(), p]);
    },
    onup: _ => {
      const l = drawing().length;
      const diff = l-floorPowerOfTwo(l);
      const step = Math.floor(l/diff);
      const signallium = drawing().filter((_, k) => k%step !== 0 || k>diff*step);
      const f = normalized(fft(signallium)).map((z, freq) => ({z, freq}));
      f.sort((a, b) => b.z.abs() - a.z.abs());
      console.log(f);
      setFourier(f);
      startTime = currentTime();
    },
  });

  const [, start, ] = createRAF(setCurrentTime);
  start();
  //createEffect(() => console.log(time()));

  return (
    <Svg ref={svg} min={Complex(-1, -1)} max={Complex(1, 1)} class="w-full h-full">
      <For each={zip(fourier(), positions())}>
        {([{z, freq}, p]) => <>
          <circle cx={p.re} cy={-p.im} r={z.abs()} fill="none" stroke="#FFA5FA77" stroke-width="0.003"></circle>
        </>}
      </For>
      <Polyline points={drawing()} stroke-width="0.003" />
      <Polyline points={positions()} stroke-width="0.003" stroke="#FCFC05" />
    </Svg>
  );
};

export default Draw;
