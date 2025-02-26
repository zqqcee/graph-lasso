//@ts-nocheck
// 评价指标
// 所有标记为 changed的节点的速度衰减率

import { entries } from "lodash";
import { dijkstra, dis, getAdjacentMatrix, getDegree } from "./common";

export class CalcMatrix {
    constructor(
        prevNodes, // 之前的节点
        prevLinks, // 之前的连边
        nodes,
        links,
        linkDistance,
        costTime,// 花费的时间
    ) {
        this.prevNodes = prevNodes;
        this.prevLinks = prevLinks;
        this.nodes = nodes;
        this.links = links;
        this.linkDistance = linkDistance
        this.costTime = costTime
    }

    energy() {
        let e = 0;
        const adj = getAdjacentMatrix(this.links);
        let shortestPathMatrix = {}
        for (let node in adj) {
            shortestPathMatrix[node] = dijkstra(adj, node)
        }
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const sp = shortestPathMatrix[this.nodes[i].mgmt_ip]?.[this.nodes[j].mgmt_ip];
                if (sp !== Infinity && sp) {
                    e += Math.pow(dis(this.nodes[i], this.nodes[j]) - sp * this.linkDistance, 2);
                }
            }
        }
        return e;
    }

    deltaPos(changed) {
        // nodes 是现存图中的所有节点
        // prev nodes 是原来图中的节点
        let delta = 0;
        let prevNodesMap = {}
        this.prevNodes.forEach((prevNode) => {
            const prevNodeId = prevNode.mgmt_ip
            prevNodesMap[prevNodeId] = prevNode
        })
        this.nodes.forEach((node) => {
            delta += dis(node, prevNodesMap[node.mgmt_ip])
        })
        return delta
    }

    // 节点对之间距离的变化
    deltaLen() {
        let delta = 0;
        let prevNodesMap = {};
        this.prevNodes.forEach((node) => {
            prevNodesMap[node.mgmt_ip] = node;
        });

        this.nodes.forEach((nodeI) => {
            this.nodes.forEach((nodeJ) => {
                let prevNodeI = prevNodesMap[nodeI.mgmt_ip];
                let prevNodeJ = prevNodesMap[nodeJ.mgmt_ip];
                let deltaX = 0;
                let deltaY = 0;
                if (prevNodeI && prevNodeJ) {
                    if (nodeI.x && nodeJ.x && prevNodeI.x && prevNodeJ.x) {
                        deltaX += Math.abs(prevNodeI.x - prevNodeJ.x - (nodeI.x - nodeJ.x));
                    }
                    if (nodeI.y && nodeJ.y && prevNodeI.y && prevNodeJ.y) {
                        deltaY += Math.abs(prevNodeI.y - prevNodeJ.y - (nodeI.y - nodeJ.y));
                    }
                    delta += Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                }
            });
        });
        return delta / 2;
    }

    //正交关系改变节点的个数
    deltaOrth() {
        let delta = 0;
        let deltaX = 0;
        let deltaY = 0;
        let prevNodesMap = {};
        this.prevNodes.forEach((node) => {
            prevNodesMap[node.mgmt_ip] = node;
        });
        for (let i = 0; i < this.nodes.length; i++) {
            let nodeI = this.nodes[i];
            for (let j = i; j < this.nodes.length; j++) {
                let nodeJ = this.nodes[j];
                let prevNodeI = prevNodesMap[nodeI.mgmt_ip];
                let prevNodeJ = prevNodesMap[nodeJ.mgmt_ip];
                if (prevNodeI && prevNodeJ) {
                    if (nodeI.x && nodeJ.x && prevNodeI.x && prevNodeJ.x) {
                        if ((prevNodeI.x - prevNodeJ.x) * (nodeI.x - nodeJ.x) < 0) {
                            delta++;
                            deltaX++;
                        }
                    }
                    if (nodeI.y && nodeJ.y && prevNodeI.y && prevNodeJ.y) {
                        if ((prevNodeI.y - prevNodeJ.y) * (nodeI.y - nodeJ.y) < 0) {
                            delta++;
                            deltaY++;
                        }
                    }
                }
            }
        }
        return {
            delta: delta, deltaX, deltaY
        };
    }

    // 这个函数计算了动态图的 Dynamic Consistency Quality (DCQ)，一个用于衡量动态图在两次状态之间的一致性的指标。
    // 它结合了节点对的几何距离和图论距离，对图布局的动态变化进行评估。
    // DCQ 衡量了几何距离变化（布局）与图论距离变化（结构）的协调性。
    // ! 一个高 DCQ 值表示布局的动态变化与图结构变化保持一致。
    deltaDCQ() {
        let diam1: number = 0,
            diam2: number = 0,
            s1: number = 0,
            s2: number = 0;

        //上一个状态中节点的最远欧式距离
        this.prevNodes.forEach((u) => {
            this.prevNodes.forEach((v) => {
                let distance = dis(u, v);
                s1 = Math.max(distance, s1);
            });
        });
        //当前状态中节点的最远欧式距离
        this.nodes.forEach((u) => {
            this.nodes.forEach((v) => {
                let distance = dis(u, v);
                s2 = Math.max(distance, s2);
            });
        });

        //上一个时间片中的图直径
        const prevAdj = getAdjacentMatrix(this.prevLinks)
        let prevShortestPathMatrix = {};
        for (let node in prevAdj) {
            prevShortestPathMatrix[node] = dijkstra(prevAdj, node);
            //计算直径(G1)
            for (let v in prevShortestPathMatrix[node]) {
                //在节点的最短路径中找最大值图的直径
                diam1 = Math.max(prevShortestPathMatrix[node][v] === Infinity ? -1 : prevShortestPathMatrix[node][v], diam1);
            }
        }

        // 当前的图直径
        const adj = getAdjacentMatrix(this.links)
        let shortestPathMatrix = {}
        for (let node in adj) {
            shortestPathMatrix[node] = dijkstra(adj, node)
            // 计算直径G2
            for (let v in shortestPathMatrix[node]) {
                diam2 = Math.max(shortestPathMatrix[node][v] === Infinity ? -1 : shortestPathMatrix[node][v], diam2);
            }
        }

        //3.按照公式计算DCQ
        let DCQ,
            p = 0,
            nodesize = Math.min(
                this.prevNodes.length,
                this.nodes.length
            );;

        for (let i = 0; i < nodesize; i++) {
            for (let j = i + 1; j < nodesize; j++) {
                let u = this.nodes[i],
                    v = this.nodes[j];
                let prevShortUV = prevShortestPathMatrix[u.mgmt_ip]?.[v.mgmt_ip];
                let shortUV = shortestPathMatrix[u.mgmt_ip]?.[v.mgmt_ip];
                p += Math.abs(
                    Math.abs(
                        ((prevShortUV === Infinity || !prevShortUV) ? 0 : prevShortUV) / diam1 -
                        ((shortUV === Infinity || !shortUV) ? 0 : shortUV) / diam2
                    ) -
                    Math.abs(
                        dis(
                            this.prevNodes[i],
                            this.prevNodes[j]
                        ) /
                        s1 -
                        dis(this.nodes[i], this.nodes[j]) / s2
                    )
                );
            }
        }
        // 图论距离 / 直径
        console.log('----this is p:' + p);
        DCQ = 1 - (2 * p) / Math.pow(nodesize, 2);
        console.log('----this is dcq:' + DCQ);
        return DCQ;
    }

    deltaMobility() {
        return this.nodes.map(n => n.mobility || 1).reduce((p, c) => { return p + c })
    }
    deltaChangedMobility() {
        return this.nodes.filter(d => d.changed).map(n => n.mobility || 1).reduce((p, c) => { return p + c })
    }


    maxVelocity() {
        const avg = (arr: any[]) =>
            Math.floor(arr?.reduce((p, c) => p + c) / arr.length);
        const sum = (arr) => arr?.reduce((p, c) => p + c)
        return sum(this.nodes.map(n => n.maxVelocity))
    }

    getAllMatrix() {
        const energy = this.energy()
        const deltaPos = this.deltaPos()
        const deltaLen = this.deltaLen()
        const deltaOrth = this.deltaOrth()
        const deltaDCQ = this.deltaDCQ() //这个计算了变化的指标
        const deltaMobility = this.deltaMobility()
        const deltaChangedMobility = this.deltaChangedMobility()
        const maxVelocity = this.maxVelocity() //最大速度之和
        const costTime = this.costTime;
        console.log(
            {
                energy,
                deltaPos,
                deltaLen,
                deltaOrth,
                deltaDCQ,
                deltaMobility,
                deltaChangedMobility,
                maxVelocity,
                costTime
            }
        )
    }

}
