import React from 'react';
import './index.less';
import { first_rhythm, second_rhythm, third_rhythm, fourth_rhythm } from '@/assets/images';

export enum Rhythm {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4
}

export interface ICellProps {
  word: string;
  rhythm: Rhythm;
}

const Cell: React.FC<ICellProps> = (props) => {
  const { word, rhythm } = props;

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
        return first_rhythm;
    }
  };

  return (
    <div className="cell">
      <div className="grid">
        <input defaultValue={word} type="text" />
      </div>
      <div className="rhythm">
        <img src={getSVGByRhythm(rhythm)} />
      </div>
    </div>
  );
};

export default Cell;