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


  return <>
    <section><h1>Fourier-transzformáció</h1></section>
    <section>
      <AsciiMath>hat(f)(xi) = int_-oo^oo f(x)e^(-i2pi xi x)dx</AsciiMath>
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
