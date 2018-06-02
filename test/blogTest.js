const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Blog Posts', function() {

    before(function () {
        return runServer;
    });

    after(function () {
        return closeServer;
    });

    it('Should return posts on Get', function(){

        return chai.request(app)
        .get('/')
        .then(function(res){
            console.log(res.body);
            expect(res).to.have.status(200)
            expect(res).to.be.json
            expect(res).to.be.a('object')
        })

    })

    it('Should add a blog post on Post', function (){

        var expectedKeys = ['title','author','content','publishDate'];
        var newPost = {
            title: "Day 2",
            author: "Yo Mama",
            content: "No partying on a school night",
            publishDate: "The Night After"
        }
        return chai.request(app)
        .post('/')
        .send(newPost)
        .then(function(res) {
            expect(res).to.have.status(201)
            expect(res.body).to.include.keys(expectedKeys)
            expect(res.body.id).to.not.equal(null)
        })

    })

    it('Should update an existing post on Put', function (){
        var newPost = {
            title: "Day no, 3",
            author: "Yo Mama, Me",
            content: "I party when I want",
            publishDate: "Every Night"
        }

        return chai.request(app)
        .get('/')
        .then(function(res){
            var newId = res.body[0].id;

            return chai.request(app)
            .put(`/${newId}`)
            .send(newPost)
            .then(function(res){
                expect(res).to.have.status(400)
                
            })
        })

    })

    it('Should delete a post on Delete', function(){
        return chai.request(app)
        .get('/')
      .then(function (res) {
        return chai.request(app)
          .delete(`/${res.body[0].id}`);
      })
      .then(function (res) {
        expect(res).to.have.status(200);
      });

    })


});