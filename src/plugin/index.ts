/**
 * 在注册力之前，根据新增节点与旧节点计算出一个mobility
 * 在计算力时，使用mobility进行计算
 */
//@ts-nocheck
import { ageMobility } from "./ageMobility";
import { degreeMobility } from "./degreeMobility";

const nodeMobility = ({ nodes, adj }, algo: string) => {
    switch (algo) {
        case 'age':
            ageMobility(nodes, adj)
            break;
        case 'degree':
            degreeMobility(nodes, adj)
    }

}

export { nodeMobility }