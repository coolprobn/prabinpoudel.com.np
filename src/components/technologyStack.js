import React, { Fragment } from 'react';

import technologyStacks from '../data/technologyStack';

import style from '../styles/technologyStacks.module.css';

const TechnologyStacks = () => {
  return (
    <div className={style.technologyStackList}>
      {technologyStacks.map((stack) => {
        const { name, category, icon } = stack;

        return (
          <div className={style.technologyStack}>
            <div className={style.categoryContainer}>
              <span className={`btn ${style.category}`}>{category}</span>
            </div>

            <div className={style.iconContainer}>
              <img src={icon} alt={`${name} icon`} className={style.icon} />
            </div>

            <span className={style.name}>{name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TechnologyStacks;
