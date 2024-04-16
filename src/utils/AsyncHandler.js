const asyncHandler = (requestHandler) =>{
  return (req,req,next)=>{
           Promise.resolve(req,res,next).catch((error)=>{
            next(error)
           })
   }
}

export default asyncHandler