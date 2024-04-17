import React from "react";
import { PageHeader } from "@arco-design/web-react";
import { Select, Message, Space } from "@arco-design/web-react";

function Title() {
  return (
    <PageHeader
      style={{ background: "#ffffff", boxShadow: "0px 1px 4px 0px #d6d0d0" }}
      title="Graph-Lasso"
      subTitle="explore freely with 'lasso'"
    />
  );
}

export default Title;
