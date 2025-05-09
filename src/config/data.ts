import midData from "../../data/network/demo.json";
import smallData from "../../data/network/less-links.json";
import connectionData from "../../data/network/only-correspondlinks.json";
import largeData from "../../data/network/pluslinks.json";
import bigData from "../../data/network/bigdata.json";
import emailData from '../../data/osdata-trans/case1.json';
import voteData from '../../data/osdata-trans/case2.json';
import socialData from '../../data/osdata-trans/case3.json';
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
  {
    data: bigData,
    key: "bigData",
    label: "超大规模",
    discription: getDescription(bigData),
  },
  {
    data: emailData,
    key: "emailData",
    label: "邮箱",
    discription: getDescription(emailData),
  },
  {
    data: voteData,
    key: "voteData",
    label: "who votes whom",
    discription: getDescription(voteData),
  },
  {
    data: socialData,
    key: "socialData",
    label: "co-authorships",
    discription: getDescription(socialData),
  },
];

export const DataMap: { [key: string]: { nodes: any[]; links: any[] } } = {
  midData: midData,
  smallData: smallData,
  largeData: largeData,
  connectionData: connectionData,
  bigData: bigData,
  emailData: emailData,
  voteData: voteData,
  socialData: socialData
};
export const DataKeys: {[key: string]: string} = {
  midData: "../../data/network/demo.json",
  smallData: "../../data/network/less-links.json",
  largeData: "../../data/network/pluslinks.json",
  connectionData: "../../data/network/only-correspondlinks.json",
  bigData: "../../data/network/bigdata.json",
  emailData: '../../data/osdata-trans/case1.json',
  voteData: '../../data/osdata-trans/case2.json',
  socialData: '../../data/osdata-trans/case3.json'
}
