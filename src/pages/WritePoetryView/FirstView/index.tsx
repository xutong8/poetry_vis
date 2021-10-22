import React, { useState } from 'react';
import './index.less';
import { emotions } from './constant';
import { IItem, RadarChart } from './RadarChart';
import { httpRequest } from '@/services';
import { Rhyme } from '..';
import { generateWords } from '@/utils';

interface IFirstViewProps {
  sentenceSelected: Rhyme;
  setSentenceSelected: (sentenceSelected: number) => void;
  setWords: (words: string[][]) => void;
}

const FirstView: React.FC<IFirstViewProps> = (props) => {
  const { sentenceSelected, setSentenceSelected, setWords } = props;

  const getSentenceSelectCls = (sentence: number) => {
    return sentenceSelected === sentence ? 'sentenceSelected' : '';
  };

  // 默认选中的情绪
  const [emotionsSelected, setEmotionsSelected] = useState<string[]>([
    '思念远方',
    '军旅悲壮',
    '忧国忧民'
  ]);

  // 生成雷达图数据
  const generateRadarDataSource = (emotions: string[]) => {
    return [
      emotions.map((emotion) => ({ value: 0, axis: emotion })),
      emotions.map((emotion) => ({ value: 0.5, axis: emotion }))
    ];
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

  // radarChart dataSource
  const [radarDataSource, setRadarDataSource] = useState<IItem[][]>(
    generateRadarDataSource(emotionsSelected)
  );

  // 生成emotion
  const generateEmotion = () =>
    emotions.map((emotion) => radarDataSource[1].find((item) => item.axis === emotion)?.value ?? 0);

  // 五言 -> 2；七言 -> 0；
  // 这里做一层映射；
  const mappingForRhyme = (sentenceSelected: Rhyme) => {
    switch (sentenceSelected) {
      case Rhyme.FIVE_WORD:
        return 2;
      case Rhyme.SEVEN_WORD:
        return 0;
      default:
        return 2;
    }
  };

  // 点击系统生成按钮触发回调
  const handleClick = async () => {
    // 根据pingList随机生成yun
    const pingList = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27];
    const len = pingList.length;
    const yun = pingList[Math.floor(Math.random() * len)];

    // 发送请求
    const { data } = await httpRequest.get(
      `/mode_1/writePoems?emotion=${generateEmotion()}&rhyme=${mappingForRhyme(
        sentenceSelected
      )}&yun=${yun}`,
      {},
      false
    );

    // 修改words的状态
    const words = data?.poem ?? generateWords(sentenceSelected);
    setWords(words);
  };

  return (
    <div className="first_view">
      <div className="title">句式选择</div>
      <div className="sentence_select">
        <div className={`text ${getSentenceSelectCls(5)}`} onClick={() => setSentenceSelected(5)}>
          五言绝句
        </div>
        <div className={`text ${getSentenceSelectCls(7)}`} onClick={() => setSentenceSelected(7)}>
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
