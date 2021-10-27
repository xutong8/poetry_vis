import { write_poetry } from '@/assets/images';
import { generateWords } from '@/utils';
import React, { useState } from 'react';
import styled from 'styled-components';
import FirstView from './FirstView';
import './index.less';
import SecondView from './SecondView';

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
            setBrushRow={setBrushRow}
            setBrushLeft={setBrushLeft}
            setBrushRight={setBrushRight}
          />
        </div>
        <div className="base_view">
          <SecondView
            words={words}
            systemScore={systemScore}
            rhymeList={rhymeList}
            continuityList={continuityList}
            brushRow={brushRow}
            setBrushRow={setBrushRow}
            brushLeft={brushLeft}
            setBrushLeft={setBrushLeft}
            brushRight={brushRight}
            setBrushRight={setBrushRight}
          />
        </div>
        <div className="base_view"></div>
      </div>
    </div>
  );
};

export default WritePoetryView;
