import express from "express";
import bodyParser from "body-parser";
import connect from "./database/currencies";


// Controllers (route handlers)
import * as blockController from "./controllers/blocks";



// Create Express server
const app = express();


// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:curr/block", blockController.getBlocks);
app.post("/:curr/block", blockController.getBlocks);


connect();


export default app;
