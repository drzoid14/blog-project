
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose =require('mongoose');
const PORT = require('./config');
const {DATABASE_URL} = require('./config');


const { BlogPost } = require('./models');

const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));
app.use(jsonParser);
app.use(express.json());

//making a post on start in order to test the get() function
BlogPost.create({title: 'Day 1', content:'I suppose it\'s time to party', author:'Some Guy', date:'May 22, 2018'});



app.get('/', (req, res) => {
    console.log('starting to look')
    BlogPost
        .find()
        .then(blogPosts => res.json(blogPosts))
        .catch(err => {
            console.error(err)
            res.status(500).json({ message: 'ABORT ABORT ABORT' })
        });
});



//Posting with Mongoose
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
    BlogPost
        .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            publishDate: req.body.publishDate
        })
        .then(
            blogPosts => res.status(201).json(blogPosts.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'MAYDAY MAYDAY MAYDAY' });
        });
});

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
    BlogPost
    .findByIdAndUpdate(req.params.id,{$set: req.body}, {new: true})
    .then(updated => res.status(204).end())
    .catch(err => res.status(500).json({error:'WOMEN AND CHILDREN FIRST'}));

    });


app.delete('/:id', (req, res) => {
    console.log('deleting a post');
    BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
    res.sendStatus(204);
    })
    .catch(err => {
        res.status(500).json({error: 'ABANDON SHIP ABANDON SHIP'})
    });
});

 



let server;


function runServer(databaseUrl, port=process.env.PORT||8080)  {
return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}


function closeServer() {
    return mongoose.disconnect().then(()=> {
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
})}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };