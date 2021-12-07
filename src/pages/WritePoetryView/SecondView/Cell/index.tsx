import React, { useContext, useEffect } from 'react';
import './index.less';
import {
  first_rhythm,
  second_rhythm,
  third_rhythm,
  fourth_rhythm,
  empty_rhythm,
  smallpen
} from '@/assets/images';
import { THRESHOLD_VALUE } from '../constant';
import { WordAnimationContext } from '@/store';

export enum Rhythm {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4
}

export interface ICellProps {
  word: string;
  rhythm: Rhythm;
  value: number;
  stress_text: boolean;
  mounted: () => void;
}

const Cell: React.FC<ICellProps> = (props) => {
  const { word, rhythm, value, stress_text, mounted } = props;

  // 根据rhythm返回svg图片
  const getSVGByRhythm = (rhythm: Rhythm) => {
    switch (rhythm) {
      case Rhythm.ONE:
        return first_rhythm;
      case Rhythm.TWO:
        return second_rhythm;
      case Rhythm.THREE:
        return third_rhythm;
      case Rhythm.FOUR:
        return fourth_rhythm;
      default:
        return empty_rhythm;
    }
  };

  const wordAnimationObj = useContext(WordAnimationContext);

  useEffect(() => {
    if (!wordAnimationObj.fade && !wordAnimationObj.show_brush) return;
    mounted();
  }, [wordAnimationObj.fade, wordAnimationObj.show_brush]);

  return (
    <div className="cell">
      <div className="grid">
        <input
          className={wordAnimationObj.fade ? 'wordAnimation' : 'wordNoAnimation'}
          key={word}
          defaultValue={word}
          type="text"
          style={{
            backgroundColor: value < THRESHOLD_VALUE ? 'rgba(255, 95, 95, 0.21)' : 'transparent',
            color: stress_text ? 'rgb(167, 22, 22)' : 'black'
          }}
        />
        <img
          className="writingBrush"
          src={smallpen}
          style={{
            display: wordAnimationObj.show_brush ? 'block' : 'none'
          }}
        />
      </div>
      <div className="rhythm">
        <img src={getSVGByRhythm(rhythm)} />
      </div>
    </div>
  );
};

export default Cell;
