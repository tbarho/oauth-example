require('dotenv').config();

const express = require('express');
const app = express();
var passport = require('passport');
var session = require('express-session');
var GitHubStrategy = require('passport-github').Strategy;


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      console.log('got here');

      return done(null);

      // an example of how you might save a user
      // new User({ username: profile.username }).fetch().then(user => {
      //   if (!user) {
      //     user = User.forge({ username: profile.username })
      //   }
      //
      //   user.save({ profile: profile, access_token: accessToken }).then(() => {
      //     return done(null, user)
      //   })
      // })
    }
  )
);
app.use(
  session({ secret: 'keyboard cat', resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
// app.use(passport.session());

app.get('/', (req, res) => {
  res.send("<a href='/secret'>Access Secret Area</a>");
});

app.get('/login', (req, res) => {
  res.send("<a href='/auth/github'>Sign in With GitHub</a>");
});

app.get('/secret', ensureAuthenticated, (req, res) => {
  res.send(`<h2>yo ${req.user}</h2>`);
});

app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['repo:status'] }), /// Note the scope here
  function (req, res) {}
);

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', failureFlash: true, failureMessage: 'Oops' }),
  function (req, res) {
    res.redirect('/');
  }
);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));
