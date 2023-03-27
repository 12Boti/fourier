import AsciiMath from './AsciiMath';
import { Arrow, Axes, Line, Plot, PlotSvg, Point, Points, Polyline, Svg, Text } from './Svg';
import { Complex } from 'complex.js';
import { linspace } from './Editor';
import { Animations, createSequence, createTweenedNumber } from './animation';
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
  const smallRadius = 0.3;
  const sum = (...fs: ((x: number) => number)[]) => (x: number) => fs.map(f => f(x)).reduce((s, a) => s + a, 0);
  const wave = (freq: number) => (x: number) => Math.sin(x*freq/250);
  const manysin = sum(wave(440), wave(329.63), /*wave(345),*/ /*wave(549),*/ wave(769));

  const [x, setX] = createSignal(0);
  const [coordinateOpacity, setCoordinateOpacity] = createSignal(0);
  const anim = createSequence([
    {update: setX, from: 0,    to: 0.25, easing: easeOutQuad, duration: 2, delay: 1},
    {update: setX, from: 0.25, to: 1,    easing: easeOutQuad, duration: 2, delay: 1},
    {update: setX, from: 1,    to: 0.85, easing: easeOutQuad, duration: 2, delay: 1},
    {update: setCoordinateOpacity, from: 0,    to: 1, easing: easeOutQuad, duration: 2, delay: 1},
  ]);
  const [corEqidx, setCorEqidx] = createSignal(0);
  const coordinateCalcs = [
    "",
    "(x;y) = (cos(-2pifx); sin(-2pifx))",
    "(x;y) = (cos(2pifx); -sin(2pifx))",
    "e^(-i2pi f t) = cos(2pifx) - sin(2pifx)i",
  ];

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
        ]}</Animations>
    </section>

    <section on:reveal={anim.start}>
      <div class="flex items-center justify-center">
        <div style={{ display: "block"}}> 
          <AsciiMath>{`e^(-i2pi*${x().toFixed(2)})`}</AsciiMath> 
          <AsciiMath>{`theta=-i2pi${x().toFixed(2)}=${(-2*Math.PI*x()).toFixed(2)}`}</AsciiMath>
        </div>
        <Svg min={Complex(-1.2, -1.2)} max={Complex(1.2, 1.2)} class="w-60%">
          <Axes xlabel='' ylabel='' min={Complex(-1.1, -1.1)} max={Complex(1.2, 1.2)}/>
          <Arrow from={Complex(0,0)} to={Complex({arg: -2*Math.PI*x(), abs: 1})} />
          <circle cx="0" cy="0" r="1" stroke-width={1} fill="none" stroke="#FFFFFF" vector-effect="non-scaling-stroke"/>
          <path 
          d={
            ["M ", smallRadius, "0 A", smallRadius, smallRadius, "0", x()<0.5 ? "0" : "1", "1", 
            (smallRadius*Math.cos(x()*2*Math.PI)),
            (smallRadius*Math.sin(x()*2*Math.PI))].join(" ")
          }
          stroke="green" fill="none" vector-effect="non-scaling-stroke" />
          <Text 
          pos={Complex(smallRadius*Math.cos(x()*2*Math.PI/2)/2,-smallRadius/5-smallRadius*Math.sin(x()*2*Math.PI/2)/2)}
          size={50}
          text-anchor="middle"
          fill={"green"}
          vector-effect="non-scaling-stroke"
          >θ</Text>
          <Point pos={Complex({arg: -2*Math.PI*x(), abs: 1})} color="red"/>
          <Text
            pos={Complex({arg: -2*Math.PI*x(), abs: 1.05})}
            size={55}
            fill="red"
            opacity={coordinateOpacity()}
          >(x; y)</Text>
        </Svg>
      </div>
      <div>
        <AsciiMath>{coordinateCalcs[corEqidx()]}</AsciiMath>
      </div>
      <Animations>{[
            () => {setCorEqidx(0);},
            () => {setCorEqidx(1);},
            () => {setCorEqidx(2);},
            () => {setCorEqidx(3);},
      ]}</Animations>
    </section>


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

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}