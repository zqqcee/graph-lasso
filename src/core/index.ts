import { v4 as uuid } from "uuid";
// @ts-ignore
import { rangeMapping } from "../utils";
import * as d3 from "d3";

console.log(d3);

let lasso: any;
let flag = true;
let velocityDecay = 0.7;
// document.querySelector("#strong").addEventListener("click", () => {
//   velocityDecay = 0.3;
//   document
//     .querySelectorAll("button")
//     .forEach((d) => (d.style.background = "#fff"));
//   document.querySelector("#strong").style.background = "#e1ffc2";
// });
// document.querySelector("#mid").addEventListener("click", () => {
//   velocityDecay = 0.7;
//   document
//     .querySelectorAll("button")
//     .forEach((d) => (d.style.background = "#fff"));
//   document.querySelector("#mid").style.background = "#e1ffc2";
// });
// document.querySelector("#weak").addEventListener("click", () => {
//   velocityDecay = 0.99;
//   document
//     .querySelectorAll("button")
//     .forEach((d) => (d.style.background = "#fff"));
//   document.querySelector("#weak").style.background = "#e1ffc2";
// });
const avg = (arr: any[]) =>
  Math.floor(arr.reduce((p, c) => p + c) / arr.length);
export const main = (res: { nodes: any[]; links: any[] }) => {
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
      container.selectAll(".edge").attr("d", (d) => {
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
    const avgX = avg(selectedNodesData.map((d) => d.x));
    const avgY = avg(selectedNodesData.map((d) => d.y));
    edges = container
      .selectAll(".edges_group")
      .data(res.links, (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip);

    const selectedNodesSet = new Set(selectedNodesData.map((n) => n.mgmt_ip));

    /**
     * 保留删除连边的动画
     */
    const selectedRelatedEdges = edges.filter((e) => {
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      return sourceInSelection && targetInSelection;
    });
    const store_selectedRelatedEdges = selectedRelatedEdges.data();
    res.links = res.links.filter((e) => {
      return !store_selectedRelatedEdges.includes(e);
    });
    selectedRelatedEdges.remove();
    const selectedNewLinks = edges.filter((e) => {
      //仅有一个端点在选择中连边其中的
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      return (
        (sourceInSelection && !targetInSelection) ||
        (targetInSelection && !sourceInSelection)
      );
    });

    selectedNewLinks
      .transition()
      .duration(1000)
      .attr("d", (d) => {
        if (selectedNodesSet.has(d.source.mgmt_ip)) {
          return `M ${avgX} ${avgY} L ${d.target.x} ${d.target.y}`;
        } else if (selectedNodesSet.has(d.target.mgmt_ip)) {
          return `M ${d.source.x} ${d.source.y} L ${avgX} ${avgY}`;
        }
      });

    const newlinks = edges.data().filter((e) => {
      //仅有一个端点在选择中连边其中的
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      return (
        (sourceInSelection && !targetInSelection) ||
        (targetInSelection && !sourceInSelection)
      );
    });
    const restNodes = res.nodes.filter((n) => !selectedNodesSet.has(n.mgmt_ip));

    // 将selectedNewLinks数据中的起点和终点保存在一个数组中

    const store_newlinks = selectedNewLinks.data().map((link) => {
      const source = link.source;
      const target = link.target;
      return {
        source: source,
        target: target,
      };
    });
    const uniqueId = uuid();
    const newNode = {
      mgmt_ip: uniqueId,
      fill: "red",
      className: "new-circle",
      x: avgX,
      y: avgY,
      children: selectedNodesData,
      childrenlinks: [...store_newlinks],
    };

    res.nodes = [...restNodes, newNode];
    res.links = res.links.filter((e) => {
      return !newlinks.includes(e);
    });
    //res.links 端点先改成聚合点
    newlinks.forEach((e) => {
      if (selectedNodesSet.has(e.source.mgmt_ip)) {
        e.source = newNode;
      }
      if (selectedNodesSet.has(e.target.mgmt_ip)) {
        e.target = newNode;
      }
    });
    res.links = [...res.links, ...newlinks];

    let newNodeCoordinates = []; // 用于存储新生成点的坐标
    /**
     * 主要设置生成新节点的动画以及被选中节点消失的动画过渡效果
     */
    container
      .selectAll(".circle_group")
      .data(res.nodes, (d) => d.mgmt_ip)
      .enter()
      .append("g")
      .attr("class", "circle_group")
      .append("circle")
      .attr("class", "new-circle")
      .attr("id", function (d) {
        console.log("新生成的节点", d);
        return uniqueId;
      })
      .attr("r", 3.5)
      .attr("cx", avgX)
      .attr("cy", avgY)
      .attr("fill", "blue")
      .on("contextmenu", function (data) {
        d3.event.preventDefault();
        if (!flag) {
          return;
        }
        res.nodes = res.nodes.filter((n) => n.mgmt_ip !== data.mgmt_ip);
        d3.select(this).remove();
        // 使用d3选择并删除newlinks所绘制的边
        newlinks.forEach((link) => {
          container
            .selectAll(".edges_group")
            .filter((d) => d === link)
            .remove();
        });
        res.links = [
          ...res.links.filter((e) => {
            return !newlinks.includes(e);
          }),
        ];
        edges = container
          .selectAll(".edges_group")
          .data(res.links, (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
          .exit()
          .remove();
        res.links = [
          ...res.links,
          ...store_selectedRelatedEdges,
          ...store_newlinks,
        ];

        // 处理边线的进入、更新、退出
        edges = container
          .selectAll(".edges_group")
          .data(res.links, (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
          .enter()
          .append("g")
          .attr("class", "edges_group")
          .append("path")
          .attr("class", "edge")
          .attr("stroke", "#caadad")
          .attr("stroke-width", 0.5)
          .attr("d", (d) => {
            return `M ${data.x} ${data.y} L ${data.x} ${data.y}`;
          })
          .transition()
          .duration(500)
          .attr("d", (d) => {
            return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
          });

        // 处理节点的进入、更新、退出
        let nodeSelection = container
          .selectAll(".circle_group")
          .data(res.nodes);

        res.nodes = [...res.nodes, ...data.children];

        let nodeEnter = nodeSelection
          .data(res.nodes, (d) => d.mgmt_ip)
          .enter()
          .append("g")
          .attr("class", "circle_group")
          .append("circle")
          .attr("fill", "black")
          .attr("class", "circle")
          .attr("r", 3.5)
          .attr("cx", data.x)
          .attr("cy", data.y)
          .transition()
          .duration(500)
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y);

        force.nodes(res.nodes);
        force.force("link", d3.forceLink(res.links));
        force.force("collide", d3.forceCollide(5));
        force.velocityDecay(0.8);
        force.on("tick", () => {
          d3.selectAll(".circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
          container.selectAll(".edge").attr("d", (d) => {
            return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
          });
          d3.selectAll(".new-circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y);
          flag = false;
        });
        force.on("end", function () {
          flag = true;
        });
        setTimeout(function () {
          force.alpha(0.8).restart();
        }, 400);
        lasso = d3
          .lasso()
          .closePathSelect(true)
          .closePathDistance(100)
          .items(d3.selectAll(".circle"))
          .targetArea(svg)
          .on("start", lasso_start)
          .on("draw", lasso_draw)
          .on("end", lasso_end);

        svg.call(lasso);
        svg.call(zoom);
      })
      .style("opacity", 0) // 设置初始透明度为0
      .transition()
      .duration(1000) // 过渡动画持续时间为1秒
      .style("opacity", 1) // 设置最终透明度为1
      .each(function (d) {
        if (d.mgmt_ip === uniqueId) {
          const cx = d3.select(this).attr("cx");
          const cy = d3.select(this).attr("cy");
          newNodeCoordinates.push({ x: cx, y: cy });
        }
      });

    let count = 0;
    force.nodes(res.nodes);
    force.force("link", d3.forceLink(res.links));
    force.force("collide", d3.forceCollide(5));
    force.on("tick", () => {
      if (count === 260) {
        selectedNodesItem.remove();
      }
      d3.selectAll(".circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
      container.selectAll(".edge").attr("d", (d) => {
        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
      });
      let tempx = 0;
      let tempy = 0;
      d3.selectAll(".new-circle")
        .attr("cx", (d) => {
          tempx = d.x;
          return d.x;
        })
        .attr("cy", (d) => {
          tempy = d.y;
          return d.y;
        });
      /**
       * 被选中的节点聚合的过程中，其他节点也会一直调整布局
       */
      selectedNodesItem
        .attr("cx", (d) => d.x - ((d.x - tempx) / 260) * count)
        .attr("cy", (d) => d.y - ((d.y - tempy) / 260) * count);

      count += 5;
      flag = false;
    });
    force.on("end", function () {
      flag = true;
    });
    force.alpha(
      Number(
        rangeMapping(selectedNodesData.length, res.nodes.length) / 20
      ).toFixed(2) < 0.2
        ? 0.4
        : Number(
            rangeMapping(selectedNodesData.length, res.nodes.length) / 20
          ).toFixed(2)
    ); //区间映射
    force.velocityDecay(velocityDecay);
    force.alphaDecay(0.01);
    force.restart();
  };

  console.log(d3);
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

// (async () => {
//   let sourceData = null;
//   try {
//     sourceData = await d3.json("data/network/demo.json", main);
//   } catch (e) {
//     throw new Error(e);
//   }
// })();
