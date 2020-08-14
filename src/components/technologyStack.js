import React from 'react';

import technologyStacks from '../data/technologyStack';

import style from '../styles/technologyStacks.module.css';

const TechCategory = ({ techList, title }) => {
  const techArray = techList.map((tech) => {
    const { name, category, icon } = tech;

    return (
      <div className={style.technologyStack}>
        <img src={icon} alt={`${name} icon`} className={style.icon} />

        <span className={style.name}>{name}</span>
      </div>
    );
  });

  return (
    <div className={style.categoryContainer}>
      <span className={style.category}>{title}</span>
      {techArray}
    </div>
  );
};

const TechnologyStacks = () => {
  const backendTechList = technologyStacks.filter(
    (stack) => stack.category == 'Backend'
  );
  const frontendTechList = technologyStacks.filter(
    (stack) => stack.category == 'Frontend'
  );
  const mobileTechList = technologyStacks.filter(
    (stack) => stack.category == 'Mobile'
  );
  const staticTechList = technologyStacks.filter(
    (stack) => stack.category == 'Static'
  );
  const stylingTechList = technologyStacks.filter(
    (stack) => stack.category == 'Styling'
  );
  const databaseTechList = technologyStacks.filter(
    (stack) => stack.category == 'Database'
  );
  const othersTechList = technologyStacks.filter(
    (stack) => stack.category == 'Others'
  );

  return (
    <div className={style.technologyStackList}>
      <TechCategory title="Backend" techList={backendTechList} />
      <TechCategory title="Frontend" techList={frontendTechList} />
      <TechCategory title="Mobile" techList={mobileTechList} />
      <TechCategory title="Static" techList={staticTechList} />
      <TechCategory title="Styling" techList={stylingTechList} />
      <TechCategory title="Database" techList={databaseTechList} />
      <TechCategory title="Others" techList={othersTechList} />
    </div>
  );
};

export default TechnologyStacks;
