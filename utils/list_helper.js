/* Always returns 1 */
const dummy = (blogs) => {
  return 1;
}

/* Returns the sum of all blogs' likes */
const totalLikes = (blogs) => {
  const sumReducer = (sum, blog) => {
    return sum + blog.likes
  }
  return blogs.reduce(sumReducer, 0)
}

/* Returns the favorite blog (one with most likes) */
const favoriteBlog = (blogs) => {
  let favorite = {}
  
  const favoriteReducer = (mostLikes, blog) => {
    if (blog.likes > mostLikes) {
      /* Change mostLikes to be the current favorite blog's likes */
      mostLikes = blog.likes
      /* Assigns the blog as the favorite (reference, not deep copy) */
      favorite = blog
    }
    return mostLikes
  }
  blogs.reduce(favoriteReducer, -1)
  return favorite  
}

/* Returns object with properties 'author' and 'blogs'
 * 'author' is the author with the largest number of blogs 
 * 'blogs' is the number of blogs the author has
 */
const mostBlogs = (blogs) => {
  let authorWithMostBlogs = {}
  const authorAndNumBlogs = []

  /* go through each blog and find each author's # of blogs */
  for (let i = 0; i < blogs.length; i++) {
    // let indexOfAuthor = authorAndNumBlogs.indexOf(blogs[i].author)
    let indexOfAuthor = authorAndNumBlogs.findIndex(item => {
        return item.author == blogs[i].author
      })
    // console.log(blogs[i].author, indexOfAuthor)

    /* if author doesn't exist in author object array, add the author */
    if (indexOfAuthor == -1) {
      // console.log('creating new author entry')
      let newAuthor = {
        author: blogs[i].author,
        blogs: 1
      }
      // console.log('new author:', newAuthor)
      authorAndNumBlogs.push(newAuthor)
    }
    /* if author exists in author object array, increment blog count by 1 */
    else {
      authorAndNumBlogs[indexOfAuthor].blogs += 1
    }
  }

  // console.log(authorAndNumBlogs)

  /* at the end, return the author object whose blog count is higher */
  const mostBlogsReducer = (mostBlogs, author) => {
    if (author.blogs > mostBlogs) {
      mostBlogs = author.blogs
      authorWithMostBlogs = author
    }
    return mostBlogs
  }
  authorAndNumBlogs.reduce(mostBlogsReducer, -1)
  return authorWithMostBlogs
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
}