import React from "react";
import styled from "styled-components";
import { Slider } from "@arco-design/web-react";
import { velocityDecayAtom } from "../store";
import { useAtom } from "jotai";

const Wrapper = styled.div`
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  .slider-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
  .slider-label {
    white-space: nowrap;
  }
`;
function Operation() {
  const [, setVelocityDecayAtom] = useAtom(velocityDecayAtom);
  return (
    <Wrapper>
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
          // style={{
          //   width: 258,
          //   marginLeft: 8,
          //   marginRight: 8,
          //   verticalAlign: "middle",
          // }}
        />
      </div>
    </Wrapper>
  );
}

export default Operation;
