import './index.less';
import { Select } from 'antd';
import { useState } from 'react';
import { DEFAULT_SUGGESTION, suggestions } from './constant';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import Cell from './Cell';
import { computeRhythm } from '@/utils';

const { Option } = Select;

export interface ISecondViewProps {
  words: string[][];
}

const SecondView: React.FC<ISecondViewProps> = (props) => {
  const { words } = props;

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
    </div>
  );
};

export default SecondView;
