//@ts-nocheck
// 评价指标
// 所有标记为 changed的节点的速度衰减率

import { dis, getDegree } from "./common";

class CalcMatrix {
    constructor(
        prevNoes, // 之前的节点
        prevLinks, // 之前的连边
        nodes,
        links,
        adj,
        linkDistance
    ) {
        this.nodes = nodes;
        this.links = links;
        this.adj = adj
        this.linkDistance = linkDistance
        this.degree = getDegree(adj)
        this.shortestPathMatrix = {};
        for (let node in adj) {
            this.shortestPathMatrix[node] = dijkstra(adj, node); // 有连边的节点到其他节点的最短距离
        }

    }

    energy() {
        let e = 0;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const sp =
                    this.shortestPathMatrix[nodes[i].mgmt_ip]?.[nodes[j].mgmt_ip];
                if (sp) {
                    e += Math.pow(dis(nodes[i], nodes[j]) - sp * this.linkDistance, 2);
                }
            }
        }
        return e;
    }

    deltaPos() {
        this.nodes = []
    }


}
