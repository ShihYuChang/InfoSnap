import styled from 'styled-components';

const QuestionWrapper = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  display: flex;
  align-items: center;
`;

const Label = styled.label`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: 100%;
  color: white;
  font-size: 24px;
  font-weight: 800;
  flex-shrink: 0;
  line-height: ${(props) => props.height}; ;
`;

const Input = styled.input`
  box-sizing: border-box;
  height: 100%;
  background-color: #a4a4a3;
  opacity: 0.5;
  border-radius: 10px;
  flex-grow: 1;
  color: white;
  padding: 0 10px;
`;

export default function Question({
  wrapperWidth,
  labelWidth,
  children,
  height,
}) {
  return (
    <QuestionWrapper width={wrapperWidth} height={height}>
      <Label width={labelWidth} height={height}>
        {children}
      </Label>
      <Input />
    </QuestionWrapper>
  );
}
