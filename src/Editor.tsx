import Complex from 'complex.js';
import { Component, createSignal, createEffect, on, For } from 'solid-js';
import AsciiMath from './AsciiMath';
import { pb, userid, UserRecord, avatar } from './pocketbase';
import { Line, Plot, PlotSvg, Svg } from './Svg';



export function linspace(start: number, stop: number, num: number, endpoint = true) {
  const div = endpoint ? (num - 1) : num;
  const step = (stop - start) / div;
  return Array.from({length: num}, (_, i) => start + step * i);
}

function createAsyncEffect(deps: (() => any)[], f: () => Promise<void>) {
  let running = false;
  let more = false;
  async function worker() {
    running = true;
    while (more) {
      more = false;
      await f();
    }
    running = false;
  }
  createEffect(on(deps, () => {
    more = true;
    if (running === false) {
      worker();
    }
  }));
}

const Editor: Component = () => {
  const [frequency, setFrequency] = createSignal(1);
  const [phase, setPhase] = createSignal(0);
  const [frequency2, setFrequency2] = createSignal(1);
  const [phase2, setPhase2] = createSignal(0);
  const [scale2, setScale2] = createSignal(0.5);

  createAsyncEffect([frequency, phase, frequency2, phase2, scale2], async () => {
    await pb.collection('users').update<UserRecord>(userid, {
      frequency: frequency(),
      phase: phase(),
      frequency2: frequency2(),
      phase2: phase2(),
      scale2: scale2(),
    });
  });

  
  return (
    <div class="text-light-500">
      <a class="absolute block bg-sky-600 text-dark-800 p-5 rounded-xl font-bold" onclick={() => {location.href = "#draw"; location.reload()}}>Rajz</a>
      <img src={avatar} class="w-20 h-20 mx-auto mb-10 pt-2 block"></img>
      <Svg min={Complex(-3, -2.1)} max={Complex(3, 2.1)}>
        <For each={linspace(-2, 2, 5)}>{x => <>
          <Line from={Complex(x, -0.2)} to={Complex(x, 0.2)} stroke="#E04C1F" />
        </>}</For>
        <Plot
          func={x => Math.sin((x*frequency() + phase())*Math.PI*2) + scale2()*Math.sin((x*frequency2() + phase2())*Math.PI*2)}
          min={Complex(-3, -2.1)} max={Complex(3, 2.1)}
          xlabel="" ylabel="" />
        <Plot
          func={x => Math.sin((x*frequency() + phase())*Math.PI*2)}
          min={Complex(-3, -2.1)} max={Complex(3, 2.1)}
          xlabel="" ylabel="" color="rgba(94, 195, 68, 0.1)" />
        <Plot
          func={x => scale2()*Math.sin((x*frequency2() + phase2())*Math.PI*2)}
          min={Complex(-3, -2.1)} max={Complex(3, 2.1)}
          xlabel="" ylabel="" color="rgba(243, 110, 208, 0.1)" />
      </Svg>
      <AsciiMath>{`f_1 = ${frequency().toFixed(1)}`}</AsciiMath>
      <input
        class="w-11/12 mx-auto block"
        type="range" min="0.1" max="3" value="1" step="0.01"
        onInput={(e) => setFrequency(+e.currentTarget.value)} />
      <AsciiMath>{`theta_1 = ${phase().toFixed(1)}`}</AsciiMath>
      <input
        class="w-11/12 mx-auto block"
        type="range" min="0" max="1" value="0" step="0.01"
        onInput={(e) => setPhase(+e.currentTarget.value)} />
      <AsciiMath>{`f_2 = ${frequency2().toFixed(1)}`}</AsciiMath>
      <input
        class="w-11/12 mx-auto block"
        type="range" min="0.1" max="3" value="1" step="0.01"
        onInput={(e) => setFrequency2(+e.currentTarget.value)} />
      <AsciiMath>{`theta_2 = ${phase2().toFixed(1)}`}</AsciiMath>
      <input
        class="w-11/12 mx-auto block"
        type="range" min="0" max="1" value="0" step="0.01"
        onInput={(e) => setPhase2(+e.currentTarget.value)} />
      <AsciiMath>{`s_2 = ${scale2().toFixed(1)}`}</AsciiMath>
      <input
        class="w-11/12 mx-auto block"
        type="range" min="0" max="1" value="0.5" step="0.01"
        onInput={(e) => setScale2(+e.currentTarget.value)} />
    </div>
  );
};

export default Editor;
