const dummy = (blogs) => {
  return 1;
}

const totalLikes = (blogs) => {
  const sumReducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.reduce(sumReducer, 0)
}

module.exports = {
  dummy,
  totalLikes,
}