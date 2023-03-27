import AsciiMath from './AsciiMath';
import { Arrow, Axes, Line, Plot, PlotSvg, Point, Points, Polyline, Svg } from './Svg';
import { Complex } from 'complex.js';
import { linspace } from './Editor';
import { Animations, createTweenedNumber } from './animation';
import { createMemo, createSignal, For, Show } from 'solid-js';
import { css, oklch, mix } from '@thi.ng/color';


export const FftSlides = () => {
  const [Eqidx, setEqidx] = createSignal(0);
  const [graphOpacity, setGraphOpacity] = createTweenedNumber(1, {duration: 800});
  const [pointOpacity, setPointOpacity] = createTweenedNumber(0, {duration: 800});
  const equations = [
    "hat(g)(f) = int_-oo^oo g(t)e^(-i2pi f t)dt", 
    "hat(g)(f) = int_-oo^oo g(t)(cos(2pift) -sin(2pift)i) dt",
    "hat(g)(f) = sum_(k=0)^(K-1) x_k(cos(2pifk) -sin(2pifk)i) dt",
    "F_n = sum_(k=0)^(K-1) x_k(cos(2pink) -sin(2pink)i) dt",
  ];

  const sum = (...fs: ((x: number) => number)[]) => (x: number) => fs.map(f => f(x)).reduce((s, a) => s + a, 0);
  const wave = (freq: number) => (x: number) => Math.sin(x*freq/250);
  const manysin = sum(wave(440), wave(329.63), /*wave(345),*/ /*wave(549),*/ wave(769));

  return <>
    <section><h1>FFT</h1></section>
    <section>
      <AsciiMath>f(x)="bonyi függvény"</AsciiMath>
      <Svg min={Complex(-1.6, -4.5)} max={Complex(18, 6)}>
        <Plot xlabel="t" ylabel="Δ" min={Complex(0, -4.5)} max={Complex(17, 6)} func={manysin} graphOpacity={graphOpacity()}/>
        <Points min={Complex(0, -4.5)} max={Complex(17, 6)} func={manysin} resolution={28} pointOpacity={pointOpacity()} />
      </Svg>
      <Animations>{[
            () => {setGraphOpacity(1); setPointOpacity(0);},
            () => {setGraphOpacity(1); setPointOpacity(1);},
            () => {setGraphOpacity(0); setPointOpacity(1);},
        ]}</Animations>
    </section>
    <section><h1>DFT</h1></section>
    <section>
        <div>
            <AsciiMath>{equations[Eqidx()]}</AsciiMath>
        </div>
        <Animations>{[
            () => {setEqidx(0);},
            () => {setEqidx(1);},
            () => {setEqidx(2);},
            () => {setEqidx(3);},
        ]}</Animations>
    </section>
  </>;
}
