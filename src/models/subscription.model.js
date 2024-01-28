import mongoose,{schema} from "mongoose";

const subscriptionschema = new mongoose.Schema({

subscriber :{
    type  :schema.Types.ObjectId,//one who is subscription
    ref : "user"
},channel:{
    type  :schema.Types.ObjectId,//one to whom'subscriber' is subscribing

    ref : "user"
}

},{timestamps:true})










export const subscription = mongoose.model("subscription",subscriptionschema)