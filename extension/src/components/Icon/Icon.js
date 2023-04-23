import React from 'react';
import styled from 'styled-components/macro';

const IconWrapper = styled.div`
  width: ${({ width }) => width};
  height: ${({ width }) => width};
  background-image: url(${({ imgUrl }) => imgUrl});
  background-size: contain;
  cursor: pointer;
`;

export default function Icon({ width, imgUrl, onClick }) {
  return <IconWrapper width={width} imgUrl={imgUrl} onClick={onClick} />;
}
