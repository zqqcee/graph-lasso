import React, { useEffect } from "react";
import styled from "styled-components";
import { main } from "../core/index";
import * as d3 from "d3";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;
function Canvas({ res, lassoFlag }) {
  React.useLayoutEffect(() => {
    main(res, lassoFlag);
  }, []);
  React.useLayoutEffect(() => {
    if (lassoFlag) {
      console.log(d3.select("svg"));
    }
  }, [lassoFlag]);

  return (
    <Wrapper>
      <svg id={"viewport"}></svg>
    </Wrapper>
  );
}

export default Canvas;
