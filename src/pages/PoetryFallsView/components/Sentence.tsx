import React, { useState } from 'react';
import '../index.less';
interface Props {
  data: any;
  z: number;
}

const font_size = 18;

const Sentence: React.FC<Props> = (props) => {
  const [isMouseOover, setMouseOover] = useState<boolean>(false);
  const { data, z } = props;
  const { x, y, content, id } = data;
  const size = font_size * (1 - 0.005 * z);
  const words = content.split(''),
    words_num = words.length,
    opacity_k = words_num > 0 ? 1 / words_num : 1;
  return (
    <div
      style={{ left: x, top: y, cursor: 'pointer' }}
      className={(isMouseOover ? 'sentence_over ' : '') + 'sentence animate' + id} //
      onMouseOver={() => setMouseOover(true)}
      onMouseOut={() => setMouseOover(false)}
    >
      {words.map((word: string, index: number) => {
        const opacity = opacity_k * index * 0.7 + 0.3; //+0.4*(1-z)
        return (
          <span key={index} className="word" style={{ opacity: opacity, fontSize: size }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

export default Sentence;
