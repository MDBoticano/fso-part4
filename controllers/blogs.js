const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

/* GET: all blogs -- ASYNC */
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(blog => blog.toJSON()))
})

/* GET: one blog using id --  */
blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog.toJSON())
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})

/* POST: create a new entry -- ASYNC */
blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes === undefined ? 0 : body.likes
  })

  try {
    const savedBlog = await blog.save()
    response.json(savedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

/* PUT: update an existing entry -- NON ASYNC*/
blogsRouter.put('/:id', (request, response, next) => {
// blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true} )
    .then(updatedBlog => {
      response.json(updatedBlog.toJSON())
    })
    .catch(error => next(error))

  // try {
  //   const updatedBlog = await blog.update(blog)
  //   response.json(updatedBlog.toJSON())
  // } catch(exception) {
  //   next(exception)
  // }
  
})

/* DELETE: one blog using id -- ASYNC */
blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter