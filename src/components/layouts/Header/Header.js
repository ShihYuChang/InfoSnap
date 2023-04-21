import { useContext, useState } from 'react';
import styled from 'styled-components/macro';
import { StateContext } from '../../../context/stateContext';
import SearchBar from '../../SearchBar/SearchBar';
import calendar from './calendar.png';
import { Calendar, theme, ConfigProvider } from 'antd';

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
  font-size: 24px;
  color: white;
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

const CalendarWrapper = styled.div`
  display: ${({ display }) => display};
  position: absolute;
  z-index: 10;
  top: 120px;
`;

const DateContainer = styled.div`
  width: 220px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

export default function Header({ children }) {
  const { selectedOption, headerIcons, selectedDate, setSelectedDate } =
    useContext(StateContext);
  const { token } = theme.useToken();
  const [isSelectingDate, setIsSelectingDate] = useState(false);

  const wrapperStyle = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorInfo,
  };

  function selectDate(date) {
    setSelectedDate(date);
    setIsSelectingDate(false);
  }

  function clickCalendar() {
    setIsSelectingDate((prev) => !prev);
  }

  // console.log(selectedDate);
  return (
    <Wrapper>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#3a6ff7',
            colorBgContainer: '#1B2028',
            colorText: 'white',
          },
        }}
      >
        <CalendarWrapper display={isSelectingDate ? 'block' : 'none'}>
          <div style={wrapperStyle}>
            <Calendar
              fullscreen={false}
              onSelect={(value) => selectDate(value.format('YYYY-MM-DD'))}
            />
          </div>
        </CalendarWrapper>
      </ConfigProvider>
      <DateContainer>
        <IconWrapper>
          <Icon imgUrl={calendar} onClick={clickCalendar} />
        </IconWrapper>
        {typeof selectedDate === 'string' ? (
          <Title>{selectedDate}</Title>
        ) : null}
      </DateContainer>
      <SearchBar />
      {headerIcons.length > 0 &&
        headerIcons.map((icon, index) => (
          <IconWrapper key={index} onClick={icon.onClick}>
            <Icon imgUrl={icon.imgUrl} />
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
