
//@ts-nocheck
import { dijkstra, getDegree, scaleLinear } from "./common"

let defaultDistance = 50;

export const markovMobility = (nodes, adj, links) => {
    const degree = getDegree(adj)

    let shortestPathMatrix: Record<ID, Record<ID, number>> = {};
    for (let node in adj) {
        shortestPathMatrix[node] = dijkstra(adj, node); // 有连边的节点到其他节点的最短距离
    }

    //1.计算节点的初始移动概率，分为三个部分
    //1.1 第一部分需要计算为理想距离与实际距离之差
    nodes.forEach((nodeI) => {
        nodes.forEach((nodeJ) => {
            if (adj[nodeI.mgmt_ip]?.[nodeJ.mgmt_ip]) {
                let idealDistance =
                    defaultDistance * shortestPathMatrix[nodeI.mgmt_ip][nodeJ.mgmt_ip];
                let deltaX = nodeI.x - nodeJ.x;
                let deltaY = nodeI.y - nodeJ.y;
                nodeI.pos =
                    Math.abs(
                        Math.sqrt(deltaX * deltaX + deltaY * deltaY) - idealDistance
                    ) / idealDistance;
            }
        });
        if (degree[nodeI.mgmt_ip]) {
            nodeI.pos /= degree[nodeI.mgmt_ip];
        } else {
            nodeI.pos = 0 // TODO: 确认一下
        }
    });

    let p0 = {}
    //1.2 如果节点是新增的，则其移动概率+1
    nodes.forEach((node) => {
        p0[node.mgmt_ip] = 0;//初始概率为0
        if (node.isNew) {
            node.mov = 1 + node.pos;
        } else {
            node.mov = node.pos;
        }
    });

    //1.3 针对每条新增的连边，会影响连边两端的节点的移动概率
    nodes.forEach(node => {
        if (node.changed && degree[node.mgmt_ip]) {
            p0[node.mgmt_ip] += (1 / degree[node.mgmt_ip])
        }
    })

    //2.计算转移矩阵，直接得到逆马尔可夫矩阵，行的和为1
    let I = {} //影响力矩阵
    nodes.forEach((nodeI) => {
        p0[nodeI.mgmt_ip] = (p0[nodeI.mgmt_ip] || 0) + nodeI.mov;
        nodes.forEach((nodeJ) => {
            if (!I[nodeI.mgmt_ip]) {
                I[nodeI.mgmt_ip] = {};
            }
            if (
                shortestPathMatrix[nodeI.mgmt_ip]?.[nodeJ.mgmt_ip] === 1 &&
                nodeI.mgmt_ip !== nodeJ.mgmt_ip
            ) {
                I[nodeI.mgmt_ip][nodeJ.mgmt_ip] = 1 / degree[nodeI.mgmt_ip];
            } else {
                I[nodeI.mgmt_ip][nodeJ.mgmt_ip] = 0;
            }
        });
    });


    //3. 转移矩阵，计算马尔可夫链达到稳定，也就是p0不再发生变化
    let diff = 1;
    let a = 0.8;
    let sum;
    let lastSum = 0;
    let res = {};
    let p = {};
    for (let node in p0) {
        p[node] = p0[node];
    }
    while (diff > 0.1) {
        // matrix product res = p0 * I
        for (let line in I) {
            res[line] = 0;
            for (let node in p0) {
                res[line] += p0[node] * I[line]?.[node];
            }
        }
        sum = 0;
        for (let node in res) {
            sum += res[node];
        }
        sum *= a;

        diff = Math.abs(sum - lastSum);

        // p0 = res, res = res * a, p += res
        for (let node in res) {
            p0[node] = res[node];
            res[node] *= a;
            p[node] += res[node];
        }
        a *= 0.8;
        lastSum = sum;
    }


    //4. 归一化
    const linear = scaleLinear()
        .domain([Math.min(...Object.values(p)), Math.max(...Object.values(p))])
        .range([0.2, 1]);
    nodes.forEach((node) => {
        node.mobility = linear(p[node.mgmt_ip]);
    });
}