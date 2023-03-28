import * as colors from './colors';
import { Complex } from 'complex.js';
import { Component, createContext, createSignal, For, JSX, onMount, splitProps, useContext } from 'solid-js';
import { linspace } from './Editor';

const SvgScaleContext = createContext<() => number>();

function turnToSubscript(numString: string): string { //This was the easiast way. I am truly sorry
  const subscriptDigits = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  let subscriptString = "";
  for (let i = 0; i < numString.length; i++) {
    let digit = parseInt(numString[i]);
    subscriptString += subscriptDigits[digit];
  }
  return subscriptString;
}


function getScale() {
  return useContext(SvgScaleContext) ?? (() =>{throw new Error("scale undefined")})();
}

export const Svg: Component<{children?: JSX.Element, min: Complex, max: Complex} & JSX.SvgSVGAttributes<SVGSVGElement>> = (props) => {
  const [p, other] = splitProps(props, ["children", "min", "max"]);
  let svg: SVGSVGElement;
  const [scale, setScale] = createSignal(1);
  const ro = new ResizeObserver(entries => {
    const m = svg.getCTM();
    setScale((m?.a || 1)*1.5);
  });
  onMount(() => ro.observe(svg));

  return <svg ref={svg} viewBox={[p.min.re, -p.max.im, p.max.re-p.min.re, p.max.im-p.min.im].join(" ")} {...other}>
    <SvgScaleContext.Provider value={scale}>
      {p.children}
    </SvgScaleContext.Provider>
  </svg>;;
};

export const Line: Component<{from: Complex, to: Complex, color?: string, width?: string}> = (props) =>
  <line
    x1={props.from.re} y1={-props.from.im} x2={props.to.re} y2={-props.to.im}
    stroke={props.color ?? colors.stroke} stroke-width={props.width ?? "5"} vector-effect="non-scaling-stroke"
    {...props}
  />;

export const Polygon: Component<{points: Complex[]}> = (props) => {
  const [p, other] = splitProps(props, ["points"]);
  return <polygon
    points={p.points.map(a => `${a.re},${-a.im}`).join(" ")}
    fill={colors.stroke} {...other}
  />;
}

export const Polyline: Component<{points: Complex[], opacity?: number}> = (props) => {
  const [p, other] = splitProps(props, ["points", "opacity"]);
  return <polyline
    points={p.points.map(a => `${a.re},${-a.im}`).join(" ")}
    stroke={colors.stroke} stroke-width="5" fill='none' vector-effect="non-scaling-stroke" stroke-opacity={p.opacity ?? "1"}
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

export const Text: Component<{children: string, pos: Complex, size: number, opacity?: number} & JSX.TextSVGAttributes<SVGTextElement>> = (props) => {
  const [p, other] = splitProps(props, ["children", "pos", "size", "opacity"]);
  const scale = getScale();
  return <text
    x={p.pos.re} y={-p.pos.im}
    font-size={(p.size/scale()).toString()} vector-effect="non-scaling-stroke"
    opacity={p.opacity ?? 1}
    {...other}
  >
    {p.children}
  </text>
}

export const Units: Component<{
  min: Complex, max: Complex,
  units: number,
}> = (props) => {
  
  const units = linspace(props.min.re, props.max.re-0.5, props.units);
  return <>
  <For each={units ?? []}>
  {(a, i) => <>
  <Line from={Complex(a, 0.2)} to={Complex(a, -0.2)} color="#E04C1F" width='3'/>
  <Text pos={Complex(a, -0.4)} size={20} fill={"#59c729"} text-anchor='middle'>
    {"X".concat(turnToSubscript(i().toString()))}</Text>
  </>}
  </For>

</>;
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
  xUnits?: number,
  resolution?: number,
  graphOpacity?: number,
}> = (props) => {
  const p = props;
  const xs = linspace(p.min.re, p.max.re-0.5, p.resolution ?? 1000);
  return <>
    <Axes xlabel={p.xlabel} ylabel={p.ylabel} min={p.min} max={p.max} />
    {p.xUnits != null ? <Units min={Complex(p.min.re, 0)} max={Complex(p.max.re, 0)} units={p.xUnits}></Units> : ""}
    <Polyline points={xs.map(x => Complex(x, p.func(x)))} opacity={p.graphOpacity ?? 1} />
  </>
}

export const PlotSvg: Component<{
  xlabel: string, ylabel: string,
  min: Complex, max: Complex,
  func: (x: number) => number,
  resolution?: number,
  graphOpacity?: number,
}> = (p) => {
  return <Svg min={p.min} max={p.max}>
    <Plot min={p.min} max={p.max} xlabel={p.xlabel} ylabel={p.ylabel} func={p.func} resolution={p.resolution} graphOpacity={p.graphOpacity ?? 1}/>
  </Svg>
}

export const Point: Component<{pos: Complex, color: string, opacity?: number, label?: string,}> = (p) => {
  const scale = getScale();
  return <><circle cx={p.pos.re} cy={-p.pos.im} r={5 / scale()} fill={p.color} fill-opacity={p.opacity ?? 1} /> <Text 
    size={28} fill={p.color} pos={Complex(p.pos.re + 5/scale(), p.pos.im + 8/scale())} opacity={p.opacity}>
    {p.label ?? ""}
  </Text></>
}

export const Points: Component<{
  min: Complex, max: Complex, 
  func: (x: number) => number,
  labelSymbol: string,
  resolution?: number,
  pointOpacity?: number,
}> = (p) => {
  const symbol = p.labelSymbol == null ? "" : p.labelSymbol;
  const xs = linspace(p.min.re, p.max.re-0.5, p.resolution ?? 1000).map((x) => Complex(x, p.func(x)));
  return <For each={xs}>
    {(a, i) => <>
      <Point pos={a} color={"#d4ea10"} opacity={p.pointOpacity ?? 1} 
      label={symbol != "" ? symbol.concat(turnToSubscript(i().toString())) : ""}/>
    </>}
  </For>
}