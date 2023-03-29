import AsciiMath from './AsciiMath';
import { Arrow, Axes, Line, Plot, PlotSvg, Point, Points, Polyline, Svg, Text, Units } from './Svg';
import { Complex } from 'complex.js';
import { linspace } from './Editor';
import { Animations, createSequence, createTweenedNumber } from './animation';
import { createMemo, createSignal, For, Index, Show } from 'solid-js';
import { css, oklch, mix } from '@thi.ng/color';


export const FftSlides = () => {
  const [Eqidx, setEqidx] = createSignal(0);
  const equations = [
    "hat(g)(f) = int_-oo^oo g(t)e^(-i2pi f t)dt", 
    "hat(g)(f) = int_-oo^oo g(t)(cos(2pift) -sin(2pift)i) dt",
    "hat(g)(f) = sum_(k=0)^(K-1) x_k(cos(2pifk) -sin(2pifk)i) dt",
    "F_n = sum_(k=0)^(K-1) x_k(cos(2pink) -sin(2pink)i) dt",
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
    "(x;y) = (cos(-2pfx); sin(-2pfx))",
    "(x;y) = (cos(2pfx); -sin(2pfx))",
    "e^(-i2pi f t) = cos(2pfx) - sin(2pfx)i",
  ];


  const [lowFreqOpacity, setLowFreqOpacity] = createTweenedNumber(0, {duration: 1000});
  const [highFreqOpacity, setHighFreqOpacity] = createTweenedNumber(0, {duration: 1000});
  const [pointFreqOpacity, setPointFreqOpacity] = createTweenedNumber(1, {duration: 800});

  const [freqs, setFreqs] = createSignal(0);
  const testFrequensies = [[0],[1,2,3], [0,1,2], [1,2,3,], [0,1], [1,2,3], [0,1,2], [1,2,3]];
  const [circlesOpacity, setCirclesOpacity] = createTweenedNumber(0, {duration: 1000});

  const [translateX, setTranslateX] = createTweenedNumber(0, {duration: 1000});

  const [translateEvenX, setTranslateEvenX] = createTweenedNumber(9, {duration: 1000});

  const [translateOddX, setTranslateOddX] = createTweenedNumber(9, {duration: 1000});

  return <>
    <section><h1>FFT</h1></section>
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
          <AsciiMath>{`theta=-i2p${x().toFixed(2)}=${(-2*Math.PI*x()).toFixed(2)}`}</AsciiMath>
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
        ]}</Animations>
    </section>

    <section>
      <AsciiMath>f(x)="bonyi függvény"</AsciiMath>
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
        <div>
            <AsciiMath>{equations[Eqidx()]}</AsciiMath>
        </div>
        <Animations>{[
            () => {setEqidx(2);},
            () => {setEqidx(3);},
        ]}</Animations>
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
  </>;
}

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}
