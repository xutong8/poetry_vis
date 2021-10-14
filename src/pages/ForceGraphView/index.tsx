import { Canvas } from '@/canvas/canvas';
import { useElementSize } from '@/hooks/useElementSize';
import { httpRequest } from '@/services';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';
import { forceCenter, forceLink, forceManyBody, forceSimulation, forceCollide } from 'd3-force';
import { Circle } from '@/canvas/shape/circle';
import { backgroundImage, group_stars } from '@/assets/images';
import { Image } from '@/canvas/shape/image';
import { Path } from '@/canvas/shape/path';
import { Text } from '@/canvas/shape/text';

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
  x?: number;
  y?: number;
}

interface IEdge {
  source: INode;
  target: INode;
  link_type: LinkType;
}

const ForceGraphView: React.FC<any> = () => {
  // 获取container的ref
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算canvas的宽度和高度
  const [canvasWidth, canvasHeight] = useElementSize(containerRef);

  // canvasRef
  const canvasRef = useRef<Canvas>();

  // dataRef
  const [apiData, setApiData] = useState<IResponseData>();

  // 发送请求
  const fetchAuthors = async () => {
    const { data } = await httpRequest.get('/getSomeAuthors');
    setApiData(data as IResponseData);
  };

  // 渲染Graph
  const renderGraph = () => {
    const { potery_reltions = [], social_relations = [], author2rank = {} } = apiData ?? {};

    canvasRef.current?.clear();

    // 作者名字数组
    const names = new Set<string>();
    const all_relations = [...potery_reltions, ...social_relations];

    // 保存入names数组中，由于names是set集合，所以会去重
    all_relations.forEach((relation) => {
      names.add(relation[0]);
      names.add(relation[1]);
    });

    // 节点数组
    const nodes: INode[] = Array.from(names).map((name) => ({
      name,
      rank: author2rank[name]
    }));

    // 求节点的最大rank和最小rank
    const max_rank = Math.max(...nodes.map((node) => node.rank)),
      min_rank = Math.min(...nodes.map((node) => node.rank));

    // 边
    const edges: IEdge[] = [];

    // 根据社交关系添加边
    social_relations.forEach((relation) => {
      edges.push({
        source: nodes.find((node) => relation[0] === node.name) as INode,
        target: nodes.find((node) => relation[1] === node.name) as INode,
        link_type: 'social'
      });
    });

    // 根据诗关系添加边
    potery_reltions.forEach((relation) => {
      edges.push({
        source: nodes.find((node) => relation[0] === node.name) as INode,
        target: nodes.find((node) => relation[1] === node.name) as INode,
        link_type: 'poetry'
      });
    });

    const simulation = forceSimulation(nodes as any)
      .force('charge', forceManyBody().distanceMin(30))
      .force('link', forceLink(edges))
      .force(
        'center',
        forceCenter()
          .x(canvasWidth / 2)
          .y(canvasHeight / 2)
      )
      .force('collision', forceCollide(40));

    const canvas: Canvas = new Canvas('force_canvas', {
      width: canvasWidth,
      height: canvasHeight
    });
    canvasRef.current = canvas;

    const image = new Image(
      {
        src: group_stars,
        sx: 0,
        sy: 0,
        swidth: 248,
        sheight: 1055,
        x: 20,
        y: 100,
        width: 124,
        height: 527
      },
      canvas
    );

    simulation.on('tick', () => {
      // 每轮tick绘制之前先清除上一轮tick绘制的图形
      canvas.clear();
      // 添加群星荟萃的图片
      canvas.addChild(image);
      // 添加作者
      nodes.forEach((node) => {
        // 作者
        const circle = new Circle(
          {
            x: node?.x ?? 0,
            y: node?.y ?? 0,
            r: ((node.rank - min_rank) / (max_rank - min_rank)) * 10 + 3,
            fillStyle: '#b77900'
          },
          canvas
        );
        // 作者的名字
        const text = new Text(
          {
            x: node.x ? node.x + 15 : 0,
            y: node.y ? node.y - 15 : 0,
            text: node.name,
            fontStyle: '20px Georgia',
            isFill: true,
            fillStyle: 'black'
          },
          canvas
        );
        canvas.addChild(text);
        canvas.addChild(circle);
      });
      // 添加边
      edges
        .filter((edge) => edge.link_type === 'social')
        .forEach((edge) => {
          const sourceX = edge.source.x ?? 0;
          const sourceY = edge.source.y ?? 0;
          const targetX = edge.target.x ?? 0;
          const targetY = edge.target.y ?? 0;
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const dr = Math.sqrt(dx * dx + dy * dy);

          const link = new Path(
            {
              paths: `
              M ${sourceX} ${sourceY}
              A ${dr} ${dr} 0 0 1 ${targetX} ${targetY}
              `,
              strokeStyle: '#b77900',
              isStroke: true,
              isFill: false
            },
            canvas
          );
          canvas.addChild(link);
        });
      canvas.draw();
    });
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    renderGraph();
  }, [canvasWidth, canvasHeight, canvasRef.current, apiData]);

  return (
    <div
      className="force_container"
      ref={containerRef}
      style={{
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <canvas id="force_canvas"></canvas>
    </div>
  );
};

export default ForceGraphView;
