/**
 * 在注册力之前，根据新增节点与旧节点计算出一个mobility
 * 在计算力时，使用mobility进行计算
 */
//@ts-nocheck
import { ageMobility } from "./ageMobility";
import { degreeMobility } from "./degreeMobility";
import { markovMobility } from "./markovMobility";
import { pinMobility } from "./pinMobility";

const nodeMobility = ({ nodes, adj, links = [] }, algo: string) => {
    switch (algo) {
        case 'age':
            ageMobility(nodes, adj)
            break;
        case 'degree':
            degreeMobility(nodes, adj)
        case 'pin':
            pinMobility(nodes, adj, links)
        case 'markov':
            markovMobility(nodes, adj, links)
    }

}

export { nodeMobility }