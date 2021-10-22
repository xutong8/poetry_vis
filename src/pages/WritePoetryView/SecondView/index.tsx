import './index.less';
import { Select } from 'antd';
import { useState } from 'react';
import { DEFAULT_SUGGESTION, suggestions } from './constant';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import Cell from './Cell';
import { computeRhythm } from '@/utils';
import { SystemScore } from '..';
import ScoreBoard from './ScoreBoard';

const { Option } = Select;

export interface ISecondViewProps {
  words: string[][];
  systemScore: SystemScore;
}

const SecondView: React.FC<ISecondViewProps> = (props) => {
  const { words, systemScore } = props;

  // 选中的建议
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>(DEFAULT_SUGGESTION);

  // 处理Select Option改变的事件
  const handleSuggestionChange = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
  };

  // 撤销按钮的click事件
  const reset = () => {};

  // 恢复按钮的click事件
  const restore = () => {};

  return (
    <div className="second_view">
      <div className="title">挥毫泼墨</div>
      <div className="menu_container">
        <div className="modify_suggestion">
          <span className="text">修改建议: </span>
          <Select
            className="suggestion_select"
            value={selectedSuggestion}
            onChange={handleSuggestionChange}
          >
            {suggestions.map((suggestion) => (
              <Option value={suggestion} key={suggestion}>
                {suggestion}
              </Option>
            ))}
          </Select>
        </div>
        <div className="reset">
          <ArrowLeftOutlined />
          <span className="text" onClick={reset}>
            撤销
          </span>
        </div>
        <div className="reset">
          <ArrowRightOutlined />
          <span className="text" onClick={restore}>
            恢复
          </span>
        </div>
      </div>
      <div className="grids">
        {words.map((group, groupIndex: number) => {
          return (
            <div className="row" key={groupIndex}>
              {group.map((item, columnIndex: number) => (
                <Cell word={item} rhythm={computeRhythm(item)} key={columnIndex} />
              ))}
            </div>
          );
        })}
      </div>
      <div className="system_score">
        <span className="desc">系统评分</span>
        <div className="board">
          <ScoreBoard value={systemScore.continuity_score} desc="连贯" />
        </div>
        <div className="board">
          <ScoreBoard value={systemScore.emotion_score} desc="情感" />
        </div>
        <div className="board">
          <ScoreBoard value={systemScore.rhyme_score} desc="韵律" />
        </div>
      </div>
      <div className="share_buttons">
        <button className="share_button">分享诗歌</button>
      </div>
    </div>
  );
};

export default SecondView;
