import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { Helmet } from 'react-helmet';
import { StaticImage } from 'gatsby-plugin-image';

import Menu from './menu';

import style from '../styles/header.module.css';

const Header = (props) => {
  const { mainMenu, defaultTheme } = props;
  let defaultThemeState =
    (typeof window !== 'undefined' && window.localStorage.getItem('theme')) ||
    null;

  if (
    defaultThemeState == null &&
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    defaultThemeState = 'dark';
    window.localStorage.setItem('theme', 'dark');
  }

  const [userTheme, changeTheme] = useState(defaultThemeState);
  const onChangeTheme = () => {
    const alternateTheme =
      (userTheme || defaultTheme) === 'light' ? 'dark' : 'light';

    changeTheme(alternateTheme);

    typeof window !== 'undefined' &&
      window.localStorage.setItem('theme', alternateTheme);
  };

  return (
    <>
      <Helmet>
        <body
          data-theme={`${
            (userTheme || defaultTheme) === 'light' ? 'light' : 'dark'
          }`}
        />
      </Helmet>
      <header className={style.header}>
        <div className={style.name}>
          <Link to="/" className={style.blogLogoLink}>
            <StaticImage
              src="../images/blog-logo.png"
              alt="blog-logo"
              className={style.blogLogo}
            />
          </Link>
        </div>
        <Menu mainMenu={mainMenu} onChangeTheme={onChangeTheme} />
      </header>
    </>
  );
};

Header.propTypes = {
  defaultTheme: PropTypes.string,
  mainMenu: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string,
    })
  ),
};

export default Header;
