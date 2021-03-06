import React from 'react';
import PropTypes from 'prop-types';
import { graphql, Link } from 'gatsby';
import { DiscussionEmbed } from 'disqus-react';

import SEO from '../components/seo';
import Layout from '../components/layout';
import Document from '../components/document';
import Pagination from '../components/pagination';
import site from '../../config/site';

import style from '../styles/post.module.css';

const PostTemplate = ({ data, pageContext }) => {
  const {
    frontmatter: {
      title,
      date,
      date_pretty,
      date_from_now,
      last_modified_at,
      last_modified_at_from_now,
      path,
      image,
      excerpt,
      tags,
      toc,
      comments: commentsEnabled,
      comments_locked: commentsLocked,
      hide_meta: hideMeta,
      canonical,
      canonical_url: canonicalUrl,
    },
    excerpt: autoExcerpt,
    timeToRead,
    tableOfContents,
    id,
    html,
  } = data.markdownRemark;
  const { next, previous } = pageContext;
  const metaImage = image
    ? image.childImageSharp.gatsbyImageData.images.fallback
    : site.image;
  const twitterCardType = image ? 'summary_large_image' : 'summary';
  const previousPath = previous && previous.frontmatter.path;
  const previousLabel = previous && previous.frontmatter.title;
  const nextPath = next && next.frontmatter.path;
  const nextLabel = next && next.frontmatter.title;

  const disqusConfig = {
    shortname: 'prabin-poudel',
    config: { identifier: path, title },
  };

  return (
    <Layout>
      <SEO
        title={`${title} - ${site.titleAlt}`}
        path={path}
        datePublished={date}
        dateModified={last_modified_at}
        description={excerpt || autoExcerpt}
        metaImage={metaImage}
        twitterCardType={twitterCardType}
        article
        canonical={canonical}
        canonicalUrl={canonicalUrl}
      />
      <main id="main">
        <Document
          key={id}
          title={title}
          hideMeta={hideMeta}
          datePublished={date}
          dateModified={last_modified_at}
          datePretty={date_pretty}
          dateFromNow={date_from_now}
          dateModifiedFromNow={last_modified_at_from_now}
          path={path}
          author={site.author}
          timeToRead={timeToRead}
          toc={toc}
          tableOfContents={tableOfContents}
          image={image}
          html={html}
          tags={tags}
          previousPost={previous}
          nextPost={next}
        />
        <section className={style.comments}>
          {commentsEnabled && (
            <>
              {commentsLocked ? (
                <div className="custom-block notice">
                  <div className="custom-block-heading">
                    Comments are closed
                  </div>
                  <div className="custom-block-body">
                    If you have a question concerning the content of this page,
                    please feel free to <Link to="/contact/">contact me</Link>.
                  </div>
                </div>
              ) : (
                <DiscussionEmbed {...disqusConfig} />
              )}
            </>
          )}
        </section>
      </main>
      <Pagination
        previousPath={previousPath}
        previousLabel={previousLabel}
        nextPath={nextPath}
        nextLabel={nextLabel}
      />
    </Layout>
  );
};

export default PostTemplate;

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    next: PropTypes.object,
    previous: PropTypes.object,
  }),
};

export const pageQuery = graphql`
  query ($path: String) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      frontmatter {
        title
        date
        date_pretty: date(formatString: "MMMM Do, YYYY")
        date_from_now: date(fromNow: true)
        last_modified_at
        last_modified_at_from_now: last_modified_at(fromNow: true)
        path
        author
        excerpt
        tags
        image {
          childImageSharp {
            gatsbyImageData(
              quality: 75
              placeholder: BLURRED
              formats: [AUTO, WEBP]
              layout: FULL_WIDTH
            )
          }
        }
        toc
        comments
        comments_locked
        hide_meta
        canonical
        canonical_url
      }
      id
      html
      excerpt
      timeToRead
      tableOfContents(pathToSlugField: "frontmatter.path", maxDepth: 3)
    }
  }
`;
