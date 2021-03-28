import React, { useState } from 'react';

import style from '../styles/testimonials.module.css';
import carouselStyle from '../styles/carousel.module.css';

const History = ({ activeIndex, items, changeSlide }) => {
  const itemList = items.map((el, index) => {
    const name = index === activeIndex ? carouselStyle.active : '';

    return (
      <li key={index}>
        <button
          className={name}
          onClick={() => changeSlide(activeIndex, index)}
        />
      </li>
    );
  });

  return <ul>{itemList}</ul>;
};

const Carousel = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToHistoryClick = (curIndex, index) => {
    setActiveIndex(index);
  };

  const content = items.map((item, index) => {
    const {
      uid,
      name,
      company,
      post,
      feedback,
      imageUrl,
      platform,
      platformUrl,
    } = item;
    const activeItemClass =
      index === activeIndex ? carouselStyle.activeCarousel : '';

    return (
      <div
        key={uid}
        className={`custom-block notice ${carouselStyle.container} ${activeItemClass}`}
      >
        <a
          href={platformUrl}
          className={`btn ${style.platformButton}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {platform}
        </a>

        <div className={style.feedback}>
          <q>{feedback}</q>
        </div>

        <div className={style.clientContainer}>
          <img
            data-src={imageUrl}
            alt="client"
            className={`${style.clientImage} lazyload`}
          />

          <div className={style.clientInfo}>
            <div className={style.clientName}>{name}</div>

            <div className={style.clientCompanyInfo}>
              <span className={style.clientPost}>{`${post}, `}</span>
              <span>{company}</span>
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className={carouselStyle.carousel}>
      {content}
      <div className={carouselStyle.history}>
        <History
          activeIndex={activeIndex}
          items={items}
          changeSlide={goToHistoryClick}
        />
      </div>
    </div>
  );
};

export default Carousel;
