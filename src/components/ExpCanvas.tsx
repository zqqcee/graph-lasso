import * as d3 from "d3";
import styled from "styled-components";
import React, { useEffect, useReducer, useState } from "react";
import { useAtom } from "jotai";
import { main } from "../core/expLasso";
import { algoAtom, dataNameAtom } from "../store";
import { DataMap } from "../config/data";
import { cloneDeep, set } from "lodash";
import { Modal, Radio, Button } from '@arco-design/web-react';
import { case1, case2, case3, case4 } from "../config/lassoConfig/cloud180";
import { expDataSource } from "../config/data";

const RadioGroup = Radio.Group;
const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  box-sizing: border-box;
  padding:2
`;

const LeftSVG = styled.div`
  .count{
    position: absolute;
    font-size: 17px;
    left:20px;
    top:10px;
  }
  #button{
    &:hover{
      background-color:#fbf3f3 
    } 
  }
  flex: 2;
  border:1px solid #b3b0c5c4;
  box-shadow:inset 0px 0px 5px 0px #f6f6f6;
  position: relative;
  border-radius: 8px;
  width: fit-content;
  height: fit-content;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  padding-left:20px;
`;

const TopRightSVG = styled.svg`
  border:1px solid #b3b0c5c4;
  box-shadow:inset 0px 0px 5px 0px #f6f6f6;
  border-radius: 8px;
`;

const BottomRadioGroup = styled(RadioGroup)`
  flex: 2;
  margin-bottom: 20px;
`;

const BottomButton = styled(Button)`
  position: absolute;
  bottom: 10px;
`;

const asset = { case1, case2, case3, case4 }; // 要收缩的节点 4个case
const asset2 = [
  ["dcaea2e9-c8ef-460f-9d12-08fa4062f6ba"],
  ["16b18fce-05bb-4b19-9fc8-378c5a3cf155"],
  ["7512c8d5-cbc9-4519-8142-49d836c151e0"],
  ["91f863b2-82dd-41b6-bb36-2f34b51443bb"]
]; //要展开节点的id


function ExpCanvas() {
  const [dataName] = useAtom<string>(dataNameAtom);
  const [currentCase, setCurrentCase] = useState<string[]>(asset['case2']);
  const [animationBeauty, setAnimationBeauty] = useState<string>('3'); // 新增：用于跟踪动画美观度的选择
  const [layoutBeauty, setLayoutBeauty] = useState<string>('3'); // 新增：用于跟踪布局美观度的选择
  const [layoutStability, setLayoutStability] = useState<string>('3'); // 新增：用于跟踪布局稳定性的选择
  const [flag, setFlag] = useState<boolean>(false); //flag false时，展开
  const [index,setIndex] = useState<number>(0);
  const [expIndex,setExpIndex] = useState<number>(0);
  const [expResult,setExpResult] = useReducer((p,c)=>[...p,c],[])
  
  const handleFinish = ()=>{
    console.log('finish');
    const logObject = {
      '动画美观度': animationBeauty,
      '布局美观度': layoutBeauty,
      '当前数据集':expDataSource[expIndex].dataName,
      '当前案例': expDataSource[expIndex].caseName,
      '是否为减量':  expDataSource[expIndex].isAggregate,
      '用户反应时间': d3.select("#exp-viewport").select("text")?.text(),
      '准确性': d3.select("#top-right-svg").select("#accuracy")?.text(),
      '精确率': d3.select("#top-right-svg").select("#precision")?.text(),
      '召回率': d3.select("#top-right-svg").select("#recall")?.text()
    };
    console.log([...expResult,logObject],'expResult')
    Modal.success({
      title: '您已完成全部实验,感谢您的参与!',
      content:'稍后，会对您进行一个简短的访谈。'
    });
  }
  const handleNextClick = () => {
    
    try {
          // 重置选择
    setAnimationBeauty('3');
    setLayoutBeauty('3');
    setLayoutStability('3');

    // 打印当前的选择
    const logObject = {
      '动画美观度': animationBeauty,
      '布局美观度': layoutBeauty,
      '当前数据集':expDataSource[expIndex].dataName,
      '当前案例': expDataSource[expIndex].caseName,
      '是否为减量':  expDataSource[expIndex].isAggregate,
      '用户反应时间': d3.select("#exp-viewport").select("text")?.text(),
      '准确性': d3.select("#top-right-svg").select("#accuracy")?.text(),
      '精确率': d3.select("#top-right-svg").select("#precision")?.text(),
      '召回率': d3.select("#top-right-svg").select("#recall")?.text()
    };
    setExpResult(logObject)
    setExpIndex(d => d+1)

    } catch (error) {
      Modal.error({
        title: '当前任务未完成!',
      });
    }


  };

  React.useLayoutEffect(() => {
    main(expDataSource[expIndex]);

    // main({
    //   isAggregate:true,//是否为聚合的case, 为true时聚合
    //   data:cloneDeep(DataMap['con_twitter']),
    //   algo:'none',
    //   currentCase
    // })
    // main(
    //   cloneDeep(DataMap[dataName]),
    //   currentCase,
    //   flag,
    // );
    // initRef.current = false;
  }, [expIndex]);

  return (
    <Wrapper>
      <LeftSVG>
        <div className="count">{`当前进度: ${expIndex+1}/${expDataSource.length}`}</div>
        <svg id={"exp-viewport"}>
        </svg>
        <BottomButton type="outline" id={"button"} style={{borderColor:'#d2cccc',color:'#4a4a4a', borderRadius:8 ,position:'absolute',right:'50px'}}>发生变化时点击</BottomButton>
      </LeftSVG>
      <RightContainer>
        <TopRightSVG id={"top-right-svg"}></TopRightSVG>
        <div style={{ display: 'flex', alignContent: 'center', flexDirection: 'column',
           border:'1px solid #b3b0c5c4',
           boxShadow:'inset 0px 0px 5px 0px #f6f6f6', 
          marginTop:20,height:'345px',padding:20,boxSizing:'border-box',borderRadius:8}}>
          <div style={{ marginRight: '10px', alignContent: 'center', display: 'flex', flexDirection: 'row' }}>
            <span style={{ marginRight: '15px' }}>动画美观度评分:</span>
            <BottomRadioGroup value={animationBeauty} onChange={(value) => setAnimationBeauty(value)}>
              <Radio value='1'>1</Radio>
              <Radio value='2'>2</Radio>
              <Radio value='3'>3</Radio>
              <Radio value='4'>4</Radio>
              <Radio value='5'>5</Radio>
            </BottomRadioGroup>
          </div>
          <div style={{ marginRight: '10px', alignContent: 'center', display: 'flex', flexDirection: 'row' }}>
            <span style={{ marginRight: '15px' }}>布局美观度评分:</span>
            <BottomRadioGroup value={layoutBeauty} onChange={(value) => setLayoutBeauty(value)}>
              <Radio value='1'>1</Radio>
              <Radio value='2'>2</Radio>
              <Radio value='3'>3</Radio>
              <Radio value='4'>4</Radio>
              <Radio value='5'>5</Radio>
            </BottomRadioGroup>
          </div>
          <div style={{ marginRight: '10px', alignContent: 'center', display: 'flex', flexDirection: 'row' }}>
            <span style={{ marginRight: '15px' }}>布局稳定性评分:</span>
            <BottomRadioGroup value={layoutStability} onChange={(value) => setLayoutStability(value)}>
              <Radio value='1'>1</Radio>
              <Radio value='2'>2</Radio>
              <Radio value='3'>3</Radio>
              <Radio value='4'>4</Radio>
              <Radio value='5'>5</Radio>
            </BottomRadioGroup>
          </div>
        </div>
      </RightContainer>
      {expIndex === expDataSource.length-1?
      <BottomButton type="secondary" id={"Next-button"} style={{ right: '10px',borderRadius:8  }} onClick={handleFinish}>完成实验</BottomButton>
      : <BottomButton type="secondary" id={"finish-button"} style={{ right: '10px',borderRadius:8  }} onClick={handleNextClick}>下一个</BottomButton>}
    </Wrapper>
  );
}

export default ExpCanvas;