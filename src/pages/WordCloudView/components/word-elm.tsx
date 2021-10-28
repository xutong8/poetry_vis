import { Word } from '..';

const rangeCollisionDetect = (range1: number[], range2: number[]) => {
  if (range1[0] > range1[1] || range2[0] > range2[1]) {
    console.log(range1, range2, '什么鬼range');
  }
  return !(range1[1] < range2[0] || range2[1] < range1[0]);
};

class WordElm {
  text: string;
  num: any;
  text_len: number;
  width: number;
  height: any;
  center_x: number;
  center_y: number;
  num1: number;
  num2: number;
  dist: number;
  belong: number;
  constructor(_object: Word) {
    this.text = _object.text;
    this.num = _object.value;
    this.text_len = this.text.split('').length;
    this.width = this.text_len * this.num; // / 1.2// * 250 * 10 /2
    this.height = this.num; /// 1.2 //* 250 * 10 /2
    this.center_x = 0;
    this.center_y = 0;

    this.num1 = 0;
    this.num2 = 0;
    this.dist = 10000;
    this.belong = -1;
  }

  getRangeX() {
    const { width, center_x } = this;
    return [center_x - width / 2 - 1, center_x + width / 2 + 1];
  }
  getRangeY() {
    const { height, center_y } = this;
    return [center_y - height / 2 - 1, center_y + height / 2 + 1];
  }

  // 可以再加个bounding

  // ture撞上了
  collisionDetect(other_elm: WordElm) {
    // 有没有撞上其他的东西
    const coll_other_text =
      rangeCollisionDetect(this.getRangeX(), other_elm.getRangeX()) &&
      rangeCollisionDetect(this.getRangeY(), other_elm.getRangeY());
    //
    return coll_other_text;
  }
}

export default WordElm;
