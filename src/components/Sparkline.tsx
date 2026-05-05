import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";

import { colors } from "../app/theme";

interface Props {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  yMin?: number;
  yMax?: number;
}

export const Sparkline: React.FC<Props> = ({
  values,
  width = 280,
  height = 80,
  color = colors.accent,
  fill = true,
  yMin,
  yMax,
}) => {
  if (!values.length) {
    return <View style={{ width, height }} />;
  }
  const min = yMin ?? Math.min(...values);
  const max = yMax ?? Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const fillD =
    points.length > 1
      ? `${d} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`
      : "";

  return (
    <Svg width={width} height={height}>
      <Line x1={0} y1={height - 4} x2={width} y2={height - 4} stroke={colors.border} strokeWidth={1} />
      {fill && fillD ? <Path d={fillD} fill={color + "22"} /> : null}
      <Path d={d} stroke={color} strokeWidth={2} fill="none" />
      {points.length > 0 ? (
        <Circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={3}
          fill={color}
        />
      ) : null}
    </Svg>
  );
};

export const Bars: React.FC<{
  values: { label: string; value: number; color?: string }[];
  height?: number;
}> = ({ values, height = 100 }) => {
  const max = Math.max(...values.map((v) => v.value), 1);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height }}>
      {values.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              width: "100%",
              height: (v.value / max) * (height - 20),
              backgroundColor: v.color ?? colors.accent,
              borderRadius: 4,
              minHeight: 2,
            }}
          />
        </View>
      ))}
    </View>
  );
};
