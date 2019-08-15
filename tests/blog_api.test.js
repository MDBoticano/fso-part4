const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./blog_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  console.log('cleaned MongoDB')

  const blogObjects = helper.sampleBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
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
  const response = await api.get('/api/blogs')
  
  /* Check each blog has an 'id' property */
  response.body.forEach(blog => {
    expect(blog.id).toBeDefined()
  })
})

/* 4.10: POST request to /api/blogs creates new blog post */
test('a valid blog can be added', async () => {
  const newBlog = {
    title: "Test POST blog",
    author: "Franz Test",
    url: "google.com",
    likes: 2,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  /* Length check: POST request should increase blog count by one */
  const blogsAfterPOST = await helper.blogsInDb()
  expect(blogsAfterPOST.length).toBe(helper.sampleBlogs.length + 1)

  /* Content check: POST request should add object matching newBlog */
  const blogTitle = blogsAfterPOST.map(blog => blog.title)
  expect(blogTitle).toContain(newBlog.title)

  const blogAuthor = blogsAfterPOST.map(blog => blog.author)
  expect(blogAuthor).toContain(newBlog.author)

  const blogURL = blogsAfterPOST.map(blog => blog.url)
  expect(blogURL).toContain(newBlog.url)

  const blogLikes = blogsAfterPOST.map(blog => blog.likes)
  expect(blogLikes).toContain(newBlog.likes)

})

/* -------------------- After all tests, close connection ------------------- */
afterAll(() => {
  mongoose.connection.close()
})

