import { BaseEvent } from '@/base';

abstract class Shape extends BaseEvent {
  // 绘制
  abstract draw(ctx: CanvasRenderingContext2D): void;
  // 判断事件是否命中了该元素
  abstract isEventRegion(clientX: number, clientY: number): boolean;
}

export { Shape };
