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

  createAsyncEffect([frequency, phase], async () => {
    await pb.collection('users').update<UserRecord>(userid, {
      frequency: frequency(),
      phase: phase(),
    });
  });

  
  return (
    <div class="text-light-500">
      <img src={avatar} class="w-20 h-20 mx-auto mb-10 pt-2 block"></img>
      <Svg min={Complex(-3, -2)} max={Complex(3, 2)}>
        <For each={linspace(-2, 2, 5)}>{x => <>
          <Line from={Complex(x, -0.2)} to={Complex(x, 0.2)} stroke="#E04C1F" />
        </>}</For>
        <Plot
          func={x => Math.sin((x*frequency() + phase())*Math.PI*2)}
          min={Complex(-3, -2)} max={Complex(3, 2)}
          xlabel="" ylabel="" />
      </Svg>
      <AsciiMath>{`f = ${frequency().toFixed(1)}`}</AsciiMath>
      <input
        class="w-11/12 mx-auto block"
        type="range" min="0.1" max="3" value="1" step="0.1"
        onInput={(e) => setFrequency(+e.currentTarget.value)} />
      <AsciiMath>{`theta = ${phase().toFixed(1)}`}</AsciiMath>
      <input
        class="w-11/12 mx-auto block"
        type="range" min="0" max="1" value="0" step="0.1"
        onInput={(e) => setPhase(+e.currentTarget.value)} />
    </div>
  );
};

export default Editor;
