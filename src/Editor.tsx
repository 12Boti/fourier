import { Component, createSignal, createEffect, on } from 'solid-js';
import Plot from './Plot';
import { pb, userid, UserRecord, avatar } from './pocketbase';



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
  const points = () => linspace(-8, 8, 1000).map((x) => [x, Math.sin(x/Math.PI*frequency())]);
  createAsyncEffect([frequency], async () => {
    await pb.collection('users').update<UserRecord>(userid, { number: frequency() });
  });

  
  return (
    <div>
      <input
        class="w-full"
        type="range" min="0.1" max="10" value="1" step="0.1"
        onInput={(e) => setFrequency(+e.currentTarget.value)} />
      <Plot points={points} minX={-7.5} maxX={7.5} minY={-1.1} maxY={1.1} />
      <img src={avatar} class="w-xs h-xs"></img>
    </div>
  );
};

export default Editor;
