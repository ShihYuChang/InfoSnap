import { db } from '../../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { StateContext } from '../../context/stateContext';
import { HealthContext } from './healthContext';
import { UserContext } from '../../context/userContext';
import Exit from '../../components/Buttons/Exit';
import ReactLoading from 'react-loading';
import SearchBar from '../../components/SearchBar/SearchBar';
import { IoArrowBackSharp } from 'react-icons/io5';

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 1000px;
  position: absolute;
  z-index: 100;
  background-color: #38373b;
  top: 50px;
  left: 20%;
  display: ${(props) => props.display};
  min-height: 300px;
  padding: 30px;
  border-radius: 10px;
`;

const RelatedFoodContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 30px;
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

  /* &:hover {
    background-color: #1b2028;
    color: white;

    ${FoodDescription} {
      color: white;
    }
  } */
`;

const SearchResultWrapper = styled.div`
  max-height: 800px;
  overflow: scroll;
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
  font-weight: 700;
`;

const Loading = styled(ReactLoading)`
  margin: 50px auto;
`;

const CaloryText = styled.div`
  /* font-size: 18px; */
  font-weight: 500;
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-grow: 1;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  width: 70px;
`;

const API_KEY = process.env.REACT_APP_NUTRITIONIX_API_KEY;
const APP_ID = process.env.REACT_APP_NUTRITIONIX_APP_ID;

export default function SearchFood() {
  const { email } = useContext(UserContext);
  const { isAdding, setIsAdding, isSearching, setIsSearching } =
    useContext(StateContext);
  const {
    searchedFood,
    setSearchedFood,
    selectedFood,
    setSelectedFood,
    hasSearched,
    setHasSearched,
  } = useContext(HealthContext);
  const [topFood, setTopFood] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [keyword, setKeyWord] = useState(null);
  const [isDisplayInfo, setIsDisplayInfo] = useState(false);

  // const [hasSearched, setHasSearched] = useState(false);
  function fetchData(url, method, headers, body) {
    return fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(body),
    })
      .then((data) => data.json())
      .catch((err) => console.log(err.message));
  }

  function getRelatedFood() {
    const searchUrl = `https://trackapi.nutritionix.com/v2/search/instant?query=${keyword}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-app-key': API_KEY,
      'x-app-id': APP_ID,
      'x-remote-user-id': '0',
    };
    fetchData(searchUrl, 'GET', headers).then((data) => setSearchedFood(data));
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
    setKeyWord(userInput);
    setHasSearched(true);
  }

  function selectFood(data) {
    const now = new Date();
    setSelectedFood({
      note: data.food_name,
      imgUrl: data.photo.thumb,
      calories: data.nf_calories,
      carbs: data.nf_total_carbohydrate,
      protein: data.nf_protein,
      fat: data.nf_total_fat,
      created_time: new Timestamp(
        now.getTime() / 1000,
        now.getMilliseconds() * 1000
      ),
    });
    setHasSearched(false);
  }

  async function storeSelectedFood() {
    await addDoc(collection(db, 'Users', email, 'Health-Food'), selectedFood);
    alert('Added!');
    closeEditWindow();
  }

  async function storeNote() {
    const now = new Date();
    const dataToStore = {
      note: selectedFood.name,
      carbs: selectedFood.nutritions[3].qty,
      protein: selectedFood.nutritions[1].qty,
      fat: selectedFood.nutritions[2].qty,
      created_time: new Timestamp(
        now.getTime() / 1000,
        now.getMilliseconds() * 1000
      ),
    };
    await addDoc(collection(db, 'Users', email, 'Health-Food'), dataToStore);
    alert('Added!');
    closeEditWindow();
  }

  useEffect(() => {
    if (keyword) {
      searchFood(keyword, setTopFood);
      getRelatedFood();
    }
  }, [keyword]);

  useEffect(() => {
    if (!isAdding) {
      setSearchedFood([]);
      setTopFood([]);
      setUserInput('');
    }
  }, [isAdding]);

  function FoodInfo() {
    return (
      <FoodInfoWrapper>
        <FoodInfoTitleWrapper>
          <FoodInfoHeader>
            <IconWrapper onClick={() => setIsDisplayInfo(false)}>
              <IoArrowBackSharp size={30} />
            </IconWrapper>
            <FoodInfoHeaderTitle>Food Information</FoodInfoHeaderTitle>
            <AddBtn onClick={() => storeNote()}>+</AddBtn>
          </FoodInfoHeader>
          <SplitLine />
        </FoodInfoTitleWrapper>
        <FoodInfoMainWrapper>
          <FoodInfoTitle>{selectedFood.name}</FoodInfoTitle>
          <FoodInfoBrandText>{selectedFood.brand_name}</FoodInfoBrandText>
          <FoodInfoContent>
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
        </FoodInfoMainWrapper>
      </FoodInfoWrapper>
    );
  }

  async function selectResult(index) {
    const commonRelatedFood = searchedFood.branded;
    const selectedFood = commonRelatedFood[index];
    const selectedFoodName = selectedFood.food_name;
    // setKeyWord(selectedFoodName);
    // setIsDisplayInfo(true);
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
          nutritions: [
            {
              key: 'calories',
              qty: totalCalories,
            },
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
        // const dataToStore = {
        //   note: selectedFood.food_name,
        //   imgUrl: selectedFood.photo.thumb,
        //   carbs: selectedFood.nf_total_carbohydrate,
        //   protein: selectedFood.protein,
        //   fat: selectedFood.nf_total_fat,
        //   created_time: new Timestamp(
        //     now.getTime() / 1000,
        //     now.getMilliseconds() * 1000
        //   ),
        // };
        // console.log(selectedFood);
        setSelectedFood(formattedFood);
      })
      .then(() => {
        setIsDisplayInfo(true);
        // alert('Added!');
        // closeEditWindow();
      })
      .catch((err) => console.log(err.message));
  }

  console.log(selectedFood);
  function closeEditWindow() {
    setIsAdding(false);
    setIsSearching(false);
    setSearchedFood([]);
    setTopFood([]);
    setUserInput('');
  }

  return (
    <Wrapper display={isSearching ? 'block' : 'none'}>
      <Exit
        top='10px'
        right='20px'
        handleClick={closeEditWindow}
        display={isAdding ? 'block' : 'none'}
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
              hasSearchIcon
            />
          </SearchContainer>
          <SplitLine />
          <SearchResultWrapper>
            <Title
              display={searchedFood.branded?.length > 0 ? 'block' : 'none'}
            >
              Search Result
            </Title>
            <RelatedFoodContainer>
              {searchedFood.branded ? (
                searchedFood.branded.map((food, index) => (
                  <RelatedFood
                    key={index}
                    onClick={() => {
                      selectResult(index);
                    }}
                  >
                    <LeftSection>
                      <TitleAndBrand>
                        <InfoTitle>{food.food_name}</InfoTitle>
                        {food.brand_name ? (
                          <FoodDescription>{`Brand: ${food.brand_name}`}</FoodDescription>
                        ) : null}
                      </TitleAndBrand>
                      {/* <CaloryText>{`${
                        food.nf_calories * food.serving_qty
                      } calories`}</CaloryText> */}
                    </LeftSection>
                    <RightSection>
                      <AddBtn>+</AddBtn>
                    </RightSection>
                  </RelatedFood>
                ))
              ) : hasSearched ? (
                <Loading type='spinningBubbles' color='white' />
              ) : null}
            </RelatedFoodContainer>
          </SearchResultWrapper>
        </>
      )}
    </Wrapper>
  );
}

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

const AddBtn = styled.button`
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3a6ff7;
  border: 0;
  outline: none;
  cursor: pointer;
  font-size: 30px;

  &:hover {
    background-color: #3a6ff7;
    color: white;
  }
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
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 3px;
`;

const FoodInfoBrandText = styled.div`
  color: #a4a4a3;
`;

const FoodInfoHeader = styled.div`
  width: 100%;
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
  height: 100px;
  gap: 50px;
  margin-top: 70px;
`;

const NutritionInfoWrapper = styled.div`
  /* background-color: black; */
  display: flex;
  flex-direction: column;
  align-items: center;
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
