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