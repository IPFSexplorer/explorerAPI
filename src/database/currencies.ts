import IdentityProvider from "orbit-db-identity-provider";
import IPFSconnector from "explorer-core/src/ipfs/IPFSConnector";
import Database from "explorer-core/src/database/DAL/database/databaseStore";
import Protector from "libp2p-pnet";
import { DbSyncStrategy } from "explorer-core/src/database/DAL/database/DbConnectOptions";

export class Currency {
    unit = "";
    name = "";

    constructor(init?: Partial<Currency>) {
        Object.assign(this, init);
    }

    get databaseName() {
        return this.unit.toUpperCase() + "_DB";
    }
}

export const EnabledCurrencies = [
    new Currency({
        name: "Bitcoin",
        unit: "Btc",
    }),
    new Currency({
        name: "Etheruem",
        unit: "Eth",
    }),
    new Currency({
        name: "DigiByte",
        unit: "dgb",
    }),
    new Currency({
        name: "Decred",
        unit: "Dcr",
    }),
];

export default async function connect() {
    IPFSconnector.setConfig({
        repo: "explroerAPI",
        config: {
            Addresses: {
                Swarm: [
                    "/ip4/0.0.0.0/tcp/" + process.env.tcpPort,
                    "/ip4/127.0.0.1/tcp/" + process.env.wsPort + "/ws",
                    "/dns4/kancel.mucka.sk/tcp/19091/ws/p2p-webrtc-star",
                    "/dns4/kancel.mucka.sk/tcp/19090/ws/p2p-websocket-star",
                ],
            },
        },
        libp2p: {
            modules: {
                connProtector: new Protector(`/key/swarm/psk/1.0.0/
/base16/
30734f1804abb36a803d0e9f1a31ffe5851b6df1445bf23f96fd3fe8fbc9e793`),
            },
            config: {
                pubsub: {
                    emitSelf: false,
                },
            },
        },
    });


    const identity = await IdentityProvider.createIdentity({
        id: (await (await IPFSconnector.getInstanceAsync()).node.id()).id,
    });

    for (const curr of EnabledCurrencies) {
        console.log("Connect to " + curr.databaseName);
        Database.connect(curr.databaseName, identity, { syncStrategy: DbSyncStrategy.replace });
    }
}