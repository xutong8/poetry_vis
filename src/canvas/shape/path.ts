import { IBaseConfig } from '@/types/baseConfig';
import { Canvas } from '../canvas';
import { Shape } from './base';

// TODO: 类型定义
export interface IPathConfig extends IBaseConfig {
  paths: string;
  fillStyle?: string;
  strokeStyle?: string;
  fillString?: string;
}

class Path extends Shape<IPathConfig> {
  constructor(config: IPathConfig, canvas: Canvas) {
    super(canvas, config);
  }

  isEventRegion(clientX: number, clientY: number) {
    return false;
  }

  draw() {
    // 获取渲染上下文
    const ctx = this.canvas.ctx;
    const {
      paths,
      isStroke = false,
      isFill = false,
      fillStyle = '#fff',
      strokeStyle = '#fff'
    } = this.config;

    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;

    const path = new Path2D(paths);

    // paths: [
    //   ['M', edge.source.x, edge.source.y],
    //   ['Q', edge.source.x, edge.source.y, edge.target.x, edge.target.y]
    // ]

    // paths.forEach((path) => {
    //   const command = path[0];

    //   switch (command) {
    //     case 'M':
    //       ctx.moveTo(path[1], path[2]);
    //       break;
    //     case 'Z':
    //       ctx.closePath();
    //       break;
    //   }
    // });

    if (!isStroke && !isFill) return;

    if (isStroke) {
      ctx.stroke(path);
    } else {
      ctx.fill(path);
    }
  }
}

export { Path };
