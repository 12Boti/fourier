/* @refresh reload */
import { render } from 'solid-js/web';
import 'virtual:uno.css'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'

//import './index.css';
import RevealJs from './RevealJs';
import Editor from './Editor';

const isPrez = window.location.hash === "#prez"

render(
  () => isPrez ? <RevealJs /> : <Editor />,
  document.getElementById('root') as HTMLElement
);
