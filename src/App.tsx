import Canvas from "./components/Canvas";
import data from "../data/network/demo.json";
import { Layout } from "@arco-design/web-react";
import Title from "./components/Title";
import Operation from "./components/Operation";
import { Button, Space } from "@arco-design/web-react";
import { lassoAtom, velocityDecayAtom } from "./store";
import { useAtom } from "jotai";

const Sider = Layout.Sider;
const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;

function App() {
  const [lassoFlag, setLassoFlag] = useAtom(lassoAtom);
  const [velocityDecay] = useAtom(velocityDecayAtom);
  return (
    <Layout style={{ height: "400px" }}>
      <Header>
        <Title />
      </Header>
      <Layout>
        <Content>
          <Canvas lassoFlag={lassoFlag} velocityDecay={1 - velocityDecay} />
        </Content>
        <Sider width={"30%"}>
          <Operation />
        </Sider>
      </Layout>
      <Footer>Footer</Footer>
    </Layout>
  );
}

export default App;
