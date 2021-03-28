import React, { Fragment } from 'react';

import style from '../../styles/icon.module.css';

function StarIcon() {
  return (
    <>
      <svg id="stars" style={{ display: 'none' }} version="1.1">
        <symbol id="stars-empty-star" viewBox="0 0 102 18" fill="#F1E8CA">
          <path d="M9.5 14.25l-5.584 2.936 1.066-6.218L.465 6.564l6.243-.907L9.5 0l2.792 5.657 6.243.907-4.517 4.404 1.066 6.218" />
        </symbol>
        <symbol id="stars-full-star" viewBox="0 0 102 18" fill="#D3A81E">
          <path d="M9.5 14.25l-5.584 2.936 1.066-6.218L.465 6.564l6.243-.907L9.5 0l2.792 5.657 6.243.907-4.517 4.404 1.066 6.218" />
        </symbol>
        <symbol id="stars-half-star" viewBox="0 0 102 18" fill="#D3A81E">
          <use xlinkHref="#stars-empty-star" />
          <path d="M9.5 14.25l-5.584 2.936 1.066-6.218L.465 6.564l6.243-.907L9.5 0l2.792" />
        </symbol>
      </svg>

      <svg aria-hidden="true" focusable="false" className={style.rating}>
        <use xlinkHref="#stars-full-star" />
        <use xlinkHref="#stars-full-star" />
        <use xlinkHref="#stars-full-star" />
        <use xlinkHref="#stars-full-star" />
        <use xlinkHref="#stars-full-star" />
      </svg>
    </>
  );
}

export default StarIcon;
