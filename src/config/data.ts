import midData from "../../data/network/demo.json";
import smallData from "../../data/network/less-links.json";
import connectionData from "../../data/network/only-correspondlinks.json";
import largeData from "../../data/network/pluslinks.json";
import { getDescription } from "./utils";

export const dataOptions = [
  {
    data: smallData,
    key: "smallData",
    label: "小规模数据",
    discription: getDescription(smallData),
  },
  {
    data: midData,
    key: "midData",
    label: "中规模数据",
    discription: getDescription(midData),
  },
  {
    data: largeData,
    key: "largeData",
    label: "大规模数据",
    discription: getDescription(largeData),
  },
  {
    data: connectionData,
    key: "connectionData",
    label: "无游离点数据",
    discription: getDescription(connectionData),
  },
];

export const DataMap: { [key: string]: { nodes: any[]; links: any[] } } = {
  midData: midData,
  smallData: smallData,
  largeData: largeData,
  connectionData: connectionData,
};
