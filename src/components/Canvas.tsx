import React, { useEffect } from "react";
import styled from "styled-components";
import { main } from "../core/index";
import * as d3 from "d3";
import { useAtom } from "jotai";
import { dataNameAtom } from "../store";
import { DataMap } from "../config/data";
import { cloneDeep } from "lodash";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: #f6f6f6;
`;
function Canvas({
  lassoFlag,
  velocityDecay,
  alpha,
  collide,
  alphaMin,
  alphaDecay,
  linkStrength,
}: any) {
  const [dataName] = useAtom<string>(dataNameAtom);
  const initRef = React.useRef(true);

  React.useLayoutEffect(() => {
    main(
      cloneDeep(DataMap[dataName]),
      lassoFlag,
      initRef.current,
      velocityDecay,
      alpha,
      collide,
      alphaMin,
      alphaDecay,
      linkStrength
    );
    initRef.current = false;
  }, [
    lassoFlag,
    velocityDecay,
    dataName,
    alpha,
    collide,
    alphaMin,
    alphaDecay,
    linkStrength,
  ]);

  React.useEffect(() => {
    initRef.current = true;
  }, [
    dataName,
    velocityDecay,
    dataName,
    alpha,
    collide,
    alphaMin,
    alphaDecay,
    linkStrength,
  ]);
  return (
    <Wrapper>
      <svg id={"viewport"}></svg>
    </Wrapper>
  );
}

export default Canvas;
