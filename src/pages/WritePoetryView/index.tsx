import { write_poetry } from '@/assets/images';
import { generateWords } from '@/utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import FirstView from './FirstView';
import { IItem } from './FirstView/RadarChart';
import './index.less';
import SecondView from './SecondView';
import { emotions } from './FirstView/constant';
import { generateRadarDataSource } from '@/utils';
import ThirdView from './ThirdView';

export enum Rhyme {
  FIVE_WORD = 5,
  SEVEN_WORD = 7
}

export interface SystemScore {
  // 连贯
  continuity_score: number;
  // 情感
  emotion_score: number;
  // 韵律
  rhyme_score: number;
}

export interface Candidate {
  // 连贯
  continuity: number;
  // 情感
  emotion: number;
  // 韵律
  rhyme: number;
  // 文本
  text: string;
}

const WritePoetryView: React.FC<any> = () => {
  // 定义一个state，用于区分当前选中的是五言 or 七言，默认为五言
  const [sentenceSelected, setSentenceSelected] = useState<Rhyme>(Rhyme.FIVE_WORD);

  // 定义words state
  const [words, setWords] = useState<string[][]>(generateWords(sentenceSelected));

  // 定义系统评分system_score state
  const [systemScore, setSystemScore] = useState<SystemScore>({
    continuity_score: 0,
    emotion_score: 0,
    rhyme_score: 0
  });

  // 连贯建议
  const [continuityList, setContinuityList] = useState<number[][]>([]);
  // 韵律建议
  const [rhymeList, setRhymeList] = useState<number[][]>([]);

  // 当前在第几行brush
  const [brushRow, setBrushRow] = useState<number>(-1);
  const [brushLeft, setBrushLeft] = useState<number>(-1);
  const [brushRight, setBrushRight] = useState<number>(-1);

  // 候选词，有的话才展示第三个视图
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // 默认选中的情绪
  const [emotionsSelected, setEmotionsSelected] = useState<string[]>([
    '思念远方',
    '军旅悲壮',
    '忧国忧民'
  ]);

  // radarChart dataSource
  // 第一个元素为实际效果；第二个元素为预期效果；
  const [radarDataSource, setRadarDataSource] = useState<IItem[][]>(
    generateRadarDataSource(emotionsSelected)
  );

  // 生成emotion
  const generateEmotion = () =>
    emotions.map((emotion) => radarDataSource[1].find((item) => item.axis === emotion)?.value ?? 0);

  return (
    <div className="write_poetry_container">
      <img src={write_poetry} className="img" />
      <div className="write_poetry_content">
        <div className="base_view">
          <FirstView
            sentenceSelected={sentenceSelected}
            setSentenceSelected={setSentenceSelected}
            setWords={setWords}
            setSystemScore={setSystemScore}
            setContinuityList={setContinuityList}
            setRhymeList={setRhymeList}
            // brush的范围
            setBrushRow={setBrushRow}
            setBrushLeft={setBrushLeft}
            setBrushRight={setBrushRight}
            // 选中的情感
            emotionsSelected={emotionsSelected}
            setEmotionsSelected={setEmotionsSelected}
            // 雷达图数据
            radarDataSource={radarDataSource}
            setRadarDataSource={setRadarDataSource}
            generateEmotion={generateEmotion}
          />
        </div>
        <div className="base_view">
          <SecondView
            words={words}
            systemScore={systemScore}
            rhymeList={rhymeList}
            continuityList={continuityList}
            // brush刷选范围
            brushRow={brushRow}
            setBrushRow={setBrushRow}
            brushLeft={brushLeft}
            setBrushLeft={setBrushLeft}
            brushRight={brushRight}
            setBrushRight={setBrushRight}
            // 设置候选词
            setCandidates={setCandidates}
            generateEmotion={generateEmotion}
            sentenceSelected={sentenceSelected}
          />
        </div>
        {candidates && candidates.length !== 0 ? (
          <div className="base_view">
            <ThirdView
              candidates={candidates}
              brushLeft={brushLeft}
              brushRight={brushRight}
              brushRow={brushRow}
              words={words}
              setWords={setWords}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default WritePoetryView;
