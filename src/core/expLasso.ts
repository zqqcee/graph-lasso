import * as d3 from "d3";
import { v4 as uuid } from "uuid";
import { clone, cloneDeep } from "lodash";
import { restrictForce } from '../plugin/restrictForce'
import { case1, case2, case3, case4 } from "../config/lassoConfig/con_twitter";
import { s2case1, s2case2 } from "../config/lassoConfig/s2";
import { s3case1 } from "../config/lassoConfig/s3";
import { link } from "fs";
let lasso: any;
let selectCase: [];
let flag = true;//标记是否可展开
let velocityDecay = 0.7;
let alpha = 0.5;
let collide = 8;
let alphaMin = 0.01;
let alphaDecay = 0.01;
let linkStrength = 0.4;
let linkDistance = 30
let forceStore;
let prevNodes = []
let prevLinks = [];
let evalMatrix = {}
let lassoendRef = () => { }
const getValidateId = (id: string) =>
  `id_${id.replaceAll("-", "").replaceAll(".", "")}`;
const avg = (arr: any[]) =>
  Math.floor(arr?.reduce((p, c) => p + c) / arr.length);

let startTime: number; // 记录第一次点击的时间

/**
 * 封装节点聚合和节点收缩
 * @param res 
 * @param selectedNodesItem 
 * @param zoom 
 * @param algo 
 * @param force 
 * @param lasso_start 
 * @param lasso_draw 
 * @param lasso_end 
 */
function handleNodesAggreation(res, selectedNodesItem, zoom, force, lasso_start, lasso_draw, lasso_end) {

  const container = d3.select("#container");
  //TODO-1.5: 这里是要聚合的节点
  const selectedNodesData = [...new Map(selectedNodesItem.data().map(item => [item.mgmt_ip, item])).values()]; //选择的NodeData
  console.log(selectedNodesData.map(d => d.mgmt_ip))

  const avgX = avg(selectedNodesData.map((d) => d.x));
  const avgY = avg(selectedNodesData.map((d) => d.y));
  let edges = container
    .selectAll(".edges_group")
    .data(res.links, (d) => d.source.mgmt_ip + "-" + d.target.mgmt_ip);

  const selectedNodesSet = new Set(selectedNodesData.map((n) => n.mgmt_ip));
  const uniqueId = uuid();
  res.nodes.forEach(n => { n.changed = 0, n.isNew = 0 }) // ! 先重置

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

  // ! 修改 mobility
  const needToEditEdges = res.links.filter((e) => {
    //仅有一个端点在选择中连边其中的
    const sourceInSelection = selectedNodesSet.has(e.source.mgmt_ip);
    const targetInSelection = selectedNodesSet.has(e.target.mgmt_ip);
    //标记哪边的端点在集合中
    if (sourceInSelection) {
      e.source.selected = true;
      e.target.changed = 1
    } else if (targetInSelection) {
      e.target.selected = true;
      e.source.changed = 1
    }
    return sourceInSelection || targetInSelection;
  });

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

  // ! 修改 mobility
  const newNode = {
    mgmt_ip: uniqueId,
    fill: "red",
    className: "new-circle",
    x: avgX,
    y: avgY,
    changed: 1,
    isNew: 1, // ! 标记是一个新节点
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
      // 展开
      d3.event.preventDefault();
      let linkUpdate = res.links.filter((e) => {
        return e.source === data || e.target === data;
      });
      const svg = d3.select("#viewport");
      res.nodes = res.nodes.filter((n) => n.mgmt_ip !== data.mgmt_ip)
      // ! 先把所有节点的change都重置为0
      res.nodes.forEach(n => { n.changed = 0 })

      d3.select(this).remove();
      // 处理节点的进入、更新、退出
      let nodeSelection = container
        .selectAll(".circle_group")
        .data(res.nodes, (d) => d.mgmt_ip);

      // ! 修改 mobility
      // ! 先重置
      res.nodes.forEach(d => {
        d.changed = 0
        d.isNew = 0
      })
      res.nodes = [
        ...res.nodes,
        ...data.children.map((d) => ({ ...d, x: data.x, y: data.y, changed: 1, isNew: 1 })) //! 标记新节点 
      ];

      d3.selectAll(`#${getValidateId(data.mgmt_ip)}`).remove();
      for (let i = 0; i < linkUpdate.length; i++) {
        let link = linkUpdate[i];
        // ! 与新节点有连边的旧节点，changed改为1
        link.source.changed = 1
        link.target.changed = 1
        for (let j = 0; j < data.childrenStorelinks.length; j++) {
          if (link.id === data.childrenStorelinks[j].id) {
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

      nodeSelection
        .data(res.nodes, (d) => d.mgmt_ip)
        .enter()
        .append("g")
        .attr("class", "circle_group")
        .append("circle")
        .attr("id", d => `node_${d.mgmt_ip.replaceAll('.', '_')}`)
        .attr("fill", "black")
        .attr("class", "circle")
        .attr("r", 3.5)
        .attr("cx", data.x)
        .attr("cy", data.y)
        .on("click", function (d) {
          if (!d.hasOwnProperty('className')) {
            const selectedNodesSet = new Set([d.mgmt_ip]);
            // 找到所有与当前节点相连的边
            const connectedEdges = res.links.filter((e) => e.source.mgmt_ip === d.mgmt_ip || e.target.mgmt_ip === d.mgmt_ip);

            // 找到所有邻居节点
            connectedEdges.forEach((e) => {
              if (e.source.mgmt_ip !== d.mgmt_ip && !e.source.hasOwnProperty('className')) {
                selectedNodesSet.add(e.source.mgmt_ip);
              } else if (e.target.mgmt_ip !== d.mgmt_ip && !e.target.hasOwnProperty('className')) {
                selectedNodesSet.add(e.target.mgmt_ip);
              }
            });

            // 获取邻居结点的数据
            const selectedNodesData = res.nodes.filter((n) => selectedNodesSet.has(n.mgmt_ip));

            // 获取邻居结点的DOM
            const selectedNodesItem = container.selectAll(".circle").filter((n) => selectedNodesSet.has(n.mgmt_ip));

            handleNodesAggreation(res, selectedNodesItem, zoom, force, lasso_start, lasso_draw, lasso_end)
          }
        })
      force.nodes(res.nodes);
      // force.force("link", d3.forceLink(res.links).strength(linkStrength));
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
        // ! 减量迭代结束
        // const evalMatrix = new CalcMatrix(prevNodes, prevLinks, res.nodes, res.links, linkDistance)
        // console.log(evalMatrix.getAllMatrix?.());
      });

      force.velocityDecay(0.99);
      force.alpha(0.3).restart();
      // force.force("y", d3.forceY(500).strength(0.04));
      // force.force("x", d3.forceX(500).strength(0.04));
      force.force('custom', restrictForce(force))


      // 添加震荡
      setTimeout(() => {
        force.alphaMin(0.1);
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
  // force.force("link", d3.forceLink(res.links).strength(linkStrength));
  // force.force("collide", d3.forceCollide(collide));
  force.force('custom', restrictForce(force))


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
    container.selectAll(".new-circle")
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
    //坍塌动画
    selectedNodesItem
      .attr("cx", (d) => d.x - ((d.x - tempx) / 260) * count)
      .attr("cy", (d) => d.y - ((d.y - tempy) / 260) * count);

    count += 5;
    flag = false;
  });
  force.on("end", function () {
    flag = true;
    // ! 减量迭代结束
    // const evalMatrix = new CalcMatrix(prevNodes, prevLinks, res.nodes, res.links, linkDistance)
    // console.log(evalMatrix.getAllMatrix?.());
  });
  force.alpha(
    alpha
  );
  force.alphaMin(alphaMin);
  force.force("collide", d3.forceCollide(collide));
  force.velocityDecay(0.7);
  force.alphaDecay(0.01);
  // force.alphaMin(0);
  force.restart();

}
const rightInit = (rightres, datacase, eflag) => {
  let res = cloneDeep(rightres);
  if (!eflag) {
    let temp = res.nodes.filter(d => {
      return d.mgmt_ip === datacase[0];
    });
    res.nodes = rightres.nodes.filter(d => {
      return !datacase.includes(d.mgmt_ip);
    });

    console.log(temp[0].children)
    res.nodes = [...res.nodes, ...temp[0].children];
    res.links = rightres.links.filter(d => {
      return d.source.mgmt_ip !== temp[0].mgmt_ip && d.target.mgmt_ip !== temp[0].mgmt_ip;
    });
    res.links = [...res.links, ...(temp[0].childrenStoreLinks || []), ...(temp[0].childrenEditLinks || [])];
  }
  const rightSvg = d3.select("#top-right-svg").attr("height", 375);
  rightSvg.selectAll("*").remove();
  const rightContainer = rightSvg.append("g").attr("id", "right-container").attr("height", 375).attr("width", 500).attr("transform", "scale(0.5)");
  let rightEdges = rightContainer
    .selectAll(".edges_group")
    .data(res.links)
    .enter()
    .append("g")
    .attr("class", "edges_group")
    .append("path")
    .attr("class", "edge")
    .attr("stroke", "#caadad")
    .attr("stroke-width", 0.5)
  const rightCircles = rightContainer
    .selectAll(".circle_group")
    .data(res.nodes, (d) => d.mgmt_ip)
    .enter()
    .append("g")
    .attr("class", "right_circle_group")
    .append("circle")
    .attr("class", (d) => d.class || d.className || "right_circle")
    .attr('id', d => `node_${d.mgmt_ip.replaceAll('.', '_')}`)
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
        .distance(linkDistance)
    )
    .force("collide", d3.forceCollide(collide))
    .force("charge", d3.forceManyBody().strength(-10))
    // .force("center", d3.forceCenter(500, 500))
    .force("y", d3.forceY(350).strength(0.04))
    .force("x", d3.forceX(500).strength(0.04))
    .on("tick", () => {
      rightContainer.selectAll(".right_circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
      rightContainer.selectAll(".edge").attr("d", (d) => {
        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
      });
      rightContainer.selectAll(".new-circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    })
    .on('end', () => {
      console.log('------init end---------')
      prevNodes = cloneDeep(res.nodes);
      prevLinks = cloneDeep(res.links);
      lassoendRef()
    });
  force.alphaMin(0.01)

  return force;
}
const init = (res) => {
  const svg = d3.select("#exp-viewport").attr("height", 750).attr("width", 750).attr("border", "1px solid black");
  svg.selectAll("*").remove();
  const container = svg.append("g").attr("id", "container").attr("height", 500).attr("width", 500).attr("transform", "scale(0.9)");

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

  const circles = container
    .selectAll(".circle_group")
    .data(res.nodes, (d) => d.mgmt_ip)
    .enter()
    .append("g")
    .attr("class", "circle_group")
    .append("circle")
    .attr("class", (d) => d.class || d.className || "circle")
    .attr('id', d => `node_${d.mgmt_ip.replaceAll('.', '_')}`)
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
        .distance(linkDistance)
    )
    .force("collide", d3.forceCollide(collide))
    .force("charge", d3.forceManyBody().strength(-10))
    // .force("center", d3.forceCenter(500, 500))
    .force("y", d3.forceY(450).strength(0.04))
    .force("x", d3.forceX(400).strength(0.04))
    .on("tick", () => {
      container.selectAll(".circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
      container.selectAll(".edge").attr("d", (d) => {
        return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
      });
      container.selectAll(".new-circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);
    })
    .on('end', () => {
      console.log('------init end---------')

      prevNodes = cloneDeep(res.nodes);
      prevLinks = cloneDeep(res.links);
      lassoendRef()
    });
  force.alphaMin(0.01)

  return force;
};
export const main = (data: { nodes: any[]; links: any[] }, datacase: string[], exflag: boolean) => {
  let force;
  let rightforce;
  let res = data;
  let rightres = cloneDeep(data);
  let temp;
  let children = [];
  if (!exflag) {
    console.log(datacase)
    temp = data.nodes.filter(d => {
      return d.mgmt_ip === datacase[0];
    })[0];
    children = temp.children.map(d => d.mgmt_ip)
  }
  res.links = res.links.map((l, id) => ({ ...l, id }));
  force = init(res);
  rightforce = rightInit(rightres, datacase, exflag);
  forceStore = force;
  let zoom = d3.zoom().scaleExtent([0.1, 5]).on("zoom", zoomed);

  const container = d3.select("#container");
  const rightContainer = d3.select("#right-container");
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

    // ! 根据ip来选择那些节点被聚合

    const selectedNodesItem = lasso.selectedItems(); //选择的DOM
    // const selectedNodesItem = d3.selectAll('circle').filter(d => {
    //   return case4.includes(d?.mgmt_ip);
    // })
    // const selectedNodesData = selectedNodesItem.data(); //选择的节点数据
    handleNodesAggreation(res, selectedNodesItem, zoom, force, lasso_start, lasso_draw, lasso_end)

  };
  const right_lasso_end = () => {
    lasso.items().classed("not_possible", false).classed("possible", false);
    const selectedNodesItem = lasso.selectedItems(); //选择的DOM
    const selectedNodesData = selectedNodesItem.data(); //选择的节点数据
    let count = 0;
    if (exflag) {
      for (let i = 0; i < selectedNodesData.length; i++) {
        for (let j = 0; j < datacase.length; j++) {
          if (selectedNodesData[i].mgmt_ip === datacase[j]) {
            count++;
          }
        }
      }
      d3.select("#right-container").selectAll("text").remove();
      d3.select("#right-container").append("text").attr("id", "accuracy").text(`准确率：${(1 - (datacase.length - count + selectedNodesData.length - count) / rightres.nodes.length) * 100}%`).attr("x", 10).attr("y", 40).attr("font-size", "20px")
      d3.select("#right-container").append("text").attr("id", "precision").text(`精确率：${count / selectedNodesData.length * 100}%`).attr("x", 10).attr("y", 80).attr("font-size", "20px")
      d3.select("#right-container").append("text").attr("id", "recall").text(`召回率：${count / datacase.length * 100}%`).attr("x", 10).attr("y", 120).attr("font-size", "20px")
    } else {
      let len = temp.children.length;
      console.log(selectedNodesData, children)
      for (let i = 0; i < selectedNodesData.length; i++) {
        for (let j = 0; j < len; j++) {
          if (selectedNodesData[i].mgmt_ip === children[j]) {
            count++;
          }
        }
      }
      d3.select("#right-container").selectAll("text").remove();
      d3.select("#right-container").append("text").attr("id", "accuracy").text(`准确率：${(1 - (len - count + selectedNodesData.length - count) / rightres.nodes.length) * 100}%`).attr("x", 10).attr("y", 40).attr("font-size", "20px")
      d3.select("#right-container").append("text").attr("id", "precision").text(`精确率：${count / selectedNodesData.length * 100}%`).attr("x", 10).attr("y", 80).attr("font-size", "20px")
      d3.select("#right-container").append("text").attr("id", "recall").text(`召回率：${count / len * 100}%`).attr("x", 10).attr("y", 120).attr("font-size", "20px")
    }

  }
  lassoendRef = lasso_end

  d3.select("#button").on("click", () => {
    const endTime = Date.now(); // 记录结束时间
    const timeDifference = endTime - startTime; // 计算时间差
    d3.select("#exp-viewport").selectAll("text").remove();
    d3.select("#exp-viewport").append("text").text(`用户反应时间: ${timeDifference} ms`).attr("x", 10).attr("y", 40).attr("font-size", "20px");
    console.log(`用户反应时间: ${timeDifference} ms`);
  });
  force.on("end", function () {
    // 第一次点击
    startTime = Date.now(); // 记录开始时间
    if (exflag) {
      const selectedNodesItem = container.selectAll('circle').filter(d => {
        return datacase.includes(d?.mgmt_ip);
      });
      selectCase = selectedNodesItem.data();
      handleNodesAggreation(res, selectedNodesItem, zoom, force, lasso_start, lasso_draw, lasso_end);
    } else {
      //展开
      for (let i = 0; i < datacase.length; i++) {
        const newdata = container.selectAll('.new-circle').filter(d => {
          return datacase.includes(d?.mgmt_ip);
        }).data()[0];

        // 展开
        let linkUpdate = res.links.filter((e) => {
          return e.source.mgmt_ip === newdata.mgmt_ip || e.target.mgmt_ip === newdata.mgmt_ip;
        });
        const svg = d3.select("#viewport");
        res.nodes = res.nodes.filter((n) => n.mgmt_ip !== newdata.mgmt_ip)
        // ! 先把所有节点的change都重置为0
        res.nodes.forEach(n => { n.changed = 0 })

        d3.select(`#node_${newdata.mgmt_ip}`).remove();
        // 处理节点的进入、更新、退出
        let nodeSelection = container
          .selectAll(".circle_group")
          .data(res.nodes, (d) => d.mgmt_ip);

        // ! 修改 mobility
        // ! 先重置
        res.nodes.forEach(d => {
          d.changed = 0
          d.isNew = 0
        })
        res.nodes = [
          ...res.nodes,
          ...newdata.children.map((d) => ({ ...d, x: newdata.x, y: newdata.y, changed: 1, isNew: 1 })) //! 标记新节点 
        ];

        d3.selectAll(`#${getValidateId(newdata.mgmt_ip)}`).remove();
        for (let i = 0; i < linkUpdate.length; i++) {
          let link = linkUpdate[i];
          // ! 与新节点有连边的旧节点，changed改为1
          link.source.changed = 1
          link.target.changed = 1
          for (let j = 0; j < newdata.childrenStorelinks.length; j++) {
            if (link.id === newdata.childrenStorelinks[j].id || true) {
              if (link.source.mgmt_ip === newdata.mgmt_ip) {
                link.source = res.nodes.find(
                  (n) => n.mgmt_ip === newdata.childrenStorelinks[j].source.mgmt_ip
                );
              }
              if (link.target.mgmt_ip === newdata.mgmt_ip) {
                link.target = res.nodes.find(
                  (n) => n.mgmt_ip === newdata.childrenStorelinks[j].target.mgmt_ip
                );
              }
            }
          }
        }
        res.links = res.links.filter((e) => {
          return !newdata.childrenEditlinks.includes(e);
        });
        res.links = [
          ...res.links,
          ...linkUpdate,
          ...newdata.childrenRemovelinks?.map((d) => {
            const source = res.nodes.find(
              (n) => n.mgmt_ip === d.source.mgmt_ip
            );
            const target = res.nodes.find(
              (n) => n.mgmt_ip === d.target.mgmt_ip
            );
            source.x = newdata.x;
            source.y = newdata.y;
            target.x = newdata.x;
            target.y = newdata.y;
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
            return `M ${newdata.x} ${newdata.y} L ${newdata.x} ${newdata.y}`;
          });
        // .transition()
        // .duration(500)
        // .attr("d", (d) => {
        //   return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
        // });
        // 执行迪杰斯特拉算法计算最短路径长度

        nodeSelection
          .data(res.nodes, (d) => d.mgmt_ip)
          .enter()
          .append("g")
          .attr("class", "circle_group")
          .append("circle")
          .attr("id", d => `node_${d.mgmt_ip.replaceAll('.', '_')}`)
          .attr("fill", "black")
          .attr("class", "circle")
          .attr("r", 3.5)
          .attr("cx", newdata.x)
          .attr("cy", newdata.y)
        // .on("click", function (d) {
        //   if (!d.hasOwnProperty('className')) {
        //     const selectedNodesSet = new Set([d.mgmt_ip]);
        //     // 找到所有与当前节点相连的边
        //     const connectedEdges = res.links.filter((e) => e.source.mgmt_ip === d.mgmt_ip || e.target.mgmt_ip === d.mgmt_ip);

        //     // 找到所有邻居节点
        //     connectedEdges.forEach((e) => {
        //       if (e.source.mgmt_ip !== d.mgmt_ip && !e.source.hasOwnProperty('className')) {
        //         selectedNodesSet.add(e.source.mgmt_ip);
        //       } else if (e.target.mgmt_ip !== d.mgmt_ip && !e.target.hasOwnProperty('className')) {
        //         selectedNodesSet.add(e.target.mgmt_ip);
        //       }
        //     });

        //     // 获取邻居结点的数据
        //     const selectedNodesData = res.nodes.filter((n) => selectedNodesSet.has(n.mgmt_ip));

        //     // 获取邻居结点的DOM
        //     const selectedNodesItem = container.selectAll(".circle").filter((n) => selectedNodesSet.has(n.mgmt_ip));

        //     handleNodesAggreation(res, selectedNodesItem, zoom, algo, force, lasso_start, lasso_draw, lasso_end)
        //   }
        // })
        force.nodes(res.nodes);
        // force.force("link", d3.forceLink(res.links).strength(linkStrength));
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
          console.log('--------------expand')
          const evalMatrix = new CalcMatrix(prevNodes, prevLinks, res.nodes, res.links, linkDistance)
          console.log(evalMatrix.getAllMatrix?.());
        });

        force.velocityDecay(0.99);
        force.alpha(0.3).restart();
        // force.force("y", d3.forceY(500).strength(0.04));
        // force.force("x", d3.forceX(500).strength(0.04));
        force.force('custom', restrictForce(force))


        // 添加震荡
        setTimeout(() => {
          force.alphaMin(0.1);
          force.velocityDecay(0.93);
          force.alpha(0.5).restart();
        }, 1000);

      }
    }

  })
  lasso = d3
    .lasso()
    .closePathSelect(true)
    .closePathDistance(100)
    .items(rightContainer.selectAll(".right_circle"))
    .targetArea(d3.select("#top-right-svg"))
    .on("start", lasso_start)
    .on("draw", lasso_draw)
    .on("end", right_lasso_end);
  d3.select("#top-right-svg").call(lasso);
}