import { Canvas } from '@/canvas/canvas';
import { Rect } from '@/canvas/shape/rect';
import { useElementSize } from '@/hooks/useElementSize';
import { httpRequest } from '@/services';
import React, { useEffect, useRef } from 'react';
import './index.less';
import { forceCenter, forceLink, forceManyBody, forceSimulation, forceCollide } from 'd3-force';

interface IAuthor2Rank {
  [authorName: string]: number;
}
interface IResponseData {
  author2rank: IAuthor2Rank;
  // TODO: 后端字段名称有问题
  potery_reltions: [string, string, number][];
  social_relations: [string, string, string, string][];
}

type LinkType = 'social' | 'poetry';

interface INode {
  name: string;
  rank: number;
}

interface IEdge {
  source: number;
  target: number;
  link_type: LinkType;
}

const ForceGraphView: React.FC<any> = () => {
  // 获取container的ref
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算canvas的宽度和高度
  const [canvasWidth, canvasHeight] = useElementSize(containerRef);

  // 发送请求
  const fetchAuthors = async () => {
    const { data } = await httpRequest.get('/getSomeAuthors');
    const { potery_reltions = [], social_relations = [], author2rank = {} } = data as IResponseData;

    // 作者名字数组
    const names = new Set<string>();
    const all_relations = [...potery_reltions, ...social_relations];

    // 保存入names数组中，由于names是set集合，所以会去重
    all_relations.forEach((relation) => {
      names.add(relation[0]);
      names.add(relation[1]);
    });

    // 节点数组
    const nodes = Array.from(names).map((name) => ({
      name,
      rank: author2rank[name]
    }));

    // 求节点的最大rank和最小rank
    const max_rank = Math.max(...nodes.map((node) => node.rank)),
      min_rank = Math.max(...nodes.map((node) => node.rank));

    // 边
    const edges: IEdge[] = [];

    // 根据社交关系添加边
    social_relations.forEach((relation) => {
      edges.push({
        source: nodes.findIndex((node) => relation[0] === node.name),
        target: nodes.findIndex((node) => relation[1] === node.name),
        link_type: 'social'
      });
    });

    // 根据诗关系添加边
    potery_reltions.forEach((relation) => {
      edges.push({
        source: nodes.findIndex((node) => relation[0] === node.name),
        target: nodes.findIndex((node) => relation[1] === node.name),
        link_type: 'poetry'
      });
    });

    const simulation = forceSimulation(nodes as any)
      .force('charge', forceManyBody().distanceMin(100))
      .force('link', forceLink(edges))
      .force(
        'center',
        forceCenter()
          .x(canvasWidth / 2)
          .y(canvasHeight / 2)
      )
      .force('collision', forceCollide(60));

    console.log('nodes: ', nodes);
    console.log('edges: ', edges);
  };

  const render = () => {
    // const canvas = new Canvas('force_canvas');
    // const rect1 = new Rect(
    //   {
    //     x: 10,
    //     y: 10,
    //     width: 50,
    //     height: 50,
    //     fillStyle: 'green'
    //   },
    //   canvas
    // );
    // rect1.on('click', () => {
    //   console.log('rect1 clicked...');
    // });
    // const rect2 = new Rect(
    //   {
    //     x: 20,
    //     y: 20,
    //     width: 20,
    //     height: 20,
    //     fillStyle: 'red'
    //   },
    //   canvas
    // );
    // rect2.on('click', () => {
    //   console.log('rect2 clicked...');
    // });
    // canvas.addChild(rect1);
    // canvas.addChild(rect2);
    // canvas.draw();
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  return (
    <div className="force_container" ref={containerRef}>
      <canvas id="force_canvas" width={canvasWidth} height={canvasHeight}></canvas>
    </div>
  );
};

export default ForceGraphView;
