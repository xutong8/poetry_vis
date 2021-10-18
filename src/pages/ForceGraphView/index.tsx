import { useElementSize } from '@/hooks/useElementSize';
import { httpRequest } from '@/services';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';
import { forceCenter, forceLink, forceManyBody, forceSimulation, forceCollide } from 'd3-force';
import { backgroundImage, group_stars } from '@/assets/images';
import { selectAll, select } from 'd3-selection';

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
  // 获取content的ref
  const contentRef = useRef<HTMLDivElement>(null);

  // 计算svg的宽度和高度
  const [svgWidth, svgHeight] = useElementSize(contentRef);

  // dataRef
  const [apiData, setApiData] = useState<IResponseData>();

  // nodes的state
  const [nodesState, setNodesState] = useState<INode[]>([]);
  // edges的state
  const [edgesState, setEdgesState] = useState<IEdge[]>([]);

  // 最小的边rank
  const [minRank, setMinRank] = useState<number>(0);
  // 最大的边rank
  const [maxRank, setMaxRank] = useState<number>(0);

  // 发送请求
  const fetchAuthors = async () => {
    const { data } = await httpRequest.get('/getSomeAuthors');
    setApiData(data as IResponseData);
  };

  // 渲染Graph
  const renderGraph = () => {
    const { potery_reltions = [], social_relations = [], author2rank = {} } = apiData ?? {};

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

    setNodesState(nodes);
    setEdgesState(edges);
    setMinRank(min_rank);
    setMaxRank(max_rank);
  };

  // 重新调整布局
  const relayoutGraph = () => {
    const simulation = forceSimulation(nodesState as any)
      .force('charge', forceManyBody().distanceMin(30))
      .force('link', forceLink(edgesState))
      .force(
        'center',
        forceCenter()
          .x(svgWidth / 2)
          .y(svgHeight / 2)
      )
      .force('collision', forceCollide(40));

    simulation.on('tick', () => {
      // 添加作者
      select('.force_svg')
        .select('.force_nodes')
        .selectAll('.force_node')
        .select('.force_circle')
        .data(nodesState)
        .attr('cx', (d) => d.x as number)
        .attr('cy', (d) => d.y as number);

      // 添加作者名字
      select('.force_svg')
        .select('.force_nodes')
        .selectAll('.force_node')
        .select('.force_text')
        .data(nodesState)
        .attr('x', (d) => (d.x ? d.x + 15 : 0) as number)
        .attr('y', (d) => (d.y ? d.y - 15 : 0) as number);

      // 添加边
      select('.force_svg')
        .select('.force_edges')
        .selectAll('.force_edge')
        .data(edgesState)
        .attr('d', (edge: IEdge) => {
          const sourceX = edge.source.x ?? 0;
          const sourceY = edge.source.y ?? 0;
          const targetX = edge.target.x ?? 0;
          const targetY = edge.target.y ?? 0;
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const dr = Math.sqrt(dx * dx + dy * dy);

          return `M ${sourceX} ${sourceY}
          A ${dr} ${dr} 0 0 1 ${targetX} ${targetY}`;
        });
    });
  };

  const bindEvents = () => {
    select('.force_svg')
      .select('.force_nodes')
      .selectAll('.force_node')
      .select('.force_circle')
      .data(nodesState)
      .on('mouseenter', function () {
        select(this).attr('r', 14);
      })
      .on('mouseleave', function (event, node) {
        select(this).attr(
          'r',
          minRank !== maxRank ? ((node.rank - minRank) / (maxRank - minRank)) * 10 + 3 : 0
        );
      });
  };

  const unbindEvents = () => {
    select('.force_svg')
      .select('.force_nodes')
      .selectAll('.force_node')
      .select('.force_circle')
      .on('mouseenter', null)
      .on('mouseleave', null);
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    renderGraph();
  }, [svgWidth, svgHeight, apiData]);

  useEffect(() => {
    relayoutGraph();
  }, [nodesState, edgesState]);

  useEffect(() => {
    bindEvents();
    return () => unbindEvents();
  }, [minRank, maxRank, nodesState, edgesState]);

  useEffect(() => {}, [contentRef.current]);

  return (
    <div
      className="force_container"
      style={{
        backgroundImage: `url(${backgroundImage})`
      }}
    >
      <img src={group_stars} className="img" />
      <div className="force_content" ref={contentRef}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="force_svg">
          <g className="force_nodes">
            {nodesState.map((node) => {
              return (
                <g className="force_node" key={node.name}>
                  <circle
                    className="force_circle"
                    cx={node.x ? node.x + 15 : 0}
                    cy={node.y ? node.y - 15 : 0}
                    r={
                      minRank !== maxRank
                        ? ((node.rank - minRank) / (maxRank - minRank)) * 10 + 3
                        : 0
                    }
                    fill={'#b77900'}
                  />
                  <text className="force_text" x={node.x} y={node.y} fill={'black'}>
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
          <g className="force_edges">
            {edgesState
              .filter((edge) => edge.link_type === 'social')
              .map((edge: IEdge, index: number) => {
                const sourceX = edge.source.x ?? 0;
                const sourceY = edge.source.y ?? 0;
                const targetX = edge.target.x ?? 0;
                const targetY = edge.target.y ?? 0;
                const dx = targetX - sourceX;
                const dy = targetY - sourceY;
                const dr = Math.sqrt(dx * dx + dy * dy);
                return (
                  <path
                    className="force_edge"
                    key={index}
                    d={`M ${sourceX} ${sourceY}
                  A ${dr} ${dr} 0 0 1 ${targetX} ${targetY}`}
                    stroke="#b77900"
                    fill="none"
                  />
                );
              })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default ForceGraphView;
