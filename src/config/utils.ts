//@ts-nocheck
export const getDescription = (data: {
  nodes: Array<any>;
  links: Array<any>;
}): {
  nodes: number;
  links: number;
  free: number;
  connection: number;
  averageClustering: number
} => {
  const { nodes, links } = data;
  const connectedNodesSet = new Set();
  links.forEach((link) => {
    connectedNodesSet.add(link.source);
    connectedNodesSet.add(link.target);
  });
  const freeNodes = nodes.filter((n) => !connectedNodesSet.has(n.mgmt_ip));
  const averageClustering = averageClusteringCoefficient(data)

  return {
    nodes: nodes?.length || 0,
    links: links?.length || 0,
    free: freeNodes.length, //游离节点
    connection: 0, // 连通分量
    averageClustering, //平均聚类系数
  };
};




// 创建一个邻接列表（邻居关系图）
function createAdjList(graph) {
  const adjList = {};
  graph.nodes.forEach(node => {
    adjList[node.mgmt_ip] = [];
  });

  graph.links.forEach(link => {
    adjList[link.source].push(link.target);
    adjList[link.target].push(link.source);
  });

  return adjList;
}

// 计算节点的聚类系数
function clusteringCoefficient(node, adjList) {
  const neighbors = adjList[node];
  const numNeighbors = neighbors.length;

  // 如果节点的度数小于2，则聚类系数为0
  if (numNeighbors < 2) {
    return 0;
  }

  // 计算实际的边数
  let actualEdges = 0;
  for (let i = 0; i < numNeighbors; i++) {
    for (let j = i + 1; j < numNeighbors; j++) {
      if (adjList[neighbors[i]].includes(neighbors[j])) {
        actualEdges++;
      }
    }
  }

  // 计算节点的聚类系数
  const possibleEdges = numNeighbors * (numNeighbors - 1) / 2;
  return actualEdges / possibleEdges;
}

// 计算图的平均聚类系数
function averageClusteringCoefficient(graph) {
  // const adjList = createAdjList(graph);
  let totalClusteringCoefficient = 0;
  let nodeCount = 0;

  // graph.nodes.forEach(node => \{

  //   const coeff = clusteringCoefficient(node.mgmt_ip, adjList);
  //   totalClusteringCoefficient += coeff;
  //   nodeCount++;
  // });

  // return totalClusteringCoefficient / nodeCount;
}

// 输出图的平均聚类系数
