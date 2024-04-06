// @ts-nocheck

import { v4 as uuid } from "uuid";
import { rangeMapping } from "../utils";
import * as d3 from "d3";

let lasso: any;
let flag = true;
// let velocityDecay = 0.7;
let forceStore;

const avg = (arr: any[]) =>
  Math.floor(arr.reduce((p, c) => p + c) / arr.length);

const init = (res) => {
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
    .force("y", d3.forceY(500))
    .force("x", d3.forceX(500))
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

  return force;
};

export const main = (
  res: { nodes: any[]; links: any[] },
  lassoFlag: boolean,
  isInit: boolean,
  velocityDecay: number
) => {
  let force;
  if (isInit) {
    force = init(res);
    forceStore = force;
  } else {
    force = forceStore;
  }
  let zoom = d3.zoom().scaleExtent([0.5, 5]).on("zoom", zoomed);

  const container = d3.select("#container");
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
    let edges = container
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
    //需要删除的连边，后续需要复原
    const store_selectedRelatedEdges = selectedRelatedEdges.data();
    res.links = res.links.filter((e) => {
      return !store_selectedRelatedEdges.includes(e);
    });
    selectedRelatedEdges.remove();
    const selectedNewLinks = edges.filter((e) => {
      //仅有一个端点在选择中连边其中的
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      //标记哪边的端点在集合中
      if (sourceInSelection) {
        e.source.selected = true;
      } else if (targetInSelection) {
        e.target.selected = true;
      }
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
    //修改端点为聚合点的连边
    const store_newlinks = selectedNewLinks.data().map((link) => {
      const { source, target } = link;
      return {
        source,
        target,
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
      childrenStorelinks: [...store_newlinks],
      childrenRemovelinks: [...store_selectedRelatedEdges],
      newLinks: [...newlinks],
    };

    res.nodes = [...restNodes, newNode];
    //先把这些links从中删掉
    res.links = res.links.filter((e) => {
      return !newlinks.includes(e);
    });
    //添加links，改为聚合点
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
        // if (!flag) {
        //   return;
        // }
        const svg = d3.select("#viewport");
        res.nodes = res.nodes.filter((n) => n.mgmt_ip !== data.mgmt_ip);
        d3.select(this).remove();
        // 处理节点的进入、更新、退出
        let nodeSelection = container
          .selectAll(".circle_group")
          .data(res.nodes);

        console.log(data.children.map((d) => ({ ...d, x: data.x, y: data.y })));
        res.nodes = [
          ...res.nodes,
          ...data.children.map((d) => ({ ...d, x: data.x, y: data.y })),
        ];

        // 使用d3选择并删除newlinks所绘制的边
        data.newLinks.forEach((link) => {
          container
            .selectAll(".edges_group")
            .filter((d) => d === link)
            .remove();
        });
        res.links = [
          ...res.links.filter((e) => {
            return !data.newLinks.includes(e);
          }),
        ];

        //store_selectedRelatedEdges: 之前被删除的连边
        res.links = [
          ...res.links,
          ...data.childrenStorelinks?.map((d) => {
            const source = res.nodes.find(
              (n) => n.mgmt_ip === d.source.mgmt_ip
            );
            const target = res.nodes.find(
              (n) => n.mgmt_ip === d.target.mgmt_ip
            );
            if (source.selected) {
              source.x = data.x;
              source.y = data.y;
            }
            if (target.selected) {
              target.x = data.x;
              target.y = data.y;
            }

            return { ...d, source, target };
          }),
          ...data.childrenRemovelinks?.map((d) => {
            const source = res.nodes.find(
              (n) => n.mgmt_ip === d.source.mgmt_ip
            );
            const target = res.nodes.find(
              (n) => n.mgmt_ip === d.target.mgmt_ip
            );
            source.x = data.x;
            source.y = data.y;
            target.x = data.x;
            target.y = data.y;
            return { ...d, source, target };
          }),
        ];

        let edges = container
          .selectAll(".edges_group")
          .data(res.links)
          .exit()
          .remove();

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
          });
        // .transition()
        // .duration(500)
        // .attr("d", (d) => {
        //   return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
        // });

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
          .attr("cy", data.y);
        // .transition()
        // .duration(500)
        // .attr("cx", (d) => d.x)
        // .attr("cy", (d) => d.y);

        force.nodes(res.nodes);
        force.force("link", d3.forceLink(res.links));
        force.force("collide", null);
        console.log(res.nodes);
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
          // force.stop();
        });
        force.on("end", function () {
          flag = true;
        });
        force.velocityDecay(0.97);
        force.alphaDecay(0.01);
        force.alpha(0.8).restart();
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

  lasso = d3
    .lasso()
    .closePathSelect(true)
    .closePathDistance(100)
    .items(d3.selectAll("circle"))
    .targetArea(d3.select("#viewport"))
    .on("start", lasso_start)
    .on("draw", lasso_draw)
    .on("end", lasso_end);
  document.addEventListener("keydown", (e) => {
    if (e.key === "f") {
      d3.select("#viewport").call(lasso);
    }
    if (e.key === "d") {
      d3.select("#viewport").call(zoom);
    }
  });
};

// (async () => {
//   let sourceData = null;
//   try {
//     sourceData = await d3.json("data/network/demo.json", main);
//   } catch (e) {
//     throw new Error(e);
//   }
// })();
