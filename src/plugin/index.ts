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
            console.log(algo, 'algo')
            ageMobility(nodes, adj)
            break;
        case 'degree':
            console.log(algo, 'algo')
            degreeMobility(nodes, adj)
            break;
        case 'pin':
            console.log(algo, 'algo')
            pinMobility(nodes, adj, links)
            break;
        case 'markov':
            console.log(algo, 'algo')
            markovMobility(nodes, adj, links)
            break;
        default:
            console.log('default', algo)
            break;
    }

}

export { nodeMobility }