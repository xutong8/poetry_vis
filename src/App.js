import './App.less';
import 'antd/dist/antd.css';
import ForceGraphView from '@/pages/ForceGraphView';
import WritePoetryView from '@/pages/WritePoetryView';
import PoetryFallsView from '@/pages/PoetryFallsView';
import styled from 'styled-components';

const Item = styled.div`
  flex: 1 0 0;
`;

function App() {
  return (
    <div className="App">
      <Item>
       <ForceGraphView />
      </Item>
      <Item>
        <PoetryFallsView />
      </Item> 
      <Item>
        <WritePoetryView />
      </Item>
    </div>
  );
}

export default App;
