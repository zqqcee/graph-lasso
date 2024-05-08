// @ts-nocheck
//TOOD: 调整聚合强度时出现问题
import { v4 as uuid } from "uuid";
import { rangeMapping } from "./utils";
import * as d3 from "d3";

let lasso: any;
let flag = true;
let velocityDecay = 0.7;
let alpha = 0.5;
let collide = 8;
let alphaMin = 0.01;
let alphaDecay = 0.01;
let linkStrength = 0.4;
let forceStore;

const getValidateId = (id: string) =>
  `id_${id.replaceAll("-", "").replaceAll(".", "")}`;
const avg = (arr: any[]) =>
  Math.floor(arr.reduce((p, c) => p + c) / arr.length);

const init = (res) => {
  const svg = d3.select("#viewport").attr("height", 1000).attr("width", 1000);
  svg.selectAll("*").remove();
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
    .attr("stroke-width", 0.5)
    .on("click", (d) => console.log(d));
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
      d3
        .forceLink(res.links)
        .strength(linkStrength)
        .id(function (d) {
          return d.mgmt_ip;
        })
    )
    .force("collide", d3.forceCollide(collide))
    .force("charge", d3.forceManyBody().strength(-10))
    // .force("center", d3.forceCenter(500, 500))
    .force("y", d3.forceY(500).strength(0.04))
    .force("x", d3.forceX(500).strength(0.04))
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
  data: { nodes: any[]; links: any[] },
  lassoFlag: boolean,
  isInit: boolean,
  velocityDecayAt: number,
  alphaAt: number,
  collideAt: number,
  alphaMinAt: number,
  alphaDecayAt: number,
  linkStrengthAt: number
) => {
  velocityDecay = velocityDecayAt;
  alpha = alphaAt;
  collide = collideAt;
  alphaMin = alphaMinAt;
  alphaDecay = alphaDecayAt;
  linkStrength = linkStrengthAt;
  let force;
  let res = data;
  //expdata,筛选出与exp相关的节点

  //  /**
  //   *   const expIp = "125.217.47.42";
  //   *
  //   res.links = res.links.filter((d) => {
  //   *     return d.source === expIp || d.target === expIp;
  //   *   });
  //   *   const nodeset = new Set();
  //   *   nodeset.add(expIp);
  //   *   res.links.forEach((e) => {
  //   *     nodeset.add(e.source);
  //   *     nodeset.add(e.target);
  //   *   });
  //   *   res.nodes = res.nodes.filter((d) => nodeset.has(d.mgmt_ip));

  //添加id

  if (isInit) {
    res.links = res.links.map((l, id) => ({ ...l, id }));
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
    const uniqueId = uuid();

    /**
     * 保留删除连边的动画
     */
    const needToDelEdges = edges.filter((e) => {
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      return sourceInSelection && targetInSelection;
    });
    //需要删除的连边，后续需要复原
    const needToDelEdgesData = needToDelEdges.data();
    const needToDelEdgesDataIds = needToDelEdgesData.map((d) => d.id);
    res.links = res.links.filter((e) => !needToDelEdgesDataIds.includes(e.id));
    needToDelEdges.remove();

    const needToEditEdges = res.links.filter((e) => {
      //仅有一个端点在选择中连边其中的
      const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
      const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
      if (e.id == "7") {
        console.log(7);
      }
      //标记哪边的端点在集合中
      if (sourceInSelection) {
        e.source.selected = true;
      } else if (targetInSelection) {
        e.target.selected = true;
      }
      // return (
      //   (sourceInSelection && !targetInSelection) ||
      //   (targetInSelection && !sourceInSelection)
      // );
      return sourceInSelection || targetInSelection;
    });
    // .attr("id", getValidateId(uniqueId));

    // needToEditEdges
    //   .transition()
    //   .duration(1000)
    //   .attr("d", (d) => {
    //     if (selectedNodesSet.has(d.source.mgmt_ip)) {
    //       return `M ${avgX} ${avgY} L ${d.target.x} ${d.target.y}`;
    //     } else if (selectedNodesSet.has(d.target.mgmt_ip)) {
    //       return `M ${d.source.x} ${d.source.y} L ${avgX} ${avgY}`;
    //     }
    //   });
    const needToEditEdgesData = needToEditEdges;
    const needToEditEdgesDataIds = needToEditEdgesData.map((d) => d.id);
    //先把这些links从中删掉
    res.links = res.links.filter((e) => {
      return !needToEditEdgesData.includes(e);
    });

    const restNodes = res.nodes.filter((n) => !selectedNodesSet.has(n.mgmt_ip));

    // 将selectedNewLinks数据中的起点和终点保存在一个数组中
    //缓存连边关系
    const store_newlinks = needToEditEdgesData.map((link) => {
      const { source, target, id } = link;
      return {
        source,
        target,
        id,
      };
    });
    const newNode = {
      mgmt_ip: uniqueId,
      fill: "red",
      className: "new-circle",
      x: avgX,
      y: avgY,
      children: selectedNodesData,
      childrenStorelinks: [...store_newlinks], // 聚合前的连边关系
      childrenRemovelinks: [...needToDelEdgesData], // 聚合后删除的连边，需要复原
      childrenEditlinks: [...needToEditEdgesData],
    };

    res.nodes = [...restNodes, newNode];

    container
      .selectAll(".edges_group")
      .data(res.links, (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
      .exit()
      .remove();
    //添加links，改为聚合点
    needToEditEdgesData.forEach((e) => {
      if (selectedNodesSet.has(e.source.mgmt_ip)) {
        e.source = newNode;
      }
      if (selectedNodesSet.has(e.target.mgmt_ip)) {
        e.target = newNode;
      }
    });

    res.links = [...res.links, ...needToEditEdgesData];
    container
      .selectAll(".edges_group")
      // .data(res.links)
      .data(res.links, (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
      .enter()
      .append("g")
      .attr("class", "edges_group")
      .attr("id", (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
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
      .data(res.nodes, (d) => d.mgmt_ip)
      .enter()
      .append("g")
      .attr("class", "circle_group")
      .append("circle")
      .attr("class", "new-circle")
      .attr("id", (d) => uniqueId)
      .attr("r", 3.5)
      .attr("cx", avgX)
      .attr("cy", avgY)
      .attr("fill", "blue")
      .on("contextmenu", function (data) {
        d3.event.preventDefault();
        // if (!flag) {
        //   return;
        // }
        let linkUpdate = res.links.filter((e) => {
          return e.source === data || e.target === data;
        });
        const svg = d3.select("#viewport");
        res.nodes = res.nodes.filter((n) => n.mgmt_ip !== data.mgmt_ip);
        d3.select(this).remove();
        // 处理节点的进入、更新、退出
        let nodeSelection = container
          .selectAll(".circle_group")
          .data(res.nodes, (d) => d.mgmt_ip);

        res.nodes = [
          ...res.nodes,
          ...data.children.map((d) => ({ ...d, x: data.x, y: data.y })),
        ];

        // 删除Editlinks所绘制的边
        // data.childrenEditlinks.forEach((link) => {
        //   container
        //     .selectAll(".edges_group")
        //     .filter((d) => {
        //       return d === link;
        //     })
        //     .remove();
        // });
        d3.selectAll(`#${getValidateId(data.mgmt_ip)}`).remove();
        for (let i = 0; i < linkUpdate.length; i++) {
          let link = linkUpdate[i];
          for (let j = 0; j < data.childrenStorelinks.length; j++) {
            if (link.id == data.childrenStorelinks[j].id) {
              if (link.source.mgmt_ip === data.mgmt_ip) {
                link.source = res.nodes.find(
                  (n) => n.mgmt_ip === data.childrenStorelinks[j].source.mgmt_ip
                );
              }
              if (link.target.mgmt_ip === data.mgmt_ip) {
                link.target = res.nodes.find(
                  (n) => n.mgmt_ip === data.childrenStorelinks[j].target.mgmt_ip
                );
              }
            }
          }
        }
        res.links = res.links.filter((e) => {
          return !data.childrenEditlinks.includes(e);
        });
        res.links = [
          ...res.links,
          // ...data.childrenStorelinks?.map((d) => {
          //   const source = res.nodes.find(
          //     (n) => n.mgmt_ip === d.source.mgmt_ip
          //   );
          //   const target = res.nodes.find(
          //     (n) => n.mgmt_ip === d.target.mgmt_ip
          //   );

          //   if (source?.selected) {
          //     source.x = data.x;
          //     source.y = data.y;
          //   }
          //   if (target?.selected) {
          //     target.x = data.x;
          //     target.y = data.y;
          //   }

          //   return { ...d, source, target };
          // }),
          ...linkUpdate,
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

        container
          .selectAll(".edges_group")
          .data(res.links, (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
          .exit()
          .remove();

        // let edges = container
        //   .selectAll(".edges_group")
        //   .data(res.links)
        //   .exit()
        //   .remove();
        // 处理边线的进入、更新、退出
        container
          .selectAll(".edges_group")
          .data(res.links)
          // .data(res.links, (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
          .enter()
          .append("g")
          .attr("class", "edges_group")
          .attr("id", (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip)
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

        nodeSelection
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
        force.nodes(res.nodes);
        force.force("link", d3.forceLink(res.links).strength(linkStrength));
        // force.force("collide", null);
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
        force.velocityDecay(0.96);
        force.alpha(0.3).restart();
        force.force("y", d3.forceY(500).strength(0.04));
        force.force("x", d3.forceX(500).strength(0.04));
        // force.force("y", d3.forceY(500));
        // force.force("x", d3.forceX(500));
        // 添加震荡
        setTimeout(() => {
          //todo: zqc
          force.alphaMin(0);
          force.velocityDecay(0.93);
          force.alpha(0.5).restart();
        }, 1000);

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
    force.force("link", d3.forceLink(res.links).strength(linkStrength));
    force.force("collide", d3.forceCollide(collide));
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
      // Number(
      //   rangeMapping(selectedNodesData.length, res.nodes.length) / 20
      // ).toFixed(2) < 0.2
      //   ? 0.4
      //   : Number(
      //       rangeMapping(selectedNodesData.length, res.nodes.length) / 20
      //     ).toFixed(2)
      alpha
    ); //区间映射
    force.alphaMin(alphaMin);
    force.force("collide", d3.forceCollide(collide));
    force.velocityDecay(0.7);
    force.alphaDecay(0.01);
    force.alphaMin(0);
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
  // lasso.call(d3.select("#viewport"));
};

// (async () => {
//   let sourceData = null;
//   try {
//     sourceData = await d3.json("data/network/demo.json", main);
//   } catch (e) {
//     throw new Error(e);
//   }
// })();
