const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
}

module.exports.userInfo = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)
    try {
        const user = await UserModel.findById(req.params.id).select('-password');
        return res.status(200).json(user)
    }
    catch (err) { console.log('ID unknown' + err); }
};

module.exports.updateUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {
        const user = await UserModel.findOneAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    bio: req.body.bio
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true },


        )
        return res.status(200).json(user);

    } catch (err) {
        return res.status(500).json({ message: err });
    }
};

module.exports.deleteUser = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {
        await UserModel.findOneAndRemove({ _id: req.params.id }).exec();
        res.status(200).json({ message: "Successfully deleted. " });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
};

module.exports.follow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToFollow))
        return res.status(400).send('One ID is unknown : ' + req.params.id + ' or ' + req.body.idToFollow)

    try {
        // add to the follower list
        await UserModel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { following: req.body.idToFollow } },
            { new: true, upsert: true }
        )

        // add to following list
        await UserModel.findByIdAndUpdate(
            req.body.idToFollow,
            { $addToSet: { followers: req.params.id } },
            { new: true, upsert: true }



        )
        res.status(201).json("message : " + req.params.id + " follow " + req.body.idToFollow);



    } catch (err) {
        return res.status(500).json({ message: err });
    }
};

module.exports.unfollow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToUnfollow))
        return res.status(400).send('One ID is unknown : ' + req.params.id + ' or ' + req.body.idToFollow)

    try {
        // remove from the follower list
        await UserModel.findByIdAndUpdate(
            req.params.id,
            { $pull: { following: req.body.idToUnfollow } },
            { new: true, upsert: true }
        )

        // remove to following list
        await UserModel.findByIdAndUpdate(
            req.body.idToUnfollow,
            { $pull: { followers: req.params.id } },
            { new: true, upsert: true }



        )
        res.status(201).json("message : " + req.params.id + " stop following " + req.body.idToUnfollow);



    } catch (err) {
        return res.status(500).json({ message: err });
    }

};