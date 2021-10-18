export interface INode {
  name: string;
  rank: number;
  x?: number;
  y?: number;
}

export type LinkType = 'social' | 'poetry';

export interface IEdge {
  source: INode;
  target: INode;
  link_type: LinkType;
}
