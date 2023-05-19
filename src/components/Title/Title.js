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
  font-weight: 500;
  line-height: ${(props) => props.height};
  cursor: pointer;
  margin: ${(props) => props.margin};
  letter-spacing: 4px;
  padding: ${({ isCollapsed }) => (isCollapsed ? '0' : '0 40px')};

  @media screen and (max-width: 1600px) {
    height: 50px;
    font-size: 20px;
  }
`;

export default function Title({
  children,
  width,
  height,
  featured,
  onClick,
  isCollapsed,
}) {
  return (
    <TitleWrapper
      width={width}
      height={height}
      isCollapsed={isCollapsed}
      margin={isCollapsed ? '0 auto' : null}
      featured={featured}
      onClick={onClick}
    >
      {children}
    </TitleWrapper>
  );
}
