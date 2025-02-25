import * as d3 from "d3";
import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { main } from "../core/expLasso";
import { algoAtom, dataNameAtom } from "../store";
import { DataMap, DataKeys } from "../config/data";
import { cloneDeep, set } from "lodash";
import { Radio, Button } from '@arco-design/web-react';
import { case1, case2, case3, case4 } from "../config/lassoConfig/con_twitter";

const RadioGroup = Radio.Group;
const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
`;

const LeftSVG = styled.svg`
  flex: 2;
  border: 1px solid black;
  position: relative;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  border-bottom: 1px solid black;
`;

const TopRightSVG = styled.svg`
  border: 1px solid black;
  border-left:none;
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
  ["5978a778-5350-41e4-b80e-11a696549c51"],
  ["2fa5b9c5-99fb-4528-9428-1de2d1cffdf3"],
  ["6a4388cf-2554-46f2-82b3-6ee032f5ff58"],
  ["39267bfe-6346-492e-af28-c589d1628845"]
]; //要展开节点的id

function ExpCanvas() {
  const [dataName] = useAtom<string>(dataNameAtom);
  const [currentCase, setCurrentCase] = useState<string[]>(asset2[0]);
  const [animationBeauty, setAnimationBeauty] = useState<string>('a'); // 新增：用于跟踪动画美观度的选择
  const [layoutBeauty, setLayoutBeauty] = useState<string>('a'); // 新增：用于跟踪布局美观度的选择
  const [flag, setFlag] = useState<boolean>(false); //flag true时
  const [index,setIndex] = useState<number>(0);


  const handleNextClick = () => {
    const randomValue = Math.floor(Math.random() * 2);
    if (randomValue === 0) {
      setFlag(true);
      const currentIndex = Object.values(asset).indexOf(currentCase);
      const nextIndex = (currentIndex + 1) % Object.values(asset).length;
      setCurrentCase(Object.values(asset)[nextIndex]);
    } else {
      setFlag(false);
      const nextIndex = (index + 1) % asset2.length;
      setCurrentCase(asset2[nextIndex]);
      setIndex(nextIndex);
    }
    // 重置选择
    setAnimationBeauty('a');
    setLayoutBeauty('a');

    // 打印当前的选择
    const logObject = {
      '动画美观度': animationBeauty,
      '布局美观度': layoutBeauty,
      '数据': DataKeys[dataName],
      '当前案例': currentCase,
      '状态': flag ? "assemble" : "expand",
      '用户反应时间': d3.select("#exp-viewport").select("text").text().substring(7,14),
      '准确性': d3.select("#top-right-svg").select("#accuracy").text().substring(4,),
      '精确率': d3.select("#top-right-svg").select("#precision").text().substring(4,)
    };
    
    console.log(logObject);
  };

  React.useLayoutEffect(() => {
    main(
      cloneDeep(DataMap[dataName]),
      currentCase,
      flag,
    );
    // initRef.current = false;
  }, [dataName, currentCase,flag]);

  return (
    <Wrapper>
      <LeftSVG id={"exp-viewport"}>
      </LeftSVG>
      <RightContainer>
        <TopRightSVG id={"top-right-svg"}></TopRightSVG>
        <div style={{ display: 'flex', alignContent: 'center', flexDirection: 'column', marginLeft: '45px' }}>
          <div style={{ marginRight: '10px', alignContent: 'center', display: 'flex', flexDirection: 'row' }}>
            <span style={{ marginRight: '15px' }}>动画美观度:</span>
            <BottomRadioGroup value={animationBeauty} onChange={(value) => setAnimationBeauty(value)}>
              <Radio value='a'>1</Radio>
              <Radio value='b'>2</Radio>
              <Radio value='c'>3</Radio>
              <Radio value='d'>4</Radio>
              <Radio value='e'>5</Radio>
            </BottomRadioGroup>
          </div>
          <div style={{ marginRight: '10px', alignContent: 'center', display: 'flex', flexDirection: 'row' }}>
            <span style={{ marginRight: '15px' }}>布局美观度:</span>
            <BottomRadioGroup value={layoutBeauty} onChange={(value) => setLayoutBeauty(value)}>
              <Radio value='a'>1</Radio>
              <Radio value='b'>2</Radio>
              <Radio value='c'>3</Radio>
              <Radio value='d'>4</Radio>
              <Radio value='e'>5</Radio>
            </BottomRadioGroup>
          </div>
        </div>
        <BottomButton type="primary" id={"button"} style={{ left: '-100px', }}>Click Me</BottomButton>
        <BottomButton type="primary" id={"Next-button"} style={{ right: '10px', color: 'white', backgroundColor: 'black' }} onClick={handleNextClick}>Next</BottomButton>
      </RightContainer>
    </Wrapper>
  );
}

export default ExpCanvas;