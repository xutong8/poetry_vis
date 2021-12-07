import React from 'react';

export interface WordAnimationObj {
  show_brush: boolean;
  fade: boolean;
  cur_idx: number;
}

export const WordAnimationContext = React.createContext<WordAnimationObj>({
  show_brush: false,
  fade: false,
  cur_idx: 0
});
