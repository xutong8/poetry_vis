import './index.less';
import { Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  CONTINUITY_SUGGESTION_VALUE,
  DEFAULT_SUGGESTION_VALUE,
  RHYME_SUGGESTION_VALUE,
  suggestions
} from './constant';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import Cell from './Cell';
import { computeRhythm } from '@/utils';
import { SystemScore } from '..';
import ScoreBoard from './ScoreBoard';
import { brushX } from 'd3-brush';
import { select, selectAll } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { range } from 'lodash';

const { Option } = Select;

export interface ISecondViewProps {
  words: string[][];
  systemScore: SystemScore;
  rhymeList: number[][];
  continuityList: number[][];
}

const SecondView: React.FC<ISecondViewProps> = (props) => {
  const { words, systemScore, rhymeList, continuityList } = props;

  // 选中的建议
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(DEFAULT_SUGGESTION_VALUE);

  // 处理Select Option改变的事件
  const handleSuggestionChange = (suggestion: number) => {
    setSelectedSuggestion(suggestion);
  };

  // 当前在第几行brush
  const [brushRow, setBrushRow] = useState<number>(-1);
  const [brushLeft, setBrushLeft] = useState<number>(-1);
  const [brushRight, setBrushRight] = useState<number>(-1);

  // 撤销按钮的click事件
  const reset = () => {};

  // 恢复按钮的click事件
  const restore = () => {};

  const suggestionList = useMemo(() => {
    switch (selectedSuggestion) {
      case CONTINUITY_SUGGESTION_VALUE:
        return continuityList;
      case RHYME_SUGGESTION_VALUE:
        return rhymeList;
      default:
        return [];
    }
  }, [selectedSuggestion, words.join('|')]);

  // bind brush event
  useEffect(() => {
    const svg = document.getElementsByClassName('svg')[0] as SVGSVGElement;
    // get bounding rect
    const boundingRect = svg.getBoundingClientRect();
    // width、height
    const svgWidth = boundingRect.width;
    const svgHeight = boundingRect.height;

    // get gaps by evey cell
    const row = document.getElementsByClassName('row')[0];
    // row距离屏幕left距离
    const rowLeft = row.getBoundingClientRect().left;
    // gaps数组：用于保存每个单元格左边界和右边界
    const gaps = [] as [number, number][];
    const cells = row.getElementsByClassName('cell');
    Array.from(cells).forEach((cell) => {
      const cellBoundingRect = cell.getBoundingClientRect();
      const cellLeft = cellBoundingRect.left - rowLeft + 10;
      gaps.push([cellLeft, cellLeft + cellBoundingRect.width]);
    });

    // handle brush event
    function handleBrush(event: any) {
      const selection = event.selection;
      if (selection && selection[0] === 0 && selection[1] === 0) return;

      // @ts-ignore
      const eventTarget = this;
      const id = Number(eventTarget.id.slice(-1));

      // 当前进行brush行为的行为id
      setBrushRow(id);

      // 清空其他行的brush
      range(0, 4).forEach((value) => {
        if (id === value) return;
        select(`#brush${value}`).call(event.target.move, [0, 0]);
      });

      // 高亮文字
      let l = -1,
        r = -1;
      // 先计算左边界
      for (let i = 0; i < gaps.length; i++) {
        const gap = gaps[i];
        if (selection[0] >= gap[0] && selection[0] <= gap[1]) {
          l = i;
          break;
        } else if (i > 0 && selection[0] > gaps[i - 1][1] && selection[0] <= gap[0]) {
          l = i;
          break;
        } else if (i === 0 && selection[0] <= gap[0]) {
          l = 0;
          break;
        }
      }

      // 再计算右边界
      for (let i = gaps.length - 1; i >= 0; i--) {
        const gap = gaps[i];
        if (selection[1] >= gap[0] && selection[1] <= gap[1]) {
          r = i;
          break;
        } else if (i > 0 && selection[1] > gaps[i - 1][1] && selection[1] <= gap[0]) {
          r = i - 1;
          break;
        } else if (i === gaps.length - 1 && selection[1] >= gap[1]) {
          r = gaps.length - 1;
          break;
        }
      }

      if (l === -1 || r === -1) {
        l = -1;
        r = -1;
      }

      setBrushLeft(l);
      setBrushRight(r);
    }

    // handle brush end event
    function handleBrushEnd(event: any) {
      const selection = event.selection;
      if (selection && selection[0] === 0 && selection[1] === 0) return;

      // @ts-ignore
      const eventTarget = this;
      select(eventTarget).call(event.target.move, [0, 0]);
    }

    // initilize brush instance
    const brush = brushX()
      .extent([
        [0, 0],
        [svgWidth + 20, svgHeight + 20]
      ])
      .on('brush', handleBrush)
      .on('end', handleBrushEnd) as any;

    selectAll('.svg').selectAll('.gBrush').call(brush);

    return () => {
      brush.on('brush', null).on('end', null);
    };
  }, []);

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
              <Option value={suggestion.value} key={suggestion.text}>
                {suggestion.text}
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
            <div className="gridsRow" key={groupIndex}>
              <div className="row">
                {group.map((item, columnIndex: number) => (
                  <Cell
                    stress_text={
                      groupIndex === brushRow &&
                      columnIndex >= brushLeft &&
                      columnIndex <= brushRight
                    }
                    word={item}
                    rhythm={computeRhythm(item)}
                    key={columnIndex}
                    value={suggestionList?.[groupIndex]?.[columnIndex] ?? 1}
                  />
                ))}
                <svg className="svg">
                  <g className="gBrush" id={`brush${groupIndex}`}></g>
                </svg>
              </div>
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
