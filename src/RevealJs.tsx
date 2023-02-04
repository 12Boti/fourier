import { Component, onMount, createSignal, onCleanup } from 'solid-js';
import Reveal from 'reveal.js'
import Slides from './Slides';

const RevealJs: Component = () => {
  let deck: Reveal.Api;

  onMount(async () => {
    document.getElementById("root")?.classList.add("reveal");
    deck = new Reveal();
    await deck.initialize({
      hideInactiveCursor: false, // it's bugged
    });
    deck.on('slidetransitionend', (event) => {
      const currentSlide: HTMLElement = event.currentSlide;
      currentSlide.dispatchEvent(new Event("reveal"));
    });
  });

  onCleanup(() => {
    deck.destroy();
  });


  return (
    <div class="slides">
      <Slides />
    </div>
  );
};

export default RevealJs;
