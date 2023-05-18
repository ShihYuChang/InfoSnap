import { useContext } from 'react';
import styled from 'styled-components/macro';
import Logo from '../../components/Logo/Logo';
import { UserContext } from '../../context/UserContext';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 100vw;
  height: 120px;
  padding: 20px 15.6vw;
  position: sticky;
  top: 0;
  left: 0;
  background-color: #181818;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 100px;
`;

const LogoWrapper = styled.div`
  width: 250px;
`;

const Menu = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
  justify-content: space-between;
`;

const MenuText = styled.div`
  height: 100%;
  display: flex;
  font-size: 18px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const LoginBtn = styled.div`
  width: 140px;
  height: 50px;
  border: 1px solid white;
  font-size: 17px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: #3a6ff7;
  }
`;

export default function Header() {
  const menuTexts = ['Home', 'Features', 'About', 'Contact'];
  const { setHasClickedSignIn } = useContext(UserContext);
  return (
    <Wrapper>
      <LogoWrapper>
        <Logo
          imgWidth='40px'
          titleFontSize='32px'
          marginBottom='0'
          flexGrow={0}
          textAlign='start'
          imgFontSize='32px'
        />
      </LogoWrapper>
      {/* <Menu>
        {menuTexts.map((text, index) => (
          <MenuText key={index}>{text}</MenuText>
        ))}
      </Menu> */}
      <LoginBtn onClick={() => setHasClickedSignIn(true)}>Login</LoginBtn>
    </Wrapper>
  );
}
