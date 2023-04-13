import { db } from '../../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { StateContext } from '../../context/stateContext';
import { HealthContext } from '../../pages/Health/healthContext';
import { UserContext } from '../../context/userContext';
import Exit from '../Buttons/Exit';

const Wrapper = styled.div`
  width: 1000px;
  position: absolute;
  z-index: 100;
  background-color: white;
  top: 20px;
  left: 20%;
  z-index: 100;
  display: ${(props) => props.display};
`;

const TopFood = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

const TopFoodInfo = styled.div`
  width: 100%;
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const RelatedFoodContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding-top: 30px;
`;

const RelatedFood = styled.div`
  width: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

const FoodImg = styled.div`
  width: 150px;
  height: 150px;
  background-image: url(${(props) => props.imgUrl});
  background-size: contain;
  background-repeat: no-repeat;
`;

const SearchContainer = styled.form`
  width: 500px;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 10px auto 30px;
`;

const SearchBar = styled.input`
  width: 300px;
  height: 50px;
  border-radius: 8px;
  padding: 0 0 0 10px;
  font-size: 20px;
`;

const SubmitBtn = styled.button`
  width: 70px;
  height: 50px;
  border-radius: 8px;
`;

const Title = styled.h1`
  display: ${(props) => props.display};
`;

const API_KEY = process.env.REACT_APP_NUTRITIONIX_API_KEY;
const APP_ID = process.env.REACT_APP_NUTRITIONIX_APP_ID;

export default function SearchFood() {
  const { email } = useContext(UserContext);
  const { isAdding, setIsAdding, isSearching, setIsSearching } =
    useContext(StateContext);
  const { searchedFood, setSearchedFood, selectedFood, setSelectedFood } =
    useContext(HealthContext);
  const [topFood, setTopFood] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [keyword, setKeyWord] = useState(null);

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
  }

  async function storeSelectedFood() {
    await addDoc(collection(db, 'Users', email, 'Health-Food'), selectedFood);
    alert('Added!');
    closeEditWindow();
  }

  useEffect(() => {
    if (selectedFood) {
      storeSelectedFood();
    }
  }, [selectedFood]);

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

  async function getSelectedRelatedFood(index) {
    const commonRelatedFood = searchedFood.common;
    const selectedFood = commonRelatedFood[index];
    const selectedFoodName = selectedFood.food_name;
    setKeyWord(selectedFoodName);
    // const nutrientsUrl =
    //   'https://trackapi.nutritionix.com/v2/natural/nutrients';
    // const headers = {
    //   'Content-Type': 'application/json',
    //   'x-app-key': API_KEY,
    //   'x-app-id': APP_ID,
    //   'x-remote-user-id': '0',
    // };
    // fetchData(nutrientsUrl, 'POST', headers, { query: selectedFoodName })
    //   .then((data) => {
    //     const now = new Date();
    //     const { foods } = data;
    //     const selectedFood = foods[0];
    //     const dataToStore = {
    //       note: selectedFood.food_name,
    //       imgUrl: selectedFood.photo.thumb,
    //       calories: selectedFood.nf_calories,
    //       carbs: selectedFood.nf_total_carbohydrate,
    //       protein: selectedFood.nf_protein,
    //       fat: selectedFood.nf_total_fat,
    //       created_time: new Timestamp(
    //         now.getTime() / 1000,
    //         now.getMilliseconds() * 1000
    //       ),
    //     };
    //     addDoc(
    //       collection(db, 'Users', email, 'Health-Food'),
    //       dataToStore
    //     );
    //   })
    //   .then(() => {
    //     alert('Added!');
    //     closeEditWindow();
    //   })
    //   .catch((err) => console.log(err.message));
  }

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
      <SearchContainer onSubmit={handleSubmit}>
        <SearchBar onChange={handleInput} value={userInput} />
        <SubmitBtn>Search</SubmitBtn>
      </SearchContainer>
      {topFood
        ? topFood.map((food, index) => (
            <TopFood key={index} onClick={() => selectFood(food)}>
              <img src={food.photo.thumb} alt='food' />
              <h2>{food.food_name}</h2>
              <TopFoodInfo>
                <h3>{`Calories: ${food.nf_calories}`}</h3>
                <h3>{`Carbs: ${food.nf_total_carbohydrate}`}</h3>
                <h3>{`Protein: ${food.nf_protein}`}</h3>
                <h3>{`Fat: ${food.nf_total_fat}`}</h3>
              </TopFoodInfo>
            </TopFood>
          ))
        : null}
      <hr />
      <Title display={topFood.length > 0 ? 'block' : 'none'}>
        Related Food
      </Title>
      <RelatedFoodContainer>
        {searchedFood.common
          ? searchedFood.common.map((food, index) => (
              <RelatedFood
                key={index}
                onClick={() => {
                  getSelectedRelatedFood(index);
                }}
              >
                <FoodImg imgUrl={food.photo.thumb} />
                <h3>{food.food_name}</h3>
              </RelatedFood>
            ))
          : null}
      </RelatedFoodContainer>
    </Wrapper>
  );
}
