//we set server as our main file in package.json
//since we used "type": "module" in package.json, we can use import instead of require 
//with module we have to import file with the respective extension(.js, .ts)

import dotenv from "dotenv";
dotenv.config({ path: "./config.env" }); 

import {app} from "./app.js";

 

app.listen(process.env.PORT, () =>{
    console.log(`Server listening on port ${process.env.PORT}`);
});