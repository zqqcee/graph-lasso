//@ts-nocheck
// 对于旧的节点，如果有连接到新的节点，confidence为0.25，如果没有连接新的节点，confidence为 1
// 对于新的节点，有三种情况：度为0，confidence为0， 度为1，confidence为0， 度大于1，conficence为0.1
import { getDegree } from "./common";

export const pinMobility = (nodes, adj, links) => {
    const degree = getDegree(adj);
    nodes.forEach(node => {
        const nodeId = node.mgmt_ip
        // 1. 计算confidence
        if (node.isNew) {
            //新增或者新减的节点
            node.confidence = degree[nodeId] > 1 ? 0.1 : 0
            return;
        }
        // 旧的有改变的节点
        if (!node.changed) {
            //老节点，且没有连接到新节点
            node.confidence = 1;
        } else {
            //邻阈有更改的节点，这里已经过滤掉了isNew的情况
            node.confidence = 0.25
        }
    })

    // 2. initialize pinning weight of nodes
    nodes.forEach((nodeI) => {
        nodeI.pinWeight = 0.6 * nodeI.confidence;
        nodes.forEach((nodeJ) => {
            if (adj[nodeI.mgmt_ip]?.[nodeJ.mgmt_ip]) {
                nodeI.pinWeight += ((1 - 0.6) / degree[nodeI.mgmt_ip]) * nodeJ.confidence;
            }
        });
    });

    // 3. 构造d0
    let d0Node = {}
    // ! 之前是这样
    // links.forEach((link) => {
    //     if (link.source.changed || link.target.changed) {
    //         //如果link之前存在
    //         d0Node[link.source.mgmt_ip] = true
    //         d0Node[link.target.mgmt_ip] = true
    //     }
    // });
    // D0是所有
    nodes.forEach(node => {
        if (node.isNew)
            d0Node[node.mgmt_ip] = true
    })
    let dPrev = []
    let visited = {}
    let disSet = []
    // 4. 构造dPrev
    nodes.forEach((node) => {
        const nodeId = node.mgmt_ip
        if (d0Node[nodeId] || node.pinWeight < 1) {
            dPrev.push(node);
            visited[nodeId] = true;
        }
    });

    while (true) {
        // initialize of dCurr
        let dCurr = []
        dPrev.forEach((d) => {
            nodes.forEach((node) => {
                if (adj[d.mgmt_ip]?.[node.mgmt_ip] && !visited[node.mgmt_ip]) {
                    dCurr.push(node);
                    visited[node.mgmt_ip] = true;
                }
            });
        });
        if (dCurr.length) {
            disSet.push(dCurr.slice());
            dPrev = dCurr;
        } else {
            break;
        }
    }


    const dMax = disSet.length;
    console.log(dMax, 'max')
    const dCutoff = 0.5 * dMax;
    disSet.forEach((d, i) => {
        if (i >= dCutoff) {
            d.forEach((node) => {
                // node.mobility = -1;
            });
        } else {
            d.forEach((node) => {
                node.mobility = Math.pow(0.35, 1 - i / dCutoff);
            });
        }
    });

}