const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

/* GET: all blogs */ /* ASYNC */
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then((result) => {
      response.json(result)
    })
})

module.exports = blogsRouter