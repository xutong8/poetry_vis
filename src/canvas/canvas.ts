import { getPixelRatio } from '@/utils';
import { BaseEvent, EVENTS } from '../base';
import { Shape } from './shape/base';

class Canvas extends BaseEvent {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  children: Shape[];

  constructor(id: string) {
    super();

    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`id ${id} is unvalid string.`);
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.children = [];

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
}

export { Canvas };
