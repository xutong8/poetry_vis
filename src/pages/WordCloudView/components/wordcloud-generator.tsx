import React, { useEffect, useRef } from 'react';
import { Word } from '..';
import Constrainer from './constrainer';
import WordElm from './word-elm';
import * as d3 from 'd3';
import { useElementSize } from '@/hooks/useElementSize';

interface IProps {
  width: number;
  height: number;
  initData: Word[];
}

const WordCloudGenerator: React.FC<IProps> = (props) => {
  const { width, height, initData } = props;
  const cloud_width = width / 1.2;
  const cloud_height = height / 1.2; //词云的半宽和高
  const constrainer = new Constrainer(cloud_width, cloud_height);
  const textRef = useRef<SVGGElement>(null);

  // 计算所有数据的总面积
  const calTotalArea = (data: any) => {
    return data.reduce((total: number, elm: any) => {
      return total + elm.width * elm.height;
    }, 0);
  };

  const draw = () => {
    // 数据为空，不绘图
    if (!initData[0]) {
      return;
    }

    let newData = initData.map((elm) => new WordElm(elm));
    let data: WordElm[] = [],
      d_data1: WordElm[] = [];

    newData.forEach((WordElm) => {
      WordElm.num1 = WordElm.num;
      WordElm.belong = 0;
      d_data1.push(WordElm);
      data.push(WordElm);
    });

    // 计算所有数据的总面积
    let now_area = calTotalArea(data);
    // 计算容器的面积
    let true_area = constrainer.area; //cloud_height*cloud_width
    // 计算缩放比例
    let ratio = Math.sqrt(true_area / now_area) / 1.1; ///21

    data.forEach((elm) => {
      elm.width *= ratio;
      elm.height *= ratio;
    });

    let finish_data: any[] = [];
    const sortByNum = (arr: any[]) => {
      return arr.sort((a, b) => b.num - a.num);
    };
    data = sortByNum(data);

    // 碰撞检测
    const collisionDetect = (text_elm: WordElm) => {
      for (let index = 0; index < finish_data.length; index++) {
        const elm = finish_data[index];
        if (text_elm === elm) continue;
        const is_collision = text_elm.collisionDetect(elm);
        if (is_collision) {
          return true;
        }
      }
      return false;
    };

    const data_area = calTotalArea(data),
      data1_area = calTotalArea(d_data1);

    let start_angle = Math.PI * 0.65,
      angle_pword = (Math.PI * 2) / data_area;

    let data1_range = [0, angle_pword * data1_area];
    // int_range0 = [data1_range[1], data1_range[1]];

    // console.log(data1_range, int_range0, data2_range, int_range1)
    // 为每个找一个最近的能放的位置
    const range2Angles = (range: any[]) => {
      let angles = [];
      let d_angle = Math.PI / 10;
      range = [range[0] - d_angle, range[1] + d_angle];
      for (let angle = range[0]; angle < range[1]; angle += Math.PI / 180) {
        angles.push(start_angle + angle);
      }
      return angles;
    };

    data.forEach((elm, index) => {
      let min_r = 9999,
        min_angle = 0;
      let angles = [];
      angles = range2Angles(data1_range);
      // if (elm.belong === 0) {
      //   angles = range2Angles(data1_range);
      // } else if (elm.belong === 1) {
      //   angles = [...range2Angles(int_range0)];
      // } else {
      //   console.error(elm, 'belong有问题');
      //   return;
      // }
      angles.forEach((angle) => {
        let r = 0;
        const cos = Math.cos(angle),
          sin = Math.sin(angle);
        while (collisionDetect(elm)) {
          // console.log(r)
          r += height / 100;
          elm.center_x = cos * r;
          elm.center_y = sin * r;
          if (r > 10000) {
            console.error(elm, '没得救了');
            break;
          }
        }
        // console.log(r, angle, min_r, min_angle)
        if (min_r > r && constrainer.isTheArea(elm)) {
          min_r = r;
          min_angle = angle;
        }
        elm.center_x = 0;
        elm.center_y = 0;
      });
      elm.center_x = Math.cos(min_angle) * min_r;
      elm.center_y = Math.sin(min_angle) * min_r;
      elm.dist = min_r;
      finish_data.push(elm);
    });

    const text_g = textRef.current;

    // 中间做差的矩阵
    // d3.select(text_g).selectAll('.text_back_ground').remove();
    // data.forEach((d) => {
    //   if (d.belong === 1) {
    //     const total_num = d.num1 + d.num2,
    //       width1 = (d.width / total_num) * d.num1,
    //       width2 = (d.width / total_num) * d.num2;

    //     d3.select(text_g)
    //       .append('rect')
    //       .attr('x', d.center_x - d.width / 2 + width / 2)
    //       .attr('y', d.center_y - d.height / 2 + height / 2)
    //       .attr('width', width1)
    //       .attr('height', d.height)
    //       .attr('class', 'text_back_ground')
    //       .attr('fill', '#588BC4');

    //     d3.select(text_g)
    //       .append('rect')
    //       .attr('x', d.center_x - d.width / 2 + width / 2 + width1)
    //       .attr('y', d.center_y - d.height / 2 + height / 2)
    //       .attr('width', width2)
    //       .attr('height', d.height)
    //       .attr('class', 'text_back_ground')
    //       .attr('fill', '#C1A1AA');
    //   }
    // });

    d3.select(text_g).selectAll('.text_tag').remove();
    d3.select(text_g)
      .selectAll('.text_tag')
      .data(data)
      .enter()
      .append('text')
      .text((d) => d.text)
      .attr('x', (d) => d.center_x + width / 2)
      .attr('y', (d) => d.center_y + height / 2)
      .attr('dy', (d) => d.height / 3)
      .attr('font-size', (d) => d.height)
      .attr('class', 'text_tag')
      .attr('text-anchor', 'middle')
      .style('fill', '#588BC4')
      .style('cursor', 'pointer')
      .on('click', (d, event) => {
        // 点击选择单词
      });
  };

  useEffect(() => {
    draw();
  }, [initData, width, height]);

  return (
    <div style={{ position: 'absolute' }}>
      <svg width={width} height={height}>
        <g ref={textRef}></g>
      </svg>
    </div>
  );
};

export default WordCloudGenerator;
