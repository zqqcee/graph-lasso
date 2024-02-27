import { v4 as uuid } from "uuid";
let lasso;
const mergeNodes = (nodes, edges) => {};
const avg = (arr) => Math.floor(arr.reduce((p, c) => p + c) / arr.length);
const main = (res) => {
  const svg = d3.select("#viewport").attr("height", 1000).attr("width", 1000);
  const container = svg.append("g").attr("id", "container");
  let edges = container
    .selectAll(".edges_group")
    .data(res.links)
    .enter()
    .append("g")
    .attr("class", "edges_group")
    .append("path")
    .attr("class", "edge")
    .attr("stroke", "#caadad")
    .attr("stroke-width", 0.5);
  const circles = container
    .selectAll(".circle_group")
    .data(res.nodes, (d) => d.mgmt_ip)
    .enter()
    .append("g")
    .attr("class", "circle_group")
    .append("circle")
    .attr("class", (d) => d.className || "circle")
    .attr("fill", (d) => d.fill)
    .attr("r", 3.5)
    .attr("cx", 100)
    .attr("cy", 100);

  let force = d3
    .forceSimulation(res.nodes)
    .force(
      "link",
      d3.forceLink(res.links).id(function (d) {
        return d.mgmt_ip;
      })
    )
    .force(
      "collide",
      d3.forceCollide(function (d) {
        return 8;
      })
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(500, 500))
    .force("y", d3.forceY(0))
    .force("x", d3.forceX(0))
    .on("tick", () => {
      d3.selectAll(".circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
        
      d3.selectAll(".edge")
        .data(res.links)
        .attr("d", (d) => {
          return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
        });
      d3.selectAll(".new-circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    });

  let zoom = d3.zoom().scaleExtent([0.5, 5]).on("zoom", zoomed);

  function zoomed() {
    let currentTransform = d3.event.transform;
    container.attr("transform", currentTransform);
  }
  //lasso
  const lasso_start = () => {
    lasso
      .items()
      .attr("r", 3.5) // reset size
      .classed("not_possible", true)
      .classed("selected", false);
  };
  const lasso_draw = () => {
    // Style the possible dots
    lasso
      .possibleItems()
      .classed("not_possible", false)
      .classed("possible", true);
    // Style the not possible dot
    lasso
      .notPossibleItems()
      .classed("not_possible", true)
      .classed("possible", false);
  };
  const lasso_end = () => {
    // Reset the style of the not selected dots
    lasso.items().classed("not_possible", false).classed("possible", false);
    // Style the selected dots
    const selectedNodesItem = lasso.selectedItems(); //选择的DOM
    const selectedNodesData = selectedNodesItem.data(); //选择的NodeData
    const avgX = avg(selectedNodesData.map((d) => d.x))
    const avgY = avg(selectedNodesData.map((d) => d.y))
    
    const selectedNodesSet = new Set(selectedNodesData.map((n) => n.mgmt_ip));
    /**
     * 此处是对原来svg视图中的渲染好的edge进行删除
     */
    const selectedRelatedEdges = edges.filter((e) => {
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      return sourceInSelection || targetInSelection;
    });
    console.log(selectedRelatedEdges)
    selectedRelatedEdges.remove();
    /**
     * 这里是对res.link数据直接进行修改，再用d3渲染
     */
    const newlinks = res.links.filter((e) => {
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      return (sourceInSelection && !targetInSelection) || (targetInSelection && !sourceInSelection);
    });
    const removelinks = res.links.filter((e)=>{
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      return sourceInSelection || targetInSelection;
    })
    res.links = res.links.filter((e) => !removelinks.includes(e))
    container.selectAll(".edge").data(res.links)
      .attr("d", (d) => {
        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
      });
      
    const uniqueId = uuid();
    const restNodes = res.nodes.filter((n) => !selectedNodesSet.has(n.mgmt_ip));
    const newNode = {
      mgmt_ip: uniqueId,
      fill: "red",
      className: "new-circle",
      x: avgX,
      y: avgY,
    }
    const newNodes = [
      ...restNodes,
      newNode,
    ];
    /**
     * 给修改端点的边添加动画在加入到res.link中
     * 再用d3进行渲染
     */
    newlinks.forEach((e) => {
      if (selectedNodesSet.has(e.source.mgmt_ip)) {
        d3.select(".edges_group")
          .append("path")
          .attr("class", "edge")
          .attr("stroke", "#caadad")
          .attr("stroke-width", 0.5)
          .attr("d", `M ${e.source.x} ${e.source.y} L ${e.target.x} ${e.target.y}`)
          .transition()
          .duration(1000)
          .attr("d", `M ${avgX} ${avgY} L ${e.target.x} ${e.target.y}`);
          e.source = newNode
      }
      if (selectedNodesSet.has(e.target.mgmt_ip)) {
        d3.select(".edges_group")
          .append("path")
          .attr("class", "edge")
          .attr("stroke", "#caadad")
          .attr("stroke-width", 0.5)
          .attr("d", `M ${e.source.x} ${e.source.y} L ${e.target.x} ${e.target.y}`)
          .transition()
          .duration(1000)
          .attr("d", `M ${e.source.x} ${e.source.y} L ${avgX} ${avgY}`);
        e.target = newNode
      }
    });
    res.links = [...res.links, ...newlinks];
    container
      .selectAll(".edges_group")
      .data(res.links,d => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
      .enter()
      .append("g")
      .attr("class", "edges_group")
      .append("path")
      .attr("class", "edge")
      .attr("stroke", "#caadad")
      .attr("stroke-width", 0.5)
      .attr("d", (d) => {
        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
      });
    
    let newNodeCoordinates = []; // 用于存储新生成点的坐标
    /**
     * 主要设置生成新节点的动画以及被选中节点消失的动画过渡效果
     */
    container
      .selectAll(".circle_group")
      .data(newNodes, (d) => d.mgmt_ip)
      .enter()
      .append("circle")
      .attr("class", "new-circle")
      .attr("r", 3.5)
      .attr("cx", avgX)
      .attr("cy", avgY)
      .attr("fill", "blue")
      .style("opacity", 0) // 设置初始透明度为0
      .transition()
      .duration(1000) // 过渡动画持续时间为1秒
      .style("opacity", 1) // 设置最终透明度为1)
      .each(function(d) {
        if (d.mgmt_ip === uniqueId) {
          const cx = d3.select(this).attr("cx");
          const cy = d3.select(this).attr("cy");
          newNodeCoordinates.push({ x: cx, y: cy });
        }
      });
    selectedNodesItem
      .transition()
      .duration(700)
      .ease(d3.easeLinear)
      .attr("cx", newNodeCoordinates[0].x)
      .attr("cy", newNodeCoordinates[0].y)
      .remove()
      
    if (selectedNodesSet.size) {
        //TODO: 根据节点的数量来设置alpha的初始值
        // 更新力导向图的节点和边
        force.nodes(newNodes);
        force.alpha(0.1);
        setTimeout(function() {
          force
            .alphaTarget(0)
            .restart();
        }, 1700);
        // console.log(force.on("tick"));
      }
  };

  lasso = d3
    .lasso()
    .closePathSelect(true)
    .closePathDistance(100)
    .items(circles)
    .targetArea(svg)
    .on("start", lasso_start)
    .on("draw", lasso_draw)
    .on("end", lasso_end);

  svg.call(lasso);
  svg.call(zoom);
};

(async () => {
  let sourceData = null;
  try {
    sourceData = await d3.json("data/network/demo.json", main);
  } catch (e) {
    throw new Error(e);
  }
})();
