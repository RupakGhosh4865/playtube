import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { apierror } from "../utils/apierror.js";
import {apiresponse } from "../utils/apiresponse.js";
import { asynchandler } from "../utils/asynchandler.js";

// Get the channel stats like total video views, total subscribers, total videos, total likes etc.

const getChannelStats = asynchandler(async (req, res) => {
   const { userId } = req.user?._id;

   const totalSubscribers = await Subscription.aggregate([
      {
         $match: {
            channel: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $group: {
            _id: null,
            subscriberCount: {
               $sum: 1,
            },
         },
      },
   ]);

   const video = await Video.aggregate([
      {
         $match: {
            owner: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $lookup: {
            from: "likes",
            foreignField: "video",
            localField: "_id",
            as: "likes",
         },
      },
      {
         $project: {
            totalLikes: {
               $size: "$likes",
            },
            totalViews: "$views",
            totalVideos: 1,
         },
      },
      {
         $group: {
            _id: null,
            totalLikes: {
               $sum: "$totalLikes",
            },
            totalViews: {
               $sum: "$totalViews",
            },
            totalVideos: {
               $sum: 1,
            },
         },
      },
   ]);

   const channelStats = {
      totalSubscribers: totalSubscribers[0]?.subscriberCount || 0,
      totalLikes: video[0]?.totalLikes || 0,
      totalVideos: video[0]?.totalVideos || 0,
      totalViews: video[0]?.totalViews || 0,
   };

   if (!channelStats) {
      throw new apierror(500, "Failed to fetch Channel Stats");
   }

   return res
      .status(200)
      .json(
         new apiresponse(
            201,
            channelStats,
            "channel stats fetched Successfully"
         )
      );
});

// Get all the videos uploaded by the channel

const getChannelVideos = asynchandler(async (req, res) => {
   const { userId } = req.user?._id;

   const channelVideos = await Video.aggregate([
      {
         $match: {
            owner: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $lookup: {
            from: "likes",
            foreignField: "videos",
            localField: "_id",
            as: "likes",
         },
      },
      {
         $addFields: {
            createdAt: {
               $dateToParts: {
                  $date: "$createdAt",
               },
            },
            likesCount: {
               $size: "$likes",
            },
         },
      },
      {
         $project: {
            _id: 1,
            title: 1,
            description: 1,
            duration: 1,
            "videoFile.url": 1,
            "thumbnail.url": 1,
            createdAt: {
               day: 1,
               month: 1,
               year: 1,
            },
            isPublished: 1,
            likesCount: 1,
         },
      },
   ]);

   if (!channelVideos) {
      throw new apierror(500, "Failed To fetch Channel Videos");
   }

   return res
      .status(200)
      .json(
         new apiresponse(
            201,
            channelVideos,
            "channel stats fetched successfully"
         )
      );
});

export { getChannelStats, getChannelVideos };