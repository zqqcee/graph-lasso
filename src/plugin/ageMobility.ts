//@ts-nocheck

import { getAdjacentMatrix } from "./common";

/**
 * 
 * @param force 力模拟器，用于获取所有节点
 * @param edges 节点的连接关系
 * @returns 
 */
export const ageMobility = (nodes, adj) => {
    const nodesMap = {}
    nodes.forEach(n => {
        nodesMap[n.mgmt_ip] = n
    })
    const newNodes = nodes.filter(d => d.changed)
    const oldNodes = nodes.filter(d => !d.changed)

    // 新节点的年龄 设置为1
    newNodes.forEach(node => {
        node.age = 1
    });
    const unChangeNodesAge = oldNodes.map(n => (n.age || 1)).reduce((prev, cur) => prev + cur);
    const sumNodesAge = nodes.map(n => (n.age || 1)).reduce((prev, cur) => prev + cur);
    // 旧节点的年龄设置
    oldNodes.forEach(node => {
        // 1 如果没有邻居， age + 1
        // 2 如果有邻居，
        nodes.forEach(nodeInAll => {
            if (adj[nodeInAll.mgmt_ip]?.[node.mgmt_ip]) {
                //有邻居
                node.age = (node.age || 1) * (unChangeNodesAge / sumNodesAge) + 1
            }
        })
    })
    // ! 计算mobility
    nodes.forEach((node) => {
        node.mobility = Math.pow(Math.E, node.age);
    });
}
