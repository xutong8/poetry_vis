import React from 'react';
import styled from 'styled-components';

const Header = styled.div`
  width: 200px;
  height: 200px;
  background: red;
`;

const WritePoetryView: React.FC<any> = () => {
  return (
    <div>
      <Header>write poetry</Header>
    </div>
  );
};

export default WritePoetryView;
