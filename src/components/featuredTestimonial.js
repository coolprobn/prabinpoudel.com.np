import React from 'react';

import testimonials from '../data/testimonial';

import testimonialsStyle from '../styles/testimonials.module.css';
import style from '../styles/featured-testimonial.module.css';

const FeaturedTestimonial = () => {
  const featuredTestimonial = testimonials.find(
    ({ name }) => name === 'Ronni Poulsen'
  );

  const { name, company, post, excerpt, imageUrl } = featuredTestimonial;

  return (
    <div className="custom-block notice">
      <p className={style.excerpt}>
        <q>{excerpt}</q>
      </p>

      <div className={style.footer}>
        <div
          className={[
            testimonialsStyle.clientContainer,
            style.clientContainer,
          ].join(' ')}
        >
          <img
            data-src={imageUrl}
            alt="client"
            className={`${testimonialsStyle.clientImage} ${style.clientImage} lazyload`}
          />

          <div className={testimonialsStyle.clientInfo}>
            <div className={testimonialsStyle.clientName}>{name}</div>

            <div className={testimonialsStyle.clientCompanyInfo}>
              <span
                className={testimonialsStyle.clientPost}
              >{`${post}, `}</span>
              <span>{company}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedTestimonial;
