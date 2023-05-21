import { useContext, useEffect, useState } from 'react';
import { IoArrowBackSharp } from 'react-icons/io5';
import ReactLoading from 'react-loading';
import { Pie, PieChart } from 'recharts';
import styled from 'styled-components/macro';
import Button from '../../components/Buttons/Button';
import Exit from '../../components/Buttons/Exit';
import SearchBar from '../../components/SearchBar';
import { HealthContext } from '../../context/HealthContext';
import { StateContext } from '../../context/StateContext';
import { UserContext } from '../../context/UserContext';
import { storeSearchedFood } from '../../utils/firebase/firebase';
import { alerts } from '../../utils/sweetAlert';
import { parseRegularTimestamp } from '../../utils/timestamp';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 1000px;
  position: fixed;
  z-index: 100;
  background-color: #38373b;
  top: ${({ top }) => top};
  left: 50%;
  transform: translate(-50%, -50%);
  display: ${(props) => props.display};
  min-height: 300px;
  padding: 30px;
  border-radius: 10px;
`;

const RelatedFoodContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 500px;
  overflow-y: auto;
  gap: 30px;
  padding-right: 15px;

  &::-webkit-scrollbar {
    background-color: #1b2028;
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #a4a4a3;
  }

  &::-webkit-scrollbar-track {
    background-color: #1b2028;
  }
`;

const FoodDescription = styled.div`
  font-size: 14px;
  color: #5b5b5b;
`;

const RelatedFood = styled.div`
  box-sizing: border-box;
  padding: 10px 30px;
  width: 100%;
  background-color: #a4a4a3;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  cursor: pointer;
  border-radius: 10px;

  &:hover {
    background-color: #3a6ff7;
    color: white;

    ${FoodDescription} {
      color: white;
    }
  }
`;

const SearchResultWrapper = styled.div`
  max-height: 800px;
`;

const SearchContainer = styled.div`
  width: 500px;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px auto 30px;
`;

const Title = styled.h1`
  display: ${(props) => props.display};
  margin: 30px 0;
  font-weight: 500;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const SearchBarWrapper = styled.div`
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: ${({ display }) => display};
  width: 40%;
  z-index: 500;
`;

const SplitLine = styled.hr`
  width: 100%;
  border: 1px solid #a4a4a3;
  margin: 0;
`;

const InfoTitle = styled.div`
  font-size: 20px;
  font-weight: 500;
`;

const TitleAndBrand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FoodInfoWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 30px;
`;

const FoodInfoTitleWrapper = styled.div`
  box-sizing: border-box;
  height: 70px;
  padding: 10px 0 30px;
`;

const FoodInfoTitle = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 3px;
`;

const FoodInfoBrandText = styled.div`
  color: #a4a4a3;
  font-size: 20px;
`;

const FoodInfoHeader = styled.div`
  width: 65%;
  height: 50px;
  display: flex;
  justify-content: space-between;
`;

const FoodInfoHeaderTitle = styled.div`
  font-size: 24px;
  font-weight: 500;
`;

const IconWrapper = styled.div`
  cursor: pointer;
`;

const FoodInfoMainWrapper = styled.div`
  margin-top: 30px;
`;

const FoodInfoContent = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 50px;
  margin-top: 50px;
`;

const NutritionInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const NutritionTitle = styled.div`
  font-weight: 500;
  font-size: 24px;
`;

const NutritionText = styled.div`
  font-size: 18px;
  color: #a4a4a3;
`;

const PieChartWrapper = styled.div`
  position: relative;
`;

const PieChartTextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  gap: px;
`;

const PieChartTextTitle = styled.div`
  font-size: 28px;
`;

const PieChartText = styled.div`
  font-size: 14px;
  color: #a4a4a3;
`;

const ButtonWrapper = styled.div`
  width: 200px;
  margin: 30px auto 0;
  border-radius: 10px;

  &:hover {
    background-color: aliceblue;
  }
`;

const API_KEY = process.env.REACT_APP_NUTRITIONIX_API_KEY;
const APP_ID = process.env.REACT_APP_NUTRITIONIX_APP_ID;

export default function SearchFood({ addIntake }) {
  const { userInfo } = useContext(UserContext);
  const email = userInfo.email;
  const {
    isEditing,
    setIsEditing,
    setIsAddingPlan,
    isSearching,
    setIsSearching,
    setFixedMenuVisible,
    selectedDate,
  } = useContext(StateContext);
  const {
    searchedFood,
    setSearchedFood,
    selectedFood,
    setSelectedFood,
    isLoading,
    setIsLoading,
  } = useContext(HealthContext);
  const [userInput, setUserInput] = useState('');
  const [keyword, setKeyWord] = useState(null);
  const [isDisplayInfo, setIsDisplayInfo] = useState(false);

  async function fetchData(url, method, headers, body) {
    try {
      const data = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body),
      });
      return await data.json();
    } catch (err) {
      alerts.titleOnly('Something went wrong, please try again later', 'error');
      return;
    }
  }

  function getRelatedFood() {
    const searchUrl = `https://trackapi.nutritionix.com/v2/search/instant?query=${keyword}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-app-key': API_KEY,
      'x-app-id': APP_ID,
      'x-remote-user-id': '0',
    };
    fetchData(searchUrl, 'GET', headers).then((data) => {
      const mixData = data.common
        .slice(0, 10)
        .concat(data.branded.slice(0, 10));
      setSearchedFood(mixData);
    });
  }

  function searchFood(keyword, callback) {
    const nutrientsUrl =
      'https://trackapi.nutritionix.com/v2/natural/nutrients';
    const headers = {
      'Content-Type': 'application/json',
      'x-app-key': API_KEY,
      'x-app-id': APP_ID,
      'x-remote-user-id': '0',
    };
    fetchData(nutrientsUrl, 'POST', headers, { query: keyword }).then(
      (data) => {
        const foodList = data.foods;
        callback(foodList);
      }
    );
  }

  function handleInput(e) {
    const inputValue = e.target.value;
    setUserInput(inputValue);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSearchedFood([]);
    setKeyWord(userInput);
    setIsLoading(true);
  }

  function handleSeachFoodSubmit(e) {
    e.preventDefault();
    const today = parseRegularTimestamp(new Date(), 'YYYY-MM-DD');
    const created_time =
      selectedDate === today ? new Date() : new Date(selectedDate);
    storeSearchedFood(selectedFood, created_time, closeEditWindow, email);
  }

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape' && isSearching) {
        closeEditWindow();
      }
    }
    window.addEventListener('keydown', handleEsc);

    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (keyword) {
      getRelatedFood();
    }
  }, [keyword]);

  useEffect(() => {
    if (!isEditing) {
      setSearchedFood([]);
      setUserInput('');
    }
  }, [isEditing]);

  useEffect(() => {
    if (searchedFood.length > 0) {
      setIsLoading(false);
    } else {
    }
  }, [searchedFood]);

  function FoodInfo() {
    return (
      <FoodInfoWrapper>
        <FoodInfoTitleWrapper>
          <FoodInfoHeader>
            <IconWrapper onClick={() => setIsDisplayInfo(false)}>
              <IoArrowBackSharp size={30} />
            </IconWrapper>
            <FoodInfoHeaderTitle>Food Information</FoodInfoHeaderTitle>
          </FoodInfoHeader>
          <SplitLine />
        </FoodInfoTitleWrapper>
        <FoodInfoMainWrapper>
          <FoodInfoTitle>{selectedFood.name}</FoodInfoTitle>
          <FoodInfoBrandText>
            {selectedFood.brand_name ?? 'No Brand'}
          </FoodInfoBrandText>
          <FoodInfoContent>
            <PieChartWrapper>
              <PieChart width={150} height={150}>
                <Pie
                  data={selectedFood.nutritions}
                  dataKey='qty'
                  nameKey='key'
                  cx='60%'
                  cy='50%'
                  outerRadius={60}
                  innerRadius={50}
                  fill='#82ca9d'
                />
              </PieChart>
              <PieChartTextWrapper>
                <PieChartTextTitle>{selectedFood.calories}</PieChartTextTitle>
                <PieChartText>calories</PieChartText>
              </PieChartTextWrapper>
            </PieChartWrapper>
            {selectedFood.nutritions.map((nutrition, index) => (
              <NutritionInfoWrapper key={index}>
                {nutrition.percentage ? (
                  <NutritionText>{nutrition.percentage}%</NutritionText>
                ) : null}
                <NutritionTitle>{nutrition.qty}</NutritionTitle>
                <NutritionText>{nutrition.key}</NutritionText>
              </NutritionInfoWrapper>
            ))}
          </FoodInfoContent>
          <ButtonWrapper>
            <Button onClick={handleSeachFoodSubmit} textAlignment='center'>
              Add Food
            </Button>
          </ButtonWrapper>
        </FoodInfoMainWrapper>
      </FoodInfoWrapper>
    );
  }

  async function selectResult(index) {
    const selectedFood = searchedFood[index];
    const selectedFoodName = selectedFood.food_name;
    const nutrientsUrl =
      'https://trackapi.nutritionix.com/v2/natural/nutrients';
    const headers = {
      'Content-Type': 'application/json',
      'x-app-key': API_KEY,
      'x-app-id': APP_ID,
      'x-remote-user-id': '0',
    };
    fetchData(nutrientsUrl, 'POST', headers, { query: selectedFoodName })
      .then((data) => {
        const { foods } = data;
        const foodInfo = foods[0];
        const proteinCalories = foodInfo.nf_protein * 4;
        const fatCalories = foodInfo.nf_total_fat * 9;
        const carbsCalories = foodInfo.nf_total_carbohydrate * 4;
        const totalCalories = (
          proteinCalories +
          carbsCalories +
          fatCalories
        ).toFixed();
        const formattedFood = {
          name: foodInfo.food_name,
          brand: foodInfo.brand_name,
          calories: totalCalories,
          nutritions: [
            {
              key: 'protein',
              qty: foodInfo.nf_protein,
              percentage: ((proteinCalories / totalCalories) * 100).toFixed(2),
            },
            {
              key: 'carbs',
              qty: foodInfo.nf_total_carbohydrate,
              percentage: ((carbsCalories / totalCalories) * 100).toFixed(2),
            },
            {
              key: 'fat',
              qty: foodInfo.nf_total_fat,
              percentage: ((fatCalories / totalCalories) * 100).toFixed(2),
            },
          ],
        };
        setSelectedFood(formattedFood);
      })
      .then(() => {
        setIsDisplayInfo(true);
      })
      .catch((err) =>
        alerts.titleOnly(
          'Something went wrong, please try again later',
          'error'
        )
      );
  }

  function closeEditWindow() {
    addIntake(false);
    setIsEditing(false);
    setIsAddingPlan(false);
    setIsSearching(false);
    setIsDisplayInfo(false);
    setSearchedFood([]);
    setUserInput('');
    setSelectedFood(null);
    setIsLoading(false);
    setFixedMenuVisible(false);
  }

  return searchedFood.length > 0 ? (
    <Wrapper
      display={isSearching ? 'block' : 'none'}
      top={searchFood.length > 0 ? '50%' : 'e0%'}
    >
      <Exit
        top='10px'
        right='20px'
        handleClick={closeEditWindow}
        display={isEditing ? 'block' : 'none'}
      >
        X
      </Exit>
      {isDisplayInfo ? (
        <FoodInfo />
      ) : (
        <>
          <SearchContainer>
            <SearchBar
              onChange={handleInput}
              onSubmit={handleSubmit}
              placeholder='Search food...'
              autocompleteDisplay='none'
              inputValue={userInput}
              hasSearchIcon
            />
          </SearchContainer>
          <SplitLine />
          <SearchResultWrapper>
            <Title display={searchedFood?.length > 0 ? 'block' : 'none'}>
              Search Result
            </Title>
            <RelatedFoodContainer>
              {searchedFood.length > 0
                ? searchedFood.map((food, index) => (
                    <RelatedFood
                      key={index}
                      onClick={() => {
                        selectResult(index);
                      }}
                    >
                      <TitleAndBrand>
                        <InfoTitle>{food.food_name}</InfoTitle>
                        <FoodDescription>
                          {food.brand_name
                            ? `Brand: ${food.brand_name}`
                            : 'No Brand'}
                        </FoodDescription>
                      </TitleAndBrand>
                    </RelatedFood>
                  ))
                : null}
            </RelatedFoodContainer>
          </SearchResultWrapper>
        </>
      )}
    </Wrapper>
  ) : (
    <SearchBarWrapper display={isSearching ? 'block' : 'none'}>
      <SearchBar
        onChange={handleInput}
        onSubmit={handleSubmit}
        placeholder='Search food...'
        autocompleteDisplay='none'
        inputValue={userInput}
        hasSearchIcon
        inputColor='#a4a4a3'
        textColor='black'
      />
      {isLoading && <Loading type='spinningBubbles' color='white' />}
    </SearchBarWrapper>
  );
}
