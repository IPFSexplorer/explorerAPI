import { Response, Request } from "express";
import parseParams from "../util/paramsToQuery";
import Block from "explorer-core/src/models/Block";
import Database from "explorer-core/src/database/DAL/database/databaseStore";
import { Currency } from "../database/currencies";
import logger from "explorer-core/src/logger";



export const getBlocks = (req: Request, res: Response) => {
    try {
        Database.use(new Currency({ unit: req.params.curr }).databaseName).execute(async () => {
            const params = parseParams(req);
            res.json(await params.toQuery(new Block()));
        });
    } catch (e) {
        logger.error(e);
    }
};

