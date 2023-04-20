import { useContext } from 'react';
import styled from 'styled-components/macro';
import { StateContext } from '../../../context/stateContext';
import SearchBar from '../../SearchBar/SearchBar';

const Wrapper = styled.div`
  width: 100%;
  height: 74px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  width: 260px;
  line-height: 74px;
  font-size: 40px;
  color: white;
  margin: 0 20px 0 0;
`;

const Profile = styled.div`
  display: flex;
  gap: 20px;
  width: 200px;
  height: 100%;
  align-items: center;
  justify-content: end;
  color: white;
  cursor: pointer;
`;

const ProfilePic = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #9e9e9e;
`;

const IconWrapper = styled.div`
  box-sizing: border-box;
  width: 50px;
  height: 50px;
  background-color: #1b2028;
  border-radius: 10px;
  position: relative;
  flex-shrink: 0;
  /* margin-left: 50px; */
  cursor: pointer;
`;

const Icon = styled.div`
  background-image: url(${(props) => props.imgUrl});
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-size: contain;
  width: 35px;
  height: 35px;
`;

export default function Header({ children }) {
  const { selectedOption, headerIcons } = useContext(StateContext);

  return (
    <Wrapper>
      <Title>{selectedOption}</Title>
      <SearchBar />
      {headerIcons.length > 0 &&
        headerIcons.map((icon, index) => (
          <IconWrapper key={index}>
            <Icon imgUrl={icon} />
          </IconWrapper>
        ))}
      {children}
      <Profile>
        <ProfilePic />
        Samuel Chang
      </Profile>
    </Wrapper>
  );
}
