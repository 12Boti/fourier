import {Complex} from 'complex.js';

export function dft(signal: Complex[]) {
  const X = [];
  const N = signal.length;
  for (let k = 0; k < N; k++) {
    let sum = new Complex(0, 0);
    for (let n = 0; n < N; n++) {
      const phi = (2*Math.PI * k * n) / N;
      const c = new Complex(Math.cos(phi), -Math.sin(phi));
      sum = sum.add(signal[n].mul(c));
    }
    sum.re = sum.re / N;
    sum.im = sum.im / N;
    X[k] = {z: new Complex(sum.re, sum.im), freq: k};
  }
  return X;
}
