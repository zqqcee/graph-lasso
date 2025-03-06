import midData from "../../data/network/demo.json";
import smallData from "../../data/network/less-links.json";
import connectionData from "../../data/network/only-correspondlinks.json";
import largeData from "../../data/network/pluslinks.json";
import bigData from "../../data/network/bigdata.json";
import emailData from '../../data/osdata-trans/case1.json';
import voteData from '../../data/osdata-trans/case2.json';
import socialData from '../../data/osdata-trans/case3.json';
// import cloud180 from "../../data/expdata/cloud180.json";
// import cloud2160 from "../../data/expdata/cloud2160.json";
// import con_twitter from "../../data/expdata/con_twitter.json";
// import dimacs10 from "../../data/expdata/dimacs10.json";
// import email_eu_core from "../../data/expdata/email_eu_core.json";
// import wiki_votes from "../../data/expdata/wiki_votes.json";
import { case1 as con_twitter_case1, case2 as con_twitter_case2, case3 as con_twitter_case3, case4 as con_twitter_case4, expandCase as con_twitter_expandCase } from "../config/lassoConfig/con_twitter";
import { case1 as cloud180_case1, case2 as cloud180_case2, case3 as cloud180_case3, case4 as cloud180_case4, expandCase as cloud180_expandCase } from "../config/lassoConfig/cloud180";
import { case1 as email_eu_core_case1, case2 as email_eu_core_case2, case3 as email_eu_core_case3, case4 as email_eu_core_case4, expandCase as email_eu_core_expandCase } from "../config/lassoConfig/email_eu_core";
import { case1 as dimacs10_case1, case2 as dimacs10_case2, case3 as dimacs10_case3, case4 as dimacs10_case4, expandCase as dimacs10_expandCase } from "../config/lassoConfig/dimacs10";
import { case1 as wiki_vote_case1, case2 as wiki_vote_case2, case3 as wiki_vote_case3, case4 as wiki_vote_case4, expandCase as wiki_vote_expandCase } from "../config/lassoConfig/wiki_votes";



import * as flatted from 'flatted';
import { data as con_twitter_txt } from '../../data/expdata/con_twitter';
import { data as cloud180_txt } from "../../data/expdata/cloud180";
import { data as cloud2160_txt } from "../../data/expdata/cloud2160";
import { data as email_eu_core_txt } from "../../data/expdata/email_eu_core";
import { data as dimacs10_txt } from "../../data/expdata/dimacs10";
import { data as wiki_votes_txt } from "../../data/expdata/wiki_votes";
import { getDescription } from "./utils";
import { cloneDeep, set } from "lodash";


const con_twitter = flatted.parse(con_twitter_txt);
const cloud180 = flatted.parse(cloud180_txt);
const cloud2160 = flatted.parse(cloud2160_txt);
const email_eu_core = flatted.parse(email_eu_core_txt);
const dimacs10 = flatted.parse(dimacs10_txt);
const wiki_votes = flatted.parse(wiki_votes_txt);
export const dataOptions = [
  {
    data: con_twitter,
    key: "con_twitter",
    label: "con_twitter",
    discription: getDescription(con_twitter),
  },
  {
    data: cloud180,
    key: "cloud180",
    label: "cloud180",
    discription: getDescription(connectionData),
  },
  {
    data: cloud2160,
    key: "cloud2160",
    label: "cloud2160",
    discription: getDescription(bigData),
  },
  {
    data: email_eu_core,
    key: "email_eu_core",
    label: "email_eu_core",
    discription: getDescription(email_eu_core),
  },
  {
    data: dimacs10,
    key: "dimacs10",
    label: "dimacs10",
    discription: getDescription(dimacs10),
  },
  {
    data: wiki_votes,
    key: "wiki_votes",
    label: "wiki_vote",
    discription: getDescription(wiki_votes),
  },
];

export const DataMap: { [key: string]: { nodes: any[]; links: any[] } } = {
  cloud180: cloud180,
  con_twitter: con_twitter,
  email_eu_core: email_eu_core,
  dimacs10: dimacs10,
  wiki_votes: wiki_votes,
  cloud2160: cloud2160,

};

const dynamicAlgo = 'pin' //表现最好的动态图方法

const cloud180AggData = [cloud180_case1, cloud180_case2, cloud180_case3, cloud180_case4].map(
  (data, index) => {
    return {
      isAggregate: index < 4,//是否为聚合的case, 为true时聚合
      data: cloneDeep(DataMap['cloud180']),
      algo: index % 2 ? dynamicAlgo : 'none',
      currentCase: data,
      dataName: 'cloud180',
      caseName: `case${index + 1}`
    }
  })
const cloud180ExpandData = cloud180_expandCase.map((data, index) => ({
  isAggregate: false,
  data: cloneDeep(DataMap['cloud180']),
  algo: index % 2 ? dynamicAlgo : 'none',
  currentCase: data,
  dataName: 'cloud180',
  caseName: `case${index + 1}`
}))

const con_twitterAggData = [con_twitter_case1, con_twitter_case2, con_twitter_case3, con_twitter_case4].map(
  (data, index) => {
    return {
      isAggregate: index < 4,//是否为聚合的case, 为true时聚合
      data: cloneDeep(DataMap['con_twitter']),
      algo: index % 2 ? dynamicAlgo : 'none',
      currentCase: data,
      dataName: 'con_twitter',
      caseName: `case${index + 1}`
    }
  })

const con_twitterExpandData = con_twitter_expandCase.map((data, index) => ({
  isAggregate: false,
  data: cloneDeep(DataMap['con_twitter']),
  algo: index % 2 ? dynamicAlgo : 'none',
  currentCase: data,
  dataName: 'con_twitter',
  caseName: `case${index + 1}`
}))


const email_eu_coreAggData = [email_eu_core_case1, email_eu_core_case2, email_eu_core_case3, email_eu_core_case4].map(
  (data, index) => {
    return {
      isAggregate: index < 4,//是否为聚合的case, 为true时聚合
      data: cloneDeep(DataMap['email_eu_core']),
      algo: index % 2 ? dynamicAlgo : 'none',
      currentCase: data,
      dataName: 'email_eu_core',
      caseName: `case${index + 1}`
    }
  })
const email_eu_coreExpandData = email_eu_core_expandCase.map((data, index) => ({
  isAggregate: false,
  data: cloneDeep(DataMap['email_eu_core']),
  algo: index % 2 ? dynamicAlgo : 'none',
  currentCase: data,
  dataName: 'email_eu_core',
  caseName: `case${index + 1}`
}))




const dimacs10AggData = [dimacs10_case1, dimacs10_case2, dimacs10_case3, dimacs10_case4].map(
  (data, index) => {
    return {
      isAggregate: index < 4,//是否为聚合的case, 为true时聚合
      data: cloneDeep(DataMap['dimacs10']),
      algo: index % 2 ? dynamicAlgo : 'none',
      currentCase: data,
      dataName: 'dimacs10',
      caseName: `case${index + 1}`
    }
  })
const dimacs10ExpandData = dimacs10_expandCase.map((data, index) => ({
  isAggregate: false,
  data: cloneDeep(DataMap['dimacs10']),
  algo: index % 2 ? dynamicAlgo : 'none',
  currentCase: data,
  dataName: 'dimacs10',
  caseName: `case${index + 1}`
}))

const wiki_voteAggData = [wiki_vote_case1, wiki_vote_case2, wiki_vote_case3, wiki_vote_case4].map(
  (data, index) => {
    return {
      isAggregate: index < 4,//是否为聚合的case, 为true时聚合
      data: cloneDeep(DataMap['wiki_vote']),
      algo: index % 2 ? dynamicAlgo : 'none',
      currentCase: data,
      dataName: 'wiki_vote',
      caseName: `case${index + 1}`
    }
  })
const wiki_voteExpandData = wiki_vote_expandCase.map((data, index) => ({
  isAggregate: false,
  data: cloneDeep(DataMap['wiki_vote']),
  algo: index % 2 ? dynamicAlgo : 'none',
  currentCase: data,
  dataName: 'wiki_vote',
  caseName: `case${index + 1}`
}))
export const expDataSource = [
  //增量
  ...con_twitterExpandData,

  ...cloud180ExpandData,
  ...email_eu_coreExpandData,
  // ...dimacs10ExpandData,
  // ...wiki_voteExpandData,

  //减量
  ...cloud180AggData,
  ...con_twitterAggData,
  ...email_eu_coreAggData,
  // ...dimacs10AggData,
  // ...wiki_voteAggData,


]
