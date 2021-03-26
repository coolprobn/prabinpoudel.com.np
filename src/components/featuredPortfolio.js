import React from 'react';

import projects from '../data/portfolio';

import style from '../styles/featured-portfolio.module.css';
import entryStyle from '../styles/entry.module.css';
import archiveModuleStyle from '../styles/archive.module.css';

const Technologies = ({ technologies }) => {
  return (
    <div className={entryStyle.meta}>
      {technologies.map((technology) => {
        return <span className={entryStyle.readTime}>{technology}</span>;
      })}
    </div>
  );
};

const ProjectLinkButton = ({ link, title }) => {
  return (
    <a
      href={link}
      className={`btn ${style.projectLinkButton}`}
      target="_blank"
      rel="nofollow noreferrer"
    >
      {title}
    </a>
  );
};

const ProjectLinks = ({ website, playStore, appStore }) => {
  if (playStore || appStore) {
    return (
      <>
        {playStore && <ProjectLinkButton link={playStore} title="Play Store" />}
        {appStore && <ProjectLinkButton link={appStore} title="App Store" />}
      </>
    );
  }

  return <ProjectLinkButton link={website} title="Visit Website" />;
};

const FeaturedPortfolio = () => {
  return (
    <div className={archiveModuleStyle.gridList}>
      {projects.map((project) => {
        const {
          name,
          featuredImage,
          description,
          technologies,
          category,
          website,
          playStore,
          appStore,
        } = project;

        return (
          <div className={`${entryStyle.entry} h-entry`}>
            <div className={style.imageContainer}>
              <img
                src={featuredImage}
                alt={`${name} Screenshot`}
                className={`${entryStyle.cover} ${style.featuredImage}`}
              />

              <div className={style.projectLinkContainer}>
                <div className={style.projectLinks}>
                  <ProjectLinks
                    website={website}
                    appStore={appStore}
                    playStore={playStore}
                  />
                </div>
              </div>
            </div>

            <h2 className={`${entryStyle.title} p-name`}>{name}</h2>
            <Technologies technologies={technologies} />

            <div className={`${entryStyle.excerpt} p-summary`}>
              {description}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeaturedPortfolio;
