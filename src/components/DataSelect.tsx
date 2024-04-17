import React from "react";
import { Select } from "@arco-design/web-react";
import { dataOptions } from "../config/data";
import { dataNameAtom } from "../store";
import { useAtom } from "jotai";
const Option = Select.Option;

function DataSelect() {
  const [, setDataName] = useAtom<string>(dataNameAtom);

  return (
    <div>
      <Select
        onChange={(v) => {
          setDataName(v);
        }}
        defaultValue={"midData"}
      >
        {dataOptions.map((option) => (
          <Option key={option.key} value={option.key}>
            {option.label}
          </Option>
        ))}
      </Select>
    </div>
  );
}

export default DataSelect;
