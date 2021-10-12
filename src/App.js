import './App.less';
import View1 from '@/pages/ForceGraphView';
import View2 from '@/pages/WritePoetryView';
import styled from 'styled-components';

const Item = styled.div`
  flex: 1 0 0;
`;

function App() {

  return (
    <div className="App">
      <Item><View1 /></Item>
      <Item><View2 /></Item>
    </div>
  );
}

export default App;
