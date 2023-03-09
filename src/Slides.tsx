import { Component, createMemo, createSignal, For, JSXElement, onCleanup } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { Svg, Arrow } from './Svg';
import { Complex } from 'complex.js';
import AsciiMath from './AsciiMath';
import { createAnimation, createSequence } from './animation';
import { pb, UserRecord, getAvatar } from './pocketbase';
import Plot from './Plot';
import { linspace } from "./Editor";
import { UnsubscribeFunc } from "pocketbase";
import JpgSlides from "./JpgSlides";

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

const Slides: Component = () => {
  const [x, setX] = createSignal(0);
  const anim = createSequence([
    {update: setX, from: 0,    to: 0.25, easing: easeOutQuad, duration: 2, delay: 1},
    {update: setX, from: 0.25, to: 1,    easing: easeOutQuad, duration: 2, delay: 1},
    {update: setX, from: 1,    to: 0.75, easing: easeOutQuad, duration: 2, delay: 1},
  ]);
  const userMap = new ReactiveMap<string, UserRecord & {avatar: string}>();
  const users = createMemo(() => [...userMap.values()]);

  let unsubscribe: UnsubscribeFunc | null = null;
  (async () => {
    unsubscribe = await pb.collection('users').subscribe<UserRecord>('*', async function (e) {
      userMap.set(e.record.id, {...e.record, avatar: getAvatar(e.record.id)});
    });
  })(); 
  onCleanup(() => { if (unsubscribe) unsubscribe() });
  const points = () => linspace(-7*Math.PI, 7*Math.PI, 1000).map((x) => [x, Math.sin(x/Math.PI*440)]);

  return <>
    <section><h1>Fourier-transzformáció</h1></section>
    <section>
      <div class="absolute"> Ez itt:
      </div>
      <div class="grid-item"><AsciiMath>hat(g)(f) = int_-oo^oo g(t)e^(-i2pi f t)dt</AsciiMath>
      </div>
      
    </section>
    <section>
      <AsciiMath>f(x)=sinx</AsciiMath>
      <svg width="800" height="300" viewBox="-1.5 -5 20 7" >
        <line x1="-30" y1="0" x2="30" y2="0" stroke-width="2" stroke="#E04C1F" vector-effect="non-scaling-stroke"></line>
        <line x1="0" y1="30" x2="0" y2="-30" stroke-width="2" stroke="#E04C1F" vector-effect="non-scaling-stroke"></line>
        <line x1="18" y1="0.5" x2="18.5" y2="0" stroke-width="2" stroke="#E04C1F" vector-effect="non-scaling-stroke"></line>
        <line x1="18" y1="-0.5" x2="18.5" y2="0" stroke-width="2" stroke="#E04C1F" vector-effect="non-scaling-stroke"></line>
        <line x1="0" y1="-5.25" x2="0.5" y2="-4.75" stroke-width="2" stroke="#E04C1F" vector-effect="non-scaling-stroke"></line>
        <line x1="0" y1="-5.25" x2="-0.5" y2="-4.75" stroke-width="2" stroke="#E04C1F" vector-effect="non-scaling-stroke"></line>
        <text x="-5%" y="-60%" fill="#d02fa0" font-size="1" vector-effect="non-scaling-stroke"> Δ
        </text>
        
      <polyline
        stroke={"#1FB3E0"} stroke-width="5" fill="none" vector-effect="non-scaling-stroke"
        points={points().map(([x, y]) => `${x} ${-y}`).join(",")} />
      <text x="85%" y="-15%" font-size="1" fill="#d02fa0" vector-effect="non-scaling-stroke"> t(s)
        </text>
    </svg>
    
    </section>
    <section on:reveal={anim.start}>
      <div class="flex items-center justify-center">
        <AsciiMath>{`e^(-i2pi*${x().toFixed(2)})`}</AsciiMath>
        <Svg min={Complex(-1.2, -1.2)} max={Complex(1.2, 1.2)} class="w-60%">
          <Arrow from={Complex(0,0)} to={Complex({arg: -2*Math.PI*x(), abs: 1})} />
        </Svg>
      </div>
    </section>
    <section>
      <div class="grid-container">
        <For each={users().concat(users())}>
          {(user) => (
            <div class="grid-row">
              <img src={user.avatar} class="grid-item"></img>
              <div class="grid-item-func">
                <Plot points={() => linspace(-8, 8, 1000).map((x) => [x, Math.sin(x/Math.PI*user.number)])} minX={-7.5} maxX={7.5} minY={-1.1} maxY={1.1} />
              </div>
            </div>
          )}
        </For>
      </div>
    </section>
    <JpgSlides />
  </>;
};

export default Slides;
