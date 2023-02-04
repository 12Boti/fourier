import { Component, createSignal } from 'solid-js';
import Plot from './Plot';

function linspace(start: number, stop: number, num: number, endpoint = true) {
  const div = endpoint ? (num - 1) : num;
  const step = (stop - start) / div;
  return Array.from({length: num}, (_, i) => start + step * i);
}

const Editor: Component = () => {

  const [frequency, setFrequency] = createSignal(1);
  const points = () => linspace(-8, 8, 1000).map((x) => [x, Math.sin(x/Math.PI*frequency())]);

  return (
    <div>
      <input
        class="w-full"
        type="range" min="0.1" max="10" value="1" step="0.1"
        onInput={(e) => setFrequency(+e.currentTarget.value)} />
      <Plot points={points} minX={-7.5} maxX={7.5} minY={-1.1} maxY={1.1} />
    </div>
  );
};

export default Editor;
