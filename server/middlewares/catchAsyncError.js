// Desc: Middleware to catch async errors
// passed a function as a parameter

//.catch(next) will catch the error and pass it to the next middleware , that is the errorMiddleware in error.js file
export const catchAsyncError = (theFunction) =>{
    return (req,res,next)=>{
        Promise.resolve(theFunction(req,res,next)).catch(next); //next means simply pass the error to the middleware in the error.js file
    }
}

// a promise if any error comes come here and then passed to the errorMiddleware