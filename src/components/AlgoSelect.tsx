import React from 'react';
import { Select } from "@arco-design/web-react";
import { algoOptions } from '../config/algo';
import { useAtom } from 'jotai';
import { algoAtom } from '../store';
const Option = Select.Option;

function AlgoSelect(){
  const [algo,setAlgo] = useAtom(algoAtom)
  return <div>
    <Select
        onChange={(v) => {
          setAlgo(v);
        }}
        value={algo}>
      {algoOptions.map(algo => <Option value={algo.key}>{algo.name}</Option>)}
    </Select>
  </div>
}

export default AlgoSelect;