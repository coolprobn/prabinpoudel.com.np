import React from 'react';
import PropTypes from 'prop-types';
import { graphql, Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import SEO from '../components/seo';
import Entry from '../components/entry';

import style from '../styles/archive.module.css';

import site from '../../config/site';

import Testimonials from '../components/testimonial';
import TechnologyStacks from '../components/technologyStack';
import FeaturedPortfolio from '../components/featuredPortfolio';
import RightArrowIcon from '../components/icons/right-arrow-icon';
import FeaturedTestimonial from '../components/featuredTestimonial';
import TrustedBy from '../components/trustedBy';

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
        title={site.title}
        path="/"
        description={site.description}
        metaImage={site.image}
        twitterCardType="summary_large_image"
      />
      <main id="main" className={style.main}>
        <div className={style.title}>
          <h1 className={style.heading}>
            <span>I create web apps to solve your business problems.</span>
          </h1>

          <div className={style.intro}>
            <p className={style.hireMeButtonContainer}>
              <Link to="/contact/">
                <button className={`${style.hireMeButton} btn`} type="button">
                  Hire me
                  <span className={style.rightArrowIconContainer}>
                    <RightArrowIcon />
                  </span>
                </button>
              </Link>
            </p>
          </div>

          <GatsbyImage
            image={getImage(data.aboutImage)}
            alt="hero section"
            className={style.cover}
            backgroundColor="var(--input-background-color)"
          />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>
            <span>Featured Testimonial</span>
          </h2>

          <FeaturedTestimonial />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>
            <span>Featured Projects</span>
          </h2>

          <FeaturedPortfolio />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>
            <span>Trusted By</span>
          </h2>

          <TrustedBy />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>
            <span>Testimonials</span>
          </h2>

          <Testimonials />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>
            <span>Skills</span>
          </h2>

          <TechnologyStacks />
        </div>

        <div className={style.content}>
          <h2 className={style.subHeading}>
            <span>Featured articles</span>
          </h2>
          <div className={style.gridList}>
            {featuredPosts.map(({ node }) => {
              const {
                id,
                excerpt: autoExcerpt,
                timeToRead,
                frontmatter: {
                  title,
                  date,
                  date_pretty: datePretty,
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
                  datePretty={datePretty}
                  path={path}
                  author={author || siteAuthor}
                  timeToRead={timeToRead}
                  image={image}
                  excerpt={excerpt || autoExcerpt}
                />
              );
            })}
          </div>

          <h2 className={style.subHeading}>
            <span>Explore more on this site</span>
          </h2>
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
              <li key="book-reviews">
                <Entry
                  key="book-reviews-home-link"
                  title="Book Reviews"
                  path="/book-reviews/"
                  excerpt="<p>My thoughts on the books I read.</p>"
                />
              </li>
              <li key="contact">
                <Entry
                  key="contact-home-link"
                  title="Contact"
                  path="/contact/"
                  excerpt="<p>Preferred methods of sending questions, messages, and love letters to me.</p>"
                />
              </li>
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
  data: PropTypes.shape.isRequired,
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
                gatsbyImageData(
                  width: 400
                  height: 250
                  quality: 100
                  formats: [AUTO, WEBP]
                )
              }
            }
          }
        }
      }
    }
    aboutImage: file(relativePath: { eq: "landing-page-hero.jpeg" }) {
      childImageSharp {
        gatsbyImageData(
          width: 720
          height: 500
          quality: 75
          placeholder: BLURRED
          formats: [AUTO, WEBP]
        )
      }
    }
  }
`;

export default HomePage;
