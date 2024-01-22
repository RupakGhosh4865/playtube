import mongoose,{schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema({
    videofile :{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    tittle:{
        type:String,
        required:true,
    },
    description:{  
        type:String,
        required:true,
    },
    duration:{
        type:number,
        required:true,
    },
    view :{
        type:number,
        default:0
    },
    ispublished :{
        type:Boolean,
        default:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }



},
{
    timestamps:true,
}
)
videoschema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video",videoSchema)