import React from 'react';
import { Layout } from "@arco-design/web-react";
import Canvas from "../components/Canvas";
const Content = Layout.Content;
const Header = Layout.Header;
import { lassoAtom, velocityDecayAtom, alphaAtom, collideAtom, alphaMinAtom, alphaDecayAtom, linkStrengthAtom } from "../store";
import { useAtom } from "jotai";
import ExpCanvas from '../components/ExpCanvas';
import styled from 'styled-components';
const HeaderText = styled.div`
  font-size:20px;
  font-weight:bold;
  text-align:left;
  margin-top:10px;
  margin-left:20px
`


const Experient: React.FC = () => {
  return (
    <Layout style={{ height: '400px' }}>
      <Header style={{height:50,borderBottom:'1px solid rgb(209 180 180 / 31%)', boxShadow:'rgb(0 0 0 / 10%) 1px 0px 5px 0px'}}>
      <HeaderText>
        交互式图探索用户实验平台
      </HeaderText>
      </Header>
      <Content style={{padding:10,boxSizing:'border-box'}}>
        <ExpCanvas />
      </Content>
    </Layout>
  );
};

export default Experient;