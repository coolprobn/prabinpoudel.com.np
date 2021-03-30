import React from 'react';

import flexonetLogo from '../images/clients/logos/flexonet.png';
import priceInsightLogo from '../images/clients/logos/price-insight.png';

import style from '../styles/trusted-by.module.css';

const TrustedBy = () => {
  const logos = [flexonetLogo, priceInsightLogo];
  const logosText = ['Eddie Makes'];

  return (
    <div className={style.trustedBy}>
      {logosText.map((logoText) => (
        <span>{logoText}</span>
      ))}

      {logos.map((logoPath) => (
        <img data-src={logoPath} className="lazyload" alt="client-logo" />
      ))}
    </div>
  );
};

export default TrustedBy;
