export const getSortedCombos = (combos, nodes = []) => {
  // 邻接
  const combosMap = {};
  combos.forEach((combo) => {
    combosMap[combo.id] = { ...combo };
  });

  // 转树
  const tree = [];
  for (const [key, value] of Object.entries(combosMap)) {
    if (typeof combosMap[key].parentId === 'undefined') {
      tree.push(value);
    } else {
      const parent = combosMap[value.parentId];
      parent.children = [...(parent.children || []), value];
    }
  }

  // 广度
  const stack = tree;
  const combosRight = [];
  while (stack.length !== 0) {
    const node = stack.shift();
    combosRight.push(node);
    node.children && stack.push(...node.children);
  }

  // 添加node子节点
  nodes.forEach((node) => {
    const combo = combosMap[node.comboId];
    if (combo) {
      combo.children = [...(combo.children || []), node.id];
    }
  });

  // 每个combo加上children
  return combosRight
    .map((combo) => {
      return { ...combo, children: combo.children?.map((node) => node.id) || [] };
    })
    .reverse();
};
