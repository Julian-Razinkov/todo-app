const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("../models/task")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)) throw new Error("Email is invalid!");
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value < 0) throw new Error("Age is invalid!");
        }
    },
    profilePicture: {
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})


userSchema.methods.createAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, "SSALAM");

    user.tokens = user.tokens.concat({token});
    
    await user.save();

    return token;
};

userSchema.methods.toJSON = function() {
    const user = this
    const userData = user.toObject();

    delete userData.tokens;
    delete userData.password;
    delete userData.profilePicture;

    return userData
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if(!user) throw new Error("User not found");

    const isHashMathc = await bcrypt.compare(password, user.password);

    if(!isHashMathc) throw new Error("Wrong password");

    return user;
}

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
});

userSchema.pre('remove', async function(next){
    const user = this;
    await Task.deleteMany({owner: user._id});

    next()

});

const User = mongoose.model("User", userSchema)

module.exports = User;

