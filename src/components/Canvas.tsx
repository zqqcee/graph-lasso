import React, { useEffect } from "react";
import styled from "styled-components";
import { main } from "../core/index";

const Wrapper = styled.div``;
function Canvas({ res }) {
  React.useLayoutEffect(() => {
    main(res);
  }, []);
  return (
    <Wrapper>
      <svg id={"viewport"}></svg>
    </Wrapper>
  );
}

export default Canvas;
