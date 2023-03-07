/* @refresh reload */
import { render } from 'solid-js/web';
import 'virtual:uno.css'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'

//import './index.css';
import RevealJs from './RevealJs';
import Draw from './Draw'
import Editor from './Editor';

const isPrez = window.location.hash === "#prez"
const isDraw = window.location.hash === "#draw"


render(
  () => isPrez ? <RevealJs /> : isDraw ? <Draw /> : <Editor />,
  document.getElementById('root') as HTMLElement
);
