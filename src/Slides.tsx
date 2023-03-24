import { Component, createMemo, createSignal, For, JSXElement, onCleanup } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { Svg, Arrow, Axes, Polyline, Plot, PlotSvg } from './Svg';
import { Complex } from 'complex.js';
import AsciiMath from './AsciiMath';
import { createAnimation, createSequence } from './animation';
import { pb, UserRecord, getAvatar } from './pocketbase';
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

  const wave = (freq: number) => (x: number) => Math.sin(x*freq/250);
  const sum = (...fs: ((x: number) => number)[]) => (x: number) => fs.map(f => f(x)).reduce((s, a) => s + a, 0);
  const Asin = wave(440);
  const Esin = wave(329.63);
  const EAsin = sum(Asin, Esin);
  const manysin = sum(Asin, Esin, wave(345), wave(549), wave(769));
  const manysin2 = sum(Asin, wave(115), wave(989), wave(220));

  return <>
    <section><h1>Fourier-transzformáció</h1></section>
    <section>
      <div class="absolute"> Ez itt:
      </div>
      <div class="grid-item"><AsciiMath>hat(g)(f) = int_-oo^oo g(t)e^(-i2pi f t)dt</AsciiMath>
      </div>
    </section>
    <section>
      <AsciiMath>f(x)=sinAx</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 5)} func={Asin} />
    </section>
    <section>
      <AsciiMath>f(x)=sinEx</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 5)} func={Esin} />
    </section>
    <section>
      <AsciiMath>f(x)=sinEx</AsciiMath>
      <div class="w-xl mx-auto">
        <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 2)} func={Esin} />
      </div>
      <AsciiMath>f(x)=sinAx</AsciiMath>
      <div class="w-xl mx-auto">
        <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 2)} func={Asin} />
      </div>
    </section>
    <section>
      <AsciiMath>f(x)=sinAx+sinEx</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 5)} func={EAsin} />
    </section>
    <section>
      <AsciiMath>f(x)="bonyi függvény"</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -4.5)} max={Complex(17, 6)} func={manysin} />
    </section>
    <section>
      <AsciiMath>f(x)="másik bonyi függvény"</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -4.5)} max={Complex(17, 6)} func={manysin2} />
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
