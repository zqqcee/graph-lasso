// @ts-nocheck
export const getAdjacentMatrix = (edges) => {
    const result = {}
    edges.forEach(e => {
        if (!result[e.source.mgmt_ip]) {
            result[e.source.mgmt_ip] = {}
        }
        if (!result[e.target.mgmt_ip]) {
            result[e.target.mgmt_ip] = {}
        }
        result[e.source.mgmt_ip][e.target.mgmt_ip] = 1
        result[e.target.mgmt_ip][e.source.mgmt_ip] = 1
    })
    return result;
}


export const getDegree = (adjacentMatrix) => {
    let degree = {};
    Object.keys(adjacentMatrix).forEach((key) => {
        degree[key] = Object.keys(adjacentMatrix[key]).length;
    });
    return degree;
}


export function scaleLinear() {
    return {
        minD: NaN,
        maxD: NaN,
        minR: NaN,
        maxR: NaN,
        k: NaN,
        b: NaN,
        domain([d1, d2]: number[]) {
            this.minD = d1;
            this.maxD = d2;
            return this;
        },
        range([r1, r2]: number[]) {
            this.minR = r1;
            this.maxR = r2;
            return (n: number) => {
                if (
                    !Number.isNaN(this.minD) &&
                    !Number.isNaN(this.minR) &&
                    !Number.isNaN(this.maxD) &&
                    !Number.isNaN(this.maxR)
                ) {
                    this.k = (this.maxR - this.minR) / (this.maxD - this.minD);
                    this.b = this.maxR - this.k * this.maxD;
                    return this.k * n + this.b;
                } else {
                    return NaN;
                }
            };
        },
    };
}


export function dijkstra(
    adjacentMatrix,
    start //nodeId
) {
    // 到所有节点的距离
    let distances = {};
    for (let node in adjacentMatrix) {
        distances[node] = Infinity;
    }
    distances[start] = 0;

    let queue: Array<ID> = [];
    queue.push(start);

    while (queue.length > 0) {
        let currentNode = queue.shift();
        if (currentNode !== undefined) {
            let neighbors = adjacentMatrix[currentNode] || {};
            for (let neighbor in neighbors) {
                // 计算从起始节点到该相邻节点的距离
                let distance = distances[currentNode] + neighbors[neighbor];

                // 如果计算出来的距离比已有的距离更短，则更新距离
                if (distance < distances[neighbor]) {
                    distances[neighbor] = distance;
                    queue.push(neighbor);
                }
            }
        }
    }
    return distances;
}

export const dis = (node1, node2) => {
    if (
        node1?.x !== undefined &&
        node2?.x !== undefined &&
        node1?.y !== undefined &&
        node2?.y !== undefined
    ) {
        return Math.sqrt(
            Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2)
        );
    }
    return 0;
}