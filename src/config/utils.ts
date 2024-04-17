export const getDescription = (data: {
  nodes: Array<any>;
  links: Array<any>;
}): {
  nodes: number;
  links: number;
  free: number;
  connection: number;
} => {
  const { nodes, links } = data;
  const connectedNodesSet = new Set();
  links.forEach((link) => {
    connectedNodesSet.add(link.source);
    connectedNodesSet.add(link.target);
  });
  const freeNodes = nodes.filter((n) => !connectedNodesSet.has(n.mgmt_ip));

  return {
    nodes: nodes?.length || 0,
    links: links?.length || 0,
    free: freeNodes.length, //游离节点
    connection: 0, // 连通分量
  };
};
