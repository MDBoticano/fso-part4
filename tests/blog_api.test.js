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

/* --------------------------------- Tests ---------------------------------- */

/* 4.8: Data is returned as JSON */
test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

/* 4.8: GET request to /api/blogs returns correct number of blog posts */
test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect (response.body.length).toBe(helper.sampleBlogs.length)
})

/* 4.9: The unique identifier property is named id */
test('identifier property is named id', async () => {
  /* Get all blogs */
  const response = await api.get('/api/blogs')
  
  /* Check each blog has an 'id' property */
  response.body.forEach(blog => {
    expect(blog.id).toBeDefined()
  })
})

/* -------------------- After all tests, close connection ------------------- */
afterAll(() => {
  mongoose.connection.close()
})

