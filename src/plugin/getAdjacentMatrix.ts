//@ts-nocheck
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