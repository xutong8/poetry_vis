import { Rhythm } from '@/pages/WritePoetryView/SecondView/Cell';
import { IEdge } from '@/types/force-graph';
import map1 from '@/data/平水韵.json';
import map2 from '@/data/韵母2声调.json';

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

export const computeRhythm = (word: string) => {
  // 1. word在map1的value里面
  const map1Values = Object.values(map1);
  // 2. 找出value对应的key
  const map1Keys = Object.keys(map1);
  const map1Key = (
    map1Keys[map1Values.findIndex((values) => values.split('').includes(word))] as string
  ).slice(-3, -2);

  return (map2 as any)[map1Key];
};
