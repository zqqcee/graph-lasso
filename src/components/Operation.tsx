import React from "react";
import styled from "styled-components";
import { Slider } from "@arco-design/web-react";
import { velocityDecayAtom, dataNameAtom } from "../store";
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
    </Wrapper>
  );
}

export default Operation;
