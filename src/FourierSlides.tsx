import AsciiMath from './AsciiMath';
import { PlotSvg } from './Svg';
import { Complex } from 'complex.js';

export const FourierSlides = () => {
  const wave = (freq: number) => (x: number) => Math.sin(x*freq/250);
  const sum = (...fs: ((x: number) => number)[]) => (x: number) => fs.map(f => f(x)).reduce((s, a) => s + a, 0);
  const Asin = wave(440);
  const Esin = wave(329.63);
  const EAsin = sum(Asin, Esin);
  const manysin = sum(Asin, Esin, wave(345), wave(549), wave(769));
  const manysin2 = sum(Asin, wave(115), wave(989), wave(220));

  return <>
    <section><h1>Fourier-transzformáció</h1></section>
    <section>
      <div class="absolute"> Ez itt:
      </div>
      <div class="grid-item"><AsciiMath>hat(g)(f) = int_-oo^oo g(t)e^(-i2pi f t)dt</AsciiMath>
      </div>
    </section>
    <section>
      <AsciiMath>f(x)=sinAx</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 5)} func={Asin} />
    </section>
    <section>
      <AsciiMath>f(x)=sinEx</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 5)} func={Esin} />
    </section>
    <section>
      <AsciiMath>f(x)=sinEx</AsciiMath>
      <div class="w-xl mx-auto">
        <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 2)} func={Esin} />
      </div>
      <AsciiMath>f(x)=sinAx</AsciiMath>
      <div class="w-xl mx-auto">
        <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 2)} func={Asin} />
      </div>
    </section>
    <section>
      <AsciiMath>f(x)=sinAx+sinEx</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -2)} max={Complex(14, 5)} func={EAsin} />
    </section>
    <section>
      <AsciiMath>f(x)="bonyi függvény"</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -4.5)} max={Complex(17, 6)} func={manysin} />
    </section>
    <section>
      <AsciiMath>f(x)="másik bonyi függvény"</AsciiMath>
      <PlotSvg xlabel="t" ylabel="Δ" min={Complex(-1.5, -4.5)} max={Complex(17, 6)} func={manysin2} />
    </section>
  </>;
}
