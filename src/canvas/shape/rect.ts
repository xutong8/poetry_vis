import { Canvas } from '../canvas';
import { Shape } from './base';

export interface IRectConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  fillStyle?: string;
}

class Rect extends Shape {
  config: IRectConfig;

  constructor(config: IRectConfig, canvas: Canvas) {
    super(canvas);
    this.config = config;
  }

  draw() {
    // 获取渲染上下文
    const ctx = this.canvas.ctx;
    // 获取x、y、width和height属性
    const { x, y, width, height, fillStyle = 'black' } = this.config;

    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, width, height);
  }

  isEventRegion(clientX: number, clientY: number) {
    // 获取点击的位置坐标
    const point = this.getEventPosition(clientX, clientY);
    const { x, y, width, height } = this.config;
    return x < point.x && point.x < x + width && y < point.y && point.y < y + height;
  }
}

export { Rect };
