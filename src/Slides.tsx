import { Component, createSignal } from "solid-js";
import { createSequence } from './animation';
import JpgSlides from "./JpgSlides";
import { FourierSlides } from "./FourierSlides";
import { FftSlides } from "./FftSlides";

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

const Slides: Component = () => {
  const [x, setX] = createSignal(0);
  const anim = createSequence([
    {update: setX, from: 0,    to: 0.25, easing: easeOutQuad, duration: 2, delay: 1},
    {update: setX, from: 0.25, to: 1,    easing: easeOutQuad, duration: 2, delay: 1},
    {update: setX, from: 1,    to: 0.75, easing: easeOutQuad, duration: 2, delay: 1},
  ]);


  return <>
    <section />
    <FourierSlides />
    <FftSlides />
    <JpgSlides />
  </>;
};

export default Slides;
