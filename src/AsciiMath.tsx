import { Component, createEffect, splitProps } from 'solid-js';
import katex from 'katex';
import 'katex/dist/katex.css'
import AsciiMathParser from 'asciimath2tex';

const asciiMathParser = new AsciiMathParser();

const AsciiMath: Component<{children: string}> = (props) => {
  const [p, other] = splitProps(props, ["children"]);
  const div =   <div {...other}/>;
  createEffect(() => {
    katex.render(asciiMathParser.parse(props.children), div, {displayMode: true});
  });
  return div;
};

export default AsciiMath;
