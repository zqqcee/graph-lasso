import Canvas from "./components/Canvas";
import data from "../data/network/demo.json";
import { Layout } from "@arco-design/web-react";
import Title from "./components/Title";
import { Button, Space } from "@arco-design/web-react";
import { lassoAtom } from "./store";
import { useAtom } from "jotai";

const Sider = Layout.Sider;
const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;

function App() {
  const [lassoFlag, setLassoFlag] = useAtom(lassoAtom);
  return (
    <Layout style={{ height: "400px" }}>
      <Header>
        <Title />
      </Header>
      <Layout>
        <Content>
          <Canvas res={data} lassoFlag={lassoFlag} />
        </Content>
        <Sider>
          <Button
            onClick={() => {
              setLassoFlag((prev) => !prev);
            }}
            type="primary"
          >
            lasso
          </Button>
        </Sider>
      </Layout>
      <Footer>Footer</Footer>
    </Layout>
  );
}

export default App;
