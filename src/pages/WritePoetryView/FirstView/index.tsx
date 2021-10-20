import React, { useState } from 'react';
import './index.less';
import { emotions } from './constant';
import { RadarChart } from './RadarChart';

interface IFirstViewProps {
  sentenceSelected: number;
  setSentenceSelected: (sentenceSelected: number) => void;
}

const FirstView: React.FC<IFirstViewProps> = (props) => {
  const { sentenceSelected, setSentenceSelected } = props;

  const getSentenceSelectCls = (sentence: number) => {
    return sentenceSelected === sentence ? 'sentenceSelected' : '';
  };

  // 默认选中的情绪
  const [emotionsSelected, setEmotionsSelected] = useState<string[]>([
    '思念远方',
    '军旅悲壮',
    '忧国忧民'
  ]);

  // 切换emotion
  const handleChangeEmotion = (emotion: string) => {
    if (emotionsSelected.includes(emotion))
      setEmotionsSelected(emotionsSelected.filter((temp) => temp !== emotion));
    else setEmotionsSelected([...emotionsSelected, emotion]);
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
        <RadarChart />
      </div>
    </div>
  );
};

export default FirstView;