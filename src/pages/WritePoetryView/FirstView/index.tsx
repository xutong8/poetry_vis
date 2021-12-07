import React from 'react';
import './index.less';
import { IItem, RadarChart } from './RadarChart';
import { httpRequest } from '@/services';
import { Rhyme, SystemScore } from '..';
import { generateWords } from '@/utils';
import { emotions } from './constant';
import { mappingForRhyme, generateRadarDataSource } from '@/utils';
import { WordAnimationObj } from '@/store';

interface IFirstViewProps {
  sentenceSelected: Rhyme;
  setSentenceSelected: (sentenceSelected: number) => void;
  setWords: (words: string[][]) => void;
  setSystemScore: (systemScore: SystemScore) => void;
  setContinuityList: (continuityList: number[][]) => void;
  setRhymeList: (rhymeList: number[][]) => void;
  setBrushRow: (brushRow: number) => void;
  setBrushLeft: (brushLeft: number) => void;
  setBrushRight: (brushRight: number) => void;
  emotionsSelected: string[];
  setEmotionsSelected: (emotionsSelected: string[]) => void;
  radarDataSource: IItem[][];
  setRadarDataSource: (radarDataSource: IItem[][]) => void;
  generateEmotion: () => number[];
  setWordAnimationObj: (wordAnimationObj: WordAnimationObj) => void;
}

const FirstView: React.FC<IFirstViewProps> = (props) => {
  const {
    sentenceSelected,
    setSentenceSelected,
    setWords,
    setSystemScore,
    setContinuityList,
    setRhymeList,
    setBrushRow,
    setBrushLeft,
    setBrushRight,
    emotionsSelected,
    radarDataSource,
    setEmotionsSelected,
    setRadarDataSource,
    generateEmotion,
    setWordAnimationObj
  } = props;

  const getSentenceSelectCls = (sentence: number) => {
    return sentenceSelected === sentence ? 'sentenceSelected' : '';
  };

  // 切换emotion
  const handleChangeEmotion = (emotion: string) => {
    if (emotionsSelected.includes(emotion)) {
      const newEmotionsSelected = emotionsSelected.filter((temp) => temp !== emotion);
      setEmotionsSelected(newEmotionsSelected);
      setRadarDataSource(generateRadarDataSource(newEmotionsSelected));
    } else {
      const newEmotionsSelected = [...emotionsSelected, emotion];
      setEmotionsSelected(newEmotionsSelected);
      setRadarDataSource(generateRadarDataSource(newEmotionsSelected));
    }
  };

  // 点击系统生成按钮触发回调
  const handleClick = async () => {
    // 根据pingList随机生成yun
    const pingList = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27];
    const len = pingList.length;
    const yun = pingList[Math.floor(Math.random() * len)];

    // 发送writePoems请求
    const { data: writePoemsData } = await httpRequest.get(
      `/mode_1/writePoems?emotion=${generateEmotion()}&rhyme=${mappingForRhyme(
        sentenceSelected
      )}&yun=${yun}`,
      {},
      false
    );

    // 修改words的状态
    const words = writePoemsData?.poem ?? generateWords(sentenceSelected);
    setWords(words);

    // poem参数数组
    const poem = words.map((row: string[]) => row.join('')).join('|');

    if (!words || words.length === 0) return;
    // 发送analysePoems请求
    const { data: analysePoemsData } = await httpRequest.get(
      `/mode_1/analysePoem?emotion=${generateEmotion()}&rhyme=${mappingForRhyme(
        sentenceSelected
      )}&yun=${yun}&poem=${poem}`,
      {},
      false
    );

    const systemScore = {
      continuity_score: analysePoemsData?.continuity_score ?? 0,
      emotion_score: analysePoemsData?.emotion_score ?? 0,
      rhyme_score: analysePoemsData?.rhyme_score ?? 0
    } as SystemScore;
    setSystemScore(systemScore);

    // 连贯建议
    const continuity_list = analysePoemsData?.continuity_list ?? [];
    setContinuityList(continuity_list);

    // 韵律建议
    const rhyme_list = analysePoemsData?.rhyme_list ?? [];
    setRhymeList(rhyme_list);

    // 拉取emotion data
    const emotionValues = analysePoemsData?.emotion ?? [];
    const computeActualRadarData = emotionsSelected.map((emotion) => {
      const idx = emotions.indexOf(emotion);
      return {
        value: emotionValues?.[idx] ?? 0,
        axis: emotion
      };
    });

    setRadarDataSource([computeActualRadarData, radarDataSource[1]]);

    // 清空brush
    setBrushRow(-1);
    setBrushLeft(-1);
    setBrushRight(-1);

    setWordAnimationObj({
      show_brush: true,
      fade: true,
      cur_idx: 0
    });
  };

  // 五言 or 七言 click事件
  const handleChangeRhyme = (rhyme: Rhyme) => {
    setSentenceSelected(rhyme);
  };

  return (
    <div className="first_view">
      <div className="title">句式选择</div>
      <div className="sentence_select">
        <div className={`text ${getSentenceSelectCls(5)}`} onClick={() => handleChangeRhyme(5)}>
          五言绝句
        </div>
        <div className={`text ${getSentenceSelectCls(7)}`} onClick={() => handleChangeRhyme(7)}>
          七言绝句
        </div>
      </div>
      <div className="title">情绪选择</div>
      <div className="emotion_select">
        {emotions.map((emotion) => (
          <div
            key={emotion}
            className={`base_emotion text ${
              emotionsSelected.includes(emotion) ? 'emotionSelected' : ''
            }`}
            onClick={() => handleChangeEmotion(emotion)}
          >
            {emotion}
          </div>
        ))}
      </div>
      <div className="radar_container">
        <RadarChart radarDataSource={radarDataSource} setRadarDataSource={setRadarDataSource} />
      </div>
      <div className="radar_buttons">
        <button className="radar_button" onClick={handleClick}>
          系统生成
        </button>
      </div>
    </div>
  );
};

export default FirstView;
