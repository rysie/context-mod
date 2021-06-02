import Action, {ActionJSONConfig, ActionConfig, ActionOptions} from "./index";
import Snoowrap, {Comment} from "snoowrap";
import Submission from "snoowrap/dist/objects/Submission";
import dayjs, {Dayjs} from "dayjs";
import {renderContent} from "../Utils/SnoowrapUtils";

export const WIKI_DESCRIM = 'wiki:';

export class CommentAction extends Action {
    content: string;
    hasWiki: boolean;
    wiki?: string;
    wikiFetched?: Dayjs;
    lock: boolean = false;
    sticky: boolean = false;
    distinguish: boolean = false;
    name?: string = 'Comment';

    constructor(options: CommentActionOptions) {
        super(options);
        const {
            content,
            lock = false,
            sticky = false,
            distinguish = false,
        } = options;
        this.hasWiki = content.trim().substring(0, WIKI_DESCRIM.length) === WIKI_DESCRIM;
        this.content = content;
        if (this.hasWiki) {
            this.wiki = this.content.trim().substring(WIKI_DESCRIM.length);
        }
        this.lock = lock;
        this.sticky = sticky;
        this.distinguish = distinguish;
    }

    async handle(item: Comment | Submission, client: Snoowrap): Promise<void> {
        if (this.hasWiki && (this.wikiFetched === undefined || Math.abs(dayjs().diff(this.wikiFetched, 'minute')) > 5)) {
            try {
                const wiki = item.subreddit.getWikiPage(this.wiki as string);
                this.content = await wiki.content_md;
                this.wikiFetched = dayjs();
            } catch (err) {
                this.logger.error(err);
                throw new Error(`Could not read wiki page. Please ensure the page '${this.wiki}' exists and is readable`);
            }
        }
        // @ts-ignore
        const reply: Comment = await item.reply(renderContent(this.content, item));
        if (this.lock && item instanceof Submission) {
            // @ts-ignore
            await item.lock();
        }
        if (this.distinguish) {
            // @ts-ignore
            await reply.distinguish({sticky: this.sticky});
        }
    }
}

export interface CommentActionConfig {
    content: string,
    lock?: boolean,
    sticky?: boolean,
    distinguish?: boolean,
}

export interface CommentActionOptions extends CommentActionConfig,ActionOptions {
}

export interface CommentActionJSONConfig extends CommentActionConfig, ActionJSONConfig {

}
