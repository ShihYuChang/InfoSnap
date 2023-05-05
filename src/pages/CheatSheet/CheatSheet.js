import styled from 'styled-components/macro';
import Mask from '../../components/Mask';

const Cheatsheet = styled.div`
  display: ${({ display }) => display};
  box-sizing: border-box;
  width: 50vw;
  max-height: 800px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #38373b;
  padding: 50px 30px;
  z-index: 500;
  border-radius: 20px;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
  overflow: scroll;
`;

const SheetHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 50px;
`;

const Title = styled.div`
  font-size: 28px;
  font-weight: 500;
`;

const SubTitle = styled.div`
  font-size: 20px;
  color: #a4a4a3;
`;

const SheetBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin: 0 auto;
  align-items: center;
`;

const SheetWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
`;

const SheetCategory = styled.div`
  margin-bottom: 20px;
`;

const Shortcut = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const ImgWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

const SheetImg = styled.div`
  width: 80px;
  height: 60px;
  background-color: #3c4642;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
`;

const SheetText = styled.div`
  width: 100%;
  line-height: 25px;
`;

const CategoryTitle = styled.div`
  width: 100%;
  font-size: 18px;
  margin-bottom: 20px;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: 1px solid #a4a4a3;
  margin-top: 30px;
`;

export default function CheatSheet({ display }) {
  const shortcuts = [
    {
      tag: 'General',
      items: [
        { key: ['Esc'], feature: 'Close Pop-up' },
        {
          key: ['Ctrl', 'Shift'],
          feature: 'Toggle the left menu',
        },
        {
          key: ['Tab'],
          feature:
            'Navigate to the next tab in the menu / Search in specific categories',
        },
        {
          key: ['Ctrl', 'S'],
          feature: 'Enter/Exit the search mode',
        },
        { key: ['`'], feature: 'Display the shortcut list.' },
        { key: ['Ctrl', ['P']], feature: 'Display/Hide the profile menu.' },
      ],
    },
    {
      tag: 'Finance',
      items: [
        {
          key: ['Ctrl', 'N'],
          feature: 'Add Record',
        },
        { key: ['Shift'], feature: 'Change to Calendar View/Analytics View' },
        {
          key: ['Ctrl', 'B'],
          feature: 'Edit income and budget',
        },
      ],
    },
  ];

  return (
    <>
      <Mask display={display} />
      <Cheatsheet display={display}>
        <SheetHeader>
          <Title>Keyboard Shortcuts</Title>
          <SubTitle>List of shortcuts to boost your efficiency</SubTitle>
        </SheetHeader>
        <SheetBody>
          {shortcuts.map((shortcut, index) => (
            <SheetCategory key={index}>
              <CategoryTitle key={index}>{shortcut.tag}</CategoryTitle>
              <SheetWrapper>
                {shortcut.items.map((item, index) => (
                  <Shortcut key={index}>
                    {item.key.map((img, index) => (
                      <SheetImg key={index}>{img}</SheetImg>
                    ))}
                    <SheetText>{item.feature}</SheetText>
                  </Shortcut>
                ))}
              </SheetWrapper>
              <SplitLine />
            </SheetCategory>
          ))}
        </SheetBody>
      </Cheatsheet>
    </>
  );
}
