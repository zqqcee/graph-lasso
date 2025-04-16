//@ts-nocheck
export const restrictForce = (force) => {
    const nodes = force.nodes()
    nodes.forEach((node) => {
        if (node.mobility) {
            node.x += node.mobility * node.vx;
            node.y += node.mobility * node.vy;
            node.maxVelocity = Math.max(node.mobility * node.vx, node.maxVelocity || 0)
        } else {
            node.maxVelocity = Math.max(node.vx, node.maxVelocity || 0);
        }
    });
}