const express = require('express');

const mongodb = require('mongodb');

const router = express.Router();

const ObjectId = mongodb.ObjectId;

const db = require('../data/database');

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  const posts = await db
  .getDb()
  .collection('posts')
  .find({}, {title: 1, summary: 1, 'author.name': 1})
  .toArray();
  res.render('posts-list', {posts: posts});
});

router.post('/posts', async function(req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db.getDb().collection('authors').findOne({_id: authorId});

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    },
  };

  const result = await db.getDb().collection('posts').insertOne(newPost);
  console.log(result);
  res.redirect('/posts');
});

router.get('/post/:id', async function(req, res) {
  const post = await db.getDb().collection('posts').findOne({_id: new ObjectId(req.params.id)}, {title: 1, content: 1, 'author.name': 1});
  if(!post) {
    return res.status(404).render('404');
  }
  res.render('includes/post-item', {post: post});
});

router.get('/update-post/:id', async function(req, res) {
  const post = await db.getDb().collection('posts').findOne({_id: new ObjectId(req.params.id)}, {date: 0, author: 0});
  if(!post) {
    res.status(404).render('404');
  }
  res.render('update-post', {post: post});
});

router.post('/update-post/:id', async function(req, res) {
  const updates = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content
  };
  const post = await db.getDb().collection('posts').updateOne(
    {_id: new ObjectId(req.params.id)},
    {
      $set: {
      title: updates.title,
      summary: updates.summary,
      content: updates.content
    }});
  res.redirect('/posts');
});

router.get('/new-post', async function(req, res) {
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', {authors: authors});
});

router.post('/delete-post/:id', async function(req, res) {
  await db.getDb().collection('posts').deleteOne({_id: new ObjectId(req.params.id)});
  res.redirect('/posts');
})

module.exports = router;