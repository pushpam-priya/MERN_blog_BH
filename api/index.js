const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const Comment = require('./models/Comment');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.set('strictQuery', false);
// const dbUrl = process.env.dbUrl || "mongodb+srv://pranish_7:565q3JePMwdgud7i@cluster0.ztoy5yl.mongodb.net/?retryWrites=true&w=majority";
// mongoose.connect(dbUrl);
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function () {
//   console.log("connected!!!");
// });

// const dbUrl = process.env.dbUrl || "mongodb+srv://pushpampriyaa:R1EkeFoNuGOeq8Ga@cluster0.4nsenpk.mongodb.net/?retryWrites=true&w=majority";
// mongoose.connect(dbUrl);
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function () {
//   console.log("connected!!!");
// });

// const dbUrl = process.env.dbUrl || "mongodb+srv://pranish7:iWtwDefsxyIW7l6f@cluster0.spvaerv.mongodb.net/?retryWrites=true&w=majority";
// mongoose.connect(dbUrl);
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function () {
//   console.log("connected!!!");
// });
// mongoose.connect(dbUrl);
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", function () {
//   console.log("connected!!!");
// });

//R1EkeFoNuGOeq8Ga
//mongoose.connect('mongodb+srv://pranish_7:565q3JePMwdgud7i@cluster0.ztoy5yl.mongodb.net/?retryWrites=true&w=majority');
//mongoose.connect('mongodb+srv://pushpampriyaa:R1EkeFoNuGOeq8Ga@cluster0.4nsenpk.mongodb.net/?retryWrites=true&w=majority');
//mongoose.connect('mongodb+srv://pranish7:iWtwDefsxyIW7l6f@cluster0.spvaerv.mongodb.net/?retryWrites=true&w=majority');
//mongoose.connect('mongodb+srv://pushpampriyaa:XwZiR39cpnPwvMX2@cluster0.0izgnrc.mongodb.net/?retryWrites=true&w=majority');

MONGO_PROD_URI = 'mongodb+srv://pranish_7:565q3JePMwdgud7i@cluster0.ztoy5yl.mongodb.net/?retryWrites=true&w=majority';

mongoose
  .connect(MONGO_PROD_URI, {
    serverSelectionTimeoutMS: 50000,
    useUnifiedTopology: true,

  })
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));

// const uri = 'mongodb+srv://pranish7:iWtwDefsxyIW7l6f@cluster0.spvaerv.mongodb.net/?retryWrites=true&w=majority';
// mongoose.connect(uri, {
//   serverSelectionTimeoutMS: 50000
// }).catch(err => console.log(err.reason));

// const uri = 'mongodb+srv://pushpampriyaa:R1EkeFoNuGOeq8Ga@cluster0.4nsenpk.mongodb.net/?retryWrites=true&w=majority';
// mongoose.connect(uri, {
//   serverSelectionTimeoutMS: 50000
// }).catch(err => console.log(err.reason));


app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  //console.log(req.body);
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
      
    });
    res.json(userDoc);
    //window.location.href = '/login';
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

/*
app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  console.log(password);
  const userDoc = await User.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});
*/

// Create a new comment
app.post('/comments', async (req, res) => {
  const { postId, text } = req.body;
  const { token } = req.cookies;
  console.log(req);
  console.log(postId, text);
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json('Unauthorized');
    }

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json('Post not found');
      }

      let comment = await Comment.create({
        text,
        author: info.id,
        post: postId,
      });
      comment=await comment.populate('author');
      console.log(comment);
      post.comments.push(comment);
      await post.save();
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json(error);
    }
  });
});

// Get comments for a specific post


app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.findOne({ username });

    if (!userDoc) {
      return res.status(400).json('Invalid credentials');
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (passOk) {
      // logged in
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie('token', token).json({
          id: userDoc._id,
          username,
        });
      });
    } else {
      res.status(400).json('Invalid credentials');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json('Server error');
  }
});



app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req,res) => {
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {title,summary,content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover:newPath,
      author:info.id,
    });
    res.json(postDoc);
  });

});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

  const {token} = req.cookies;
  jwt.verify(token, secret, {}, async (err,info) => {
    if (err) throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json('you are not the author');
    }
    await postDoc.update({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });

    res.json(postDoc);
  });

});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', ['username'])
      .sort({ createdAt: -1 });
    res.json({postDoc, comments});
  } catch (error) {
    res.status(400).json(error);
  }
})

app.listen(4000);
//