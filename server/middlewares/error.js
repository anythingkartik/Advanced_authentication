//Making a class for error handling, Error is already a class in JS, so we are extending it to make our own class
//extends the built in Error class because Error class has only message and no parameter for statuscoe
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
}
}

//Middleware to handle errors, it takes 4 parameters, err is the error, req is the request, res is the response and next is the next middleware
export const errorMiddleware=(err,req,res,next)=> {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    //console.log(err)- if you do this then the erro name and its code will be displayed in the terminal

    //Mongoose bad object id error
    if(err.name === "CastError") {
        const message = `Invalid ${err.path}`;
        err= new ErrorHandler(message, 400)
    }

    if(err.name ==="JsonWebTokenError") {
        const message = "Invalid Token";
        err = new ErrorHandler(message, 400);
    }

    if(err.name ==="TokenExpiredError") {
        const message = "Token expired";
        err = new ErrorHandler(message, 400);
    }
    //Duplicate key error- this code comes when we try to enter a value that is already present in the database
    if(err.code===11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err= new ErrorHandler(message, 400);
    }

//we are returning the response in json format because we are using the API.
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

//exporting the class so that we can use it in other files
export default ErrorHandler;