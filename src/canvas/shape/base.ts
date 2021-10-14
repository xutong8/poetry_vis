import { BaseEvent } from '@/base';
import { Canvas } from '../canvas';
import { IEventPosition } from '@/types/baseEvent';
abstract class Shape extends BaseEvent {
  canvas: Canvas;

  constructor(canvas: Canvas) {
    super();
    this.canvas = canvas;
  }

  // 绘制
  abstract draw(ctx: CanvasRenderingContext2D): void;
  // 判断事件是否命中了该元素
  abstract isEventRegion(clientX: number, clientY: number): boolean;

  getEventPosition(clientX: number, clientY: number): IEventPosition {
    const bbox = this.canvas.canvas.getBoundingClientRect();
    return {
      x: clientX - bbox.left,
      y: clientY - bbox.top
    };
  }
}

export { Shape };
