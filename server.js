'use strict';

const express = require('express');
const fs = require('fs'); 
const bodyParser = require('body-parser');
const pg = require('pg');
const cors = require('cors');
const superAgent = require('superagent');
const PORT = process.env.PORT || 3000;
const app = express();

require('dotenv').config();
// const conString = 'postgres://localhost:5432/my_media_db';
const conString = 'postgres://postgres:GiGahurtZ42@mhzsys.net:20010/my_media_db';

const api_key = process.env.api_key;

const client = new pg.Client(conString);
client.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

// gets the 4 most popular movies
app.get('/api/movies/popular', (req, res) => {
  let url_popular = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;
  superAgent.get(url_popular)
    .then(data => {
      let arrPopular = data.body.results.filter((movie, index) => {
        if (index < 20) {return movie;}
      });
      let randArr = [];
      for(var i = 0; i < 4; i++) {
        let rand = Math.floor((Math.random() * 19) + 1);
        if (!randArr.includes(arrPopular[rand])) {randArr.push(arrPopular[rand]);}
        else {
          randArr.push(arrPopular[Math.floor((Math.random() * 19) + 1)]);
        }
      }
      res.send(randArr);
    }).catch(err => console.error(err));
});

// gets 4 recommended movies
app.get('/api/movies/recommend', (req, res) => {
  let url_recommend = `https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&language=en-US&sort_by=vote_count.desc&include_adult=false&include_video=false&page=1`;
  superAgent.get(url_recommend)
    .then(data => {
      let arrRecommend = data.body.results.filter((movie, index) => {
        if (index < 20) {return movie;}
      });
      let randArr = [];
      for(var i = 0; i < 4; i++) {
        let rand = Math.floor((Math.random() * 19) + 1);
        if(!randArr.includes(arrRecommend[rand])) {randArr.push(arrRecommend[rand]);}
        else {
          randArr.push(arrRecommend[Math.floor((Math.random() * 19) + 1)]);
        }
      }
      res.send(randArr);
    })
    .catch(err => console.error(err));
});



// gets movies based on user search by title
app.get('/api/movies/:title', (req, res) => {
  let url_search = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${req.params.title}`;
  superAgent.get(url_search)
    .then(data => {
      console.log(req.params.title)
      res.send(data.body.results);
    })
    .catch(err => console.error(err));
});


app.get('/api/movies/one/:id', (req, res) => {
  let detail_Url = `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${api_key}&append_to_response=videos,images`
  superAgent.get(detail_Url)
    .then(data => {
      console.log(data.body.id);
      res.send(data.body);
    })
    .catch(err => console.error(err));
});

app.get('/api/movies/related/:id', (req, res) => {
  let detail_Url = `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${api_key}&append_to_response=videos,images`
  superAgent.get(detail_Url)
    .then(data => {
      console.log(data.body.id);
      res.send(data.body);
    })
    .catch(err => console.error(err));
});

app.post('/user', (req, res) => {
  client.query(`
    INSERT INTO users(first_name, last_name, email, db_key, pwd)
    VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING;`,
    [
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      req.body.db_key,
      req.body.pwd
    ])
    .catch(err => console.error(err));
});

loadDB();

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});

function loadDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email VARCHAR(255) NOT NULL,
      db_key VARCHAR(255) NOT NULL,
      pwd VARCHAR(255) NOT NULL);`
  )
    .then()
    .catch(err => console.error(err));
}