import Canvas from "./components/Canvas";
import data from "../data/network/demo.json";
import { Layout } from "@arco-design/web-react";
import Title from "./components/Title";

const Sider = Layout.Sider;
const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;

function App() {
  return (
    <Layout style={{ height: "400px" }}>
      <Header>
        <Title />
      </Header>
      <Layout>
        <Content>
          <Canvas res={data} />
        </Content>
        <Sider>Sider</Sider>
      </Layout>
      <Footer>Footer</Footer>
    </Layout>
  );
}

export default App;
