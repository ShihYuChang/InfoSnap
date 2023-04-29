import { useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components/macro';

const Wrapper = styled.div`
  width: 100%;
  color: white;
`;

const Container = styled.div`
  position: absolute;
  margin: auto;
  width: 100vw;
  height: 80pt;
  top: 0;
  bottom: 0;

  filter: url(#threshold) blur(0.6px);
`;

const HeroText = styled.div`
  position: absolute;
  width: 100%;
  display: inline-block;
  text-align: center;
  user-select: none;
  font-size: 80px;
  filter: ${(props) => props.filter};
  opacity: ${(props) => props.opacity};
`;

// const HeroTextWrapper = styled.div`
//   width: 100%;
//   height: 100vh;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   flex-direction: column;
// `;

// const HeroText = styled.div`
//   font-size: 120px;
//   font-weight: 800;
//   filter: ${(props) => props.filter};
//   opacity: ${(props) => props.opacity};
// `;

export default function LandingPage() {
  const texts = [
    'If',
    'You',
    'Like',
    'It',
    'Please',
    'Give',
    'a Love',
    ':)',
    'by @DotOnion',
  ];

  const morphTime = 1;
  const cooldownTime = 0.25;

  let textIndex = texts.length - 1;
  let time = new Date();
  let morph = 0;
  let cooldown = cooldownTime;

  const [heroText, setHeroText] = useState({
    text1: { value: '', opacity: '100%', filter: '' },
    text2: { value: '', opacity: '0%', filter: '' },
  });
  const [hasSetMorph, setHasSetMorph] = useState(false);

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

  useEffect(() => {
    const newHeroText = { ...heroText };

    newHeroText.text1.value = texts[textIndex % texts.length];
    newHeroText.text2.value = texts[(textIndex + 1) % texts.length];
    setHeroText(newHeroText);

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
      //   elts.text2.style.filter = '';
      newHeroText.text2.filter = '';
      newHeroText.text2.opacity = '100%';
      newHeroText.text1.filter = '';
      newHeroText.text1.opacity = '0%';
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

    animate();
  }, []);
  return (
    <Wrapper>
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
      <svg id='filters'>
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
      </svg>
      {/* <HeroTextWrapper>
        <HeroText>{heroText.text1}</HeroText>
        <HeroText>{heroText.text2}</HeroText>
      </HeroTextWrapper> */}
    </Wrapper>
  );
}
