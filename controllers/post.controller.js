
const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.readPost = async (req, res) => {
    try {
        const post = await PostModel.find();
        return res.status(201).json(post);
    } catch (err) {
        console.log('Error to get data : ' + err);
    }
}

module.exports.createPost = async (req, res) => {
    const newPost = new PostModel({
        posterId: req.body.posterId,
        message: req.body.message,
        video: req.body.video,
        likers: [],
        comments: []
    });

    try {
        const post = await newPost.save();
        return res.status(201).json(post);
    } catch (err) {
        return res.status(400).send(err);
    }
}

module.exports.updatePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    const updatedRecord = {
        message: req.body.message
    }

    try {
        const post = await PostModel.findByIdAndUpdate(
            req.params.id,
            { $set: updatedRecord },
            { new: true }
        )
        return res.status(200).send(post);
    } catch (err) {
        return console.log("Update error : " + err);
    }
}

module.exports.deletePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {
        await PostModel.findOneAndRemove(req.params.id).exec();
        res.status(200).send({ message: "Successfully deleted. " });
    } catch (err) {
        return console.log("Delete error : " + err);
    }
}