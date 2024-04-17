import React from "react";
import styled from "styled-components";
import { Slider } from "@arco-design/web-react";
import { velocityDecayAtom, dataNameAtom ,alphaAtom,collideAtom,alphaMinAtom,alphaDecayAtom,linkStrengthAtom} from "../store";
import { useAtom } from "jotai";
import DataSelect from "./DataSelect";
import DataDescription from "./DataDescription";

const Wrapper = styled.div`
  padding: 12px 24px;
  display: flex;
  gap: 20px;
  flex-direction: column;
  .slider-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .slider-label {
    white-space: nowrap;
  }
  .data-description{
    border-radius: 8px;
    box-shadow: 0px 0px 4px 1px #cfe7cf;
    padding: 12px 12px;
}
  }
`;
function Operation() {
  const [, setVelocityDecayAtom] = useAtom(velocityDecayAtom);
  const [,setAlphaAtom] = useAtom(alphaAtom);
  const [,setCollideAtom] = useAtom(collideAtom);
  const [,setAlphaMinAtom] = useAtom(alphaMinAtom);
  const [,setAlphaDecayAtom] = useAtom(alphaDecayAtom);
  const [,setLinkStrengthAtom] = useAtom(linkStrengthAtom);
  const [dataName] = useAtom(dataNameAtom);
  return (
    <Wrapper>
      <div className="data-select-wrapper">
        <DataSelect />
      </div>
      <div className="data-description">
        <DataDescription dataName={dataName} />
      </div>
      <div className="slider-wrapper">
        <div className="slider-label">塌陷程度</div>
        <Slider
          defaultValue={0.3}
          style={{ marginLeft: 10 }}
          max={0.9}
          onChange={(v) => {
            setVelocityDecayAtom(v);
          }}
          step={0.1}
          showTicks={true}
        />
      </div>
      <div className="slider-wrapper">
        <div className="slider-label">作用力强度</div>
        <Slider
          defaultValue={0.5}
          style={{ marginLeft: 10 }}
          max={0.9}
          onChange={(a) => {
            setAlphaAtom(a);
          }}
          step={0.1}
          showTicks={true}
        />
      </div>
      <div className="slider-wrapper">
        <div className="slider-label">作用力最小值</div>
        <Slider
          defaultValue={0.01}
          style={{ marginLeft: 10 }}
          max={0.2}
          onChange={(am) => {
            setAlphaMinAtom(am);
          }}
          step={0.02}
          showTicks={true}
        />
      </div>
      <div className="slider-wrapper">
        <div className="slider-label">力衰减速率</div>
        <Slider
          defaultValue={0.01}
          style={{ marginLeft: 10 }}
          max={0.015}
          onChange={(ad) => {
            setAlphaDecayAtom(ad);
          }}
          step={0.001}
          showTicks={true}
        />
      </div>
      <div className="slider-wrapper">
        <div className="slider-label">碰撞检测</div>
        <Slider
          defaultValue={8}
          style={{ marginLeft: 10 }}
          max={10}
          onChange={(c) => {
            setCollideAtom(c);
          }}
          step={1}
          showTicks={true}
        />
      </div>
      <div className="slider-wrapper">
        <div className="slider-label">连边力</div>
        <Slider
          defaultValue={0.4}
          style={{ marginLeft: 10 }}
          max={1}
          onChange={(l) => {
            setLinkStrengthAtom(l);
          }}
          step={0.1}
          showTicks={true}
        />
      </div>
    </Wrapper>
  );
}

export default Operation;
