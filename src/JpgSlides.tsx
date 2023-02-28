import { Svg } from "./Svg";
import pepeJpg from "../images/pepe.jpg";
import { Complex } from 'complex.js';
import { createSignal } from "solid-js";
import { createTween } from "@solid-primitives/tween";

const JpgSlides = () => {
    const [pos, setPos] = createSignal(Complex(0, 0));
    const [zoom, setZoom] = createSignal(1);

    const tweenedX = createTween(() => pos().re, {duration: 500});
    const tweenedY = createTween(() => pos().im, {duration: 500});
    const tweenedCenter = () => Complex(tweenedX(), tweenedY());
    const tweenedZoom = createTween(zoom, {duration: 500});
    

    return <>
        <section class="w-full h-full">
            <Svg
                min={tweenedCenter().sub(Complex(1, 1).div(tweenedZoom()))}
                max={tweenedCenter().add(Complex(1, 1).div(tweenedZoom()))}
                class="w-full h-full"
            >
                <image href={pepeJpg} x="-1" y="-1" width="2" height="2" />
            </Svg>
            <span class="fragment" data-fragment-index="0" on:reveal={() => {
                setPos(Complex(0, 0));
                setZoom(1);
            }} />
            <span class="fragment" data-fragment-index="1" on:reveal={() => {
                setPos(Complex(0, 0.1));
                setZoom(5);
            }} />
        </section>
    </>;
}

export default JpgSlides;
