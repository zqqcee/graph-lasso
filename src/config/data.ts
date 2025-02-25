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
import * as flatted from 'flatted';
import { data as con_twitter_txt } from '../../data/expdata/con_twitter';
import { data as cloud180_txt } from "../../data/expdata/cloud180";
import { data as cloud2160_txt } from "../../data/expdata/cloud2160";
import { data as email_eu_core_txt } from "../../data/expdata/email_eu_core";
import { data as dimacs10_txt } from "../../data/expdata/dimacs10";
import { data as wiki_votes_txt } from "../../data/expdata/wiki_votes";
import { getDescription } from "./utils";
import { promises as fs } from 'fs';

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
export const DataKeys: { [key: string]: string } = {

}


