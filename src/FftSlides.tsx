import AsciiMath from './AsciiMath';
import { Arrow, Axes, Line, Plot, PlotSvg, Point, Points, Polyline, Svg, Text, Units } from './Svg';
import { Complex } from 'complex.js';
import { linspace } from './Editor';
import { Animations, createSequence, createTweenedNumber } from './animation';
import { createMemo, createSignal, For, Index, Show } from 'solid-js';
import { css, oklch, mix } from '@thi.ng/color';
import * as colors from './colors';

import ABomb from '../images/Atmoic-Bomb-US.png';
import falloutExposure from '../images/US_fallout_exposure.png';
import hydrophone from '../images/hydrophone.png';
import instrument from '../images/seismographInstrument.png';
import NumberOfEarthquakes from '../images/Number-of-earthquakes-per-year-worldwide-source-IRIS.png';
import seismograph from '../images/seismograph.png';
import explosionVsearthquake from '../images/explosionVSearthquake.png';
import Tukey from '../images/John_Tukey.png';
import Cooley from '../images/James_Cooley.png';
import Gauss from '../images/Carl_Friedrich_Gauss.png';
import { dft, dftReal, normalized, normalizedReal } from './fourier';
import {zip} from './Draw';


export const FftSlides = () => {
  const [Eqidx, setEqidx] = createSignal(0);
  const equations = [
    "hat(g)(f) = int_-oo^oo g(t)e^(-i2pi f t)dt", 
    "hat(g)(f) = int_-oo^oo g(t)(cos(2pift) -sin(2pift)i) dt",
    "hat(g)(f) = sum_(k=0)^(N-1) P_k(cos(2pif {:k/N:}) -sin(2pif {:k/N:})i)",
    "F_n = sum_(k=0)^(N-1) P_k(cos(2pin (k)/N) -sin(2pin  k/N)i)",
  ];

  //bonyi function
  const [graphOpacity, setGraphOpacity] = createTweenedNumber(1, {duration: 800});
  const [pointOpacity, setPointOpacity] = createTweenedNumber(0, {duration: 800});
  const sum = (...fs: ((x: number) => number)[]) => (x: number) => fs.map(f => f(x)).reduce((s, a) => s + a, 0);
  const wave = (freq: number) => (x: number) => Math.sin(x*freq/250);
  const cosWave = (freq: number) => (x: number) => Math.cos(x*freq/250);
  const manysin = sum(wave(440), wave(329.63), /*wave(345),*/ /*wave(549),*/ wave(769));
  
  //e^ix
  const smallRadius = 0.3;
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
    "e^(-i2pi f t) = cos(2pfx) - sin(2pfx)i",
  ];

  const [theta, setTheta] = createTweenedNumber((1/8), {ease: (t) => t, duration: 5000});
  const [arrowOpacity, setArrowOpacity] = createTweenedNumber(0, {duration: 1000});
  const [circleOpacity, setCircleOpacity] = createTweenedNumber(0, {duration: 1000});
  const [othePlotOpacity, setOthePlotOpacity] = createTweenedNumber(0, {duration: 1000});


  const [triangleOpacity, setTriangleOpacity] = createTweenedNumber(0, {duration: 1000});
  const [lengthOpacity, setLengthOpacity] = createTweenedNumber(0, {duration: 1000});
  const [angleOpacity, setAngleOpacity] = createTweenedNumber(0, {duration: 1000});

  const [lowFreqOpacity, setLowFreqOpacity] = createTweenedNumber(0, {duration: 1000});
  const [highFreqOpacity, setHighFreqOpacity] = createTweenedNumber(0, {duration: 1000});
  const [pointFreqOpacity, setPointFreqOpacity] = createTweenedNumber(1, {duration: 800});

  const [freqs, setFreqs] = createSignal(0);
  const testFrequensies = [[0],[1,2,3], [0,1,2], [1,2,3,], [0,1], [1,2,3], [0,1,2], [1,2,3]];
  const [circlesOpacity, setCirclesOpacity] = createTweenedNumber(0, {duration: 1000});

  const [translateX, setTranslateX] = createTweenedNumber(0, {duration: 1000});

  const [translateEvenX, setTranslateEvenX] = createTweenedNumber(9, {duration: 1000});

  const [translateOddX, setTranslateOddX] = createTweenedNumber(9, {duration: 1000});

  const [translateMultiX, setTranslateMultiX] = createTweenedNumber(0, {duration: 1000});
  const [translateMultiY1, setTranslateMultiY1] = createTweenedNumber(0, {duration: 1000});
  const [translateMultiY2, setTranslateMultiY2] = createTweenedNumber(0, {duration: 1000});

  const [zoom, setZoom] = createTweenedNumber(1, {ease: (t) => t, duration: 7000});

  const [vectorOpacity, setVectorOpacity] = createTweenedNumber(0, {duration: 800});
  const [functionOpacity, setFunctionOpacity] = createTweenedNumber(0, {duration: 800});
  const [time, setTime] = createTweenedNumber(1, {ease: (t) => t, duration: 7000});
  const fouriSin = sum((x) => 2*wave(250)(x+Math.PI/4), (x) => 2*wave(250*3)(x), (x) => 1*wave(250*5)(x-Math.PI/3));
  const xs = linspace(0, Math.PI*2,13).map((x) => Complex(x, fouriSin(x))).slice(0,-1);
  const dft_xs = normalizedReal(dftReal(xs));
  const dft_xs_polar = dft_xs.slice(0,dft_xs.length/2).map((z, freq) => ({z, freq}))
    .sort((a, b) => Math.round((b.z.abs() - a.z.abs())*10) || (a.freq - b.freq)).filter((z)=> z.z.abs() > 0.001);
  const offsets = () => dft_xs_polar.map(({z, freq}) => Complex({abs: z.abs(), arg: freq*time()*2*Math.PI + z.arg()}));
  const positions = () => {
    const o = offsets();
    const a = Array(o.length+1);
    a[0] = Complex.ZERO;
    for (let i = 1; i < o.length+1; i++) {
        a[i] = a[i-1].add(o[i-1]);
    }
    return a;
  };

  return <>
    <section><h1>Fast Fourier Transfrom (FFT)</h1></section>
    <section>
      <img src={ABomb}/>
    </section>
    <section>
      <img src={falloutExposure}/>
    </section>
    <section>
      <img src={hydrophone}/>
    </section>
    <section>
      <img src={instrument}/>
    </section>
    <section>
      <img src={NumberOfEarthquakes}/>
    </section>
    <section>
      <img src={seismograph}/>
    </section>
    <section>
      <img src={explosionVsearthquake}/>
    </section>
    <section>
      <AsciiMath>f(x)="bonyi függvény"</AsciiMath>
      <Svg min={Complex(-1.6, -4.5)} max={Complex(18, 6)}>        
        <Plot xlabel="t" ylabel="Δ" min={Complex(0, -4.5)} max={Complex(17, 6)} func={manysin} graphOpacity={graphOpacity()} xUnits={28}/>
        <Points min={Complex(0, -4.5)} max={Complex(17, 6)} func={manysin} resolution={28} pointOpacity={pointOpacity()} labelSymbol='P'/>
      </Svg>
      <Animations>{[
            () => {setGraphOpacity(1); setPointOpacity(0);},
            () => {setGraphOpacity(1); setPointOpacity(1);},
            () => {setGraphOpacity(0); setPointOpacity(1);},
        ]}</Animations>
    </section>
    <section><h1>Discrete Fourier Transfrom (DFT)</h1></section>
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
          <AsciiMath>{`theta=-2pi*${x().toFixed(2)}=${(-2*Math.PI*x()).toFixed(2)}`}</AsciiMath>
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
          stroke="#11da22" fill="none" vector-effect="non-scaling-stroke" />
          <Text 
          pos={Complex(smallRadius*Math.cos(x()*2*Math.PI/2)/2,-smallRadius/5-smallRadius*Math.sin(x()*2*Math.PI/2)/2)}
          size={50}
          text-anchor="middle"
          fill={"#11da22"}
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
      <div class="w-full">
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
            <AsciiMath class="text-3xl">{equations[Eqidx()]}</AsciiMath>
        </div>
        <Animations>{[
            () => {setEqidx(0);},
            () => {setEqidx(1);},
            () => {setEqidx(2);},
        ]}</Animations>
    </section>

    <section>
      <Svg min={Complex(-0.5, -2)} max={Complex(2*Math.PI+1, 2)} class="w-full h-full">
        <Plot xlabel="" ylabel="Δ" min={Complex(0, -1.5)} max={Complex(Math.PI*2+0.5, 2)} func={(x) => wave(250)(x)} xUnits={5}/>
        <Points min={Complex(0, -4.5)} max={Complex(Math.PI*(3/2)+0.5, 6)} func={(x) => wave(250)(x)} resolution={4} pointOpacity={pointFreqOpacity()} labelSymbol='P'/>
      </Svg>
    </section>

    <section>
        <div>
            <AsciiMath class="text-3xl">{equations[Eqidx()]}</AsciiMath>
        </div>
        <Animations>{[
            () => {setEqidx(2);},
        ]}</Animations>
    </section>

    <section>
      <Svg min={Complex(-1.6, -4.5)} max={Complex(18, 6)}>
        <Plot xlabel="t" ylabel="Δ" min={Complex(0, -4.5)} max={Complex(Math.PI*5 + 0.5 /*We probaly need +0.5 because of the triangle*/, 6)} func={(x) => 3*wave(250)(x)} graphOpacity={lowFreqOpacity()}/>
        <Plot xlabel="t" ylabel="Δ" min={Complex(0, -4.5)} max={Complex(Math.PI*5 + 0.5, 6)} func={(x) => 3*wave(5*250)(x)} graphOpacity={highFreqOpacity()}/>
        <Points min={Complex(0, -4.5)} max={Complex(Math.PI*5 + 0.5, 6)} func={(x) => 3*wave(250)(x)} resolution={11} pointOpacity={pointFreqOpacity()} labelSymbol='P'/>
      </Svg>
      <Animations>{[
            () => {setLowFreqOpacity(0), setHighFreqOpacity(0); setPointFreqOpacity(1);},
            () => {setLowFreqOpacity(1), setHighFreqOpacity(0); setPointFreqOpacity(1);},
            () => {setLowFreqOpacity(0), setHighFreqOpacity(1); setPointFreqOpacity(1);},
            () => {setLowFreqOpacity(0.5), setHighFreqOpacity(0.5); setPointFreqOpacity(1);},
        ]}</Animations>
    </section>


    <section>
      <AsciiMath>hat(g)(f)</AsciiMath>
      <Svg min={Complex(-1.6, -4.5)} max={Complex(18, 6)}>
        <Plot xlabel="f" ylabel="Δ" min={Complex(0, -4.5)} max={Complex(Math.PI*5 + 0.5 , 6)} func={(x) => 3*cosWave(625)(x-Math.PI)} graphOpacity={0} xUnits={6} symbol='F'/>        
        <Points min={Complex(0, -4.5)} max={Complex(Math.PI*5 + 0.5, 6)} func={(x) => 3*Math.abs(cosWave(625)(x-Math.PI))} resolution={6} pointOpacity={pointFreqOpacity()} labelSymbol='P'/>
      </Svg>
    </section>


    <section>
        <div>
            <AsciiMath class="text-3xl">{equations[Eqidx()]}</AsciiMath>
        </div>
        <Animations>{[
            () => {setEqidx(2);},
            () => {setEqidx(3);},
        ]}</Animations>
    </section>


    <section>
      <div class="w-full h-full">
      <Svg min={Complex(-1.2, -1.2)} max={Complex(3.8, 1.2)} class="w-full h-full">
          <g transform="scale(0.5, 0.5) translate(-1.3,-0.3)">
            <Axes xlabel='' ylabel='' min={Complex(-1.1, -1.5)} max={Complex(1.2, 1.5)}/>
            <Arrow from={Complex(0,0)} to={Complex({arg: 2*Math.PI*theta(), abs: 1})} opacity={arrowOpacity()}/>
            <circle cx="0" cy="0" r="1" stroke-width={1} fill="none" stroke="#FFFFFF" vector-effect="non-scaling-stroke" opacity={circleOpacity()}/>
            <path 
            d={
              ["M ", smallRadius, "0 A", smallRadius, smallRadius, "0", (theta()%1)<0.5 ? "0" : "1", "0", 
              (smallRadius*Math.cos(theta()*2*Math.PI)),
              (-smallRadius*Math.sin(theta()*2*Math.PI))].join(" ")
            }
            stroke="#11da22" fill="none" vector-effect="non-scaling-stroke" opacity={circleOpacity()}/>
            <Text 
            pos={Complex(smallRadius*Math.cos((theta()%1)*2*Math.PI/2)/2,-smallRadius/5+smallRadius*Math.sin((theta()%1)*2*Math.PI/2)/2)}
            size={50}
            text-anchor="middle"
            fill="#11da22"
            vector-effect="non-scaling-stroke"
            opacity={circleOpacity()}
            >θ</Text>
            <Point pos={Complex({arg: 2*Math.PI/8, abs: 1})} color="red"/>
            <Text
              pos={Complex({arg: 2*Math.PI/8, abs: 1.05})}
              size={55}
              fill="red"
            >(x; y)</Text>
          </g>
          <g transform="scale(0.5, 0.5) translate(0.5,-0.3)">
            <Axes xlabel="t" ylabel="Δ" min={Complex(0, -1.5)} max={Complex(Math.PI*2 + 0.5, 1.5)} opacity={othePlotOpacity()}/>
            <Polyline points={linspace(0, Math.PI*2*((theta()-1/8)/(3)) + 0.5-0.5, 1000).map(x => Complex(x, 1*wave(250)(3*x+(1/8)*2*Math.PI)))} opacity={1} color={colors.stroke} opacity={othePlotOpacity()}/>
            <Line from={Complex(Math.cos(theta()*2*Math.PI)*1-1.8, Math.sin(theta()*2*Math.PI)*1)} to={Complex(Math.PI*2*((theta()-1/8)/(3)), Math.sin(theta()*2*Math.PI)*1)} color={"cyan"} opacity={0.5*othePlotOpacity()}/>
            
          </g>
        </Svg>
      </div>
      <Animations>{[
            () => {setTheta(1/8); setArrowOpacity(0); setCircleOpacity(0); setOthePlotOpacity(0)},
            () => {setTheta(1/8); setArrowOpacity(1); setCircleOpacity(0); setOthePlotOpacity(0)},
            () => {setTheta(1/8); setArrowOpacity(1); setCircleOpacity(1); setOthePlotOpacity(0)},
            () => {setTheta(1/8); setArrowOpacity(1); setCircleOpacity(1); setOthePlotOpacity(1)},
            () => {setTheta(3 + 1/8); setArrowOpacity(1); setCircleOpacity(1); setOthePlotOpacity(1)},
      ]}</Animations>
    </section>


    <section>
      <div class="w-full h-full">
      <Svg min={Complex(-1.8, -1.2)} max={Complex(1.8, 1.2)} style="width: auto; height: 77%;">
          <Axes xlabel='' ylabel='' min={Complex(-1.1, -1.2)} max={Complex(1.2, 1.2)}/>
          <Line from={Complex(0,0)} to={Complex({arg: 2*Math.PI*(1/8), abs: 1})} opacity={1} color='yellow'/>
          <Line from={Complex(0,0)} to={Complex(Math.cos(2*Math.PI*(1/8)), 0)} opacity={triangleOpacity()} color='purple'/>
          <Line from={Complex(Math.cos(2*Math.PI*(1/8)),0)} to={Complex(Math.cos(2*Math.PI*(1/8)), Math.sin(2*Math.PI*(1/8)))} opacity={triangleOpacity()} color='blue'/>
          <circle cx="0" cy="0" r="1" stroke-width={1} fill="none" stroke="#FFFFFF" vector-effect="non-scaling-stroke" opacity={1}/>
          <path 
          d={
            ["M ", smallRadius, "0 A", smallRadius, smallRadius, "0", ((1/8)%1)<0.5 ? "0" : "1", "0", 
            (smallRadius*Math.cos((1/8)*2*Math.PI)),
            (-smallRadius*Math.sin((1/8)*2*Math.PI))].join(" ")
          }
          stroke="#11da22" fill="none" vector-effect="non-scaling-stroke" opacity={1}/>
          <Text 
          pos={Complex(1.3*smallRadius*Math.cos(((1/8)%1)*2*Math.PI/2)/2,-0.8*smallRadius/5+smallRadius*Math.sin(((1/8)%1)*2*Math.PI/2)/2)}
          size={50}
          text-anchor="middle"
          fill={"#11da22"}
          vector-effect="non-scaling-stroke"
          opacity={1}
          >θ</Text>
          <Point pos={Complex({arg: 2*Math.PI/8, abs: 1})} color="red"/>
          <Text
            pos={Complex({arg: 2*Math.PI/8, abs: 1.05})}
            size={55}
            fill="red"
          >(x; y)</Text>
        </Svg>
        <style>{`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .grid-item {
            padding: 0px;
            text-align: center;
          }`}
        </style>
        <div class="grid-container">
          <AsciiMath class="grid-item" style={"opacity: "+lengthOpacity()+";"}>A=sqrt(x^2+y^2)</AsciiMath>
          <AsciiMath class="grid-item" style={"opacity: "+angleOpacity()+";"}>theta=tg^(-1)(y/x)</AsciiMath>
        </div>
      </div>
      <Animations>{[
        () => {setTriangleOpacity(0); setAngleOpacity(0); setLengthOpacity(0);},
        () => {setTriangleOpacity(1); setAngleOpacity(0); setLengthOpacity(0);},
        () => {setTriangleOpacity(1); setAngleOpacity(0); setLengthOpacity(1);},
        () => {setTriangleOpacity(1); setAngleOpacity(1); setLengthOpacity(1);},
      ]}</Animations>
    </section>

    <section style={"flex-direction: row;"}>
      <img src={Tukey} style={"float: left; width: auto; height: 50%;"}/>
      <img src={Cooley} style={"float: left; width: auto; height: 50%;"}/>
    </section>

    <section>
    <Svg min={Complex(-1.6, -4.5)} max={Complex(18, 6)}>
    <Plot xlabel="t" ylabel="Δ" min={Complex(0, -4.5)} max={Complex(Math.PI*5 + 0.5, 6)} func={(x) => 3*wave(100)(x)} graphOpacity={1}/>
    <Index each={Array(freqs())}>
      {(a, i) => <>
        <Polyline points={linspace(0, Math.PI*5 + 0.5-0.5, 1000).map(x => Complex(x, 3*cosWave(i*100)(x)))}
        opacity={0.4} stroke={css(oklch([0.8, 0.221, i*2*Math.PI/8]))} stroke-width="2"/>
      </>}
    </Index>
    <Index each={Array(8)}>
      {(a, i) => <>
        <For each={testFrequensies[i]}>
          {(b) => <>
            <circle 
            cx={linspace(0, Math.PI*5*(7/8) + 0.5-0.5, 8)[i]} 
            cy={-3*cosWave(b*100)(linspace(0, Math.PI*5*(7/8) + 0.5-0.5, 8)[i])}
            r="0.3"
            fill="none" stroke-width={3} stroke='red' vector-effect="non-scaling-stroke" opacity={circlesOpacity()}
            />
          </>}
        </For>
      </>}
    </Index>
    <Points min={Complex(0, -4.5)} max={Complex(Math.PI*5*(7/8) + 0.5, 6)} func={(x) => 3*wave(100)(x)} resolution={8} pointOpacity={1} labelSymbol='P'/>
    <Animations>{[
      () => {setFreqs(0);},
      () => {setFreqs(1);},
      () => {setFreqs(2);},
      () => {setFreqs(3);},
      () => {setFreqs(4);},
      () => {setFreqs(5);},
      () => {setFreqs(6);},
      () => {setFreqs(7);},
      () => {setFreqs(8); setCirclesOpacity(0);},
      () => {setFreqs(8); setCirclesOpacity(1);},
      ]}</Animations>
    </Svg>
    </section>



    <section>
    <Svg min={Complex(-3.2, -9)} max={Complex(36, 12)}>
      <Plot xlabel="" ylabel="" min={Complex(0, -4.5)} max={Complex(Math.PI*5 + 0.5, 6)} func={(x) => 3*wave(100)(x)} graphOpacity={0} transform={"translate("+(7+translateX()).toString()+", 0)"}/>
      <Points min={Complex(Math.PI*(5*(1/8)), -4.5)} max={Complex(Math.PI*(5*(7/8)) + 0.5, 6)} func={(x) => 3*wave(100)(x)} resolution={4} pointOpacity={1} labelSymbol='P' transform={"translate("+(7+translateX()).toString()+", 0)"} index={(x: number) => {return 2*x + 1}}/>
      <Plot xlabel="" ylabel="" min={Complex(0, -4.5)} max={Complex(Math.PI*5 + 0.5, 6)} func={(x) => 3*wave(100)(x)} graphOpacity={0} transform={"translate("+(7-translateX()).toString()+", 0)"}/>
      <Points min={Complex(0, -4.5)} max={Complex(Math.PI*5*(6/8) + 0.5, 6)} func={(x) => 3*wave(100)(x)} resolution={4} pointOpacity={1} labelSymbol='P' transform={"translate("+(7-translateX()).toString()+", 0)"} index={(x: number) => {return 2*x}}/>
      <Animations>{[
            () => {setTranslateX(0);},
            () => {setTranslateX(9);},
      ]}</Animations>
    </Svg>
    </section>


    <section>
      <div class="w-full h-full">
        <Svg min={Complex(-3.2, -20)} max={Complex(36, 12)}>
          <Index each={Array(4)}>
            {(a, i) => <>
              <Plot xlabel="" ylabel="" min={Complex(0, -3)} max={Complex(Math.PI*5 + 0.5, 3.5)} func={(x) => 3*wave(100)(x)} graphOpacity={0} 
              transform={"translate("+(7-translateEvenX()).toString()+", "+(13+i*-7).toString()+")"}/>
              <Polyline points={linspace(0, Math.PI*5 + 0.5-0.5, 1000).map(x => Complex(x, 3/1.5*cosWave((3-i)*100)(x)))} opacity={0.4} stroke={css(oklch([0.8, 0.221, i*2*Math.PI/8]))} stroke-width="2" 
              transform={"translate("+(7-translateEvenX()).toString()+", "+(13+i*-7).toString()+")"}/>

              <Plot xlabel="" ylabel="" min={Complex(0, -3)} max={Complex(Math.PI*5 + 0.5, 3.5)} func={(x) => 3*wave(100)(x)} graphOpacity={0} 
              transform={"translate("+(7+translateEvenX()).toString()+", "+(13+i*-7).toString()+")"}/>
              <Polyline points={linspace(0, Math.PI*5 + 0.5-0.5, 1000).map(x => Complex(x, 3/1.5*cosWave((3-i+4)*100)(x)))} opacity={0.4} stroke={css(oklch([0.8, 0.221, i*2*Math.PI/8]))} stroke-width="2" transform={
                "translate("+(7+translateEvenX()).toString()+", "+(13+i*-7).toString()+")"}/>

              <Units min={Complex(0, -2)} max={Complex(Math.PI*5*(6/8) + 0.5, 3)} units={4} 
              transform={"translate("+(7-translateEvenX()).toString()+", "+(13+i*-7).toString()+")"} index={(x: number) => {return 2*x}}/>
              <Units min={Complex(0, -2)} max={Complex(Math.PI*5*(6/8) + 0.5, 3)} units={4} 
              transform={"translate("+(7+translateEvenX()).toString()+", "+(13+i*-7).toString()+")"} index={(x: number) => {return 2*x}}/>

            </>}
          </Index>
          <Animations>{[
            () => {setTranslateEvenX(9);},
            () => {setTranslateEvenX(0);},
          ]}</Animations>
        </Svg>
      </div>
    </section>

    <section>
      <div class="w-full h-full">
        <Svg min={Complex(-3.2, -20)} max={Complex(36, 12)}>
          <Index each={Array(4)}>
            {(a, i) => <>
              <Plot xlabel="" ylabel="" min={Complex(0, -3)} max={Complex(Math.PI*5 + 0.5, 3.5)} func={(x) => 3*wave(100)(x)} graphOpacity={0} 
              transform={"translate("+(7-translateOddX()).toString()+", "+(13+i*-7).toString()+")"}/>
              <Polyline points={linspace(0, Math.PI*5 + 0.5-0.5, 1000).map(x => Complex(x, 3/1.5*cosWave((3-i)*100)(x)))} opacity={0.4} stroke={css(oklch([0.8, 0.221, i*2*Math.PI/8]))} stroke-width="2" 
              transform={"translate("+(7-translateOddX()).toString()+", "+(13+i*-7).toString()+")"}/>

              <Plot xlabel="" ylabel="" min={Complex(0, -3)} max={Complex(Math.PI*5 + 0.5, 3.5)} func={(x) => 3*wave(100)(x)} graphOpacity={0} 
              transform={"translate("+(7+translateOddX()).toString()+", "+(13+i*-7).toString()+")"}/>
              <Polyline points={linspace(0, Math.PI*5 + 0.5-0.5, 1000).map(x => Complex(x, 3/1.5*cosWave((3-i+4)*100)(x)))} opacity={0.4} stroke={css(oklch([0.8, 0.221, i*2*Math.PI/8]))} stroke-width="2" transform={
                "translate("+(7+translateOddX()).toString()+", "+(13+i*-7).toString()+")"}/>

              <Units min={Complex(Math.PI*(5*(1/8)), -4.5)} max={Complex(Math.PI*(5*(7/8)) + 0.5, 6)} units={4} 
              transform={"translate("+(7-translateOddX()).toString()+", "+(13+i*-7).toString()+")"} index={(x: number) => {return 2*x + 1}}/>
              <Units min={Complex(Math.PI*(5*(1/8)), -4.5)} max={Complex(Math.PI*(5*(7/8)) + 0.5, 6)} units={4} 
              transform={"translate("+(7+translateOddX()).toString()+", "+(13+i*-7).toString()+")"} index={(x: number) => {return 2*x + 1}}/>

            </>}
          </Index>
          <Animations>{[
            () => {setTranslateOddX(9);},
            () => {setTranslateOddX(0);},
          ]}</Animations>
        </Svg>
      </div>
    </section>



    <section>
      <div class="w-full h-full">
        <Svg min={Complex(-3.2, -20)} max={Complex(36, 12)}>
          <Index each={Array(8)}>
            {(a, i) => <>
              <Plot xlabel="" ylabel="" min={Complex(0, -3)} max={Complex(Math.PI*5 + 0.5, 3.5)} func={(x) => 3*wave(100)(x)} graphOpacity={0} 
              transform={"translate("+((39.2-(Math.PI*5))/2-translateMultiX()*-1*(2*(i%2)-1)-3).toString()+", "+ 
              (2.5 + (i%4 == 1 || i%4 == 2 ? -1 : 1)*(i < 4 ? translateMultiY1() : translateMultiY2())).toString()
              +")"}/>
            </>}
          </Index>
          <Index each={Array(8)}>
            {(a, i) => <>
              <Point pos={linspace(0, Math.PI*(5*(7/8)), 8).map((x) => Complex(x, 3*wave(100)(x)))[i]} color={"#d4ea10"} label={"P"+i.toString()}
              transform={"translate("+((39.2-(Math.PI*5))/2-translateMultiX()*-1*(2*(i%2)-1)-3).toString()+", "+ 
              (2.5 + (i%4 == 1 || i%4 == 2 ? -1 : 1)*(i < 4 ? translateMultiY1() : translateMultiY2())).toString()
              +")"}/>
            </>}
          </Index>
          <Animations>{[
            () => {setTranslateMultiX(0); setTranslateMultiY1(0); setTranslateMultiY2(0);},
            () => {setTranslateMultiX(9); setTranslateMultiY1(0); setTranslateMultiY2(0);},
            () => {setTranslateMultiX(9); setTranslateMultiY1(3.5); setTranslateMultiY2(3.5);},
            () => {setTranslateMultiX(9); setTranslateMultiY1(3.5); setTranslateMultiY2(10.5);},
          ]}</Animations>
        </Svg>
      </div>
    </section>

    <section>
      <AsciiMath>O(n^2) "vs " O(nlog_2n)</AsciiMath>
    </section>


    <section>
      <div class="w-full h-full">
        <Svg min={Complex(-0.5, -0.5)} max={Complex(36, 24)}>
          <Units min={Complex(0, -3)} max={Complex(34.5, 24)} units={5*zoom()} symbol=''/>
          <Units min={Complex(0, -3)} max={Complex(23.5, 24)} units={5*zoom()*(23.5/34.5)} symbol='' transform='rotate(-90)' index={(x) => ""}/>
          <Plot xlabel="" ylabel="" min={Complex(0, -3)} max={Complex(35, 24)} func={(x) => x*zoom()>=1 ? x*Math.log2(x*zoom())/50 : 0}/>
          <Plot xlabel="" ylabel="" min={Complex(0, -3)} max={Complex(35, 24)} func={(x) => x*x*zoom()/50} />
          <Animations>{[
            () => {setZoom(1);},
            () => {setZoom(20);},
          ]}</Animations>
        </Svg>
      </div>
    </section>

    <section>
      <img src={Gauss}/>
    </section>

    <section>
    <style>{`
          .grid-container-1 {
            display: grid;
            grid-template-columns: 70% 30%;
            
            gap: 0px;
            padding: 0px;
          }
          .small-ascii-math .katex-display {
            margin: 0;
          }
          
          .grid-container-2 {
            display: grid;
            grid-template-rows: repeat(6, 1fr);
            
            gap: 0px;
            padding: 0px;
          }

          .grid-item {
            text-align: left;
            padding: 0px;
            text-align: center;
            margin: 0px;
          }`
          }
      </style>
      <div class="grid-container-1 w-full">          
      <Svg min={Complex(-1.6, -6.5)} max={Complex(9, 7)} class="grid-item">        
        <Plot xlabel="t" ylabel="Δ" min={Complex(0, -5)} max={Complex(Math.PI*2, 5)} func={fouriSin} graphOpacity={1} xUnits={7}/>
        <Points min={Complex(0, -4.5)} max={Complex(Math.PI*2, 6)} func={fouriSin} resolution={7} pointOpacity={1} labelSymbol='P'/>
      </Svg>
      <div class="grid-container-2">
      <AsciiMath style="height: auto; width: 70%;" class="grid-item small-ascii-math text-3xl">{"f_0 = ("+ dft_xs[0].re.toFixed(2).toString() + ";" + dft_xs[0].im.toFixed(2).toString() +")"}</AsciiMath>
      <AsciiMath style="height: auto; width: 70%;" class="grid-item small-ascii-math text-3xl">{"f_1 = ("+ dft_xs[1].re.toFixed(2).toString() + ";" + dft_xs[1].im.toFixed(2).toString() +")"}</AsciiMath>
      <AsciiMath style="height: auto; width: 70%;" class="grid-item small-ascii-math text-3xl">{"f_2 = ("+ dft_xs[2].re.toFixed(2).toString() + ";" + dft_xs[2].im.toFixed(2).toString() +")"}</AsciiMath>
      <AsciiMath style="height: auto; width: 70%;" class="grid-item small-ascii-math text-3xl">{"f_3 = ("+ dft_xs[3].re.toFixed(2).toString() + ";" + dft_xs[3].im.toFixed(2).toString() +")"}</AsciiMath>
      <AsciiMath style="height: auto; width: 70%;" class="grid-item small-ascii-math text-3xl">{"f_4 = ("+ dft_xs[4].re.toFixed(2).toString() + ";" + dft_xs[4].im.toFixed(2).toString() +")"}</AsciiMath>
      <AsciiMath style="height: auto; width: 70%;" class="grid-item small-ascii-math text-3xl">{"f_5 = ("+ dft_xs[5].re.toFixed(2).toString() + ";" + dft_xs[5].im.toFixed(2).toString() +")"}</AsciiMath>
      </div>
      </div>
    </section>



    <section>
    <div class="w-full h-full">
      <Svg min={Complex(-2.7, -2.2)} max={Complex(5.3, 2.2)} class="w-full h-full">
          <g transform="scale(0.5, 0.5) translate(-1.3,-0.3)">
            <Axes xlabel='' ylabel='' min={Complex(-2.5, -2.5)} max={Complex(2.5, 2.5)}/>
            <For each={zip(offsets(), positions())}>
            {([z, p]) => <>
              <circle cx={p.re} cy={-p.im} r={z.abs()} fill="none" stroke="#FFA5FA77" stroke-width="1" vector-effect="non-scaling-stroke" opacity={functionOpacity()}></circle>
              <Arrow from={p} to={p.add(z)} opacity={vectorOpacity()}/>
            </>}
            </For>            
          </g>
          <g transform="scale(0.5, 0.5) translate(3.5,-0.3)">
            <Axes xlabel="t" ylabel="Δ" min={Complex(0, -2.5)} max={Complex(Math.PI*2 + 0.5, 2.5)} opacity={functionOpacity()}/>
            <Polyline points={linspace(0, Math.PI*2*(time()), 1000).map(x => Complex(x, fouriSin(x)))} opacity={functionOpacity()} color={colors.stroke}/>
            <Line from={positions()[positions().length-1].sub(Complex(4.8, 0))} to={Complex(Math.PI*2*time(), fouriSin(time()*2*Math.PI)*1)} color={"cyan"} opacity={0.5*functionOpacity()}/>
            
          </g>
        </Svg>
      </div>
      <Animations>{[
        () => {setTime(0); setVectorOpacity(0); setFunctionOpacity(0);},
        () => {setTime(0); setVectorOpacity(1); setFunctionOpacity(0);},
        () => {setTime(0); setVectorOpacity(1); setFunctionOpacity(1);},
        () => {setTime(1); setVectorOpacity(1); setFunctionOpacity(1);},
      ]}</Animations>
    </section>
  </>;
}

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}
