import { getPixelRatio } from '@/utils';
import { BaseEvent, EVENTS } from '../base';
import { Shape } from './shape/base';

class Canvas extends BaseEvent {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  children: Shape[];
  width: number;
  height: number;

  constructor(id: string) {
    super();

    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`id ${id} is unvalid string.`);
    }

    this.canvas = canvas;

    const layout = canvas.getBoundingClientRect();

    this.width = layout.width;
    this.height = layout.height;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.children = [];

    const pixelRatio = this.getPixelRatio();
    this.ctx.scale(pixelRatio, pixelRatio);

    // 初始化事件机制
    this.initEvent();
  }

  addChild(shape: Shape) {
    this.children.push(shape);
  }

  initEvent() {
    EVENTS.forEach((eventName) => {
      // 给canvas绑定所有事件
      this.canvas.addEventListener(eventName as any, (event: MouseEvent) =>
        this.handleEvent(event)
      );
    });
  }

  handleEvent(event: MouseEvent) {
    // 判断事件命中的是哪个元素
    this.children
      .filter((shape) => shape.isEventRegion(event.x, event.y))
      .forEach((shape) => shape.emit(event.type, event));
  }

  getPixelRatio() {
    const pixelRatio = getPixelRatio();
    return pixelRatio >= 1 ? Math.ceil(pixelRatio) : 1;
  }

  draw() {
    const ctx = this.ctx;
    this.children.forEach((shape) => shape.draw(ctx));
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.children = [];
  }
}

export { Canvas };
