---
uid: 'PB-A-9'
title: 'Setup Gatsby with Strapi in M1 Mac'
date: 2021-03-20
path: /articles/setup-gatsby-with-strapi-in-m1-mac/
excerpt: "Setting up strapi with gatsby is straight forward but not while you are setting it up in mac with M1 chip. M1 chip throws so many errors due to software support issues and I am writing this article to save your day."
image: ../../images/articles/setup-gatsby-with-strapi-in-m1-mac.webp
categories: [articles]
tags: [gatsby, strapi, tutorial]
toc: true
featured: true
comments: true
---

Setting up Gatsby with Strapi is straight forward, but while I was setting it up in M1 Mac, I encountered some errors maybe due to software support issues as M1 is relatively new in the market right now. It took some time for me to figure out solutions and I want to save your day. Let's setup the Gatsby blog with Strapi now!

Apart from error and solutions, every step I mention in this blog is from the <a href="https://strapi.io/blog/build-a-static-blog-with-gatsby-and-strapi" target="_blank">tutorial</a> in the official strapi website.

## Step 1: Install node v14

During the time I wrote this blog, v15 was the latest node version but not supported by strapi.

In command line type the following:

```cmd
nvm install 14.16.0
```

## Step 2: Install yarn

```cmd
npm install --global yarn
```

## Step 3: Create strapi-blog folder

Create a folder to store the backend (strapi) and frontend (gatsby) part of the blog. Following command will create a folder and move inside it.

```cmd
take strapi-blog

# above command is short for

mkdir strapi-blog
cd strapi-blog
```

## Step 4: Setup strapi with template

```cmd
yarn create strapi-app backend --quickstart --template https://github.com/strapi/strapi-template-blog
```

There you go, we encounter our first error:

### Error

ERR! sharp Prebuilt libvips 8.10.5 binaries are not yet available for darwin-arm64v8

#### Solution

Ref: <a href="https://github.com/lovell/sharp/issues/2460#issuecomment-779373454" target="_blank">Fix</a> from github repo of sharp library

##### Install vips with brew

```cmd
brew install vips
```

It took me around 14 minutes for it to install in my machine.

##### Install sharp

```cmd
npm i sharp
```

##### Remove backend folder

When you run command to setup strapi with template, it creates backend folder to add all related files and folder for strapi to it. When you run the command again, you will strapi will complain that backend folder should be empty so let's empty it before strapi can even complain.

```cmd
rm -rf backend
```

##### Run the command to setup strapi project again

```cmd
yarn create strapi-app backend --quickstart --template https://github.com/strapi/strapi-template-blog
```

Command should run without any issue now.

## Step 5: Setup admin user for strapi dashboard

As soon as the strapi setup is complete, dashboard will open in the browser and you will see the sign up page to setup the admin user. 

Add necessary details and we won't need to deal with strapi anymore, apart from running the server for now.

## Step 6: Setup Gatsby

### Install gatsby cli

```cmd
yarn global add gatsby-cli
```

### Move out of backend folder

We need to setup gatsby project in separate folder so if you are inside backend folder, first you will have to move out from there

```cmd
cd ..
```

### Create gatsby project

Now you should be inside strapi-blog, run the following command to setup new gatsby project

```cmd
gatsby new frontend
```

#### Error

wasm code commit Allocation failed - process out of memory

##### Solution

###### Switch to node v15

This issue is specifically in node v14 so switch to v15. If you haven't installed it in your machine yet, you can do so with following commands

```cmd
# install node v15
nvm install 15.0.0

# use v15 locally
nvm use 15.0.0
```

Installation took around 10 minutes in my machine and I could hear the fan from Mac loudly (lol).

###### Run the command to setup gatsby project again

```cmd
gatsby new frontend
```

Now the project should setup without any issue.

## Step 7: Create .env file inside your gatsby project root

```cmd
# move to gatsby project
cd frontend

# create .env file inside the project root
nano .env
```

Add following to the file:

```env
GATSBY_ROOT_URL=http://localhost:8000
API_URL=http://localhost:1337
```

## Step 8: Setup strapi for gatsby

### Install gatsby-source-strapi

```cmd
yarn add gatsby-source-strapi
```

### Replace the content of gatsby-config.js with the following

```js
require("dotenv").config({
 path: `.env`,
});
 
module.exports = {
 plugins: [
   "gatsby-plugin-react-helmet",
   {
     resolve: `gatsby-source-filesystem`,
     options: {
       name: `images`,
       path: `${__dirname}/src/images`,
     },
   },
   {
     resolve: "gatsby-source-strapi",
     options: {
       apiURL: process.env.API_URL || "http://localhost:1337",
       contentTypes: ["article", "category", "writer"],
       singleTypes: [`homepage`, `global`],
       queryLimit: 1000,
     },
   },
   "gatsby-transformer-sharp",
   "gatsby-plugin-sharp",
   {
     resolve: `gatsby-plugin-manifest`,
     options: {
       name: "gatsby-starter-default",
       short_name: "starter",
       start_url: "/",
       background_color: "#663399",
       theme_color: "#663399",
       display: "minimal-ui",
       icon: `src/images/gatsby-icon.png`
     },
   },
   "gatsby-plugin-offline",
 ],
};

```

## Step 9: Replace the content of src/components/seo.js with the following:

```js
import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { useStaticQuery, graphql } from "gatsby";

const SEO = ({ seo = {} }) => {
  const { strapiGlobal } = useStaticQuery(query);
  const { defaultSeo, siteName, favicon } = strapiGlobal;

  // Merge default and page-specific SEO values
  const fullSeo = { ...defaultSeo, ...seo };

  const getMetaTags = () => {
    const tags = [];

    if (fullSeo.metaTitle) {
      tags.push(
        {
          property: "og:title",
          content: fullSeo.metaTitle,
        },
        {
          name: "twitter:title",
          content: fullSeo.metaTitle,
        }
      );
    }
    if (fullSeo.metaDescription) {
      tags.push(
        {
          name: "description",
          content: fullSeo.metaDescription,
        },
        {
          property: "og:description",
          content: fullSeo.metaDescription,
        },
        {
          name: "twitter:description",
          content: fullSeo.metaDescription,
        }
      );
    }
    if (fullSeo.shareImage) {
      const imageUrl =
        (process.env.GATSBY_ROOT_URL || "http://localhost:8000") +
        fullSeo.shareImage.publicURL;
      tags.push(
        {
          name: "image",
          content: imageUrl,
        },
        {
          property: "og:image",
          content: imageUrl,
        },
        {
          name: "twitter:image",
          content: imageUrl,
        }
      );
    }
    if (fullSeo.article) {
      tags.push({
        property: "og:type",
        content: "article",
      });
    }
    tags.push({ name: "twitter:card", content: "summary_large_image" });

    return tags;
  };

  const metaTags = getMetaTags();

  return (
    <Helmet
      title={fullSeo.metaTitle}
      titleTemplate={`%s | ${siteName}`}
      link={[
        {
          rel: "icon",
          href: favicon.publicURL,
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css?family=Staatliches",
        },
        {
          rel: "stylesheet",
          href:
            "https://cdn.jsdelivr.net/npm/uikit@3.2.3/dist/css/uikit.min.css",
        },
      ]}
      script={[
        {
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/uikit/3.2.0/js/uikit.min.js",
        },
        {
          src:
            "https://cdn.jsdelivr.net/npm/uikit@3.2.3/dist/js/uikit-icons.min.js",
        },
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/uikit/3.2.0/js/uikit.js",
        },
      ]}
      meta={metaTags}
    />
  );
};

export default SEO;

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  article: PropTypes.bool,
};

SEO.defaultProps = {
  title: null,
  description: null,
  image: null,
  article: false,
};

const query = graphql`
  query {
    strapiGlobal {
      siteName
      favicon {
        publicURL
      }
      defaultSeo {
        metaTitle
        metaDescription
        shareImage {
          publicURL
        }
      }
    }
  }
`;

```

## Step 10: Style the blog

Create **src/assets/css/main.css** file and add the following:

```css
a {
  text-decoration: none !important;
}

h1 {
  font-family: Staatliches !important;
  font-size: 120px !important;
}

#category {
  font-family: Staatliches !important;
  font-weight: 500 !important;
}

#title {
  letter-spacing: 0.4px !important;
  font-size: 22px !important;
  font-size: 1.375rem !important;
  line-height: 1.13636 !important;
}

#banner {
  margin: 20px !important;
  height: 800px !important;
}

#editor {
  font-size: 16px !important;
  font-size: 1rem !important;
  line-height: 1.75 !important;
}

.uk-navbar-container {
  background: #fff !important;
  font-family: Staatliches !important;
}

img:hover {
  opacity: 1 !important;
  transition: opacity 0.25s cubic-bezier(0.39, 0.575, 0.565, 1) !important;
}

```

## Step 11: Remove useless components/pages

In command line, type the following:

```cmd
rm src/components/header.js src/components/layout.css  src/pages/page-2.js src/pages/using-typescript.tsx
```

## Step 12: Replace the content of pages/index.js with the following code

```js
import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import Layout from "../components/layout";
import "../assets/css/main.css";

const IndexPage = () => {
  const data = useStaticQuery(query);

  return (
    <Layout seo={data.strapiHomepage.seo}>
      <div className="uk-section">
        <div className="uk-container uk-container-large">
          <h1>{data.strapiHomepage.hero.title}</h1>
        </div>
      </div>
    </Layout>
  );
};

const query = graphql`
  query {
    strapiHomepage {
      hero {
        title
      }
      seo {
        metaTitle
        metaDescription
        shareImage {
          publicURL
        }
      }
    }
  }
`;

export default IndexPage;

```

## Step 13: Replace the content of components/layout.js with the following code

```js
import React from "react";
import PropTypes from "prop-types";
import { StaticQuery, graphql } from "gatsby";
import Seo from "./seo";

const Layout = ({ children, seo }) => (
  <StaticQuery
    query={graphql`
      query {
        strapiHomepage {
          seo {
            metaTitle
            metaDescription
            shareImage {
              publicURL
            }
          }
        }
      }
    `}
    render={(data) => (
      <>
        <Seo seo={seo} />
        <main>{children}</main>
      </>
    )}
  />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;

```

## Step 14: Create a ./src/components/nav.js with the following code

From code editor, create a new file and add the following:

```js
import React from "react";
import { Link, StaticQuery, graphql } from "gatsby";

const Nav = () => (
  <StaticQuery
    query={graphql`
      query {
        strapiGlobal {
          siteName
        }
        allStrapiCategory {
          edges {
            node {
              slug
              name
            }
          }
        }
      }
    `}
    render={(data) => (
      <div>
        <div>
          <nav className="uk-navbar-container" data-uk-navbar>
            <div className="uk-navbar-left">
              <ul className="uk-navbar-nav">
                <li>
                  <Link to="/">{data.strapiGlobal.siteName}</Link>
                </li>
              </ul>
            </div>
            <div className="uk-navbar-right">
              <button
                className="uk-button uk-button-default uk-margin-right"
                type="button"
              >
                Categories
              </button>
              <div uk-dropdown="animation: uk-animation-slide-top-small; duration: 1000">
                <ul className="uk-nav uk-dropdown-nav">
                  {data.allStrapiCategory.edges.map((category, i) => (
                    <li key={`category__${category.node.slug}`}>
                      <Link to={`/category/${category.node.slug}`}>
                        {category.node.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </div>
    )}
  />
);

export default Nav;

```

## Step 15: Import and use Nav component inside components/layout.js

Replace the code inside **components/layout.js** with the following:

```js
import React from "react";
import PropTypes from "prop-types";
import { StaticQuery, graphql } from "gatsby";
import Nav from "./nav";
import Seo from "./seo";

const Layout = ({ children, seo }) => (
  <StaticQuery
    query={graphql`
      query {
        strapiHomepage {
          seo {
            metaTitle
            metaDescription
            shareImage {
              publicURL
            }
          }
        }
      }
    `}
    render={(data) => (
      <>
        <Seo seo={seo} />
        <Nav />
        <main>{children}</main>
      </>
    )}
  />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;

```

## Step 16: Blog listing UI

### Install gatsby-image

```cmd
npm install gatsby-image
```

_NOTE_

Tutorial in official strapi site is using **gatsby-image** which has already been deprecated but we will not update in this blog.

<a href=" https://www.gatsbyjs.com/plugins/gatsby-image/ " target="_blank">Deprecation Note</a>

### Create a new file components/card.js and add following code

```js
import React from "react";
import { Link } from "gatsby";
import Img from "gatsby-image";
 
const Card = ({ article }) => {
 return (
   <Link to={`/article/${article.node.slug}`} className="uk-link-reset">
     <div className="uk-card uk-card-muted">
       <div className="uk-card-media-top">
         <Img
           fixed={article.node.image.childImageSharp.fixed}
           imgStyle={{ position: "static" }}
         />
       </div>
       <div className="uk-card-body">
         <p id="category" className="uk-text-uppercase">
           {article.node.category.name}
         </p>
         <p id="title" className="uk-text-large">
           {article.node.title}
         </p>
         <div>
           <hr className="uk-divider-small" />
           <div className="uk-grid-small uk-flex-left" data-uk-grid="true">
             <div>
               {article.node.author.picture && (
                 <Img
                   fixed={article.node.author.picture.childImageSharp.fixed}
                   imgStyle={{ position: "static", borderRadius: "50%" }}
                 />
               )}
             </div>
             <div className="uk-width-expand">
               <p className="uk-margin-remove-bottom">
                 {article.node.author.name}
               </p>
             </div>
           </div>
         </div>
       </div>
     </div>
   </Link>
 );
};
 
export default Card;

```

### Create a new file components/articles.js and add following code

```js
import React from "react";
import Card from "./card";
 
const Articles = ({ articles }) => {
 const leftArticlesCount = Math.ceil(articles.length / 5);
 const leftArticles = articles.slice(0, leftArticlesCount);
 const rightArticles = articles.slice(leftArticlesCount, articles.length);
 
 return (
   <div>
     <div className="uk-child-width-1-2@s" data-uk-grid="true">
       <div>
         {leftArticles.map((article, i) => {
           return (
             <Card
               article={article}
               key={`article__left__${article.node.slug}`}
             />
           );
         })}
       </div>
       <div>
         <div className="uk-child-width-1-2@m uk-grid-match" data-uk-grid>
           {rightArticles.map((article, i) => {
             return (
               <Card
                 article={article}
                 key={`article__right__${article.node.slug}`}
               />
             );
           })}
         </div>
       </div>
     </div>
   </div>
 );
};
 
export default Articles;

```

### Replace the code inside pages/index.js with the following

```js
import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import Layout from "../components/layout";
import ArticlesComponent from "../components/articles";
import "../assets/css/main.css";
 
const IndexPage = () => {
 const data = useStaticQuery(query);
 
 return (
   <Layout seo={data.strapiHomepage.seo}>
     <div className="uk-section">
       <div className="uk-container uk-container-large">
         <h1>{data.strapiHomepage.hero.title}</h1>
         <ArticlesComponent articles={data.allStrapiArticle.edges} />
       </div>
     </div>
   </Layout>
 );
};
 
const query = graphql`
 query {
   strapiHomepage {
     hero {
       title
     }
     seo {
       metaTitle
       metaDescription
       shareImage {
         publicURL
       }
     }
   }
   allStrapiArticle(filter: { status: { eq: "published" } }) {
     edges {
       node {
         strapiId
         slug
         title
         category {
           name
         }
         image {
           childImageSharp {
             fixed(width: 800, height: 500) {
               src
             }
           }
         }
         author {
           name
           picture {
             childImageSharp {
               fixed(width: 30, height: 30) {
                 src
               }
             }
           }
         }
       }
     }
   }
 }
`;
 
export default IndexPage;

```

### Start gatsby app

To see what we have been building up till now, start the gatsby app and view the blog:

```js
gatsby develop
```

## Step 17: Article Page

### Install react-markdown and react-moment

```cmd
yarn add react-markdown react-moment moment
```

### Replace the content inside gatsby.node.js with following code

```js
exports.createPages = async ({ graphql, actions }) => {
   const { createPage } = actions;
   const result = await graphql(
     `
       {
         articles: allStrapiArticle {
           edges {
             node {
               strapiId
               slug
             }
           }
         }
       }
     `
   );
    if (result.errors) {
     throw result.errors;
   }
    // Create blog articles pages.
   const articles = result.data.articles.edges;
    const ArticleTemplate = require.resolve("./src/templates/article.js");
    articles.forEach((article, index) => {
     createPage({
       path: `/article/${article.node.slug}`,
       component: ArticleTemplate,
       context: {
         slug: article.node.slug,
       },
     });
   });
 };
  module.exports.onCreateNode = async ({ node, actions, createNodeId }) => {
   const crypto = require(`crypto`);
    if (node.internal.type === "StrapiArticle") {
     const newNode = {
       id: createNodeId(`StrapiArticleContent-${node.id}`),
       parent: node.id,
       children: [],
       internal: {
         content: node.content || " ",
         type: "StrapiArticleContent",
         mediaType: "text/markdown",
         contentDigest: crypto
           .createHash("md5")
           .update(node.content || " ")
           .digest("hex"),
       },
     };
     actions.createNode(newNode);
     actions.createParentChildLink({
       parent: node,
       child: newNode,
     });
   }
 };

```

### Create a file src/templates/article.js with the following code

```js
import React from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";
import Moment from "react-moment";
import Layout from "../components/layout";
import Markdown from "react-markdown";
 
export const query = graphql`
 query ArticleQuery($slug: String!) {
   strapiArticle(slug: { eq: $slug }, status: { eq: "published" }) {
     strapiId
     title
     description
     content
     publishedAt
     image {
       publicURL
       childImageSharp {
         fixed {
           src
         }
       }
     }
     author {
       name
       picture {
         childImageSharp {
           fixed(width: 30, height: 30) {
             src
           }
         }
       }
     }
   }
 }
`;
 
const Article = ({ data }) => {
 const article = data.strapiArticle;
 const seo = {
   metaTitle: article.title,
   metaDescription: article.description,
   shareImage: article.image,
   article: true,
 };
 
 return (
   <Layout seo={seo}>
     <div>
       <div
         id="banner"
         className="uk-height-medium uk-flex uk-flex-center uk-flex-middle uk-background-cover uk-light uk-padding uk-margin"
         data-src={article.image.publicURL}
         data-srcset={article.image.publicURL}
         data-uk-img
       >
         <h1>{article.title}</h1>
       </div>
 
       <div className="uk-section">
         <div className="uk-container uk-container-small">
           <Markdown source={article.content} escapeHtml={false} />
 
           <hr className="uk-divider-small" />
 
           <div className="uk-grid-small uk-flex-left" data-uk-grid="true">
             <div>
               {article.author.picture && (
                 <Img
                   fixed={article.author.picture.childImageSharp.fixed}
                   imgStyle={{ position: "static", borderRadius: "50%" }}
                 />
               )}
             </div>
             <div className="uk-width-expand">
               <p className="uk-margin-remove-bottom">
                 By {article.author.name}
               </p>
               <p className="uk-text-meta uk-margin-remove-top">
                 <Moment format="MMM Do YYYY">{article.published_at}</Moment>
               </p>
             </div>
           </div>
         </div>
       </div>
     </div>
   </Layout>
 );
};
 
export default Article;

```

Since we edited **gatsby-node.js**, we will need to restart the gatsby server to view the new changes. You should be able to view the blog detail page now.

In command line where gatsby server is running, do the following: 

```cmd
# stop the server
control + c

# run the gatsby server again
gatsby develop
```

## Step 18: Blog Category Page

### Create a file src/templates/category.js with the following code

```js
import React from "react";
import { graphql } from "gatsby";
import ArticlesComponent from "../components/articles";
import Layout from "../components/layout";
 
export const query = graphql`
 query Category($slug: String!) {
   articles: allStrapiArticle(
     filter: { status: { eq: "published" }, category: { slug: { eq: $slug } } }
   ) {
     edges {
       node {
         slug
         title
         category {
           name
         }
         image {
           childImageSharp {
             fixed(width: 660) {
               src
             }
           }
         }
         author {
           name
           picture {
             childImageSharp {
               fixed(width: 30, height: 30) {
                 ...GatsbyImageSharpFixed
               }
             }
           }
         }
       }
     }
   }
   category: strapiCategory(slug: { eq: $slug }) {
     name
   }
 }
`;
 
const Category = ({ data }) => {
 const articles = data.articles.edges;
 const category = data.category.name;
 const seo = {
   metaTitle: category,
   metaDescription: `All ${category} articles`,
 };
 
 return (
   <Layout seo={seo}>
     <div className="uk-section">
       <div className="uk-container uk-container-large">
         <h1>{category}</h1>
         <ArticlesComponent articles={articles} />
       </div>
     </div>
   </Layout>
 );
};
 
export default Category;

```

### Replace the content inside gatsby.node.js with the following code

```js
exports.createPages = async ({ graphql, actions }) => {
   const { createPage } = actions;
   const result = await graphql(
     `
       {
         articles: allStrapiArticle {
           edges {
             node {
               strapiId
               slug
             }
           }
         }
         categories: allStrapiCategory {
           edges {
             node {
               strapiId
               slug
             }
           }
         }
       }
     `
   );
    if (result.errors) {
     throw result.errors;
   }
    // Create blog articles pages.
   const articles = result.data.articles.edges;
   const categories = result.data.categories.edges;
    const ArticleTemplate = require.resolve("./src/templates/article.js");
    articles.forEach((article, index) => {
     createPage({
       path: `/article/${article.node.slug}`,
       component: ArticleTemplate,
       context: {
         slug: article.node.slug,
       },
     });
   });
    const CategoryTemplate = require.resolve("./src/templates/category.js");
    categories.forEach((category, index) => {
     createPage({
       path: `/category/${category.node.slug}`,
       component: CategoryTemplate,
       context: {
         slug: category.node.slug,
       },
     });
   });
 };
  module.exports.onCreateNode = async ({ node, actions, createNodeId }) => {
   const crypto = require(`crypto`);
    if (node.internal.type === "StrapiArticle") {
     const newNode = {
       id: createNodeId(`StrapiArticleContent-${node.id}`),
       parent: node.id,
       children: [],
       internal: {
         content: node.content || " ",
         type: "StrapiArticleContent",
         mediaType: "text/markdown",
         contentDigest: crypto
           .createHash("md5")
           .update(node.content || " ")
           .digest("hex"),
       },
     };
     actions.createNode(newNode);
     actions.createParentChildLink({
       parent: node,
       child: newNode,
     });
   }
 };

```

### Restart the gatsby server to view new changes

In command line where gatsby server is running, do the following: 

```cmd
# stop the server
control + c

# run the gatsby server again
gatsby develop
```

You should now be able to view blogs listed by specific category.

## Conclusion

Congratulations, you have successfully setup a gatsby blog with strapi. There was a small issue that I encountered after setting up the blog; in blog listing page, featured images of blog were not loading properly while they were loading correctly in the page where blogs are listed by category. Let me know how it goes for you!

Thanks for reading, if you have any confusion or suggestion, please comment below. See you soon in next blog!

**References**

- <a href="https://strapi.io/blog/build-a-static-blog-with-gatsby-and-strapi" target="_blank">Strapi with Gatsby - Official Blog</a>
