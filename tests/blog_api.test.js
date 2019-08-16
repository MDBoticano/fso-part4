const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./blog_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')


/* for findByIdAndUpdate */
mongoose.set('useFindAndModify', false);

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.sampleBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

/* --------------------------------- Tests ---------------------------------- */

describe('get initial blogs', () => {
  /* Data is returned as JSON */
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  /* The unique identifier property is named id */
  test('identifier property is named id', async () => {
    const response = await api.get('/api/blogs')

    /* Check each blog has an 'id' property */
    response.body.forEach(blog => {
      expect(blog.id).toBeDefined()
    })
  })

  /* GET request to /api/blogs returns correct number of blog posts */
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.sampleBlogs.length)
  })

  /* GET request to /api/blogs/:id returns correct blog */
  test('a specific blog is within returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const contents = response.body.map(blog => blog.title)
    expect(contents).toContain('Type wars')
  })
})

describe('get specific blogs', () => {
  /* 4.13: a specific blog can be viewed */
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  /* */


})

describe('blog creation', () => {
  /* POST request to /api/blogs creates new blog post */
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
    const lastBlogIndex = blogsAfterPOST.length - 1
    const lastBlog = blogsAfterPOST[lastBlogIndex]

    expect(lastBlog.title).toBe(newBlog.title)
    expect(lastBlog.author).toBe(newBlog.author)
    expect(lastBlog.url).toBe(newBlog.url)
  })

  /* If likes is missing from POST request, likes defaults to 0 */
  test('no likes POST request defaults to 0 likes', async () => {
    const newBlog = {
      title: "Test POST blog",
      author: "Franz Test",
      url: "google.com"
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    /* Content check: POST request should add object matching newBlog */
    const blogsAfterPOST = await helper.blogsInDb()
    const lastBlogIndex = blogsAfterPOST.length - 1
    const lastBlog = blogsAfterPOST[lastBlogIndex]

    expect(lastBlog.likes).toBe(0)
  })

  /* If title and url are missing from POST, respond with 400 bad request */
  test('no title/url POST request returns status 400', async () => {
    const newBlog = {
      author: "Franz Test",
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfterPOST = await helper.blogsInDb()
    expect(blogsAfterPOST.length).toBe(helper.sampleBlogs.length)
  })
})

describe('blog deletion', () => {
  /* 4.13: a specific blog can be deleted */
  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.sampleBlogs.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('blog likes update', () => {
  /* 4.14: a specific blog's likes can be updated */
  test('a valid blog can be updated', async () => {
    const idOfBlogToUpdate = '5a422bc61b54a676234d17fc';

    const updatedBlog = {
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 222
    }

    await api
      .put(`/api/blogs/${idOfBlogToUpdate}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    /* Length check: PUT request should not increase number of blogs */
    const blogsAfterPOST = await helper.blogsInDb()
    expect(blogsAfterPOST.length).toBe(helper.sampleBlogs.length)

    /* Content check: PUT request should have object matching updatedBlog */
    /* get blog by id */
    const updatedBlogById = blogsAfterPOST.find(blog => {
      return blog.id === idOfBlogToUpdate
    })

    /* check blog's like counts to match updatedBlog.likes */
    expect(updatedBlogById.likes).toBe(updatedBlog.likes)
  })
})


/* -------------------- After all tests, close connection ------------------- */
afterAll(() => {
  mongoose.connection.close()
})

