import React, { useState, useEffect } from 'react';
import { httpRequest } from '@/services';
import { cloud_fly } from '@/assets/images';
import useWindowSize from '@/hooks/use-windows-size';
import './index.less';
import WordCloudGenerator from './components/wordcloud-generator';

type ResponseData = [string, number][];

export interface Word {
  text: string;
  value: number;
}

const WordCloudView: React.FC = () => {
  const [width, height] = useWindowSize();
  const [data, setData] = useState<Word[]>([]);

  const getTotalValue = (data: Word[]) => data.reduce((total, elm) => total + elm.value, 0);
  /**
   * 处理数据
   * @param data 服务端返回的数据
   */

  const handleResponseData = (data: ResponseData) => {
    // 数组转为对象数组
    const newData: Word[] = data.map((elm) => {
      return {
        text: elm[0],
        value: elm[1]
      };
    });
    // 计算总和
    const totalVaule = getTotalValue(newData);
    // value修改为权重百分比
    newData.forEach((elm) => (elm.value /= totalVaule));
    setData(newData);
  };

  const fetchData = async () => {
    const { data } = await httpRequest.get('/getSomeWords');
    handleResponseData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="word-page">
      <img className="title" src={cloud_fly} alt="title" />
      <WordCloudGenerator width={width} height={height} initData={data} />
    </div>
  );
};

export default WordCloudView;
