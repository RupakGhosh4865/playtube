import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweets.models.js";
import { apierror } from "../utils/apierror.js";
import {   apiresponse } from "../utils/  apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

const createTweet = asynchandler(async (req, res) => {
   const { content } = req.body;

   if (!content) {
      throw new apierror(400, "Content is Required");
   }

   const tweet = await Tweet.create({
      content,
      owner: req?.user?._id,
   });

   if (!tweet) {
      throw new apierror(500, "Error in creating tweet");
   }

   return res
      .status(200)
      .json(new   apiresponse(201, tweet, "Tweet created Successfully"));
});

const getUserTweets = asynchandler(async (req, res) => {
   const { userId } = req.params;

   if (!isValidObjectId(userId)) {
      throw new apierror(400, "Invalid User Id");
   }

   const tweets = await Tweet.aggregate([
      {
         $match: {
            owner: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $lookup: {
            from: "users",
            foreignField: "owner",
            localField: "_id",
            as: "Owner",

            pipeline: [
               {
                  $project: {
                     username: 1,
                     "avatar.url": 1,
                  },
               },
            ],
         },
      },
      {
         $lookup: {
            from: "likes",
            foreignField: "tweet",
            localField: "_id",
            as: "likedetails",

            pipeline: [
               {
                  $project: {
                     likeBy: 1,
                  },
               },
            ],
         },
      },
      {
         $addFields: {
            likesCount: {
               $size: "$likedetails",
            },
            ownerDetails: {
               $first: "$Owner",
            },
         },
      },
      {
         $project: {
            content: 1,
            ownerDetails: 1,
            likesCount: 1,
            createdAt: 1,
         },
      },
   ]);

   if (!tweets) {
      throw new apierror(500, "Error in fetching tweets");
   }

   return res
      .status(200)
      .json(new   apiresponse(201, tweets, "All Tweets fetched Successfully"));
});

const updateTweet = asynchandler(async (req, res) => {
   const { content } = req.body;

   const { tweetId } = req.params;

   if (!content) {
      throw new apierror(400, "Content is Required");
   }

   if (!isValidObjectId(tweetId)) {
      throw new apierror(400, "Invalid Tweet Id");
   }

   const tweet = await Tweet.findById(tweetId);

   if (!tweet) {
      throw new apierror(400, "Tweet not found");
   }

   if (tweet?.owner.toString() !== req.user?._id.toString()) {
      throw new apierror(
         400,
         "You can not update the tweet as you are not the owner"
      );
   }

   const updatedTweet = await Tweet.findByIdAndUpdate(
      {
         tweetId,

         $set: { content },
      },
      { new: true }
   );

   if (!updatedTweet) {
      throw new apierror(500, "Failed to Update Tweet. Please Try again");
   }

   return res
      .status(200)
      .json(new   apiresponse(201, updatedTweet, "Tweet updated Successfully"));
});

const deleteTweet = asynchandler(async (req, res) => {
   const { tweetId } = req.params;

   if (!isValidObjectId(tweetId)) {
      throw new apierror(400, "Invalid Tweet Id");
   }

   const tweet = await Tweet.findById(tweetId);

   if (!tweet) {
      throw new apierror(400, "Tweet not found");
   }

   if (tweet?.owner.toString() !== req.user?._id.toString()) {
      throw new apierror(
         400,
         "You can not delete the tweet as you are not the owner"
      );
   }

   await Tweet.findByIdAndDelete(tweetId);

   return res.status(
      200,
      new   apiresponse(201, {}, "Tweet Deleted Successfully")
   );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };