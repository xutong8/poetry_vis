import WordElm from './word-elm';
import * as d3 from 'd3';

// 词云限制区域
class Constrainer {
  area: number;
  width: number;
  height: number;
  bound: [number, number][];
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    let points: [number, number][] = [
      [0, 4],
      [2, 5],
      [4, 3],
      [6, 2],
      [6, 1],
      [5, 1],
      [4, 0],
      [4, -0.5],
      [3, -1],
      [3, -2],
      [2, -3.5],
      [1, -3],
      [1, -2],
      [-1, -2],
      [-2, -2.5],
      [-3, -2],
      [-3, -1],
      [-4, -1],
      [-4, 0],
      [-5, 1],
      [-5, 2],
      [-7, 2],
      [-8, 3],
      [-4, 4],
      [-2, 6],
      [0, 4]
    ];

    let xs = points.map((elm) => elm[0]),
      ys = points.map((elm) => elm[1]);
    const center_point = d3.polygonCentroid(points);
    let max_x = Math.max(...xs),
      max_y = Math.max(...ys),
      min_x = Math.min(...xs),
      min_y = Math.min(...ys);
    // console.log(min_x, min_y, max_x, max_y)
    points = points.map((elm) => {
      return [elm[0] - center_point[0], elm[1] - center_point[1]];
    });
    points = points.map((elm) => {
      return [(elm[0] * width) / (max_x - min_x) / 1.2, (elm[1] * height) / (max_y - min_y) / 1.2];
    });

    this.bound = points;
    // console.log(points)
    this.area = d3.polygonArea(this.bound);
  }
  isTheArea(wordElm: WordElm) {
    return d3.polygonContains(this.bound, [wordElm.center_x, wordElm.center_y]);
  }
}

export default Constrainer;
