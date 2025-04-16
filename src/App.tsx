import Canvas from "./components/Canvas";
import data from "../data/network/demo.json";
import { Layout } from "@arco-design/web-react";
import Title from "./components/Title";
import Operation from "./components/Operation";
import { Button, Space } from "@arco-design/web-react";
import { lassoAtom, velocityDecayAtom, alphaAtom, collideAtom, alphaMinAtom, alphaDecayAtom, linkStrengthAtom } from "./store";
import { useAtom } from "jotai";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Experient from './pages/exp';
import Home from './pages/home';


function App() {
  
  return (
    <div> 
      <Router>
        <Routes>
          <Route path="/exp" element={<Experient />} />
          <Route path="/" element={<Home />}/>
        </Routes>
      </Router>
      
    </div>
  );
}

export default App;
