const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(function(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});



mongoose.connect("mongodb://localhost:27017/jolubookDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const userSchema = mongoose.Schema({
  name: String,
  year:String,
  department: String,
  currorg:String,
  username: String,
  password: String
});
const postSchema = mongoose.Schema({
  postedtext:String,
  time:String,
  postedby:Object
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);



const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/account", function(req, res) {
  if (req.isAuthenticated()){
    //console.log(req.user);
    res.render("account",{user:req.user});

  } else {
    res.redirect("/login");
  }
});

app.get("/feed", function(req, res){
  if (req.isAuthenticated()){

    Post.find({"postedtext": {$ne:''}}, function(err, foundPosts){
      if (err){
        console.log(err);
      } else {
        if (foundPosts) {
          //console.log(foundPosts);
          res.render("feed",{allposts: foundPosts.reverse(),currentuser:req.user.name});
        }
      }
    });


  } else {
    res.redirect("/login");
  }
});


app.post("/login",function(req,res){

  const user = new User({
  username: req.body.username,
  password: req.body.password
});

req.login(user, function(err){
  if (err) {
    console.log(err);
  } else {
    passport.authenticate("local")(req, res, function(){
      res.redirect("/feed");
    });
  }
});
});




app.post("/register",function(req,res){

  User.register({name: req.body.name,
  year: req.body.year,
  department: req.body.department,
  currorg:req.body.currorg,
  username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/feed");
        });
      }
    });

});

app.post("/addpost", function(req, res){
  if (req.isAuthenticated()){
  var currdate = new Date();
  var datetime =  currdate.toLocaleDateString()+" "+currdate.toLocaleTimeString();
    if(req.body.inputText!=='')
    {
      User.findById(req.user.id, function(err, foundUser){
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            var newPost = new Post({
                      postedtext: req.body.inputText,
                      postedby:foundUser,
                      time: datetime
                    })
            newPost.save(function(err) {
                      if (err) {
                        console.log(err);
                      } else {

                      }
                    });
          }
        }
      });

    }
    res.redirect("/feed");
  } else {
    res.redirect("/login");
  }
});



app.get("/", function(req, res) {
  if (req.isAuthenticated()){
    res.redirect("/feed");
  } else {
    res.render("homepage");
  }
});


app.get('/register', function(req, res){
    res.render('register');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/accountedit', function(req, res){
  res.render('accountedit');
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});