import {Complex} from 'complex.js';

export function dft(signal: Complex[]): Complex[] {
  const N = signal.length;
  return Array.from(
    Array(N),
    (_, k) =>
      signal.reduce(
        (acc, x, n) => acc.add(x.mul({abs: 1, arg: -2 * Math.PI * k * n / N})),
        Complex.ZERO,
      )
  );
}

export function dft_normalized(signal: Complex[]): Complex[] {
  return dft(signal).map(z => z.div(signal.length));
}
