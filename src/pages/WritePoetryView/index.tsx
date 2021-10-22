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

const WritePoetryView: React.FC<any> = () => {
  // 定义一个state，用于区分当前选中的是五言 or 七言，默认为五言
  const [sentenceSelected, setSentenceSelected] = useState<Rhyme>(Rhyme.FIVE_WORD);

  // 定义word
  const [words, setWords] = useState<string[][]>(generateWords(sentenceSelected));

  return (
    <div className="write_poetry_container">
      <img src={write_poetry} className="img" />
      <div className="write_poetry_content">
        <div className="base_view">
          <FirstView
            sentenceSelected={sentenceSelected}
            setSentenceSelected={setSentenceSelected}
            setWords={setWords}
          />
        </div>
        <div className="base_view">
          <SecondView words={words} />
        </div>
        <div className="base_view"></div>
      </div>
    </div>
  );
};

export default WritePoetryView;
