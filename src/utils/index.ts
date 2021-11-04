import { IEdge } from '@/types/force-graph';
import map1 from '@/data/平水韵.json';
import map2 from '@/data/韵母2声调.json';
import { Rhyme } from '@/pages/WritePoetryView';

// 计算力导向图link path
export const computeForceLinkPath = (edge: IEdge) => {
  const sourceX = edge.source.x ?? 0;
  const sourceY = edge.source.y ?? 0;
  const targetX = edge.target.x ?? 0;
  const targetY = edge.target.y ?? 0;
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dr = Math.sqrt(dx * dx + dy * dy);

  return `M ${sourceX} ${sourceY}
          A ${dr} ${dr} 0 0 1 ${targetX} ${targetY}`;
};

// 计算韵律
export const computeRhythm = (word: string) => {
  if (!word) return;

  // 1. word在map1的value里面
  const map1Values = Object.values(map1);
  // 2. 找出value对应的key
  const map1Keys = Object.keys(map1);
  const map1Key = (
    map1Keys[map1Values.findIndex((values) => values.split('').includes(word))] as string
  ).slice(-3, -2);

  return (map2 as any)[map1Key];
};

// 根据五言 or 七言生成内容全是''的words
export const generateWords = (rhyme: Rhyme) => {
  const words = [];

  for (let i = 0; i < 4; i++) {
    words[i] = new Array(rhyme).fill('');
  }

  return words;
};

// 五言 -> 2；七言 -> 0；
// 这里做一层映射；
export const mappingForRhyme = (sentenceSelected: Rhyme) => {
  switch (sentenceSelected) {
    case Rhyme.FIVE_WORD:
      return 2;
    case Rhyme.SEVEN_WORD:
      return 0;
    default:
      return 2;
  }
};

// 生成雷达图数据
export const generateRadarDataSource = (emotions: string[]) => {
  return [
    emotions.map((emotion) => ({ value: 0, axis: emotion })),
    emotions.map((emotion) => ({ value: 0.5, axis: emotion }))
  ];
};

// 生成marker
export const generateMarker = (words: string[][], row: number, left: number, right: number) => {
  return words
    .map((rowGroup: string[], rowIndex: number) => {
      const len = rowGroup.length;
      const arr = new Array(len).fill(0);

      if (rowIndex === row) {
        for (let i = left; i <= right; i++) {
          arr[i] = 1;
        }
      }

      return arr.join(',');
    })
    .join('|');
};
