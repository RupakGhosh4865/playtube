class apierror extends error{
    constructor(message="something went wrong",
    statuscode,
    errors= [],
    stack =""
        ){
        super (message)
        this.statuscode = statuscode
        this.data =null
        this.message =message
        this.success =false;
        this.errors =errors
    

    if (stack){
        this.stack =stack
    } else{
        error.captureStackTrace(this, this.constructor)
    }
}
}
 export  {apierror}