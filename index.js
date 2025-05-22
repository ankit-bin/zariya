import express from "express";
import cookieParser from "cookie-parser";  
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import jobRoute from "./routes/job.route.js";
import companyRoute from "./routes/company.route.js";
import applicationRoute from "./routes/application.route.js";

dotenv.config({}); 

const app = express();




//middle ware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

const corsOptions = {
  origin: "", ///kotlin app url
    credentials: true,
}
app.use(cors(corsOptions)); 


const PORT =  process.env.PORT || 3000;



// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

//



app.listen(PORT, () => {
    connectDB(); // Connect to the database when the server starts
    console.log(`Server is running on http://localhost:${PORT}`);
})
 
