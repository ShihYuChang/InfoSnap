import styled from 'styled-components/macro';

const Wrapper = styled.div`
  width: 100%;
`;

const QuestionWrapper = styled.div`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Label = styled.label`
  box-sizing: border-box;
  width: ${(props) => props.width};
  height: 100%;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
  line-height: ${(props) => props.height};
`;

const Input = styled.input`
  display: ${(props) => props.display};
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background-color: #a4a4a3;
  border-radius: 10px;
  flex-grow: 1;
  color: white;
  padding: 0 10px;
  outline: none;
  border: 0;
  font-size: 18px;
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
  font-size: 18px;
  cursor: pointer;
`;

const ErrorMessage = styled.div`
  display: ${({ display }) => display};
  box-sizing: border-box;
  width: 100%;
  margin-top: 10px;
  background-color: #3a6ff8;
  border-radius: 10px;
  padding: 5px 10px;
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

export default function Questions({
  wrapperWidth,
  labelWidth,
  children,
  height,
  type,
  options,
  onChange,
  userInput,
  errorMessage,
  errorMessageDisplay,
  maxLength,
}) {
  function removeFirstZero(str) {
    if (str.startsWith('0')) {
      const firstNonZeroIndex = str.indexOf(str.match(/[1-9]/)[0]);
      const newStr =
        firstNonZeroIndex !== -1 ? str.slice(firstNonZeroIndex) : str;
      return newStr;
    } else return str;
  }

  return (
    <Wrapper>
      <QuestionWrapper width={wrapperWidth} height={height}>
        <Label width={labelWidth} height={height}>
          {children}
        </Label>
        <Input
          display={type === 'select' ? 'none' : 'block'}
          type={type}
          onChange={onChange}
          value={
            type === 'number'
              ? Number(userInput) > 0
                ? removeFirstZero(userInput)
                : 0
              : userInput ?? ''
          }
          maxLength={maxLength}
          min={0}
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
      <ErrorMessage display={errorMessageDisplay}>{errorMessage}</ErrorMessage>
    </Wrapper>
  );
}
