import { batch } from "solid-js";

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

export { createAnimation, createSequence };

/*

const a1 = createAnimation({update: setVal, from: 10, to: 100, duration: 0.5, delay: 0.1});

const a2 = createSequence([
    {update: setVal1, from: 10, to: 100, duration: 0.5},
    {update: setVal2, from: 20, to: 200, duration: 0.5, delay: 0.2},
    {update: setVal3, from: 30, to: 300, duration: 0.5, delay: -0.1},
]);

*/
