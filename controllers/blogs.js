const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
  
    const user = await User.findById(body.userId)

    // validate who the token belongs to, not just that its valid
    if (decodedToken.id.toString() !== user._id.toString()) {
      return response.status(401).json({ error: 'token doesn\'t match user' })
    }

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

  try {
    const blog = {
      title: body.title,
      author: body.author,
      likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
    response.json(updatedBlog.toJSON())
  } catch(exception) {
    next(exception)
  }
})

/* DELETE: one blog using id -- ASYNC */
blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    // get the token from the request
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
  
    // get blog from id
    const blogToDelete = await Blog.findById(request.params.id)

    // console.log(blogToDelete)

    // validate who the token belongs to, not just that its valid
    if (decodedToken.id.toString() !== blogToDelete.user.toString()) {
      return response.status(401).json({ error: 'token doesn\'t match user' })
    } 

    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter