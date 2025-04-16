import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { main } from "../core/index";
import * as d3 from "d3";
import { useAtom } from "jotai";
import { algoAtom, dataNameAtom } from "../store";
import { DataMap } from "../config/data";
import { cloneDeep } from "lodash";
import * as flatted from 'flatted'

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  // background-color: #f6f6f6;
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
  const [algo] = useAtom<string>(algoAtom);
  const initRef = React.useRef(true);
  const fileref = React.useRef(false);
  const [fileContent,setFileContent] = useState<string>('');
  const [f,setF] = useState<boolean>(false);

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
          linkStrength,
          algo,
          true,
        );

    // initRef.current = false;
  }, [
    lassoFlag,
    velocityDecay,
    dataName,
    alpha,
    collide,
    alphaMin,
    alphaDecay,
    linkStrength,
    algo
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
      <input type="file" id="file" ref={fileref}/>
    </Wrapper>
  );
}

export default Canvas;
