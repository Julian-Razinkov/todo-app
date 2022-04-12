const jwt = require("jsonwebtoken");
const User = require("../models/user")

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decodedPayload = jwt.verify(token, "SSALAM");
        const user = await User.findOne({_id: decodedPayload._id, "tokens.token": token});

        if(!user) throw new Error()
        req.user = user;
        req.token = token;
        next()
    } catch (e) {
        res.status(401).send({error: "Acces denied, please uthenticate"});
    }
}

module.exports = auth; 