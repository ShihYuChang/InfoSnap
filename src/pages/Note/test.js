import React, { useState } from 'react';
import styled from 'styled-components';

const ImportButton = styled.button``;

const Option = styled.div``;

export default function Test() {
  const [buttonIsHovered, setButtonIsHovered] = useState(false);
  return (
    <div>
      <ImportButton
        onMouseEnter={() => setButtonIsHovered(true)}
      ></ImportButton>
      <Option display={buttonIsHovered ? 'block' : 'none'}></Option>
    </div>
  );
}
