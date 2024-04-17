import React from "react";
import { Descriptions } from "@arco-design/web-react";
import { dataOptions } from "../config/data";

function DataDescription({ dataName }: { dataName: string }) {
  const description = dataOptions.find((d) => d.key === dataName)?.discription;
  const data = [
    {
      label: "节点数量",
      value: description?.nodes,
    },
    {
      label: "连边数量",
      value: description?.links,
    },
    {
      label: "游离节点",
      value: description?.free,
    },
    {
      label: "连通分量个数",
      value: description?.connection,
    },
  ];
  return (
    <Descriptions
      column={1}
      title={"数据信息"}
      data={data}
      labelStyle={{ paddingRight: 36 }}
    />
  );
}

export default DataDescription;
