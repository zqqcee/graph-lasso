import React from 'react';
import { Layout } from "@arco-design/web-react";
import Canvas from "../components/Canvas";
const Content = Layout.Content;
import { lassoAtom, velocityDecayAtom, alphaAtom, collideAtom, alphaMinAtom, alphaDecayAtom, linkStrengthAtom } from "../store";
import { useAtom } from "jotai";
import ExpCanvas from '../components/ExpCanvas';
const Experient: React.FC = () => {
  return (
    <Layout style={{ height: '400px' }}>
      <Content>
        <ExpCanvas />
      </Content>
    </Layout>
  );
};

export default Experient;