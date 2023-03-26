import Complex from "complex.js";
import { batch, Component, createEffect, createSignal, For, on, onCleanup } from "solid-js";

let globalTime: number;

interface RegisteredAnimation {
    startTime: number;
    endTime: number;
    update: (frac: number) => void;
}

const registeredAnimations = new Map<Symbol, RegisteredAnimation>();

function tick(t: number) {
    t /= 1000;
    globalTime = t;
    batch(() => 
        registeredAnimations.forEach((a, k) => {
            let frac = (t-a.startTime)/(a.endTime-a.startTime);
            if (frac < 0) {
                //a.update(0);
            } else if (frac > 1) {
                a.update(1);
                registeredAnimations.delete(k);
            } else {
                a.update(frac);
            }
        })
    );

    requestAnimationFrame(tick);
}

tick(performance.now());

interface Animation {
    start: () => void;
    // stop: () => void;
}

interface AnimationOptions {
    update: (value: number) => void;
    from?: number,
    to: number,
    duration: number,
    delay?: number,
    easing?: (x: number) => number;
}

function createAnimation(options: AnimationOptions): Animation {
    const key = Symbol();
    const delay = options.delay ?? 0;
    const from = options.from ?? 0;
    const easing = options.easing ?? ((x) => x);
    const start = () =>
        registeredAnimations.set(key, {
            startTime: globalTime + delay,
            endTime: globalTime + delay + options.duration,
            update: (frac) => options.update(easing(frac)*(options.to - from) + from),
        });
    return {start};
}

function createSequence(options: (AnimationOptions)[]): Animation {
    let delay = 0;
    const anims = options.map((options) => {
        delay += options.delay ?? 0;
        const a = createAnimation({...options, delay: delay});
        delay += options.duration;
        return a;
    });
    return {
        start: () => anims.forEach((a) => a.start()),
    };
}

export interface TweenOpts {
    ease?: ((t: number) => number);
    duration?: number;
}

export function createTween(
    target: () => number,
    { ease = (t: number) => 1 - (1 - t) * (1 - t), duration = 100 },
): () => number {
    const [start, setStart] = createSignal<[number, number]>([document.timeline.currentTime ?? 0, target()]);
    const [current, setCurrent] = createSignal(target());
    let lastTarget = target();
    createEffect(on(target, () => {
        setStart([document.timeline.currentTime ?? 0, lastTarget]);
        lastTarget = target();
    }, { defer: true }));
    createEffect(on([start, current], () => {
        const cancelId = requestAnimationFrame(t => {
            const [startTime, startVal] = start();
            const elapsed = t - startTime;
            // @ts-ignore
            setCurrent(
                elapsed < duration
                    ? (target() - startVal) * ease(elapsed / duration) + startVal
                    : target()
            );
        });
        onCleanup(() => cancelAnimationFrame(cancelId));
    }));
    return current;
}

function createTweenedNumber(value: number, opts: TweenOpts): [() => number, (v: number) => void, () => number] {
    const [v, setv] = createSignal(value, {equals: () => false});
    const tweenedv = createTween(v, opts);
    return [tweenedv, setv, v];
}

function createTweenedComplex(value: Complex, opts: TweenOpts): [() => Complex, (v: Complex) => void, () => Complex] {
    const [v, setv] = createSignal(value, {equals: () => false});
    const tweenedre = createTween(() => v().re, opts);
    const tweenedim = createTween(() => v().im, opts);
    return [() => Complex(tweenedre(), tweenedim()), setv, v];
}

export const Animations: Component<{children: (() => void)[]}> = (props) => <For each={props.children}>{callback =>
    <span class="fragment" on:reveal={callback} />
}</For>

export { createAnimation, createSequence, createTweenedNumber, createTweenedComplex };

/*

const a1 = createAnimation({update: setVal, from: 10, to: 100, duration: 0.5, delay: 0.1});

const a2 = createSequence([
    {update: setVal1, from: 10, to: 100, duration: 0.5},
    {update: setVal2, from: 20, to: 200, duration: 0.5, delay: 0.2},
    {update: setVal3, from: 30, to: 300, duration: 0.5, delay: -0.1},
]);

*/
