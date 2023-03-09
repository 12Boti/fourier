import { Svg } from "./Svg";
import pepeJpg from "../images/pepe.jpg";
import { Complex } from 'complex.js';
import { createSignal } from "solid-js";
import { createTween } from "@solid-primitives/tween";
import { createTweenedNumber, createTweenedComplex } from "./animation";

const JpgSlides = () => {
    const [pos, setPos] = createTweenedComplex(Complex(0, 0), {duration: 500});
    const [zoom, setZoom] = createTweenedNumber(1, {duration: 500});

    return <>
        <section class="w-full h-full">
            <Svg
                min={pos().sub(Complex(1, 1).div(zoom()))}
                max={pos().add(Complex(1, 1).div(zoom()))}
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
