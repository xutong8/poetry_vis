import './index.less';
import { Select } from 'antd';
import { useState } from 'react';
import { DEFAULT_SUGGESTION, suggestions } from './constant';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import Cell from './Cell';
import { computeRhythm } from '@/utils';

const { Option } = Select;

const SecondView = () => {
  // 选中的建议
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>(DEFAULT_SUGGESTION);

  // 处理Select Option改变的事件
  const handleSuggestionChange = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
  };

  // dataSource
  const dataSource = [
    ['烽', '烟', '今', '日', '暮'],
    ['燕', '颔', '梦', '成', '眠'],
    ['此', '地', '临', '河', '水'],
    ['朝', '来', '见', '马', '鞍']
  ];

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
          <span className="text">撤销</span>
        </div>
        <div className="reset">
          <ArrowRightOutlined />
          <span className="text">恢复</span>
        </div>
      </div>
      <div className="grids">
        {dataSource.map((group, groupIndex: number) => {
          return (
            <div className="row" key={groupIndex}>
              {group.map((item) => (
                <Cell word={item} rhythm={1} key={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecondView;
