import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import { Helmet } from 'react-helmet'

import Menu from './menu'

import style from '../styles/header.module.css'

import BlogLogo from '../images/blog-logo.png';

const Header = props => {
  const { siteTitle, mainMenu, defaultTheme } = props
  const defaultThemeState =
    (typeof window !== 'undefined' && window.localStorage.getItem('theme')) ||
    null
  const [userTheme, changeTheme] = useState(defaultThemeState)
  const onChangeTheme = () => {
    const alternateTheme =
      (userTheme || defaultTheme) === 'light' ? 'dark' : 'light'

    changeTheme(alternateTheme)

    typeof window !== 'undefined' &&
      window.localStorage.setItem('theme', alternateTheme)
  }

  return (
    <>
      <Helmet>
        <body
          data-theme={`${
            (userTheme || defaultTheme) === 'light' ? 'light' : 'dark'
          }`}
        />
      </Helmet>
      <nav className={style.skipLinks}>
        <ul>
          <li>
            <a href="#nav-primary" className={style.shortcut}>
              Skip to primary navigation
            </a>
          </li>
          <li>
            <a href="#main" className={style.shortcut}>
              Skip to content
            </a>
          </li>
          <li>
            <a href="#footer" className={style.shortcut}>
              Skip to footer
            </a>
          </li>
        </ul>
      </nav>
      <header className={style.header}>
        <div className={style.name}>
          <Link to="/" className={style.blogLogoLink}>
            <img src={BlogLogo} alt="blog-logo" className={style.blogLogo} />
          </Link>
        </div>
        <Menu mainMenu={mainMenu} onChangeTheme={onChangeTheme} />
      </header>
    </>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
  defaultTheme: PropTypes.string,
  mainMenu: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string,
    })
  ),
}

export default Header
