import React from 'react';
import styled from 'styled-components';

const Regular = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  background-image: url(${(props) => props.imgUrl});
  background-size: contain;
`;

export default function Icon({ width, imgUrl }) {
  return <Regular width={width} imgUrl={imgUrl} />;
}
