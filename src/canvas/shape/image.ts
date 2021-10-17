import { Canvas } from '../canvas';
import { Shape } from './base';

export interface IImageConfig {
  src: string;
  sx: number;
  sy: number;
  swidth: number;
  sheight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

class ImageShape extends Shape<IImageConfig> {
  image: HTMLImageElement | undefined;

  constructor(config: IImageConfig, canvas: Canvas) {
    super(canvas, config);
    const image = new Image();

    image.onload = () => {
      this.image = image;
      canvas.draw();
    };

    image.src = config.src;
    image.crossOrigin = 'Anonymous';
    this.config = config;
  }

  draw() {
    // 获取渲染上下文
    const ctx = this.canvas.ctx;
    // 获取src、sx、sy等属性
    const { sx, sy, swidth, sheight, x, y, width, height } = this.config;
    const image = this.image;

    if (image instanceof Image) {
      ctx.drawImage(image, sx, sy, swidth, sheight, x, y, width, height);
    }
  }

  isEventRegion(clientX: number, clientY: number) {
    // 获取点击的位置坐标
    const point = this.getEventPosition(clientX, clientY);
    const { x, y, width, height } = this.config;
    return x < point.x && point.x < x + width && y < point.y && point.y < y + height;
  }
}

export { ImageShape as Image };
