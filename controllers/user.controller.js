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
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {

    } catch (err) {
        return res.status(500).json({ message: err });
    }
};

module.exports.unfollow = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send('ID unknown : ' + req.params.id)

    try {

    } catch (err) {
        return res.status(500).json({ message: err });
    }
};