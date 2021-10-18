import { IEdge } from '@/types/force-graph';

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
