export const rangeMapping = (current, total) => {
  // 确保 current 和 total 都是有效的数字
  if (
    typeof current !== "number" ||
    typeof total !== "number" ||
    isNaN(current) ||
    isNaN(total)
  ) {
    throw new Error("current and total must be valid numbers");
  }

  // 确保 total 大于 0
  if (total <= 0) {
    throw new Error("total must be greater than 0");
  }
  // 计算映射后的值

  const ratio = (current - 0) / total;
  const mappedValue = ratio * 1 + 0.3;

  // 确保映射后的值在 0.1 到 1 的范围内
  const mappedInRange = Math.min(Math.max(mappedValue, 0.1), 0.8);

  // 返回 current 在区间中的值
  return mappedInRange;
};
