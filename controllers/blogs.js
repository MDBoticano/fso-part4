const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

/* GET: all blogs */ /* ASYNC */
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes
  })

  blog
    .save()
    .then((result) => {
      response.json(result)
    })
})

module.exports = blogsRouter