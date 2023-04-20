import React from 'react';
import styled from 'styled-components';

const IconWrapper = styled.div`
  width: ${(props) => props.width};
  height: ${(props) => props.width};
  background-image: url(${(props) => props.imgUrl});
  background-size: contain;
`;

export default function Icon({ width, imgUrl }) {
  return <IconWrapper width={width} imgUrl={imgUrl} />;
}
