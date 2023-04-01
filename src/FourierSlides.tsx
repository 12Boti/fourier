import AsciiMath from './AsciiMath';
import { Arrow, Axes, Line, PlotSvg, Point, Points, Polyline, Svg, Text } from './Svg';
import { Complex } from 'complex.js';
import { linspace } from './Editor';
import { Animations, createTweenedNumber } from './animation';
import { Component, createMemo, createSignal, For, Index, Show } from 'solid-js';
import { css, oklch, mix } from '@thi.ng/color';
import createRAF from '@solid-primitives/raf';
import { PlaySlides, userSumFunc } from './PlaySlides';
import joke from '../audio/Fourier_joke.wav';
import joke_noise from '../audio/Fourier_joke_noise.wav';
import joke_spectrum from '../images/joke_spectrum.png';

const func_resolution = 1024;

const twistGradient = linspace(0, 1, func_resolution)
  .map(x => 1 - Math.pow(2, -10 * x))
  .map(x => mix([], oklch("oklch(80% 0.121 220.24)"), oklch("oklch(30% 0.121 290.025)"), x))
  .map(x => oklch(x))
  .map(x => css(x));


const wave = (freq: number) => (x: number) => Math.sin(x*freq/250);
const wavesum = (...fs: ((x: number) => number)[]) => (x: number) => fs.map(f => f(x)).reduce((s, a) => s + a, 0);
const Asin = wave(440);
const Esin = wave(329.63);
const EAsin = wavesum(Asin, Esin);
const manysin = wavesum(Asin, Esin, wave(549), wave(769));
const manysin2 = wavesum(Asin, wave(115), wave(989), wave(220));
const complexsum = (zs: Complex[]) => zs.reduce((s, z) => s.add(z), Complex.ZERO);

const audioCtx = new AudioContext();
const gain = audioCtx.createGain();
const gain2 = audioCtx.createGain();
gain.connect(gain2).connect(audioCtx.destination);
gain2.gain.setValueAtTime(0.3, audioCtx.currentTime);
let activeOscillators: OscillatorNode[] = [];

function playFreqs(...freqs: number[]): void {
  const time = audioCtx.currentTime;
  for (const o of activeOscillators) {
    o.stop();
    o.disconnect();
  }
  activeOscillators = [];
  for (const f of freqs) {
    const oscillator = audioCtx.createOscillator();
    oscillator.connect(gain);
    oscillator.frequency.setValueAtTime(f, audioCtx.currentTime);
    oscillator.start();
    activeOscillators.push(oscillator);
  }
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(1, time + 1);
  gain.gain.linearRampToValueAtTime(1, time + 2);
  gain.gain.linearRampToValueAtTime(0, time + 3);
}

const GradientPolyline: Component<{points: Complex[]}> = (p) =>
  <Index each={[...p.points.keys()].slice(1)}>{i =>
    <Line from={p.points[i()-1]} to={p.points[i()]} stroke={twistGradient[p.points.length-i()]} stroke-linecap="round" />
  }</Index>

const TransformSlide = () => {
  const [func, setFunc] = createSignal((x: number) => Math.sin(x*2*Math.PI*3));
  const func_values = createMemo(() => linspace(-0.5, 2, func_resolution).map(x => Complex(x, func()(x))));
  const func_freqs = createMemo(() => linspace(0, 10, 1000).map(freq => Complex(freq, complexsum(func_values().filter(z => z.re >= 0).map(z => Complex({abs: z.im, arg: -2*Math.PI*freq*z.re}))).abs()/100)));

  const [time, setTime] = createTweenedNumber(0, {duration: 10000, ease: (x) => x});
  const [spinFreq, setSpinFreq] = createTweenedNumber(1.1, {duration: 20000, ease: (x) => x});
  const [constLength, setConstLength] = createSignal(true);
  const [showAvg, setShowAvg] = createSignal(false);
  const [showFreqs, setShowFreqs] = createSignal(false);

  const twisted_values = createMemo(() => func_values().filter((z) => z.re >= 0 && z.re <= time()).map(z => Complex({abs: z.im, arg: -2*Math.PI*spinFreq()*z.re})));
  const avg = () => complexsum(twisted_values()).div(twisted_values().length);

  return <section><div class="grid grid-rows-2 grid-cols-2 w-full h-full">
    <div class="col-span-2">
      <Svg min={Complex(-0.5, -0.3)} max={Complex(2.1, 0.3)}>
        <Axes xlabel="t" ylabel="" min={Complex(-0.5, -0.3)} max={Complex(2.1, 0.3)} />
        <Line from={Complex(1, -0.1)} to={Complex(1, 0.1)} stroke="#E04C1F" />
        <Line from={Complex(2, -0.1)} to={Complex(2, 0.1)} stroke="#E04C1F" />
        <Text pos={Complex(1-0.02, -0.2)} size={50} fill="#d02fa0">1</Text>
        <Text pos={Complex(2-0.02, -0.2)} size={50} fill="#d02fa0">2</Text>
        <Polyline points={func_values().map(z => Complex(z.re, z.im*0.2))} />
        <Arrow from={Complex(time(), 0)} to={Complex(time(), func()(time())*0.2)} color="#009933" headwidth={0.7} headlength={0.5} />
      </Svg>
    </div>
    <div>
      <div style="height: 0; width: 0">
        <AsciiMath>{`f = ${spinFreq().toFixed(2)} "Hz"`}</AsciiMath>
      </div>
      <Svg min={Complex(-1.5, -1.5)} max={Complex(1.5, 1.5)} class="h-xs">
          <Show when={constLength() === false}>
            <GradientPolyline points={twisted_values()} />
          </Show>
          <Show when={showAvg() === true}>
            <Point pos={Complex.ZERO} color="#880000" />
            <Point pos={avg()} color="#ff0000" />
          </Show>
          <Show when={showAvg() === false}>
            <Arrow from={Complex.ZERO} to={Complex({abs: 1, arg: -2*Math.PI*spinFreq()*time()})} color="#004919" headwidth={0.7} headlength={0.5} />
            <Arrow from={Complex.ZERO} to={Complex({abs: constLength() ? 1 : func()(time()), arg: -2*Math.PI*spinFreq()*time()})} color="#009933" headwidth={0.7} headlength={0.5} />
          </Show>
      </Svg>
    </div>
    <div>
      <Show when={showFreqs()}>
        <Svg min={Complex(-0.3, -1.3)} max={Complex(10, 7)} class="h-xs">
          <Axes xlabel="f" ylabel="d" min={Complex(-0.2, -0.5)} max={Complex(10, 7)} />
          <For each={linspace(1, 9, 9)}>{x => <>
            <Line from={Complex(x, -0.4)} to={Complex(x, 0.4)} stroke="#E04C1F" />
            <Text pos={Complex(x-0.2, -1.2)} size={50} fill="#d02fa0">{x.toFixed(0)}</Text>
          </>}</For>
          <Polyline stroke="#ff0000" stroke-linejoin="round" points={func_freqs().filter(z => z.re <= spinFreq())} />
        </Svg>
      </Show>
    </div>
  </div>
  <Animations>{[
    () => {setTime(0); setTime(0);},
    () => {setConstLength(true); setTime(2);},
    () => {setConstLength(false); setTime(0); setTime(2); setSpinFreq(1.1); setSpinFreq(1.1); setShowAvg(false);},
    () => {setShowAvg(true);},
    () => {setShowFreqs(false); setSpinFreq(0.1);},
    () => {setShowFreqs(true);},
    () => {setSpinFreq(3);},
    () => {setSpinFreq(10); setFunc(() => (x) => Math.sin(x*2*Math.PI*3))},
    () => {setFunc(() => (x) => manysin(x*15)/3.1); setTime(0); setTime(0); setSpinFreq(1); setSpinFreq(1); setShowFreqs(false); setShowAvg(false);},
    () => {setTime(2);},
    () => {setShowAvg(true); setShowFreqs(true); setSpinFreq(0.1); setSpinFreq(10);},
    () => {setSpinFreq(0.1); setSpinFreq(0.1); setFunc(() => userSumFunc ? ((x) => userSumFunc(x*3)) : ((x) => 0))},
    () => {setSpinFreq(10);},
  ]}</Animations>
  </section>;
};

const ESlides = () => {
  const [f, setF] = createTweenedNumber(1, {duration: 10000, ease: x => x});
  const [arg, setArg] = createSignal(0);
  let prevTimestamp = performance.now();
  const [t, setT] = createSignal(0);

  const [running, start, stop] = createRAF(timestamp => {
    const dt = (timestamp - prevTimestamp)/1000;
    setT(t => t + dt);
    prevTimestamp = timestamp;
    setArg(arg => arg+f()*dt);
  });

  return <>
    <section>
      <div class="flex flex-row justify-evenly w-full">
        <AsciiMath>{`e^(-i2pi*f*t)`}</AsciiMath>
        <AsciiMath>{`f = ${f().toFixed(1)}`}</AsciiMath>
        <AsciiMath>{`t = ${t().toFixed(1)}`}</AsciiMath>
      </div>
      <Svg min={Complex(-1.2, -1.2)} max={Complex(1.2, 1.2)} class="h-xl">
        <Arrow from={Complex(0,0)} to={Complex({arg: -2*Math.PI*arg(), abs: 1})} color="#00b9e4" />
      </Svg>
      <Animations>{[
        () => {setF(1); setArg(0); setT(0); start();},
        () => {setF(0);},
        () => {setF(3);},
      ]}</Animations>
    </section>
  </>;
}

const IntegralSlides = () => {
  const [resolution, setResolution] = createSignal(10);

  const func = manysin;
  const twisted_func = (x: number) => Complex({abs: func(x*1.1)/3, arg: -2*Math.PI*2*x})

  return <>
    <section>
      <AsciiMath>int"..."dt</AsciiMath>
      <Svg min={Complex(-1.5, -1.5)} max={Complex(1.5, 1.5)} class="h-xs">
        <GradientPolyline points={linspace(0, 1, 1000).map(twisted_func)} />
        <For each={linspace(0, 1, resolution())}>{x =>
          <Point pos={twisted_func(x)} color="#e55443" />
        }</For>
      </Svg>
      <Animations>{[
        () => setResolution(10),
        () => setResolution(20),
        () => setResolution(50),
      ]}</Animations>
    </section>
  </>
}

export const FourierSlides = () => {

  return <>
    <section><h1>Hogyan turmixoljunk visszafelé egy smoothiet?</h1>
    </section>
    <section><h1>Fourier-transzformáció</h1></section>
    <section>
      <div class="text-7xl text-left"> Ez itt:
      </div>
      <AsciiMath>hat(g)(f) = int_-oo^oo g(t)e^(-i2pi f t)dt</AsciiMath>
    </section>
    <section>
      <AsciiMath>f(x)=sinAx</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 5)} func={Asin} />
      <Animations>{[
        () => {},
        () => playFreqs(440),
      ]}</Animations>
    </section>
    <section>
      <AsciiMath>f(x)=sinEx</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 5)} func={Esin} />
      <Animations>{[
        () => {},
        () => playFreqs(329.63),
      ]}</Animations>
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
      <Animations>{[
        () => {},
        () => playFreqs(440, 329.63),
      ]}</Animations>
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
    <PlaySlides />
    <TransformSlide />
    <section>
      <audio controls src={joke_noise} />
    </section>
    <section>
      <img src={joke_spectrum} />
    </section>
    <section>
      <audio controls src={joke} />
    </section>
    <section>
    <AsciiMath>hat(g)(f) = int_-oo^oo g(t)e^(-i2pi f t)dt</AsciiMath>
    </section>
  
    <ESlides />
    <IntegralSlides />
  </>;
}
