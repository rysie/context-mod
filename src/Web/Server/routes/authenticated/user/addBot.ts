import {Request, Response} from 'express';
import {BotInstanceConfig} from "../../../../../Common/interfaces";
import {authUserCheck} from "../../../middleware";
import Bot from "../../../../../Bot";
import LoggedError from "../../../../../Utils/LoggedError";
import {open} from 'fs/promises';
import {buildBotConfig} from "../../../../../ConfigBuilder";

const addBot = () => {

    const middleware = [
        authUserCheck(),
    ];

    const response = async (req: Request, res: Response) => {

        if (!req.user?.isInstanceOperator(req.app)) {
            return res.status(401).send("Must be an Operator to use this route");
        }

        if (!req.botApp.fileConfig.isWriteable) {
            return res.status(409).send('Operator config is not writeable');
        }

        const {overwrite = false, ...botData} = req.body;

        // check if bot is new or overwriting
        let existingBot = req.botApp.bots.find(x => x.botAccount === botData.name);
        // spin down existing
        if (existingBot !== undefined) {
            const {
                bots: botsFromConfig = []
            } = req.botApp.fileConfig.document.toJS();
            if (botsFromConfig.length === 0 || !botsFromConfig.some(x => x.name === botData.name)) {
                req.botApp.logger.warn('Overwriting existing bot with the same name BUT this bot does not exist in the operator CONFIG FILE. You should check how you have provided config before next start or else this bot may be started twice (once from file, once from arg/env)');
            }

            await existingBot.destroy('system');
            const existingBotIndex = req.botApp.bots.findIndex(x => x.botAccount === botData.name);
            req.botApp.bots.splice(existingBotIndex, 1);
        }

        req.botApp.fileConfig.document.addBot(botData);

        const handle = await open(req.botApp.fileConfig.document.location as string, 'w');
        await handle.writeFile(req.botApp.fileConfig.document.toString());
        await handle.close();

        const newBot = new Bot(buildBotConfig(botData, req.botApp.config), req.botApp.logger);
        req.botApp.bots.push(newBot);
        let result: any = {stored: true, success: true};
        try {
            if (newBot.error !== undefined) {
                result.error = newBot.error;
                return res.status(500).json(result);
            }
            await newBot.init();
            // return response early so client doesn't have to wait for all managers to be built
            res.json(result);
        } catch (err: any) {
            result.success = false;
            if (newBot.error === undefined) {
                newBot.error = err.message;
                result.error = err.message;
            }
            req.botApp.logger.error(`Bot ${newBot.botName} cannot recover from this error and must be re-built`);
            if (!err.logged || !(err instanceof LoggedError)) {
                req.botApp.logger.error(err);
            }
        }

        try {
            await newBot.buildManagers();
            newBot.runManagers('system').catch((err) => {
                req.botApp.logger.error(`Unexpected error occurred while running Bot ${newBot.botName}. Bot must be re-built to restart`);
                if (!err.logged || !(err instanceof LoggedError)) {
                    req.botApp.logger.error(err);
                }
            });
        } catch (err: any) {
            req.botApp.logger.error(`Bot ${newBot.botName} cannot recover from this error and must be re-built`);
            if (!err.logged || !(err instanceof LoggedError)) {
                req.botApp.logger.error(err);
            }
        }
        return;
    }
    return [...middleware, response];
}

export default addBot;
