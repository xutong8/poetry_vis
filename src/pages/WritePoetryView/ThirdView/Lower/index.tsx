import { httpRequest } from '@/services';
import React, { useEffect, useRef, useState } from 'react';
import { Candidate, RecommendWord, Rhyme } from '../..';
import { gou, backwards, black, red, maobi } from '@/assets/images';
import './index.less';
import { hierarchy } from 'd3-hierarchy';
import { select } from 'd3-selection';
import * as d3 from 'd3';
import { mappingForRhyme, generateMarker, generateYun } from '@/utils';

// 根节点，用于生成d3.tree
interface Root {
  index: string;
  update_words: string;
  x0: number;
  y0: number;
  children: RingWord[];
  [key: string]: any;
}

// 栈,root表示当前根节点，last_root记录之前的根节点，以便返回
interface stack {
  root: Root | null;
  last_root: Root[];
}

// 环中显示的字
interface RingWord {
  name: string;
  probability: number;
  children?: RingWord[];
  [key: string]: any;
}

// d3.tree节点
interface Node {
  data: RingWord;
  depth: number;
  height: number;
  parent: Node;
  x: number;
  y: number;
  children?: Node[];
  x0?: number;
  y0?: number;
  [key: string]: any;
}

interface LowerViewProps {
  brushLeft: number;
  brushRight: number;
  brushRow: number;
  words: string[][];
  sentenceSelected: Rhyme;
  setCandidates: (candidates: Candidate[]) => void;
  recommendWords: RecommendWord[];
  generateEmotion: () => number[];
  updateWords: (text: string) => void;
}

const Lower: React.FC<LowerViewProps> = (props) => {
  const {
    recommendWords,
    words,
    brushRow,
    brushLeft,
    brushRight,
    sentenceSelected,
    generateEmotion,
    updateWords,
    setCandidates
  } = props;
  const [width, height] = [800, 800];
  const stack = useRef<stack>({ root: null, last_root: [] });

  // 复用旧逻辑处理数据
  const handleData = (origin: RecommendWord[]) => {
    let temp = {
      name: '',
      probability: 0,
      children: [] as RingWord[]
    } as RingWord;
    const data = temp;

    function sort_pro(a: RingWord, b: RingWord) {
      return b.probability - a.probability;
    }
    // RecommendWord[0]是内环，RecommendWord[1]是内环第一个字对应的外环
    origin.forEach((elm, index) => {
      for (let i in elm) {
        let word = {
          name: i,
          probability: elm[i] as any as number
        };
        temp.children?.push(word);
      }
      temp.children?.sort(sort_pro);
      temp = temp.children![0];
      temp.children = [];
    });
    return data;
  };

  // 返回上一步
  const onBack = () => {
    let { last_root } = stack.current;
    if (last_root.length == 0) return;
    stack.current.root = last_root.pop() as Root;
    select('.update_words').text(stack.current.root.update_words);
    update(stack.current.root);
  };

  // 完成编辑
  const onFinish = () => {
    // 未选择完推荐字则不替换
    if (select('.update_words').text().length < brushRight - brushLeft + 1) {
      return;
    }
    updateWords(select('.update_words').text());
    // 清空候选词，隐藏第三视图
    setCandidates([]);
  };

  const update = (root: Root) => {
    let treeRoot = hierarchy(root);
    const tree = d3
      .tree()
      .size([360, 320])
      .separation(function (a, b) {
        return (a.parent == b.parent ? 1 : 2) / a.depth;
      });
    tree(treeRoot);

    let i = 0,
      duration = 1000;
    let svg = select('#lowerSvg').select('g');
    let nodes = treeRoot.descendants() as any as Node[];

    nodes.forEach(function (d) {
      d.y = 230 * Math.log2(d.depth + 1);
    });
    // 删除之前所有的元素
    svg.selectAll('g.node').remove();

    // 创建g标签，g标签下有circle和text
    let nodeEnter = svg
      .selectAll('g.node')
      .data(nodes, function (d: any) {
        return d.id || (d.id = ++i);
      })
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('id', function (d) {
        return d.depth;
      })
      .on('click', (e, d) => click(root, d));

    nodeEnter
      .append('circle')
      .attr('r', 20)
      .attr('opacity', (d) => {
        return d.data.probability * 14;
      })
      .style('fill', function (d) {
        return d.depth
          ? d.data.name == stack.current.root?.index
            ? 'url(#chosen)'
            : 'url(#unchosen)'
          : 'none';
      });

    nodeEnter
      .append('text')
      .attr('dy', '.3em')
      .attr('dx', '-.45em')
      .attr('transform', function (d) {
        return 'rotate(' + (-d.x + 90) + ')';
      })
      .text(function (d) {
        if (d.depth == 0) return '';
        return d.data.name;
      })
      .attr('font-size', 45)
      .style('fill-opacity', 1e-6)
      .call(d3.drag().on('drag', dragmove).on('end', dragend) as any);

    // 给g标签增加过渡动画
    let nodeUpdate = svg
      .selectAll('g.node')
      .data(nodes)
      .transition()
      .duration(duration)
      .attr('transform', function (d) {
        return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
      });

    nodeUpdate
      .select('circle')
      .attr('r', 60)
      .style('fill', function (d: any) {
        return d.depth
          ? d.data.name == stack.current.root?.index && d.depth == 1
            ? 'url(#chosen)'
            : 'url(#unchosen)'
          : 'none';
      });

    nodeUpdate.select('text').style('fill-opacity', 1);

    // // Transition exiting nodes to the parent's new position.
    // let nodeExit = svg
    //   .selectAll('g.node')
    //   .data(nodes, function (d: any) {
    //     return d.id || (d.id = ++i);
    //   })
    //   .exit()
    //   .transition()
    //   .duration(duration)
    //   .attr('transform', function (d: any) {
    //     return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
    //   })
    //   .remove();

    // nodeExit.select('circle').attr('r', 1e-6);

    // nodeExit.select('text').style('fill-opacity', 1e-6);

    // 缓存过渡前的位置
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  };

  function dragmove(this: Element, e: any, d: any) {
    function getTranslation(transform: any) {
      let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttributeNS(null, 'transform', transform);
      let matrix = g.transform.baseVal.consolidate()?.matrix;
      return [matrix?.e, matrix?.f];
    }
    // 选择当前拖动的text节点
    let text = select(this).node();
    let translate = getTranslation(text?.getAttribute('transform'));
    let rotate = (text?.parentNode as any)
      .getAttribute('transform')
      .match(/\((.+?)\)/g)[1]
      .replace(/[(|)]/g, '');
    select(this)
      .attr(
        'transform',
        'translate(' +
          (translate[0] + e.dx) +
          ',' +
          (translate[1] + e.dy) +
          ') rotate(' +
          -rotate +
          ')'
      )
      .attr('class', 'chosen_text');
  }

  function dragend() {
    let { root, last_root } = stack.current;
    let text = select('.chosen_text').node() as HTMLElement;
    let update_words = select('.update_words').node() as HTMLElement;
    if (text == null) {
      return;
    }
    if (
      Math.abs(text.getBoundingClientRect().x - update_words.getBoundingClientRect().x) <= 40 &&
      Math.abs(text.getBoundingClientRect().y - update_words.getBoundingClientRect().y) <= 40
    ) {
      let rotate = (text?.parentNode as any)
        .getAttribute('transform')
        .match(/\((.+?)\)/g)[1]
        .replace(/[(|)]/g, '');
      select('.chosen_text')
        .attr('transform', 'rotate(' + -rotate + ')')
        .attr('class', '');

      let used_words = update_words.innerHTML;
      let new_words = used_words + text.innerHTML;
      select('.update_words').text(new_words);

      // 后续还有未选择的字则向后端发起请求
      if (new_words.length != brushRight - brushLeft) {
        getDistribution(new_words, true);
      } else {
        let new_root;
        for (let i = 0; i < root!.children.length; i++) {
          if (root!.children[i].name == text.innerHTML) {
            new_root = JSON.parse(JSON.stringify(root!.children[i]));
            new_root.x0 = 400;
            new_root.y0 = 0;
            new_root.children = JSON.parse(JSON.stringify(root!.children[0].children));
            new_root.update_words = new_words;
            new_root.index = '';
            break;
          }
        }
        last_root.push(root!);
        stack.current.root = new_root;
        update(new_root);
      }
    }
  }

  const click = (root: Root, d: Node) => {
    if (d.depth != 1) return;
    let used_words = select('.update_words')?.text();
    let new_words = used_words + d.data.name;

    if (d.parent.children && d.parent.children[0].children) {
      getDistribution(new_words, false);
    }
  };

  /**
   * 获取下一个环的推荐字
   *
   * @param new_words 选中的词
   * @param flag treu表示拖拽时触发，false表示点击时触发
   */
  const getDistribution = (new_words: string, flag: boolean) => {
    let { root, last_root } = stack.current;

    let newWords: string[][] = JSON.parse(JSON.stringify(words));
    for (let i = brushLeft, j = 0; i <= brushRight && j < new_words.length; i++, j++) {
      newWords[brushRow][i] = new_words[j];
    }
    const poem = newWords.map((row: string[]) => row.join('')).join('|');
    httpRequest
      .get(
        `/mode_1/get_distribution?emotion=${generateEmotion().join(
          ','
        )}&poem=${poem}&rhyme=${mappingForRhyme(
          sentenceSelected
        )}&yun=${generateYun()}&marker=${generateMarker(
          newWords,
          brushRow,
          brushLeft + new_words.length,
          brushRight
        )}`,
        {},
        false
      )
      .then((res) => {
        if (flag) {
          last_root.push(root!);
          let new_root = handleData(res.data) as any as Root;
          new_root.x0 = 400;
          new_root.y0 = 0;
          new_root.update_words = new_words;
          stack.current.root = new_root;
          update(new_root);
        } else {
          last_root.push(root!);
          let new_root = JSON.parse(JSON.stringify(root));
          new_root.children[0].children = handleData(res.data).children;
          new_root.children[0].children[0].children = null;
          new_root.index = new_words[new_words.length - 1];
          stack.current.root = new_root;
          update(new_root);
        }
      });
  };

  useEffect(() => {
    const data = handleData(recommendWords);
    // 生成root
    if (data.children && data.children.length !== 0) {
      stack.current.root = {
        index: data.children[0].name,
        update_words: '',
        x0: height / 2,
        y0: 0,
        children: data.children
      };
    }
    if (!stack.current.root) return;
    // 清除之前的选中文字
    select('.update_words').text('');
    // 更新视图
    update(stack.current.root);
  }, [recommendWords]);

  return (
    <div className="lower">
      <svg id="lowerSvg" className="lowerSvg" viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          <text className="update_words" textAnchor="middle" fontSize="70" dy="10"></text>
          <image
            width="120"
            height="120"
            xlinkHref={backwards}
            x="-450"
            y="-200"
            onClick={onBack}
          />
          <image width="100" height="120" xlinkHref={gou} x="-450" y="0" onClick={onFinish} />
          <image width="80" height="80" xlinkHref={maobi} x="-40" y="-40" opacity="0.5"></image>
          <defs>
            <pattern id="chosen" width="100" height="100">
              <image xlinkHref={red} width="120" height="120" x={0} y={0} />
            </pattern>
            <pattern id="unchosen" width="100" height="100">
              <image xlinkHref={black} width="120" height="120" x={0} y={0} opacity="0.8" />
            </pattern>
          </defs>
        </g>
      </svg>
    </div>
  );
};

export default Lower;
