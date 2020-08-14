import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Entry from '../components/entry';

import style from '../styles/archive.module.css';

import site from '../../config/site';

import Testimonials from '../components/testimonial';
import TechnologyStacks from '../components/technologyStack';
import FeaturedPortfolio from '../components/featuredPortfolio';

const HomePage = ({ data }) => {
  const {
    site: {
      siteMetadata: { author: siteAuthor },
    },
    featuredPosts: { edges: featuredPosts },
  } = data;

  return (
    <Layout>
      <SEO
        title={`${site.title} - ${site.description}`}
        path="/"
        description={site.description}
        metaImage={site.image}
      />
      <main id="main" className={style.main}>
        <div className={style.title}>
          <h1 className={style.heading}>
            <span>
              Personal site of <a href="/about/">Prabin&nbsp;Poudel</a>.
            </span>
          </h1>
          <div className={style.intro}>
            <p>
              Full Stack developer from Nepal who enjoys writing codes all day,
              travelling, trying different foods and going on adventures.
            </p>
          </div>
          <Img
            fluid={data.aboutImage.childImageSharp.fluid}
            className={style.cover}
            backgroundColor="var(--input-background-color)"
          />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>Featured Projects</h2>

          <FeaturedPortfolio />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>Testimonials</h2>

          <Testimonials />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>Skills</h2>

          <TechnologyStacks />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>Featured articles</h2>
          <div className={style.gridList}>
            {featuredPosts.map(({ node }) => {
              const {
                id,
                excerpt: autoExcerpt,
                timeToRead,
                frontmatter: {
                  title,
                  date,
                  date_pretty,
                  path,
                  author,
                  excerpt,
                  image,
                },
              } = node;

              return (
                <Entry
                  key={id}
                  title={title}
                  date={date}
                  datePretty={date_pretty}
                  path={path}
                  author={author || siteAuthor}
                  timeToRead={timeToRead}
                  image={image}
                  excerpt={excerpt || autoExcerpt}
                />
              );
            })}
          </div>

          <h2 className={style.subHeading}>Explore more on this site</h2>
          <div>
            <ul className={`${style.gridListExpanded} ${style.navList}`}>
              <li key="articles">
                <Entry
                  key="articles-home-link"
                  title="Articles"
                  path="/articles/"
                  excerpt="<p>Long form writing mostly about web or mobile app development and travels.</p>"
                />
              </li>
              <li key="notes">
                <Entry
                  key="notes-home-link"
                  title="Notes"
                  path="/notes/"
                  excerpt="<p>Thoughts, inspiration, mistakes, quick solutions and other minutia you&rsquo;d find in a blog.</p>"
                />
              </li>
              {/* <li key="works">
                <Entry
                  key="works-home-link"
                  title="Works"
                  path="/work/"
                  excerpt="<p>Hand-picked selection of things I've developed.</p>"
                />
              </li> */}
              <li key="contact">
                <Entry
                  key="contact-home-link"
                  title="Contact"
                  path="/contact/"
                  excerpt="<p>Preferred methods of sending questions, messages, and love letters to me.</p>"
                />
              </li>
              {/* <li key="faqs">
                <Entry
                  key="faqs-home-link"
                  title="Frequently asked questions"
                  path="/faqs/"
                  excerpt="<p>There&rsquo;s no such thing as a dumb question&hellip;</p>"
                />
              </li> */}
              <li key="topics">
                <Entry
                  key="topics-home-link"
                  title="All topics"
                  path="/tag/"
                  excerpt="<p>Archive of all posts organized by topic.</p>"
                />
              </li>
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
};

HomePage.propTypes = {
  data: PropTypes.object.isRequired,
};

export const pageQuery = graphql`
  query HomeQuery {
    site {
      siteMetadata {
        author {
          name
          url
        }
      }
    }
    featuredPosts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/posts/" }
        frontmatter: { featured: { eq: true }, published: { ne: false } }
      }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 6
    ) {
      edges {
        node {
          id
          excerpt(format: HTML)
          timeToRead
          frontmatter {
            title
            date
            date_pretty: date(formatString: "MMMM Do, YYYY")
            path
            excerpt
            featured
            categories
            image {
              childImageSharp {
                fluid(maxWidth: 400, maxHeight: 250, quality: 100) {
                  ...GatsbyImageSharpFluid_noBase64
                }
              }
            }
          }
        }
      }
    }
    aboutImage: file(relativePath: { eq: "thailand-best.webp" }) {
      childImageSharp {
        fluid(maxWidth: 720, maxHeight: 500, quality: 75) {
          ...GatsbyImageSharpFluid_noBase64
        }
      }
    }
  }
`;

export default HomePage;
