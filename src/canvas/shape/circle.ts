import { Canvas } from '../canvas';
import { Shape } from './base';

export interface ICircleConfig {
  x: number;
  y: number;
  r: number;
  fillStyle?: string;
}

class Circle extends Shape<ICircleConfig> {
  constructor(config: ICircleConfig, canvas: Canvas) {
    super(canvas, config);
  }

  isEventRegion(clientX: number, clientY: number) {
    // 获取点击的位置坐标
    // const point = this.getEventPosition(clientX, clientY);
    // const { x, y, r } = this.config;
    // return (point.x - x) * (point.x - x) + (point.y - y) * (point.y - y) < r * r;
    return true;
  }

  draw() {
    // 获取渲染上下文
    const ctx = this.canvas.ctx;
    // 获取x、y、width和height属性
    const { x, y, r, fillStyle = 'black' } = this.config;

    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

export { Circle };
