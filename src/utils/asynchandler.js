// asynchandler.js
const asynchandler = (fn) => async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error("Error caught in asynchandler:", error);
  
      res.status(error.code || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
        
      });
    }
  };
  
  
 
  

// const asynchandler =(requesthandler) =>
//      (req,res,next)=>{
//     Promise.resolve(requesthandler(req,res,next)).catch(err=>
//         next(err))
    
// }
export  { asynchandler };






