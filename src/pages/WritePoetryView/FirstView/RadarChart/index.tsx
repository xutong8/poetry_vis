import { useElementSize } from '@/hooks/useElementSize';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { curveCardinalClosed, lineRadial } from 'd3-shape';
import { range } from 'lodash';
import React, { useMemo, useRef } from 'react';
import './index.less';

export interface IItem {
  axis: string;
  value: number;
}

const RadarChart: React.FC<any> = () => {
  const data = [
    // 蓝色
    [
      { axis: '思念远方', value: 0.22 },
      { axis: '军旅悲壮', value: 0.4 },
      { axis: '离别不舍', value: 0.5 }
    ],
    // 红色
    [
      { axis: '思念远方', value: 0.25 },
      { axis: '军旅悲壮', value: 0.42 },
      { axis: '离别不舍', value: 0.67 }
    ]
  ];

  // container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // calculate container size
  const [svgWidth, svgHeight] = useElementSize(containerRef);

  // color scale
  const color = scaleOrdinal<number, string>()
    .domain([0, 1])
    .range(['rgb(0, 160, 176)', 'rgb(204, 51, 63)']);

  // 所有的坐标轴
  const allAxis = data[0].map((item) => item.axis);
  // 坐标轴的数量
  const axisTotal = allAxis.length;
  // 半径
  const radius = Math.floor(Math.min(svgWidth / 2, svgHeight / 2) - 35);
  // 角度切片
  const angleSlice = (Math.PI * 2) / axisTotal;

  // r scale
  const rScale = scaleLinear().range([0, radius]).domain([0, 1]);

  // levels
  const levels = 4;

  // generate radar line
  const radarLine = lineRadial()
    .curve(curveCardinalClosed)
    .radius((d: any) => rScale(d.value))
    .angle((d: any, i: number) => i * angleSlice);

  return (
    <div className="radar_chart_container" ref={containerRef}>
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <g transform={`translate(${svgWidth / 2}, ${svgHeight / 2})`}>
          {/* 模糊 */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"></feGaussianBlur>
              <feMerge>
                <feMergeNode in="coloredBlur"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
          </defs>
          {/* 生成axis */}
          <g className="axisWrapper">
            {range(1, levels + 1).map((level) => (
              <circle
                key={level}
                // radius必须要大于0，如果小于会有warning
                r={radius > 0 ? (radius / levels) * level : 0}
                fill="#CDCDCD"
                stroke="#CDCDCD"
                fillOpacity="0.1"
                filter="url(#glow)"
              />
            ))}
          </g>
          {/* 生成axis的线 */}
          {allAxis.map((axis: string, index: number) => (
            <g key={axis} className="axis">
              <line
                x1="0"
                y1="0"
                x2={rScale(1) * Math.cos(angleSlice * index - Math.PI / 2)}
                y2={rScale(1) * Math.sin(angleSlice * index - Math.PI / 2)}
                className="line"
                stroke="white"
                strokeWidth="2"
              />
              <text
                className="legend"
                textAnchor="middle"
                x={rScale(1.25) * Math.cos(angleSlice * index - Math.PI / 2)}
                y={rScale(1.25) * Math.sin(angleSlice * index - Math.PI / 2)}
              >
                {axis}
              </text>
            </g>
          ))}
          {data.map((group: IItem[], groupIndex: number) => (
            <g className="radarWrapper" key={groupIndex}>
              <path
                className="radarArea"
                d={radarLine(group as any) as any}
                fill={color(groupIndex)}
                fillOpacity="0.35"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export { RadarChart };
