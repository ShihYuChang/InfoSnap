import styled from 'styled-components/macro';

const TitleWrapper = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  color: ${(props) => (props.featured ? 'white' : '#a4a4a3')};
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 24px;
  font-weight: 800;
  line-height: ${(props) => props.height};
  padding: 0 40px;
  cursor: pointer;
`;

export default function Title({ children, width, height, featured, onClick }) {
  return (
    <TitleWrapper
      width={width}
      height={height}
      featured={featured}
      onClick={onClick}
    >
      {children}
    </TitleWrapper>
  );
}
