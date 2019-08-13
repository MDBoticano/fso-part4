const dummy = (blogs) => {
  return 1;
}

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
      /* If blog's likes is more than mostLikes, put it as favorite */
      favorite = blog
    }
    return mostLikes
  }

  blogs.reduce(favoriteReducer, -1)

  return favorite  
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}