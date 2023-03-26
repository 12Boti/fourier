import * as colors from './colors';
import { Complex } from 'complex.js';
import { Component, createContext, createSignal, JSX, onMount, splitProps, useContext } from 'solid-js';
import { linspace } from './Editor';

const SvgScaleContext = createContext<() => number>();

function getScale() {
  return useContext(SvgScaleContext) ?? (() =>{throw new Error("scale undefined")})();
}

export const Svg: Component<{children?: JSX.Element, min: Complex, max: Complex} & JSX.SvgSVGAttributes<SVGSVGElement>> = (props) => {
  const [p, other] = splitProps(props, ["children", "min", "max"]);
  let svg: SVGSVGElement;
  const [scale, setScale] = createSignal(1);
  const ro = new ResizeObserver(entries => {
    const m = svg.getCTM();
    setScale(m?.a || 1);
  });
  onMount(() => ro.observe(svg));

  return <svg ref={svg} viewBox={[p.min.re, -p.max.im, p.max.re-p.min.re, p.max.im-p.min.im].join(" ")} {...other}>
    <SvgScaleContext.Provider value={scale}>
      {p.children}
    </SvgScaleContext.Provider>
  </svg>;;
};

export const Line: Component<{from: Complex, to: Complex}> = (props) =>
  <line
    x1={props.from.re} y1={-props.from.im} x2={props.to.re} y2={-props.to.im}
    stroke={colors.stroke} stroke-width="5" vector-effect="non-scaling-stroke"
    {...props}
  />;

export const Polygon: Component<{points: Complex[]}> = (props) => {
  const [p, other] = splitProps(props, ["points"]);
  return <polygon
    points={p.points.map(a => `${a.re},${-a.im}`).join(" ")}
    fill={colors.stroke} {...other}
  />;
}

export const Polyline: Component<{points: Complex[]}> = (props) => {
  const [p, other] = splitProps(props, ["points"]);
  return <polyline
    points={p.points.map(a => `${a.re},${-a.im}`).join(" ")}
    stroke={colors.stroke} stroke-width="5" fill='none' vector-effect="non-scaling-stroke"
    {...other}
  />;
}

export const Arrow: Component<{from: Complex, to: Complex, color: string, headwidth?: number, headlength?: number}> = (props) => {
  const scale = getScale();
  let v = () => {
    const d = props.from.sub(props.to);
    let r = d.isZero() ? Complex(0, -1/scale()) : d.mul(20 / scale() / d.abs());
    return r.sign().mul(Math.min(r.abs(), d.abs()));
  };
  let polygon: SVGPolygonElement;
  
  return <>
    <Line from={props.from} to={props.to.add(v().mul(props.headlength ?? 1))} stroke={props.color} />
    <Polygon ref={polygon} points={[
      props.to,
      props.to.add(v().mul(props.headlength ?? 1).mul(2)).add(v().mul(props.headwidth ?? 1).mul(Complex.I)),
      props.to.add(v().mul(props.headlength ?? 1).mul(2)).add(v().mul(props.headwidth ?? 1).mul(Complex.I).neg())
    ]} fill={props.color} vector-effect="non-scaling-size" />
  </>;
};

export const Text: Component<{children: string, pos: Complex, size: number} & JSX.TextSVGAttributes<SVGTextElement>> = (props) => {
  const [p, other] = splitProps(props, ["children", "pos", "size"]);
  const scale = getScale();
  return <text
    x={p.pos.re} y={-p.pos.im}
    font-size={(p.size/scale()).toString()} vector-effect="non-scaling-stroke"
    {...other}
  >
    {p.children}
  </text>
}

export const Axes: Component<{
  xlabel: string, ylabel: string,
  min: Complex, max: Complex,
}> = (props) => {
  const p = props;
  const scale = getScale();
  return <>
    <Arrow from={Complex(p.min.re, 0)} to={Complex(p.max.re, 0)} color="#E04C1F"/>
    <Arrow from={Complex(0, p.min.im)} to={Complex(0, p.max.im)} color="#E04C1F" />
    <Text size={70} fill="#d02fa0" pos={Complex(p.max.re-20/scale(), 30/scale())} text-anchor="end">
      {p.xlabel}
    </Text>
    <Text size={70} fill="#d02fa0" pos={Complex(20/scale(), p.max.im-10/scale())} dominant-baseline="hanging">
      {p.ylabel}
    </Text>
  </>;
}

export const Plot: Component<{
  xlabel: string, ylabel: string,
  min: Complex, max: Complex,
  func: (x: number) => number,
  resolution?: number,
}> = (props) => {
  const p = props;
  const xs = linspace(p.min.re, p.max.re-0.5, p.resolution ?? 1000);
  return <>
    <Axes xlabel={p.xlabel} ylabel={p.ylabel} min={p.min} max={p.max} />
    <Polyline points={xs.map(x => Complex(x, p.func(x)))} />
  </>
}

export const PlotSvg: Component<{
  xlabel: string, ylabel: string,
  min: Complex, max: Complex,
  func: (x: number) => number,
  resolution?: number,
}> = (p) => {
  return <Svg min={p.min} max={p.max}>
    <Plot min={p.min} max={p.max} xlabel={p.xlabel} ylabel={p.ylabel} func={p.func} resolution={p.resolution} />
  </Svg>
}

export const Point: Component<{pos: Complex, color: string}> = (p) => {
  const scale = getScale();
  return <circle cx={p.pos.re} cy={-p.pos.im} r={5/scale()} fill={p.color} />
}
