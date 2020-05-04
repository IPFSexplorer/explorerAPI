import { Request } from "express";
import Queriable from "explorer-core/src/database/DAL/query/queriable";
import PropertyCondition from "explorer-core/src/database/DAL/conditions/propertyCondition";
import greatherThan from "explorer-core/src/database/DAL/conditions/comparators/greatherThan";
import lessThan from "explorer-core/src/database/DAL/conditions/comparators/lessThan";
import between from "explorer-core/src/database/DAL/conditions/comparators/between";
import { makeFunctionFromString } from "explorer-core/src/common";
import equal from "explorer-core/src/database/DAL/conditions/comparators/equal";

type condition = {
    type: string;
    comparator: string;
    property: string;
    values: any[];
}

type resolver = {
    type: string;
    params: { limit: number; page: number; perPage: number};
}

export class RequestParams {
    private resolver: resolver;
    private conditions: condition[] = [];
    private filters: string[] = [];
    private skip: number;



    constructor(init?: Partial<RequestParams>) {
        Object.assign(this, init);
    }


    public async toQuery(entity: Queriable<any>) {
        for (const condition of this.conditions) {
            const cond = new PropertyCondition(condition.property, entity.queryPlanner);
            switch (condition.comparator) {
                case "greaterThan":
                    cond.comparator = new greatherThan(
                        condition.property,
                        condition.values[0],
                        entity.constructor.name,
                    );
                    break;
                case "lessThan":
                    cond.comparator = new lessThan(
                        condition.property,
                        condition.values[0],
                        entity.constructor.name,
                    );
                    break;
                case "equal":
                    cond.comparator = new equal(
                        condition.property,
                        condition.values[0],
                        entity.constructor.name,
                    );
                    break;
                case "between":
                    cond.comparator = new between(
                        condition.property,
                        {
                            min: condition.values[0],
                            max: condition.values[1]
                        },
                        entity.constructor.name,
                    );
                    break;
                default:
                    throw Error("bad condition comparator");
            }
          
            switch (condition.type) {
                case "and":
                    entity.queryPlanner.addAndCondition(cond);
                    break;
                case "or":
                    entity.queryPlanner.addOrCondition(cond);
                    break;
                default:
                    throw Error("bad condition type");
            }
        }

        for (const filter of this.filters) {
            entity.queryPlanner.addFilter(makeFunctionFromString(filter));
        }

        if (this.skip) {
            entity.skip(this.skip);
        }

        switch (this.resolver.type) {
            case "all":
                return await Promise.all(await entity.all());
            case "first":
                return await entity.first();
            case "take":
                return await Promise.all(await entity.take(this.resolver.params.limit));
            case "paginate":
                return (await entity.paginate(this.resolver.params.perPage))[Symbol.asyncIterator]().next();
            default:
                throw Error("bad resolver");
        }
    }
}

export default function parseParams(req: Request) {
    if (req.method.toLowerCase() === "get") {
        return new RequestParams(req.query.query);
    } else if (req.method.toLowerCase() === "post") {
        return new RequestParams(req.body.query);
    } 
    throw Error("method not supported");
}