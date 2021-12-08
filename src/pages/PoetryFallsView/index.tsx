import React, { useState, useEffect } from 'react';
import { httpRequest } from '@/services';
import { clip_article } from '@/assets/images';
import useWindowSize from '@/hooks/use-windows-size';
import Sentence from './components/sentence';
import './index.less';

type ResponseData = [string, string][][];

const font_size = 30;
// const max_stage_nums = 3;
const stage_dist = 10;
const poetry_margin = 30;

const PoetryFallsView: React.FC = () => {
  const [poteryStages, setPoteryStages] = useState<any[]>([]);
  const [width, height] = useWindowSize();

  const addPoetries = () => {
    const arrangePosition = (poetries: any) => {
      // 去掉同层的遮挡
      poetries = poetries.sort((a: any, b: any) => a.x - b.x);
      poetries.forEach((elm: any, index: number) => {
        if (index === 0) return;
        const former = poetries[index - 1];
        const x = elm.x,
          former_x = former.x + font_size + poetry_margin;
        if (former_x > x) {
          elm.x = former_x + Math.random() * 3;
        }
      });
    };

    httpRequest.get('/getSomePoteries/').then((res) => {
      let poetry_stagess = (res.data as ResponseData).map((arr: any[], index: number) => {
        let poetries = arr.map((elm) => {
          const [id, content] = elm;
          const x = Math.random() * width, //*0.9+width*0.05,
            y = Math.random() * height * 3 - height;

          document.styleSheets[0].insertRule(
            '@keyframes keyframe_' +
              id +
              '{' +
              '0% {transform:translateY(' +
              (-height).toString() +
              'px)}' +
              '100% {transform:translateY(' +
              (height - y).toString() +
              'px)}' +
              '}'
          );
          document.styleSheets[0].insertRule(
            '.animate' +
              id +
              '{' +
              'animation-name: keyframe_' +
              id +
              ';' +
              'animation-duration: ' +
              (Math.random() * 15 + 20).toString() +
              's;' +
              'animation-timing-function: linear;' +
              'animation-iteration-count: infinite;' +
              '}'
          );
          return {
            id: id,
            content: content,
            x: x,
            y: y,
            height: content.split('').length * font_size + 10,
            speed: Math.random() / 2 + 0.5,
            _show: true
          };
        });
        // poetry_stagess.push(poetries as any);
        arrangePosition(poetries);
        return {
          poetries: poetries,
          z: (index + 1) * stage_dist
        };
      });
      poetry_stagess.forEach((elm, index) => {
        let poetries = [...elm.poetries];
        for (let i = 1; i < 10; i++) {
          const next = poetry_stagess[index + i];
          if (next) poetries = [...poetries, ...next.poetries];
        }
        arrangePosition(poetries);
      });
      setPoteryStages(poetry_stagess);
    });
  };

  useEffect(() => {
    addPoetries();
  }, [width, height]);

  return (
    <div className="poetry-page">
      <img className="title" src={clip_article} alt="title" />
      <div>
        {poteryStages.map((elm, stage_index) => {
          const { poetries, z } = elm;
          const opacity = 1;
          return (
            <div key={stage_index} className="stage" style={{ opacity: opacity }}>
              {poetries.map((elm: any, index: number) => (
                <Sentence
                  key={index}
                  z={z}
                  data={elm}
                  // onClick={this.handleClickPotery.bind(this)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PoetryFallsView;
