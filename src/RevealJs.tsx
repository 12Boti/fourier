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
      center: false,
      respondToHashChanges: false,
    });
    deck.on('slidetransitionend', (event) => {
      const currentSlide: HTMLElement = event.currentSlide;
      currentSlide.dispatchEvent(new Event("reveal"));
      deck.nextFragment();
    });
    deck.on('fragmentshown', (event) => {
      const currentFragment: HTMLElement = event.fragment;
      currentFragment.dispatchEvent(new Event("reveal"));
    });
    deck.on('fragmenthidden', (event) => {
      const currentFragment: HTMLElement = document.querySelector(".current-fragment");
      if (currentFragment) {
        currentFragment.dispatchEvent(new Event("reveal"));
      } else {
        deck.prev();
      }
    });
  });

  onCleanup(() => {
    deck?.destroy();
  });


  return (
    <div class="slides">
      <Slides />
    </div>
  );
};

export default RevealJs;
