import { useElementSize } from '@/hooks/useElementSize';
import { scaleLinear } from 'd3-scale';
import { range } from 'lodash';
import { useRef, useState } from 'react';
import { Candidate } from '..';
import './index.less';
import { linkVertical } from 'd3-shape';
import { select } from 'd3-selection';

export interface IThirdViewProps {
  candidates: Candidate[];
  brushLeft: number;
  brushRight: number;
  brushRow: number;
  words: string[][];
  setWords: (words: string[][]) => void;
  candidateIndex: number;
  setCandidateIndex: (candidateIndex: number) => void;
}

const ThirdView: React.FC<IThirdViewProps> = (props) => {
  const {
    candidates,
    setCandidateIndex,
    brushLeft,
    brushRight,
    brushRow,
    setWords,
    words,
    candidateIndex
  } = props;

  // container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // calculate container size
  const [svgWidth, svgHeight] = useElementSize(containerRef);

  // 起点和终点坐标
  const start_x = 50;
  const start_y = (val: number) => (svgHeight > 0 ? ((svgHeight - 10) * val) / 3 : 0);
  const end_x = svgWidth > 0 ? svgWidth - 10 : 0;

  //draw curve lines
  const extremum = {
    continuity: [100, 0],
    emotion: [100, 0],
    rhyme: [100, 0]
  };

  // 旧的逻辑，直接复用
  candidates.forEach((candidate) => {
    if (candidate.continuity > extremum.continuity[1])
      extremum.continuity[1] = candidate.continuity;
    if (candidate.continuity < extremum.continuity[0])
      extremum.continuity[0] = candidate.continuity;
    if (candidate.emotion > extremum.emotion[1]) extremum.emotion[1] = candidate.emotion;
    if (candidate.emotion < extremum.emotion[0]) extremum.emotion[0] = candidate.emotion;
    if (candidate.rhyme > extremum.rhyme[1]) extremum.rhyme[1] = candidate.rhyme;
    if (candidate.rhyme < extremum.rhyme[0]) extremum.rhyme[0] = candidate.rhyme;
  });

  // 在轴的两边留出1/4宽度的间隙
  const con_diff = extremum.continuity[1] - extremum.continuity[0];
  extremum.continuity[0] = Math.max(extremum.continuity[0] - con_diff / 4, 0);
  extremum.continuity[1] = Math.min(extremum.continuity[1] + con_diff / 4, 10);
  const emo_diff = extremum.emotion[1] - extremum.emotion[0];
  extremum.emotion[0] = Math.max(extremum.emotion[0] - emo_diff / 4, 0);
  extremum.emotion[1] = Math.min(extremum.emotion[1] + emo_diff / 4, 10);
  const rhy_diff = extremum.rhyme[1] - extremum.rhyme[0];
  extremum.rhyme[0] = Math.max(extremum.rhyme[0] - rhy_diff / 4, 0);
  extremum.rhyme[1] = Math.min(extremum.rhyme[1] + rhy_diff / 4, 10);

  // 根据上面建立起的范围，设置scale
  const scale_continuity = scaleLinear().range([start_x, end_x]).domain(extremum.continuity);
  const scale_emotion = scaleLinear().range([start_x, end_x]).domain(extremum.emotion);
  const scale_rhyme = scaleLinear().range([start_x, end_x]).domain(extremum.rhyme);

  const bezier = linkVertical()
    .source((d) => d.source)
    .target((d) => d.target)
    .x((d) => d[0])
    .y((d) => d[1]);

  // 点击新的候选词后，需要在第二个视图上更新词语
  const updateWords = (text: string) => {
    const newWords = JSON.parse(JSON.stringify(words)) as string[][];
    for (let i = brushLeft, j = 0; i <= brushRight; i++, j++) {
      newWords?.[brushRow] && (newWords[brushRow][i] = text[j]);
    }
    const sentence = newWords?.[brushRow]?.slice(brushLeft, brushRight + 1).join('') ?? '';
    const newCandidateIndex = candidates.findIndex((candidate) => candidate.text === sentence);
    setCandidateIndex(newCandidateIndex);
    setWords(newWords);
  };

  // 处理候选词mouseover
  const handleCandidateOver = (index: number) => {
    select(`#candidate${index}`).style('color', 'black');
    select(`#curve${index}`).select('path').attr('opacity', 1.0);
    select(`#curve${index}`).selectAll('circle').attr('opacity', 1.0).attr('r', 2.5);
  };

  // 处理候选词mouseout
  const handleCandidateOut = (index: number) => {
    select(`#candidate${index}`).style('color', 'rgba(0, 0, 0, 0.36)');
    select(`#curve${index}`)
      .select('path')
      .attr('opacity', index === candidateIndex ? 0.5 : 0.1);
    select(`#curve${index}`)
      .selectAll('circle')
      .attr('opacity', index === candidateIndex ? 0.8 : 0.1)
      .attr('r', 2);
  };

  return (
    <div className="third_view">
      <div className="title">雕章琢句</div>
      <div className="candidates">
        <div className="words">
          {candidates.map((candidate, index: number) => (
            <div
              key={candidate.text}
              id={`candidate${index}`}
              className="word"
              onClick={() => updateWords(candidate.text)}
              onMouseOver={() => handleCandidateOver(index)}
              onMouseOut={() => handleCandidateOut(index)}
            >
              {candidate.text}
            </div>
          ))}
        </div>
        <div className="curve_lines" ref={containerRef}>
          <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            <g className="number">
              {[extremum.continuity[0], extremum.emotion[0], extremum.rhyme[0]].map(
                (val, index) => (
                  <text
                    key={index}
                    className="number_text"
                    x={start_x - 5}
                    y={start_y(index + 1) + 10}
                  >
                    {val?.toFixed(2)}
                  </text>
                )
              )}
            </g>
            <g className="axis">
              {range(1, 4).map((val) => (
                <line
                  key={val}
                  x1={start_x}
                  y1={start_y(val)}
                  x2={end_x}
                  y2={start_y(val)}
                  stroke="#a07b58"
                  strokeWidth="1px"
                />
              ))}
            </g>
            <g className="texts">
              {['连贯', '情绪', '韵律'].map((text, index) => (
                <text key={text} className="text" x={start_x} y={start_y(index + 1) - 20}>
                  {text}
                </text>
              ))}
            </g>
            <g className="polygons">
              {range(1, 4).map((val) => (
                <polygon
                  key={val}
                  points="0 0,5 10,10 0"
                  fill="#CC333F"
                  transform={`translate(${start_x - 5}, ${start_y(val) - 12})`}
                />
              ))}
            </g>
            <g className="links">
              {candidates.map((candidate, index: number) => {
                const data = [candidate.continuity, candidate.emotion, candidate.rhyme];
                const continuity_point = [scale_continuity(data[0]), start_y(1)];
                const emotion_point = [scale_emotion(data[1]), start_y(2)];
                const rhyme_point = [scale_rhyme(data[2]), start_y(3)];

                const line1 = bezier({
                  source: continuity_point,
                  target: emotion_point
                } as any) as string;
                const line2 = bezier({
                  source: emotion_point,
                  target: rhyme_point
                } as any) as string;

                return (
                  <g key={index} id={`curve${index}`}>
                    <path
                      opacity={index === candidateIndex ? 0.5 : 0.1}
                      d={line1 + line2}
                      fill="none"
                      stroke={index === candidateIndex ? '#CC333F' : 'grey'}
                      strokeWidth={index === candidateIndex ? 2 : 1.5}
                    />
                    <circle
                      cx={continuity_point[0]}
                      cy={continuity_point[1]}
                      r={index === candidateIndex ? 2.5 : 2}
                      fill={index === candidateIndex ? '#CC333F' : 'grey'}
                      opacity={index === candidateIndex ? 0.8 : 0.1}
                    />
                    <circle
                      cx={emotion_point[0]}
                      cy={emotion_point[1]}
                      r={index === candidateIndex ? 2.5 : 2}
                      fill={index === candidateIndex ? '#CC333F' : 'grey'}
                      opacity={index === candidateIndex ? 0.8 : 0.1}
                    />
                    <circle
                      cx={rhyme_point[0]}
                      cy={rhyme_point[1]}
                      r={index === candidateIndex ? 2.5 : 2}
                      fill={index === candidateIndex ? '#CC333F' : 'grey'}
                      opacity={index === candidateIndex ? 0.8 : 0.1}
                    />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ThirdView;
