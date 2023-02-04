import * as colors from './colors';

interface Props {
  points: () => number[][];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const Plot = (props: Props) => {
  const viewBox = [props.minX, -props.maxY, props.maxX-props.minX, props.maxY-props.minY];
  return (
    <svg viewBox={viewBox.join(" ")}>
      <polyline
        stroke={colors.stroke} stroke-width="0.1" fill="none"
        points={props.points().map(([x, y]) => `${x} ${-y}`).join(",")} />
    </svg>
  );
};
  
export default Plot;
