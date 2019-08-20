const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

/* Helper for Authentication */
const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    // Return the rest of the string after 'bearer '
    return authorization.substring(7)
  }
  return null
}

/* GET: all blogs -- ASYNC */
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', {
      username: 1,
      name: 1
    })
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
  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
  
    const user = await User.findById(body.userId)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes,
      user: user._id
    })
  
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.json(savedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

/* PUT: update an existing entry -- NON ASYNC*/
blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    likes: body.likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
    response.json(updatedBlog.toJSON())
  } catch(exception) {
    next(exception)
  }
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