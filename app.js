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
    cb(null, Date.now()+'-'+file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'  || file.mimetype === 'video/mp4'  || file.mimetype === 'application/vnd.ms-powerpoint'  || file.mimetype === 'application/msword'   || file.mimetype === 'application/pdf'  || file.mimetype === 'application/octet-stream'    || file.mimetype === 'audio/x-wav'  || file.mimetype === 'audio/mpeg'){
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500
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
  whatsapp:String,
  year: String,
  aboutyou:String,
  department: String,
  currorg: String,
  prevorg: String,
  country: String,
  currcity: String,
  hometown: String,
  username: String,
  facebook:String,
  github:String,
  instagram:String,
  linkedin:String,
  personalwebsite:String,
  dp: String,
  coverpic:String
});
const postSchema = mongoose.Schema({
  postedtext: String,
  time: String,
  postedby: String,
  postfile:String,
  posttype:String,
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
          user: req.user,accountholder:fu,host:req.rawHeaders[1]
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
        prevorg: req.body.prevorg,
        whatsapp: req.body.whatsapp,
        facebook: req.body.facebook,
        linkedin: req.body.linkedin,
        aboutyou: req.body.aboutyou,
        github: req.body.github,
        instagram: req.body.instagram,
        personalwebsite: req.body.personalwebsite
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
    var condition={};
    feedloader(req,res,condition);



  } else {
    res.redirect("/login");
  }
});


const feedloader =(req,res,condition)=>
{
  Post.find(condition, function(err, foundPosts) {
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
              var post = {
                author: obj.postedby,
                post: obj.postedtext,
                authordp: fu.dp,
                posttime: obj.time,
                authorg: fu.currorg,
                authcity: fu.currcity,
                authcountry:fu.country,
                authpassyear:fu.year,
                authdept:fu.department,
                postfile:obj.postfile,
                posttype:obj.posttype,
                postid:obj._id,
                poster:obj.creatorusername
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
}


app.get("/myposts", function(req, res) {
  if (req.isAuthenticated()) {
    var condition={creatorusername:req.user.username};
    feedloader(req,res,condition);
  } else {
    res.redirect("/login");
  }
});


app.get("/removedp", function(req, res) {
  if (req.isAuthenticated()) {
    Person.updateOne({
      username: req.user.username
    }, {
      $set: {
        dp: "avater.jpeg"
      }
    }, {
      upsert: true
    }, function(err) {
      if (err) console.log(err);
    })
    User.updateOne({
      username: req.user.username
    }, {
      $set: {
        dp: "avater.jpeg"
      }
    }, {
      upsert: true
    }, function(err) {
      if (err) console.log(err);
    })
    if(req.user.dp!=="avater.jpeg")
    {
      itemdeleter(req.user.dp);

    }


    req.user.dp = "avater.jpeg";
    res.redirect("/account");

  } else {
    res.redirect("/login");
  }
});

app.get("/deleteaccount", function(req, res) {
  if (req.isAuthenticated()) {
  Post.find({creatorusername:req.user.username}, function(err, foundPosts) {
    if (err) {
      console.log(err);
    } else {
      for(var i = 0; i < foundPosts.length; i++)
      {
        let obj=foundPosts[i];
        //console.log(obj.postfile);
        if(obj.postfile!="")
        {
          itemdeleter(obj.postfile);
        }
      }
    }});
    Post.deleteMany({creatorusername:req.user.username}).then(result => {
        //console.log("Records Deleted");
    })
    Person.deleteOne(
    { username: req.user.username } // specifies the document to delete
    ).then(result => {
        //console.log("Records Deleted");
    })
    User.deleteOne(
    { username: req.user.username } // specifies the document to delete
    ).then(result => {
        //console.log("Records Deleted");
    })
    if(req.user.dp!="avater.jpeg")
    {
      itemdeleter(req.user.dp);
    }
    res.redirect("/logout");

  } else {
    res.redirect("/login");
  }
});


const itemdeleter =(itemlink)=>
{
  const pathToFile = "./uploads/"+itemlink;
  fs.unlink(pathToFile, function(err) {
    if (err) {
      throw err
    } else {
    }
  })
}




app.get("/user/:userid",function(req,res){
  if(req.isAuthenticated())
    {Person.find({_id:req.params.userid}, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if(foundUser.length===0) res.redirect("/jolutree");
        else{
          Post.find({creatorusername:foundUser[0].username}, function(err, foundPosts) {
            if (err) {
              console.log(err);
            } else {
            res.render("userpage",{user:foundUser[0],posts:foundPosts.reverse(),currentuser: req.user});
          }});
        }
    }});
  }
  else {
    res.render('login');
  }
});
app.get("/post/*",function(req,res){
  res.send("<h1>"+req.params[0]+"</h1>");
});



app.get("/jolutree/:year/:dept",function(req,res){
  if(req.isAuthenticated()) {
    let fetcher=req.params;
    //console.log(fetcher.year);
    var de=fetcher.dept.toUpperCase();
    var condition={};
    if(de=="ALL") condition={year:fetcher.year};
    else condition={year:fetcher.year,department:de};
    jolutreeloader(req,res,condition);
  }else {
    res.render('login');
  }
});
app.get("/jolutree/:query",function(req,res){
  if(req.isAuthenticated()) {
    let fetcher=req.params.query;
    //console.log(fetcher.query);
    var condition={};
    if(fetcher>=1961 && fetcher<=2050)
    {condition={year:fetcher};}
    else if(fetcher==="all") condition={};
    else condition={department:fetcher.toUpperCase()};

    jolutreeloader(req,res,condition);
  }else {
    res.render('login');
  }
});
const jolutreeloader =(req,res,condition)=>
{

  Person.find(condition, function(err, foundPeople) {
    if (err) {
      console.log(err);
    } else {
    res.render('jolutreeyear', {people:foundPeople,currentuser: req.user});
  }});

}
app.get('/jolutree', function(req, res) {
  if(req.isAuthenticated()) {
    res.render('jolutree', {currentuser: req.user});
  }else {
    res.render('login');
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
        whatsapp: "",
        facebook:"",
        github:"",
        instagram:"",
        linkedin:"",
        personalwebsite:"",
        prevorg: "",
        country: "",
        currcity: "",
        hometown: "",
        dp: "avater.jpeg",
        aboutyou:"Hi Visitor I am a Jolubook User"
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

app.post("/addpost", upload.single('postfile'),function(req, res) {
  if (req.isAuthenticated()) {
    //console.log(req.file);
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
    var postfilename="";
    var posttype="0";
    if(req.file)
    {
      postfilename=req.file.filename;
      if(req.file.mimetype.includes("application")) posttype="1";
      else if(req.file.mimetype.includes("image")) posttype="2";
      else if(req.file.mimetype.includes("video")) posttype="3";
      else if(req.file.mimetype.includes("audio")) posttype="4";
      //console.log(posttype);
    }
    if (req.body.inputText !== '' ||  postfilename!="") {
      var newPost = new Post({
        postedtext: req.body.inputText,
        postedby: req.user.name,
        time: datetime,
        creatorusername: req.user.username,
        postfile:postfilename,
        posttype:posttype
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