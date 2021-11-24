import './index.less';
import { Select } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CONTINUITY_SUGGESTION_VALUE,
  DEFAULT_SUGGESTION_VALUE,
  RHYME_SUGGESTION_VALUE,
  suggestions
} from './constant';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import Cell from './Cell';
import { computeRhythm, generateYun } from '@/utils';
import { Candidate, RecommendWord, Rhyme, SystemScore } from '..';
import ScoreBoard from './ScoreBoard';
import { brushX } from 'd3-brush';
import { select, selectAll } from 'd3-selection';
import { range } from 'lodash';
import { httpRequest } from '@/services';
import { mappingForRhyme, generateMarker } from '@/utils';

const { Option } = Select;

export interface ISecondViewProps {
  words: string[][];
  systemScore: SystemScore;
  rhymeList: number[][];
  continuityList: number[][];
  brushRow: number;
  setBrushRow: (brushRow: number) => void;
  brushLeft: number;
  setBrushLeft: (brushLeft: number) => void;
  brushRight: number;
  setBrushRight: (brushRight: number) => void;
  setCandidates: (candidates: Candidate[]) => void;
  generateEmotion: () => number[];
  sentenceSelected: Rhyme;
  setCandidateIndex: (candidateIndex: number) => void;
  setRecommendWords: (recommendWords: RecommendWord[]) => void;
}

const SecondView: React.FC<ISecondViewProps> = (props) => {
  const {
    words,
    systemScore,
    rhymeList,
    continuityList,
    brushRow,
    setBrushRow,
    brushLeft,
    setBrushLeft,
    brushRight,
    setBrushRight,
    setCandidates,
    generateEmotion,
    sentenceSelected,
    setCandidateIndex,
    setRecommendWords
  } = props;

  // 选中的建议
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(DEFAULT_SUGGESTION_VALUE);

  // 处理Select Option改变的事件
  const handleSuggestionChange = (suggestion: number) => {
    setSelectedSuggestion(suggestion);
  };

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

  // 是否正在brushing
  const brushingRef = useRef<boolean>(false);
  // 获取brush
  const brushRef = useRef<any>();
  // dispatch
  const brushDispatch = useRef<any>();
  // brushRow ref
  const brushRowRef = useRef<number>(-1);
  // brushLeft ref
  const brushLeftRef = useRef<number>(-1);
  // brushRight ref
  const brushRightRef = useRef<number>(-1);

  const wordsRef = useRef<string[][]>([]);

  useEffect(() => {
    wordsRef.current = words;
  }, [words.join('')]);

  // bind brush event
  useEffect(() => {
    if (!words) return;
    if (words && words[0] && words[0][0] === '') return;

    const svg = document.getElementsByClassName('svg')[0] as SVGSVGElement;
    // get bounding rect
    const boundingRect = svg.getBoundingClientRect();
    // width、height
    const svgWidth = boundingRect.width;
    const svgHeight = boundingRect.height;

    // 和index.less中@offset_x对应
    const offsetX = Number(getComputedStyle(svg, null).getPropertyValue('left').slice(1, -2));

    // get gaps by evey cell
    const row = document.getElementsByClassName('row')[0];
    // row距离屏幕left距离
    const rowLeft = row.getBoundingClientRect().left;
    // gaps数组：用于保存每个单元格左边界和右边界
    const gaps = [] as [number, number][];
    const cells = row.getElementsByClassName('cell');
    Array.from(cells).forEach((cell) => {
      const cellBoundingRect = cell.getBoundingClientRect();
      const cellLeft = cellBoundingRect.left - rowLeft + offsetX;
      gaps.push([cellLeft, cellLeft + cellBoundingRect.width]);
    });

    // handle brush event
    function handleBrush(event: any) {
      if (!event) return;

      const selection = event.selection;

      if (!selection) return;
      if (selection[0] === 0 && selection[1] === 0) return;

      // @ts-ignore
      const eventTarget = this;
      const id = Number(eventTarget.id.slice(-1));

      // 当前正在brush
      brushingRef.current = true;

      brushDispatch.current = event._;

      // 当前进行brush行为的行为id
      brushRowRef.current = id;
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

      brushLeftRef.current = l;
      setBrushLeft(l);

      brushRightRef.current = r;
      setBrushRight(r);
    }

    // handle brush end event
    function handleBrushEnd(event: any) {
      if (!event) return;

      const selection = event.selection;

      if (!selection) return;
      if (selection[0] === 0 && selection[1] === 0) return;

      // brush结束
      brushingRef.current = false;

      selectAll('.svg').selectAll('.gBrush').call(brush.move, [0, 0]);

      // 最新的brush row
      const latestBrushRow = brushRowRef.current;
      // 最新的brush left
      const latestBrushLeft = brushLeftRef.current;
      // 最新的brush right
      const latestBrushRight = brushRightRef.current;
      // 最新的words
      const latestWords = wordsRef.current;
      console.log('latest', latestWords);

      // poem参数数组
      const poem = latestWords.map((row: string[]) => row.join('')).join('|');
      console.log('poem', poem);

      // brush刷选完后，发送getCandidate请求
      if (latestBrushLeft !== -1 || latestBrushRight !== -1) {
        httpRequest
          .get(
            `/mode_1/getCandidates?emotion=${generateEmotion().join(
              ','
            )}&poem=${poem}&rhyme=${mappingForRhyme(
              sentenceSelected
            )}&yun=${generateYun()}&marker=${generateMarker(
              latestWords,
              latestBrushRow,
              latestBrushLeft,
              latestBrushRight
            )}`,
            {},
            false
          )
          .then((res) => {
            const newCandidates = (res?.data ?? []) as Candidate[];
            const sentence =
              latestWords?.[latestBrushRow]
                ?.slice(latestBrushLeft, latestBrushRight + 1)
                .join('') ?? '';
            const newCandidateIndex = newCandidates.findIndex(
              (candidate) => candidate.text === sentence
            );
            setCandidateIndex(newCandidateIndex);
            setCandidates(newCandidates);
          });
        httpRequest
          .get(
            `/mode_1/get_distribution?emotion=${generateEmotion().join(
              ','
            )}&poem=${poem}&rhyme=${mappingForRhyme(
              sentenceSelected
            )}&yun=${generateYun()}&marker=${generateMarker(
              latestWords,
              latestBrushRow,
              latestBrushLeft,
              latestBrushRight
            )}`,
            {},
            false
          )
          .then((res) => {
            const newRecommendWords = (res?.data ?? []) as RecommendWord[];
            setRecommendWords(newRecommendWords);
          });
      }
    }

    // initilize brush instance
    const brush = brushX()
      .extent([
        [0, 0],
        [svgWidth, svgHeight]
      ])
      .on('brush', handleBrush)
      .on('end', handleBrushEnd) as any;

    selectAll('.svg').selectAll('.gBrush').call(brush);

    brushRef.current = brush;

    return () => {
      brush.on('brush', null).on('end', null);
    };
  }, [words.join('')]);

  useEffect(() => {
    const handleContextMenu = () => {
      const isbrushing = brushingRef.current;
      const brush = brushRef.current;

      // Fix: 此时还需要清空刷选状态
      setBrushLeft(-1);
      setBrushRight(-1);
      setBrushRow(-1);

      isbrushing && selectAll('.svg').selectAll('.gBrush').call(brush.move, [0, 0]);
    };

    // bind contextmenu event
    document.addEventListener('contextmenu', handleContextMenu);

    // unbind contextmenu event
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
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
