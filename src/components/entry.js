import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

import style from '../styles/entry.module.css';

const _ = require('lodash-addons');

const Entry = ({
  title,
  date,
  datePretty,
  path,
  image,
  author,
  timeToRead,
  excerpt,
  tags,
}) => (
  <>
    <article className={`${style.entry} h-entry`}>
      <h2 className={`${style.title} p-name`}>
        <Link to={path}>{title}</Link>
      </h2>
      <div className={style.meta}>
        {author && (
          <span style={{ display: 'none' }}>
            Published by{' '}
            <a className="p-author h-card" href={author.url}>
              {author.name}
            </a>
          </span>
        )}
        {date && (
          <>
            {' '}
            <time className={`${style.date} dt-published`} dateTime={date}>
              {datePretty}
            </time>
          </>
        )}
        {timeToRead && (
          <>
            {' '}
            <span className={style.readTime}>
              {timeToRead}&nbsp;min&nbsp;read
            </span>
          </>
        )}
        {tags ? (
          <div className={style.tags}>
            {tags.map((tag) => (
              <Link to={`/tag/${_.slugify(tag)}/`} key={_.slugify(tag)}>
                <span>#{tag}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {image && (
        <GatsbyImage
          image={getImage(image)}
          alt={`cover: ${title}`}
          className={style.cover}
          backgroundColor="var(--input-background-color)"
        />
      )}

      <div
        className={`${style.excerpt} p-summary`}
        dangerouslySetInnerHTML={{ __html: excerpt }}
      />
    </article>
  </>
);

Entry.propTypes = {
  title: PropTypes.string,
  date: PropTypes.string,
  datePretty: PropTypes.string,
  path: PropTypes.string,
  image: PropTypes.object,
  author: PropTypes.object,
  timeToRead: PropTypes.number,
  excerpt: PropTypes.string,
  tags: PropTypes.array,
};

export default Entry;
