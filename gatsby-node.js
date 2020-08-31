const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const projectPost = path.resolve(`./src/templates/project-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                posttype
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  
  const allPosts = result.data.allMarkdownRemark.edges
  let blogPosts = allPosts.filter(function(post) {
    return post.node.frontmatter.posttype == "Blog"
  })
  let projectPosts = allPosts.filter(function(post) {
    return post.node.frontmatter.posttype == "Project"
  })

  // Create blog posts pages.
  blogPosts.forEach((post, index) => {
    const previous = index === blogPosts.length - 1 ? null : blogPosts[index + 1].node
    const next = index === 0 ? null : blogPosts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })

  // Create projects posts pages.
  projectPosts.forEach((post, index) => {

    createPage({
      path: post.node.fields.slug,
      component: projectPost,
      context: {
        slug: post.node.fields.slug,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
