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

export function normalized(signal: Complex[]): Complex[] {
  return signal.map(z => z.div(signal.length));
}

function ceilPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}




export function fft(signal: Complex[]): Complex[] {
  const fourier = signal.concat(Array(ceilPowerOfTwo(signal.length)-signal.length).fill(Complex.ZERO));
  const n = fourier.length;
  if (n === 1){
    return fourier;
  }
  const Po = fourier.filter((_, i) => i%2 === 1);
  const Pe = fourier.filter((_, i) => i%2 === 0);
  const ye = fft(Pe);
  const yo = fft(Po);
/*   return Array.from(
    Array(n/2),
    (_, j) =>
    yo[j].mul({abs: 1, arg: -Math.PI*2*j/n}).add(ye[j])
    ).concat(Array.from(
      Array(n/2),
      (_, j) =>
      yo[j].mul({abs: 1, arg: -Math.PI*2*j/n}).mul(-1).add(ye[j])
      )

    ).slice(0,signal.length); */
  const output: Complex[] = [];
  for (let k = 0; k < n / 2; k++) {
    const t = Complex({abs: 1, arg:-2 * Math.PI * k / n}).mul(yo[k]);
    output[k] = ye[k].add(t);
    output[k + n / 2] = ye[k].sub(t);
  } 
  return output;

}