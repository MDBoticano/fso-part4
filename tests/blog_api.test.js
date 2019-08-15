const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./blog_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogObjects = helper.sampleBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect (response.body.length).toBe(helper.sampleBlogs.length)
})

afterAll(() => {
  mongoose.connection.close()
})