// const asynchandler =(fn) =>async (req,res,next)=>{
//     try {
// await fn(req,res,next)
//     } catch(error){
//         res.status(err.code || 500).json({success : false,message : err.message }
//             )
// }
   
// }

const asynchandler =(requesthandler) =>{(req,res,next)=>{
    promise.resolve(requesthandler(req,res,next)). catch((err)=>
        next(err))
    
}}






export {asynchandler}