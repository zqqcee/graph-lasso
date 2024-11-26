//@ts-nocheck
export const restrictForce = (force) => {
    const nodes = force.nodes()
    nodes.forEach((node) => {
        if (node.mobility) {
            node.x += node.mobility * node.vx;
        }
    });
}