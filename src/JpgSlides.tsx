import { Svg } from "./Svg";
import pepeJpg from "../images/pepe.jpg";
import textPng from "../images/text.png";
import lettersPng from "../images/letters.png";
import duck1 from "../images/duck1.jpg";
import { Complex } from 'complex.js';
import { createTweenedNumber, createTweenedComplex, TweenOpts, Animations } from "./animation";
import { Component, createEffect, createMemo, createResource, createSignal, For, JSX, onMount, Show, splitProps } from "solid-js";
import { linspace } from "./Editor";
import createTween from "@solid-primitives/tween";

const duck = await loadRgba(duck1);
const text = await loadRgba(textPng);
const textdata = Array.from(
    Array(8),
    (_, r) => Array.from(text.data).filter((_, i) => i%4 === 0).slice(160*(8+r)+24, 160*(8+r)+24+8).map(x => x/255*2-1)
);
const lettersdata = await loadRgba(lettersPng);
const letters = Array.from(
    Array(5),
    (_, i) => Array.from(
        Array(8),
        (_, r) => Array.from(lettersdata.data).filter((_, i) => i%4 === 0).slice(8*r + 8*8*i, 8*r + 8*8*i + 8).map(x => x/255*2-1)
    )
);


class RNG {
    private seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    shuffle<T>(a: T[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
    }
}


const RgbaImage: Component<
{pixels: Uint8ClampedArray, width: number, height: number}
& JSX.CanvasHTMLAttributes<HTMLCanvasElement>
> = (props) => {
    const [p, other] = splitProps(props, ["pixels", "width", "height"]);
    const canvas: HTMLCanvasElement = <canvas width={p.width} height={p.height} class="w-xs image-render-pixel" {...other}></canvas>;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    createEffect(() => {
        const imageData = new ImageData(p.pixels, p.width, p.height);
        ctx.putImageData(imageData, 0, 0);
    });
    return canvas;
}

function toRgba(signal: number[]): Uint8ClampedArray {
    const arr = new Uint8ClampedArray(signal.length*4);
    // Fill the array with RGBA values
    for (let i = 0; i < signal.length; i += 1) {
        const v = (signal[i]+1)/2*255;
        arr[i*4 + 0] = v;
        arr[i*4 + 1] = v;
        arr[i*4 + 2] = v;
        arr[i*4 + 3] = 255;
    }
    return arr;
}

const PixelImage: Component<
    {pixels: number[], width: number, height: number}
    & JSX.CanvasHTMLAttributes<HTMLCanvasElement>
> = (props) => {
    const [p, other] = splitProps(props, ["pixels"]);
    return <RgbaImage pixels={toRgba(p.pixels)} {...other} />;
}

// returns [RGBA, width, height]
async function loadRgba(url: string): Promise<ImageData> {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    return imageData;
}

function repeat<T>(times: number, arr: T[]): T[] {
    return [].concat(...Array(times).fill(arr));
}

function cartesian<L extends number, T>(...a: T[][] & {length: L}): (T[] & {length: L})[] {
    return a.reduce<T[][]>((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
}

function transpose<T>(array: T[][]): T[][] {
    return array[0].map((_, colIndex) => array.map(row => row[colIndex]));
}

function multiply(as: Uint8ClampedArray, bs: number[]): Uint8ClampedArray {
    const arr = new Uint8ClampedArray(as.length);
    for (let i = 0; i < bs.length; i += 1) {
        const v = bs[i];
        arr[i*4 + 0] = as[i*4 + 0] * v;
        arr[i*4 + 1] = as[i*4 + 1] * v;
        arr[i*4 + 2] = as[i*4 + 2] * v;
        arr[i*4 + 3] = as[i*4 + 3];
    }
    return arr;
}

// https://en.wikipedia.org/wiki/Discrete_cosine_transform#DCT-II
function dct(signal: number[]): number[] {
    const N = signal.length;
    return Array.from(
        Array(N),
        (_, k) =>
            signal.reduce(
                (acc, x, n) => acc + x*Math.cos(Math.PI/N*(n + 0.5)*k),
                0,
            )
    ).map(x => x/N);
}

// https://en.wikipedia.org/wiki/Discrete_cosine_transform#DCT-III
function invdct(signal: number[]): number[] {
    const N = signal.length;
    return Array.from(
        Array(N),
        (_, k) =>
            signal.slice(1).reduce(
                (acc, x, n) => acc + x*Math.cos(Math.PI/N*(k + 0.5)*(n+1)),
                signal[0]/2,
            )
    ).map(x => x*2);;
}

function dct2d(signal: number[][]): number[][] {
    return transpose(transpose(signal.map(dct)).map(dct));
}

function invdct2d(signal: number[][]): number[][] {
    return transpose(transpose(signal).map(invdct)).map(invdct);
}

const Pepe = () => {
    const [pos, setPos] = createTweenedComplex(Complex(0, 0), {duration: 500});
    const [zoom, setZoom] = createTweenedNumber(1, {duration: 500});
    return <section class="w-full h-full">
        <Svg
            min={pos().sub(Complex(1, 1).div(zoom()))}
            max={pos().add(Complex(1, 1).div(zoom()))}
            class="w-full h-full"
        >
            <image href={pepeJpg} x="-1" y="-1" width="2" height="2" class="image-render-pixel" />
        </Svg>

        <Animations>{[
            () => { setPos(Complex(0, 0));   setZoom(1); },
            () => { setPos(Complex(0, 0.1)); setZoom(5); },
        ]}</Animations>
    </section>;
}

const Freqs = () => {
    const frowvals: (() => number)[] = [];
    const setfrowvals: ((v: number) => void)[] = [];
    for (let i = 0; i < 8; i++) {
        const [get, set] = createTweenedNumber(0, {duration: 500});
        frowvals.push(get);
        setfrowvals.push(set);
    }
    const frow = () => frowvals.map(x => x());
    const setfrow = (vs: number[]) => vs.map((v, i) => setfrowvals[i](v));
    const row = () => invdct(frow());


    return <>
        <section>
        <div class="grid grid-cols-8 w-full">
            <For each={frow()}>{px =>
                <div>{px.toFixed(1)}</div>
            }</For>
            <For each={row()}>{px =>
                <PixelImage
                    width={1} height={1}
                    pixels={[px]} class="w-full" />
            }</For>
        </div>
        <Animations>{[
            () => setfrow([ 0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([-0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([ 0.7,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([ 0.0,  0.4,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([ 0.0, -0.4,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([ 0.0, -0.2,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([ 0.0,  0.0,  0.3,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([ 0.0,  0.0,  0.0,  0.4,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([ 0.0,  0.0,  0.0,  0.0,  0.5,  0.0,  0.0,  0.0]),
            () => setfrow([ 0.0,  0.0,  0.0,  0.0,  0.0,  0.6,  0.0,  0.0]),
            () => setfrow([ 0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.7,  0.0]),
            () => setfrow([ 0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.8]),
            () => setfrow([ 0.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([-0.3,  0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]),
            () => setfrow([-0.3,  0.5,  0.0,  0.0,  0.0,  0.0,  0.6,  0.0]),
        ]}</Animations>
        </section>
    </>
};

const Freqs2 = () => {
    const frows = textdata.map(row => dct(row));
    const frow_overlay: (() => number)[][] = [];
    const set_frow_overlay: ((v: number) => void)[][]  = [];
    for (let r = 0; r < 8; r++) {
        const x = [];
        const y = [];
        for (let c = 0; c < 8; c++) {
            const [get, set] = createTweenedNumber(0, {duration: 500});
            x.push(get);
            y.push(set);
        }
        frow_overlay.push(x);
        set_frow_overlay.push(y);
    }
    const overlayed_frows = () => frows.map((r, ri) => r.map((c, ci) => c + frow_overlay[ri][ci]()));
    const overlayed_rows = () => overlayed_frows().map(invdct);

    return <>
        <section>
        <div class="flex justify-center gap-8">
        <PixelImage
            width={8} height={8}
            pixels={overlayed_rows().flat()} class="w-md image-render-pixel" />
        
        <PixelImage
            width={8} height={8}
            pixels={overlayed_frows().flat()} class="w-md image-render-pixel" />
        </div>

        <Animations>{[
            () => {set_frow_overlay[2][0](0)},
            () => {set_frow_overlay[2][0](0.5); set_frow_overlay[6][7](0)},
            () => {set_frow_overlay[6][7](-0.5)},
        ]}</Animations>
        </section>
    </>
}

function createTweened2d(value: number[][], opts: TweenOpts): [() => number[][], (v: number[][]) => void, () => number[][]] {
    const [v, setv] = createSignal(value);
    const tweens = value.map((r, ri) => r.map((_, ci) => createTween(() => v()[ri][ci], opts)));
    return [() => tweens.map(r => r.map(c => c())), setv, v];
}

const Freqs2d = () => {
    const textfreq = dct2d(textdata);
    const [freq, setfreq, freqtarget] = createTweened2d(textfreq, {duration: 500});
    const data = () => invdct2d(freq());
    const zeros = Array.from(Array(8), () => Array(8).fill(0));
    const s = (...vs: [number, number, number][]) => {
        const t = zeros.map(x => x.slice());
        for (const [r, c, v] of vs) {
            t[r][c] = v;
        }
        setfreq(t);
    };
    const reveal = (img: number[][], steps: number = 10, m: number = 2) => {
        const freqs = dct2d(img).flatMap((r, ri) => r.map((f, ci) => ({ri, ci, f})));
        freqs.sort(({f: a}, {f: b}) => Math.abs(b) - Math.abs(a));
        return Array.from(
            Array(steps+1),
            (_, i) => () => s(...freqs.slice(0, i*m).map<[number, number, number]>(({ri, ci, f}) => [ri, ci, f]))
        );
    };

    return <>
        <section>
        <div class="flex justify-center gap-8">
        <PixelImage
            width={8} height={8}
            pixels={data().flat()} class="w-md image-render-pixel" />
        
        <PixelImage
            width={8} height={8}
            pixels={freq().flat()} class="w-md image-render-pixel" />
        </div>
        <Animations>{[
            () => setfreq(textfreq),
            () => setfreq(zeros),
            () => s([0, 0, 0.7]),
            () => s([0, 1, 0.7]),
            () => s([0, 2, 0.7]),
            () => s([0, 3, 0.7]),
            () => s([0, 4, 0.7]),
            () => s([0, 5, 0.7]),
            () => s([0, 6, 0.7]),
            () => s([0, 7, 0.7]),
            () => s([0, 0, 0.7]),
            () => s([1, 0, 0.7]),
            () => s([2, 0, 0.7]),
            () => s([3, 0, 0.7]),
            () => s([4, 0, 0.7]),
            () => s([5, 0, 0.7]),
            () => s([6, 0, 0.7]),
            () => s([7, 0, 0.7]),
            () => s([1, 1, 0.4]),
            () => s([1, 2, 0.4]),
            () => s([1, 3, 0.4]),
            () => s([1, 4, 0.4]),
            () => s([1, 5, 0.4]),
            () => s([2, 5, 0.4]),
            () => s([3, 5, 0.4]),
            () => s([4, 5, 0.4]),
            () => s([5, 5, 0.4]),
            () => s([5, 5, 0.4], [0, 0, -0.4]),
            () => s([5, 5, 0.4], [0, 0, -0.4], [0, 1, -0.4]),
            () => setfreq(textfreq),
            () => setfreq(dct2d(letters[0])),
            ...reveal(letters[0]),
            ...reveal(letters[1]),
            ...reveal(letters[2]),
            ...reveal(letters[3]),
            ...reveal(letters[4]),
        ]}</Animations>
        </section>
    </>
}

const JpgSlides: Component = () => <>
    <Pepe/>
    {() => {
        const [fragidx, setFragidx] = createSignal(0);
        return <section class="w-full h-full">
            <Svg
                min={Complex(0, 0)}
                max={Complex(160, 16)}
                class="w-full h-full"
            >
                <image href={textPng} x="0" y="0" class="image-render-pixel" />
                <Show when={fragidx() > 0}>
                    <For each={linspace(0, 152, 20)}>{x => <>
                        <rect x={x} y="0" width="8" height="8" fill="none" stroke="#ff9900" />
                        <rect x={x} y="8" width="8" height="8" fill="none" stroke="#ff9900" />
                    </>}</For>
                </Show>
                <Show when={fragidx() > 1}>
                    <rect x="24" y="8" width="8" height="8" fill="none" stroke="#ff3300" />
                </Show>
            </Svg>
            <Animations>{[
                () => setFragidx(0),
                () => setFragidx(1),
                () => setFragidx(2),
            ]}</Animations>
        </section>;
    }}
    <section class="w-full h-full">
        <div class="h-full aspect-square mx-auto">
            <Svg
                min={Complex(24, 0)}
                max={Complex(32, 8)}
                class="w-full h-full"
            >
                <image href={textPng} x="0" y="-16" width="160" height="16" class="image-render-pixel" />
            </Svg>
        </div>
    </section>
    {() => {
        const range = linspace(0, 2*Math.PI, 8);
        const range2d = cartesian(range, range);
        const bigrange = linspace(0, 40*Math.PI, 160);
        const bigrange2d = cartesian(bigrange, bigrange);
        const lofr = ([x, y]: number[]) => (Math.cos(x*0.5) + Math.cos(y*0.5))*0.3;
        const hifr = ([x, y]: number[]) => (Math.cos(x*4) + Math.cos(y*4))*0.3;


        return <>
            <section>
                <div>
                    <PixelImage
                        width={8} height={8}
                        pixels={range2d.map(lofr)} />
                    <PixelImage
                        width={8} height={8}
                        pixels={range2d.map(hifr)} />
                    <PixelImage
                        width={1} height={1}
                        pixels={[0]} />
                </div>
            </section>
            <section>
                <div>
                    <PixelImage
                        width={160} height={160}
                        pixels={bigrange2d.map(lofr)} />
                    <PixelImage
                        width={160} height={160}
                        pixels={bigrange2d.map(hifr)} />
                    <PixelImage
                        width={1} height={1}
                        pixels={[0]} />
                </div>
            </section>
            <section>
                <div>
                    <Show when={duck} keyed>{d => <>
                        <RgbaImage
                            width={160} height={160}
                            pixels={multiply(d.data, bigrange2d.map(lofr).map(x => x*1.5+1))} />
                        <RgbaImage
                            width={160} height={160}
                            pixels={multiply(d.data, bigrange2d.map(hifr).map(x => x*1.5+1))} />
                        <RgbaImage
                            width={160} height={160}
                            pixels={d.data} />
                    </>}</Show>
                </div>
            </section>
        </>
    }}
    {() => {
        const row = () => textdata[0];
        const frow = () => dct(row());
        const [fragidx, setFragidx] = createSignal(0);


        return <>
            <section>
            <div class="grid grid-cols-8 w-full">
                <For each={row()}>{px =>
                    <PixelImage
                        width={1} height={1}
                        pixels={[px]} class="w-full" />
                }</For>
                <Show when={fragidx() >= 1}>
                    <For each={row()}>{px =>
                        <div>{px.toFixed(2)}</div>
                    }</For>
                </Show>
                <Show when={fragidx() >= 2}>
                    <div class="col-span-full">⇓</div>
                    <For each={frow()}>{px =>
                        <div>{px.toFixed(2)}</div>
                    }</For>
                </Show>
            </div>
            <Animations>{[
                () => setFragidx(0),
                () => setFragidx(1),
                () => setFragidx(2),
            ]}</Animations>
            </section>
        </>
    }}
    <Freqs />
    <Freqs2 />
    <Freqs2d />
</>;

export default JpgSlides;
