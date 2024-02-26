### id与class

画布：

在 `init()`函数中设置

- `<g>` ：
  - `id`: container
  - `class`: `null`

第一层:

计算，更新位置：
更新位置逻辑：
**统一在力导引结束后更新**

设置一个offset，offset表示该节点针对父层级节点的偏移量

计算凸包半径：欧氏距离+节点半径

## 展开逻辑

展开总体分两步：

第一步是确定凸包半径和凸包内新增节点相对圆心的位置，从展开层向上冒泡处理

1. 点击展开节点，在DOM中增加相关图元，固定当前展开节点的位置
2. 设置展开层simulator，以被展开节点位置为force center
3. 当前simulator tick end的时候，计算所有新增节点相对被展开节点的x和y偏移量（拖动的时候也要改变，暂时不做拖动），并绑定在nodes上
4. 计算凸包半径：遍历nodes计算最大的偏移量平方和，将开平方结果和图元视觉半径相加得到最小凸包（拖动之后要重新计算）

第二步是确定凸包相对位置，根据偏移量从展开层	向下辐射更新所有节点坐标

1. 在上层simulator中将被展开节点的r更新为凸包半径
2. 将节点的 fx, fy 设置为null，不固定节点
3. 渲染绘图
4. 修改上层simulator的碰撞力
5. 重启上层simulator，每次tick时修改上层点边位置，并根据被展开节点tick前后位置偏移来确定展开层的凸包、点、边的新位置

## 拖动逻辑

节点

1. drag start
2. dragged 的时候需要启动力导，但是不把alpha设置得太大，稍微震荡即可，更新凸包半径
3. drag end的时候重新计算凸包半径，更新位置

凸包

1. 拖动凸包和拖动节点的逻辑类似，判断顶层凸包是否存在，如果不存在
2. 拖动凸包相当于拖动凸包中心点的位置，那么其他节点的位置也应该被更改

## 更新位置逻辑

在凸包半径变化时需要更新位置

在重启力导引后，都要在.end处更新位置，更新同层节点的offset

1. 节点的位置 = 父节点位置+offsetX

计算半径公示：

```
R = 所有节点（offset + r ）的最大值
```

更新半径后

每次更新半径后，都要从当前层向上冒泡处理

每次处理后，都要从当前层到底部更新位置

## Nested Bubble Force List 数据结构

```javascript
/**
 * 使用索引获取第i层的力map，使用parentId找到具体的力
 * 注：这里的parentId是parent那个图元的id，比如:node_0_6
 * [
 *  第一层
 *  {
 *      parentId : force,
 *  },
 *  第二层
 *  {
 *      parentId : force,
 *  }
 * ]
 */
[
  {
    level: 1,
    forceList: [
      {
        simulatorId: 1,
        parentId: null,
        simulator1_1,
      },
      {
        simulatorId: 2,
        parentId: null,
        simulator1_2
      },
      ...
    ]
  },
  {
    level: 2,
    forceList: [
      {
        simulatorId: 2,
        parentId: 1,
        simulator2_1,
      },
      {
        simulatorId: 2,
        parent: 2,
        simulator2_2,
      },
      ...
    ]
  },
  ...
]
```

### 问题

- 展开的节点没法根据个数来预估半径

### 汇报

report-07 七月汇报 - 设计算法，做出一层效果

report-09 九月汇报 - 做出三层效果，并可以延伸到多层

### 方法与接口

- `calHullRadius`
- `getParentNodeByChildData`
- `calEdgeTranslate`
- `init`
- `initLayout`
- `generateArc`
- `addLevelGroup`
- `enterLevelItem`
- `updateLevelItem`
- `getNodesDst`
- `getGrandParentId`
- 

### changelog

- 分游离点和联通结构
- 如何根据新展开的凸包中节点的个数计算它的半径R
- 使用transform固定节点，因为节点的x和y不一定是最终的x和y，transform才是
- 分游离点和联通结构
- 如何根据新展开的凸包中节点的个数计算它的半径R
- 使用transform固定节点，因为节点的x和y不一定是最终的x和y，transform才是
- 全景聚焦（半径？）
