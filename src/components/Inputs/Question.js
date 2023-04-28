import styled from 'styled-components/macro';

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
  flex-shrink: 0;
  line-height: ${(props) => props.height};
`;

const Input = styled.input`
  display: ${(props) => props.display};
  box-sizing: border-box;
  height: 100%;
  background-color: #a4a4a3;
  border-radius: 10px;
  flex-grow: 1;
  color: white;
  padding: 0 10px;
  outline: none;
  border: 0;
  font-size: 20px;
`;

const Select = styled.select`
  display: ${(props) => props.display};
  box-sizing: border-box;
  height: 100%;
  background-color: #a4a4a3;
  border-radius: 10px;
  flex-grow: 1;
  color: white;
  padding: 0 10px;
  outline: none;
  border: 0;
  font-size: 20px;
  cursor: pointer;
`;

export function DateSelector({ width, height, fontSize, padding, margin }) {
  const Wrapper = styled.input`
    box-sizing: border-box;
    background-color: #a4a4a3;
    width: ${(props) => props.width ?? '100%'};
    height: ${(props) => props.height ?? '70px'};
    text-align: center;
    line-height: 60px;
    border: 0;
    border-radius: 10px;
    cursor: pointer;
    padding: ${(props) => props.padding};
    outline: none;
    margin: ${(props) => props.margin ?? '0 auto'};
    color: white;
  `;

  return (
    <Wrapper
      width={width}
      height={height}
      padding={padding}
      fontSize={fontSize}
      margin={margin}
      type='date'
    />
  );
}

export default function Question({
  wrapperWidth,
  labelWidth,
  children,
  height,
  type,
  options,
  onChange,
  userInput,
}) {
  return (
    <QuestionWrapper width={wrapperWidth} height={height}>
      <Label width={labelWidth} height={height}>
        {children}
      </Label>
      <Input
        display={type === 'select' ? 'none' : 'block'}
        type={type}
        onChange={onChange}
        value={userInput}
        required
      />
      <Select
        display={type === 'select' ? 'block' : 'none'}
        onChange={onChange}
      >
        {type === 'select'
          ? options.map((option, index) => (
              <option key={index}>{option}</option>
            ))
          : null}
      </Select>
    </QuestionWrapper>
  );
}
