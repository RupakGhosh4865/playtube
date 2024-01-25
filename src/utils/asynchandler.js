const asynchandler =(fn) =>async (req,res,next)=>{
    try {
await fn(req,res,next)
    } catch(error){
        res.status(error.code || 500).json({success : false,message : error.message }
            )
}
   

}


export {asynchandler}

// const asynchandler =(requesthandler) =>{
//     return (req,res,next)=>{
//     promise.resolve(requesthandler(req,res,next)). catch((err)=>
//         next(err))
    
// }}







