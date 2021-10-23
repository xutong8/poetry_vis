import { useElementSize } from '@/hooks/useElementSize';
import { drag } from 'd3-drag';
import { easeLinear } from 'd3-ease';
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { select } from 'd3-selection';
import { curveCardinalClosed, lineRadial } from 'd3-shape';
import { transition } from 'd3-transition';
import { range } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';

export interface IItem {
  axis: string;
  value: number;
}

export interface IRadarChartProps {
  radarDataSource: IItem[][];
  setRadarDataSource: (radarDataSource: IItem[][]) => void;
}

const RadarChart: React.FC<IRadarChartProps> = (props) => {
  const { radarDataSource, setRadarDataSource } = props;

  // container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // calculate container size
  const [svgWidth, svgHeight] = useElementSize(containerRef);

  // color scale
  const color = scaleOrdinal<number, string>()
    .domain([0, 1])
    // 蓝色、红色
    .range(['rgb(0, 160, 176)', 'rgb(204, 51, 63)']);

  // 所有的坐标轴
  const allAxis = radarDataSource?.[0].map((item) => item.axis) ?? [];
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

  // 获取radar area id
  const getRadarAreaId = (groupIndex: number) => `radarArea_id${groupIndex}`;

  // 获取radar stroke id
  const getRadarStrokeId = (groupIndex: number) => `radarStroke_id${groupIndex}`;

  // factory function for generating transition instance
  const generateTransitionInstance = () => transition().ease(easeLinear) as any;

  // 处理mouseover事件
  const handleMouseOver = (groupIndex: number) => {
    const t1 = generateTransitionInstance();

    select('.radar_chart_container')
      .selectAll('.radarArea')
      .transition(t1)
      .duration(200)
      .attr('fill-opacity', 0.1);

    const t2 = generateTransitionInstance();

    select('.radar_chart_container')
      .select(`#${getRadarAreaId(groupIndex)}`)
      .transition(t2)
      .duration(200)
      .attr('fill-opacity', 0.7);
  };

  // 处理mouseout事件
  const handleMouseOut = () => {
    const t = generateTransitionInstance();

    select('.radar_chart_container')
      .selectAll('.radarArea')
      .transition(t)
      .duration(200)
      .attr('fill-opacity', 0.35);
  };

  // data ref
  const dataRef = useRef<IItem[][]>([]);

  // handle drag event
  function handleDrag(event: any) {
    const { x, y } = event;
    let newValue = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / radius;

    // 边界值检测，防止圆出界
    if (newValue > 1) {
      newValue = 1;
    } else if (newValue < 0) {
      newValue = 0;
    }

    // @ts-ignore
    const circle = this;
    // eg: circle_0_1
    const id_array = circle.id.split('_').slice(1);

    const rowIdx = Number(id_array[0]);
    const columnIdx = Number(id_array[1]);

    const newData = JSON.parse(JSON.stringify(radarDataSource)) as IItem[][];
    newData[rowIdx][columnIdx].value = newValue;
    dataRef.current = newData;

    const cx = rScale(newValue) * Math.cos(angleSlice * columnIdx - Math.PI / 2);
    const cy = rScale(newValue) * Math.sin(angleSlice * columnIdx - Math.PI / 2);

    select(circle).attr('cx', cx).attr('cy', cy);
  }

  // 拖动end时触发
  function handleDragEnd() {
    const newData = dataRef.current;
    setRadarDataSource(newData);
  }

  // 每次render，生成一个dragInstance
  const dragInstance = drag().on('drag', handleDrag).on('end', handleDragEnd) as any;

  // bind drag event
  const bindDragEventForCircle = () => {
    select('.radar_chart_container')
      .select('.radarWrapper')
      .selectAll('.radarCircle')
      .call(dragInstance);
  };

  // unbind drag event
  const unbindDragEventForCircle = () => {
    dragInstance.on('drag', null).on('end', null);
  };

  useEffect(() => {
    bindDragEventForCircle();
    return () => unbindDragEventForCircle();
  }, [radarDataSource, svgWidth, svgHeight]);

  return (
    <div className="radar_chart_container" ref={containerRef}>
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
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
                opacity="0.25"
              />
              <text
                className="legend"
                textAnchor="middle"
                x={rScale(1.25) * Math.cos(angleSlice * index - Math.PI / 2)}
                y={rScale(1.1) * Math.sin(angleSlice * index - Math.PI / 2)}
              >
                {axis}
              </text>
            </g>
          ))}
          {radarDataSource.map((group: IItem[], groupIndex: number) => (
            <g className="radarWrapper" key={groupIndex}>
              {/* draw radar area path */}
              <path
                id={getRadarAreaId(groupIndex)}
                className="radarArea"
                d={radarLine(group as any) as any}
                fill={color(groupIndex)}
                fillOpacity="0.35"
                onMouseOver={() => handleMouseOver(groupIndex)}
                onMouseOut={handleMouseOut}
              />
              {/* draw stroke for radar area path */}
              <path
                id={getRadarStrokeId(groupIndex)}
                className="radarStroke"
                d={radarLine(group as any) as any}
                strokeWidth="2"
                stroke={color(groupIndex)}
                fill="none"
                filter="url(#glow)"
              />
              {/* append the circles */}
              {group.map((item: IItem, itemIndex: number) => (
                <circle
                  key={itemIndex}
                  className="radarCircle"
                  id={`circle_${groupIndex}_${itemIndex}`}
                  r="4"
                  cx={rScale(item.value) * Math.cos(angleSlice * itemIndex - Math.PI / 2)}
                  cy={rScale(item.value) * Math.sin(angleSlice * itemIndex - Math.PI / 2)}
                  fill={color(groupIndex)}
                  fillOpacity="0.8"
                />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export { RadarChart };
