//@ts-nocheck
export const restrictForce = (force) => {
    const nodes = force.nodes()
    console.log(nodes.filter(d => d.changed))
    nodes.forEach((node) => {
        if (node.mobility) {
            console.log(node.mobility)
            node.x += node.mobility * node.vx;
        }
    });
}