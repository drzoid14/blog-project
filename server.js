
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { BlogPosts } = require('./models');

const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));
app.use(jsonParser);

//making a post on start in order to test the get() function
BlogPosts.create('Day 1', 'I suppose it\'s time to party', 'Some Guy', 'May 22, 2018');


app.get('/', (req, res) => {
    res.json(BlogPosts.get());
    console.log('Getting the Blog Posts')
});

app.post('/', (req, res) => {
    console.log('posting a new blog');
    //check to make sure proper keys are being received
    const reqFields = ['title', 'content', 'author', 'publishDate'];
    for (let i = 0; i < reqFields.length; i++) {
        const field = reqFields[i];
        console.log("looking for keys");
        if (!(field in req.body)) {
            const message = `You did not put \`${field}\` in your request`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    const post = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
    res.status(201).json(post);
})

app.put('/:id', (req, res) => {
    console.log("updating a post");
    const reqFields = ["id", "title", "content", "author", "publishDate"]
    for (let i = 0; i < reqFields.length; i++) {
        const field = reqFields[i];
        console.log("looking for keys");
        if (!(field in req.body)) {
            const message = `You did not put \`${field}\` in your request`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    if (req.params.id !== req.body.id) {
        const message = `The id you are trying to update does not match the id given`;
        console.error(message);
        return res.status(400).send(message);
    }
    console.log("Ship Shape so far");
    const post = BlogPosts.update(req.body);
    res.status(200).json(post);
});

app.delete('/:id', (req,res) =>{
    console.log('deleting a post');
    BlogPosts.delete(req.params.id);
    res.sendStatus(200);
})



app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});

let server;


function runServer() {
  const port = process.env.PORT || 8080;
  return new Promise((resolve, reject) => {
    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    }).on('error', err => {
      reject(err)
    });
  });
}


function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        
        return;
      }
      resolve();
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};