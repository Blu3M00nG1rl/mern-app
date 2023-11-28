const postModel = require('../models/post.model');
const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const { uploadErrors } = require("../utils/errors.utils");
const ObjectID = require('mongoose').Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

module.exports.readPost = async (req, res) => {
    try {
        const post = await PostModel.find().sort({ createdAt: -1 });
        return res.status(201).json(post);
    } catch (err) {
        console.log('Error to get data : ' + err);
    }
}

module.exports.createPost = async (req, res) => {
    let fileName;
    if (req.file != null) {
        try {
            if (
                req.file.detectedMimeType != "image/jpg" &&
                req.file.detectedMimeType != "image/png" &&
                req.file.detectedMimeType != "image/jpeg"
            )
                throw Error("invalid file");

            if (req.file.size > 500000) throw Error("max size");
        } catch (err) {
            const errors = uploadErrors(err);
            return res.status(201).json({ errors });
        }
        fileName = req.body.posterId + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/posts/${fileName}`
            )
        );
    }

    const newPost = new PostModel({
        posterId: req.body.posterId,
        message: req.body.message,
        picture: req.file != null ? "./uploads/posts/" + fileName : "",
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

module.exports.likePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('One ID is unknown : ' + req.params.id);

    try {

        await PostModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { likers: req.body.id } },
            { new: true }
        )
        await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id }
            },
            { new: true },
        )

        res.status(201).send("message : " + req.params.id + " liked by " + req.body.id);


    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.unlikePost = async (req, res) => {

    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('One ID is unknown : ' + req.params.id);

    try {
        await PostModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { likers: req.body.id } },
            { new: true }
        )

        await UserModel.findByIdAndUpdate(
            req.body.id,
            { $pull: { likes: req.params.id } },
            { new: true }
        )

        res.status(201).json("message : " + req.params.id + " stop liking by " + req.body.id);




    }
    catch (err) {
        return res.status(400).json(err);
    }

};

module.exports.commentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        const newComment = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
                    },
                },
            },
            { new: true });

        console.log(newComment);
        return res.status(200).send(newComment);
    } catch (err) {
        console.log(newComment);
        return res.status(400).send(err);
    }

};

module.exports.editCommentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id);

    try {
        const post = await PostModel.findById(
            req.params.id
        )

        const theComment = post.comments.find((comment) =>
            comment._id.equals(req.body.commentId)
        );

        if (!theComment) return res.status(404).send("Comment not found");
        theComment.text = req.body.text;

        post.save();
        return res.status(200).send(post);
    } catch (err) {
        return res.status(400).send(err);
    }
};

module.exports.deleteCommentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {
        const post = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        _id: req.body.commentId
                    }
                }
            },
            { new: true }
        );
        post.save();
        return res.status(200).send(post);


    } catch (err) {
        //console.log(post);
        return res.status(400).send(err);
    }
};