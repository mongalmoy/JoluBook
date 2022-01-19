const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const fs = require('fs');

const app = express();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname + '-' + Date.now() + '.jpeg'); //Appending extension
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

app.set('view engine', 'ejs');
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({
  extended: true
}));
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
  username: String,
  password: String,
  dp:String
});
const personSchema = mongoose.Schema({
  name: String,
  mobile: String,
  year: String,
  department: String,
  currorg: String,
  prevorg: String,
  country: String,
  currcity: String,
  hometown: String,
  username: String,
  dp: String
});
const postSchema = mongoose.Schema({
  postedtext: String,
  time: String,
  postedby: String,
  creatorusername: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);



const User = mongoose.model("User", userSchema);
const Person = mongoose.model("Person", personSchema);
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

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/account", function(req, res) {
  if (req.isAuthenticated()) {
    Person.findOne({
      'username': req.user.username
    }, function(error, fu) {
      if(error) console.log(error);
      else{
        res.render("account", {
          user: req.user,accountholder:fu
        });
      }
    });


  } else {
    res.redirect("/login");
  }
});
app.get("/editaccount", function(req, res) {
  if (req.isAuthenticated()) {
    Person.findOne({
      'username': req.user.username
    }, function(error, fu) {
      if(error) console.log(error);
      else{
        res.render("accountedit", {
          user: req.user,accountholder:fu
        });
      }
    });


  } else {
    res.redirect("/login");
  }
});

app.post("/editaccount", upload.single('newImg'), function(req, res) {
  if (req.isAuthenticated()) {
    Person.updateOne({
      username: req.body.username
    }, {
      $set: {
        mobile: req.body.mobile,
        currcity: req.body.currcity,
        currorg: req.body.currorg,
        country: req.body.country,
        hometown: req.body.hometown,
        prevorg: req.body.prevorg
      }
    }, {
      upsert: true
    }, function(err) {
      if (err) console.log(err);
      //else console.log("User Details Updated");
    })
    if(req.file)
    {
      Person.updateOne({
        username: req.body.username
      }, {
        $set: {
          dp: req.file.filename
        }
      }, {
        upsert: true
      }, function(err) {
        if (err) console.log(err);
      })
      User.updateOne({
        username: req.body.username
      }, {
        $set: {
          dp: req.file.filename
        }
      }, {
        upsert: true
      }, function(err) {
        if (err) console.log(err);
      })
      if(req.user.dp!=="avater.jpeg")
      {
        const pathToFile = "./uploads/"+req.user.dp;

        fs.unlink(pathToFile, function(err) {
          if (err) {
            throw err
          } else {
            //console.log("Successfully deleted the file.")
          }
        })
      }


      req.user.dp = req.file.filename;

    }
    //dp: req.file.filename
    //req.user.currorg = req.body.currPosition;
    //




    res.redirect("/account");

  } else {
    res.redirect("/login");
  }



});






app.get("/feed", function(req, res) {
  if (req.isAuthenticated()) {

    Post.find({
    }, function(err, foundPosts) {
      if (err) {
        console.log(err);
      } else {
        if(foundPosts.length===0) {res.render("feed", {
          allposts: foundPosts.reverse(),
          currentuser: req.user
        });}
        //console.log(foundPosts);
        else {
          var articles = [];
          for (var i = 0; i < foundPosts.length; i++) {
            let obj = foundPosts[i];
            Person.findOne({
              'username': obj.creatorusername
            }, function(error, fu) {
              if (error) console.log(error);
              else {
                /*console.log(obj);
                console.log(fu);
                console.log(obj);
                console.log("--------------------");*/


                var post = {
                  author: obj.postedby,
                  post: obj.postedtext,
                  authordp: fu.dp,
                  posttime: obj.time,
                  authorg: fu.currorg,
                  authcity: fu.currcity,
                  authcountry:fu.country,
                  authpassyear:fu.year,
                  authdept:fu.department
                };
                articles.push(post);
                if(articles.length===foundPosts.length) {res.render("feed", {
                  allposts: articles.reverse(),
                  currentuser: req.user
                });}
              }
            });
          }
          //console.log(foundPosts);

        }
      }
    });


  } else {
    res.redirect("/login");
  }
});





app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/feed");
      });
    }
  });
});




app.post("/register", function(req, res) {

  User.register({
    name: req.body.name,
    username: req.body.username,dp: "avater.jpeg"
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      var newPerson = new Person({
        name: req.body.name,
        year: req.body.year,
        department: req.body.department,
        currorg: req.body.currorg,
        username: req.body.username,
        mobile: "",
        prevorg: "",
        country: "",
        currcity: "",
        hometown: "",
        dp: "avater.jpeg"
      })
      newPerson.save(function(err) {
        if (err) {
          console.log(err);
        } else {

        }
      });









      passport.authenticate("local")(req, res, function() {
        res.redirect("/feed");
      });
    }
  });

});

app.post("/addpost", function(req, res) {
  if (req.isAuthenticated()) {
    const currdate = new Date();
    const formattedDate = currdate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '/');
    const formattime = currdate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });


    var datetime = formattedDate + " " + formattime;
    if (req.body.inputText !== '') {
      var newPost = new Post({
        postedtext: req.body.inputText,
        postedby: req.user.name,
        time: datetime,
        creatorusername: req.user.username
      })
      newPost.save(function(err) {
        if (err) {
          console.log(err);
        } else {

        }
      });
    }
    res.redirect("/feed");
  } else {
    res.redirect("/login");
  }
});



app.get("/", function(req, res) {

  if (req.isAuthenticated()) {
    res.redirect("/feed");
  } else {
    res.render("homepage");
  }
});


app.get('/register', function(req, res) {
  res.render('register');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});