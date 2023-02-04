import * as colors from './colors';
import { Complex } from 'complex.js';
import { Component, JSX, splitProps } from 'solid-js';

export const Svg: Component<{children: JSX.Element, min: Complex, max: Complex}> = (props) => {
  const [p, other] = splitProps(props, ["children", "min", "max"]);
  return <svg viewBox={[p.min.re, -p.max.im, p.max.re-p.min.re, p.max.im-p.min.im].join(" ")} {...other}>
    {p.children}
  </svg>
};

export const Line: Component<{from: Complex, to: Complex}> = (props) =>
  <line
    x1={props.from.re} y1={-props.from.im} x2={props.to.re} y2={-props.to.im}
    stroke={colors.stroke} stroke-width="0.05"
  />;

export const Polygon: Component<{points: Complex[]}> = (props) =>
  <polygon
    points={props.points.map(p => `${p.re},${-p.im}`).join(" ")}
    fill={colors.stroke}
  />;

export const Polyline: Component<{points: Complex[]}> = (props) =>
  <polyline
    points={props.points.map(p => `${p.re},${-p.im}`).join(" ")}
    stroke={colors.stroke} stroke-width="0.05"
    fill='none'
  />;

export const Arrow: Component<{from: Complex, to: Complex}> = (props) => {
  let v = () => {
    const d = props.from.sub(props.to);
    return d.mul(0.1 / d.abs());
  };
  
  return <>
    <Line from={props.from} to={props.to.add(v())} />
    <Polygon points={[
      props.to,
      props.to.add(v().mul(2)).add(v().mul(Complex.I)),
      props.to.add(v().mul(2)).add(v().mul(Complex.I).neg())
    ]} />
  </>;
  // <foreignObject x={props.to.re*10} y={-props.to.im*10} width="100%" height="100%" transform="scale(0.1)" overflow="visible">
  //   <div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(0.1); height: 100%">{props.children}</div>
  // </foreignObject>
};
