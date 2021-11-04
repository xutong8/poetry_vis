// 默认为不提供建议
export const DEFAULT_SUGGESTION = '不提供';
export const DEFAULT_SUGGESTION_VALUE = 2;

// 连贯性建议
export const CONTINUITY_SUGGESTION = '连贯性';
export const CONTINUITY_SUGGESTION_VALUE = 0;

// 韵律建议
export const RHYME_SUGGESTION = '韵律';
export const RHYME_SUGGESTION_VALUE = 1;

// 建议的数组
export const suggestions = [
  {
    text: CONTINUITY_SUGGESTION,
    value: CONTINUITY_SUGGESTION_VALUE
  },
  {
    text: RHYME_SUGGESTION,
    value: RHYME_SUGGESTION_VALUE
  },
  {
    text: DEFAULT_SUGGESTION,
    value: DEFAULT_SUGGESTION_VALUE
  }
];
// 连贯性和韵律的阈值
export const THRESHOLD_VALUE = 0.65;
