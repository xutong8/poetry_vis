import React from 'react';
import './index.less';

export interface IScoreBoardProps {
  value: number;
  desc: string;
}

const ScoreBoard: React.FC<IScoreBoardProps> = (props) => {
  const { value, desc } = props;

  return (
    <div className="score_board">
      <div className="score_value">{value?.toFixed(1)}分</div>
      <div className="score_desc">{desc}</div>
    </div>
  );
};

export default ScoreBoard;
