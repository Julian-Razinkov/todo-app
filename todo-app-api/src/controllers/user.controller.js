const User = require('../models/user');
const multer = require('multer');
const sharp = require('sharp');

//User profile picture configuration
const avatar = multer({
    limits: {
      fileSize: 1000000,    
    },
    fileFilter(req, file, callback){
      if(!file.originalname.match(/\.(png|jpg|gif|jfif|jpeg)/)) return callback( new Error ('Wrong file type, must be an image!'));
      callback(undefined, true)
    }
  });

const getUserProfile = async (req, res) => {
    res.send(req.user);
};

const getUserAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
  
        if (!user || !user.profilePicture) {
            throw new Error()
        }
  
        res.set('Content-Type', 'image/png')
        res.send(user.profilePicture)
    } catch (e) {
        res.status(404).send()
    }
};

const signUp = async (req, res) => {
    const user = new User(req.body);
    try {
      await user.save();
      const token = await user.createAuthToken();
      res.status(201).send({user, token});
    } catch (e) {
      res.status(400).send(e);
    }
  
};

const signIn = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email,
            req.body.password);
        const token = await user.createAuthToken();
        res.send({user, token});
      } catch (e) {
        res.status(400).send(e);
      }
};

const logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
          return token.token !== req.token;
        });
    
        await req.user.save();
        res.send();
    
      } catch (e) {
        res.status(500).send();
      }
};

const logoutFromAllDevices = async (req, res) => {
    try {
        req.user.tokens = [];
    
        await req.user.save();
        res.send();
      } catch (e) {
        res.status(500).send();
      }
};

const uploadUserAvatar = async (req, res) => {
    const buffer = await sharp(req.file.buffer)
    .png()
    .resize({
      width: 300,
      height: 300,
    }).toBuffer();
  
    req.user.profilePicture = buffer;
    await req.user.save();
    res.send();
};

const handleUploadError = (error, req, res, next) => {
    res.status(400).send({error: error.message});
}

const updateUser = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'password', 'email'];
    const isValidUpdate = updates.every(
        (update) => allowedUpdates.includes(update));
  
    if (!isValidUpdate) return res.status(400).send({error: 'Invalid update!'});
  
    try {
      const user = req.user;
  
      updates.forEach((update) => user[update] = req.body[update]);
  
      await user.save();
      res.status(200).send(user);
  
    } catch (e) {
      res.status(400).send(e);
    }
};

const deleteUserAvatar = async (req, res) => {
    try {
        req.user.profilePicture = undefined;
        await req.user.save()
        res.send();
      } catch (e) {
        res.status(500).send();
      }
};

const deleteUser = async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    
      } catch (e) {
        res.status(500).send();
      }
};


module.exports = {
    avatar,
    getUserProfile,
    getUserAvatar,
    signUp,
    signIn,
    logout,
    logoutFromAllDevices,
    uploadUserAvatar,
    handleUploadError,
    updateUser,
    deleteUserAvatar,
    deleteUser,
}