import { useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  width: 100%;
  color: white;
`;

const Container = styled.div`
  width: 100vw;
  filter: url(#threshold) blur(0.6px);
`;

const HeroText = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  user-select: none;
  font-size: 150px;
  top: -180px;
  filter: ${(props) => props.filter};
  opacity: ${(props) => props.opacity};
  color: ${(props) => props.color};
`;

const HeroTextWrapper = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const ButtonWrapper = styled.div`
  width: 400px;
  display: flex;
  justify-content: space-between;
`;

const Button = styled.div`
  width: 180px;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.backgroundColor};
  border: ${(props) => (props.border ? '1px solid white' : null)};
  cursor: pointer;
`;

const SubTitle = styled.div`
  box-sizing: border-box;
  width: 50%;
  text-align: center;
  padding: 10px;
  font-size: 20px;
  line-height: 50px;
  margin-bottom: 90px;
`;

const SVGFilter = styled.svg`
  height: 0;
  margin-bottom: 40px;
`;

export default function Main() {
  const texts = ['Organize', 'Your Life', 'In a Snap', 'With', 'InfoSnap'];

  const morphTime = 1;
  const cooldownTime = 0.8;

  let textIndex = texts.length - 1;
  let time = new Date();
  let morph = 0;
  let cooldown = cooldownTime;

  const [heroText, setHeroText] = useState({
    text1: { value: '', opacity: '100%', filter: '' },
    text2: { value: '', opacity: '0%', filter: '' },
  });

  function setMorph(fraction) {
    const newHeroText = { ...heroText };
    newHeroText.text2.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    newHeroText.text2.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    fraction = 1 - fraction;
    newHeroText.text1.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    newHeroText.text1.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    newHeroText.text1.value = texts[textIndex % texts.length];
    newHeroText.text2.value = texts[(textIndex + 1) % texts.length];
    setHeroText(newHeroText);
  }

  function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    let fraction = morph / morphTime;
    if (fraction > 1) {
      cooldown = cooldownTime;
      fraction = 1;
    }
    setMorph(fraction);
  }

  function doCooldown() {
    const newHeroText = { ...heroText };
    morph = 0;
    newHeroText.text2.filter = '';
    newHeroText.text2.opacity = '100%';
    newHeroText.text1.filter = '';
    newHeroText.text1.opacity = '0%';
    setHeroText(newHeroText);
  }

  function animate() {
    requestAnimationFrame(animate);
    let newTime = new Date();
    let shouldIncrementIndex = cooldown > 0;
    let dt = (newTime - time) / 1000;
    time = newTime;
    cooldown -= dt;
    if (cooldown <= 0) {
      if (shouldIncrementIndex) {
        textIndex++;
      }
      doMorph();
    } else {
      doCooldown();
    }
  }

  useEffect(() => {
    const newHeroText = { ...heroText };
    newHeroText.text1.value = texts[textIndex % texts.length];
    newHeroText.text2.value = texts[(textIndex + 1) % texts.length];
    setHeroText(newHeroText);

    animate();
  }, []);

  return (
    <Wrapper>
      <HeroTextWrapper>
        <Container>
          <HeroText
            id='text1'
            filter={heroText.text1.filter}
            opacity={heroText.text1.opacity}
          >
            {heroText.text1.value}
          </HeroText>
          <HeroText
            id='text2'
            filter={heroText.text2.filter}
            opacity={heroText.text2.opacity}
          >
            {heroText.text2.value}
          </HeroText>
        </Container>
        <SVGFilter id='filters'>
          <defs>
            <filter id='threshold'>
              <feColorMatrix
                in='SourceGraphic'
                type='matrix'
                values='1 0 0 0 0
									0 1 0 0 0
									0 0 1 0 0
									0 0 0 255 -140'
              />
            </filter>
          </defs>
        </SVGFilter>
        <SubTitle>
          Effortlessly manage your tasks, expenses, and more - all in one place,
          and get a snapshot of your day in no time.
        </SubTitle>
        <ButtonWrapper>
          <Button backgroundColor='#3a6ff7'>Try For Free</Button>
          <Button backgroundColor='null' border>
            Learn More
          </Button>
        </ButtonWrapper>
      </HeroTextWrapper>
    </Wrapper>
  );
}
