import React from 'react';

import testimonials from '../data/testimonial';

import style from '../styles/testimonials.module.css';

import Carousel from './carousel';

const Testimonials = () => {
  return (
    <div className={style.testimonialList}>
      <Carousel items={testimonials} />
    </div>
  );
};

export default Testimonials;
