import { IBaseConfig } from '@/types/baseConfig';
import { Canvas } from '../canvas';
import { Shape } from './base';

export interface ITextConfig extends IBaseConfig {
  x: number;
  y: number;
  text: string;
  fontStyle?: string;
  fillStyle?: string;
}

class Text extends Shape<ITextConfig> {
  constructor(config: ITextConfig, canvas: Canvas) {
    super(canvas, config);
  }

  isEventRegion(clientX: number, clientY: number) {
    return false;
  }

  draw() {
    // 获取渲染上下文
    const ctx = this.canvas.ctx;

    const {
      fontStyle = '',
      isFill = false,
      isStroke = false,
      text,
      x,
      y,
      fillStyle = 'black'
    } = this.config;

    ctx.font = fontStyle;
    ctx.fillStyle = fillStyle;

    if (!isFill && !isStroke) return;

    if (isFill) {
      ctx.fillText(text, x, y);
    } else {
      ctx.strokeText(text, x, y);
    }
  }
}

export { Text };
