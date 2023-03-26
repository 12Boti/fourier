import AsciiMath from './AsciiMath';
import { Arrow, Axes, Line, PlotSvg, Point, Polyline, Svg } from './Svg';
import { Complex } from 'complex.js';
import { linspace } from './Editor';
import { Animations, createTweenedNumber } from './animation';
import { createMemo, createSignal, For, Show } from 'solid-js';
import { css, oklch, mix } from '@thi.ng/color';

const func_resolution = 1000;

const twistGradient = linspace(0, 1, func_resolution)
  .map(x => 1 - Math.pow(2, -10 * x))
  .map(x => mix([], oklch("oklch(80% 0.121 220.24)"), oklch("oklch(30% 0.121 290.025)"), x))
  .map(x => oklch(x))
  .map(x => css(x));
const TransformSlide = () => {
  const func = (x: number) => Math.sin(x*2*Math.PI/3);
  const func_values = linspace(-1, 19.3, func_resolution).map(x => Complex(x, func(x)));

  const [time, setTime] = createTweenedNumber(0, {duration: 10000, ease: (x) => x});
  const [spinFreq, setSpinFreq] = createTweenedNumber(1.1, {duration: 10000, ease: (x) => x});
  const [constLength, setConstLength] = createSignal(true);
  const [showAvg, setShowAvg] = createSignal(false);

  const twisted_values = createMemo(() => func_values.filter((z) => z.re >= 0 && z.re <= time()).map(z => Complex({abs: z.im, arg: -2*Math.PI*spinFreq()*z.re})));
  const avg = () => twisted_values().reduce((s, z) => s.add(z), Complex.ZERO).div(twisted_values().length);

  return <section><div class="grid grid-rows-2 grid-cols-2">
    <div class="col-span-2">
      <Svg min={Complex(-1, -1.5)} max={Complex(20, 1.5)}>
        <Axes xlabel="t" ylabel="" min={Complex(-1, -1.5)} max={Complex(20, 1.5)} />
        <Polyline points={func_values} />
        <Arrow from={Complex(time(), 0)} to={Complex(time(), func(time()))} color="#009933" headwidth={0.7} headlength={0.5} />
      </Svg>
    </div>
    <div>
      <Svg min={Complex(-1.5, -1.5)} max={Complex(1.5, 1.5)} class="h-xs">
          <Show when={constLength() === false}>
            {/*<Polyline points={twisted_values()} />*/}
            <For each={[...twisted_values().keys()].slice(1)}>{i =>
              /*<Line from={twisted_values()[i-1]} to={twisted_values()[i]} stroke={`rgb(20, 30, ${Math.max(70, 200*(1-(twisted_values().length-i)/100))})`} stroke-linecap="round" />*/
              <Line from={twisted_values()[i-1]} to={twisted_values()[i]} stroke={twistGradient[twisted_values().length-i]} stroke-linecap="round" />
            }</For>
          </Show>
          <Show when={showAvg() === true}>
            <Point pos={avg()} color="#ff0000" />
          </Show>
          <Show when={showAvg() === false}>
            <Arrow from={Complex.ZERO} to={Complex({abs: constLength() ? 1 : func(time()), arg: -2*Math.PI*spinFreq()*time()})} color="#009933" headwidth={0.7} headlength={0.5} />
          </Show>
      </Svg>
    </div>
    <div>x</div>
  </div>
  <Animations>{[
    () => {setTime(0); setTime(0);},
    () => {setConstLength(true); setTime(19);},
    () => {setConstLength(false); setTime(0); setTime(19); setSpinFreq(1.1); setSpinFreq(1.1); setShowAvg(false);},
    () => {setShowAvg(true);},
    () => {setSpinFreq(0);},
  ]}</Animations>
  </section>;
};

export const FourierSlides = () => {
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
    <TransformSlide />
  </>;
}
