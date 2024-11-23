//@ts-nocheck
import { getDegree, scaleLinear } from "./common"
export const degreeMobility = (nodes, adj) => {
    const degree = getDegree(adj);
    const [minE, maxE] = Object.values<number>(degree).reduce<[number, number]>(
        ([minE, maxE], d) => [Math.min(minE, d), Math.max(maxE, d)],
        [Infinity, 0]
    );

    if (maxE !== 0) {
        const linear = scaleLinear().domain([minE, maxE]).range([0.6, 1]);
        nodes.forEach((node) => (node.mobility = linear(degree[node.mgmt_ip])));
    } else {
        nodes.forEach((node) => (node.mobility = 1));
    }
}