import { write_poetry } from '@/assets/images';
import React, { useState } from 'react';
import styled from 'styled-components';
import FirstView from './FirstView';
import './index.less';
import SecondView from './SecondView';

const WritePoetryView: React.FC<any> = () => {
  // 定义一个state，用于区分当前选中的是五言 or 七言，默认为五言
  const [sentenceSelected, setSentenceSelected] = useState<number>(5);

  // 定义word
  const [words, setWords] = useState<string[][]>([]);

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
          <SecondView />
        </div>
        <div className="base_view"></div>
      </div>
    </div>
  );
};

export default WritePoetryView;
