import { db } from '../../firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components/macro';
import { StateContext } from '../../context/stateContext';
import { HealthContext } from '../../pages/Health/healthContext';

const Wrapper = styled.div`
  width: 1000px;
  margin: 20px auto;
  margin-top: 20px;
  position: absolute;
  z-index: 100;
  background-color: white;
  top: 0;
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
  const { isSearching, setIsSearching } = useContext(StateContext);
  const { selectedFood, setSelectedFood } = useContext(HealthContext);
  const [topFood, setTopFood] = useState([]);
  const [searchedFood, setSearchedFood] = useState([]);
  const [userInput, setUserInput] = useState(null);
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

  function searchFood() {
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
        setTopFood(foodList);
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
    await addDoc(
      collection(db, 'Users', 'sam21323@gmail.com', 'Health-Food'),
      selectedFood
    );
    alert('Added!');
    setIsSearching(false);
    setSelectedFood(null);
  }

  useEffect(() => {
    if (selectedFood) {
      storeSelectedFood();
    }
  }, [selectedFood]);

  useEffect(() => {
    if (keyword) {
      searchFood();
      getRelatedFood();
    }
  }, [keyword]);

  return (
    <Wrapper display={isSearching ? 'block' : 'none'}>
      <SearchContainer onSubmit={handleSubmit}>
        <SearchBar onChange={handleInput} />
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
      <Title display={topFood ? 'block' : 'none'}>Related Food</Title>
      <RelatedFoodContainer>
        {searchedFood.common
          ? searchedFood.common.map((food, index) => (
              <RelatedFood key={index}>
                <FoodImg imgUrl={food.photo.thumb} />
                <h3>{food.food_name}</h3>
              </RelatedFood>
            ))
          : null}
      </RelatedFoodContainer>
    </Wrapper>
  );
}
