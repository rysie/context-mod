import Snoowrap, {Listing, RedditUser} from "snoowrap";
import {Submission, Subreddit, Comment} from "snoowrap/dist/objects";
import {parseSubredditName} from "../util";
import {ModUserNoteLabel} from "../Common/Infrastructure/Atomic";
import {CreateModNoteData, ModNote, ModNoteRaw, ModNoteSnoowrapPopulated} from "../Subreddit/ModNotes/ModNote";
import {SimpleError} from "./Errors";

// const proxyFactory = (endpoint: string) => {
//     return class ProxiedSnoowrap extends Snoowrap {
//         rawRequest(options: any) {
//             // send all requests through a proxy
//             return super.rawRequest(Object.assign(options, {
//                 proxy: endpoint,
//                 tunnel: false
//             }))
//         }
//     }
// }

export interface ModNoteGetOptions {
    before?: string,
    filter?: ModUserNoteLabel,
    limit?: number
}

export interface ModNotesRaw {
    mod_notes: ModNoteSnoowrapPopulated[]
    start_cursor: string
    end_cursor: string
    has_next_page: boolean
}

export interface ModNotesResponse {
    notes: ModNote[]
    startCursor: string
    endCursor: string
    isFinished: boolean
}

export class ExtendedSnoowrap extends Snoowrap {

    constructor(args: any) {
        super(args);
        const {timeoutCodes = ['ESOCKETTIMEDOUT', 'ETIMEDOUT', 'ECONNRESET']} = args;
        // @ts-ignore
        this._config.timeoutCodes = timeoutCodes;
    }

    /**
     * https://www.reddit.com/r/redditdev/comments/jfltfx/comment/g9le48w/?utm_source=reddit&utm_medium=web2x&context=3
     * */
    async getManySubreddits(subs: (Subreddit | string)[]): Promise<Listing<Subreddit>> {
        // parse all names
        const names = subs.map(x => {
            if(typeof x !== 'string') {
                return x.display_name;
            }
            try {
                return parseSubredditName(x);
            } catch (err: any) {
                return x;
            }
        });

        return await this.oauthRequest({uri: '/api/info', method: 'get', qs: { sr_name: names.join(',')}}) as Listing<Subreddit>;
    }

    async assignUserFlairByTemplateId(options: { flairTemplateId: string, username: string, subredditName: string }): Promise<any> {
        return await this.oauthRequest({
            uri: `/r/${options.subredditName}/api/selectflair`,
            method: 'post',
            form: {
                api_type: 'json',
                name: options.username,
                flair_template_id: options.flairTemplateId,
            }
        });
    }

    async getModNotes(subreddit: Subreddit | string, user: RedditUser | string, options: ModNoteGetOptions = {limit: 100}): Promise<ModNotesResponse> {

        const authorName = typeof user === 'string' ? user : user.name;
        if(authorName === '[deleted]') {
            throw new SimpleError(`User is '[deleted]', cannot retrieve`, {isSerious: false});
        }
        const subredditName = typeof subreddit === 'string' ? subreddit : subreddit.display_name;

        const data: any = {
            subreddit: subredditName,
            user: authorName,
            ...options
        };
        const response = await this.oauthRequest({
            uri: `/api/mod/notes`,
            method: 'get',
            qs: data
        }) as ModNotesRaw;

        // TODO get all mod notes (iterate pages if has_next_page)
        return {

            // "undo" the _populate function snoowrap uses to replace user/subreddit keys with Proxies
            // because we want to store the "raw" response data when caching (where user/subreddit keys are strings) so we can construct ModNote from either api response or cache using same data
            notes: response.mod_notes.map(x => {
                return new ModNote({
                    ...x,
                    subreddit: x.subreddit.display_name,
                    user: x.user.name,
                }, this);

            }),
            startCursor: response.start_cursor,
            endCursor: response.end_cursor,
            isFinished: !response.has_next_page
        }
    }

    /**
     * Add a Mod Note
     *
     * @see https://www.reddit.com/dev/api#POST_api_mod_notes
     * */
    async addModNote(data: CreateModNoteData): Promise<ModNote> {
        const {note, label} = data;

        const requestData: any = {
            note,
            label,
            subreddit: data.subreddit.display_name,
            user: data.user.name,
        }
        if(data.activity !== undefined) {
            requestData.reddit_id = data.activity.name;
        }

        const response =await this.oauthRequest({
            uri: `/api/mod/notes`,
            method: 'post',
            form: requestData
        }) as { created: ModNoteRaw };
        return new ModNote(response.created, this);
    }
}

export class RequestTrackingSnoowrap extends ExtendedSnoowrap {
    requestCount: number = 0;

    oauthRequest(...args: any) {
        // send all requests through a proxy
        if(args[1] === undefined || args[1] === 1) {
            this.requestCount++;
        }
        // @ts-ignore
        return super.oauthRequest(...args);
    }
}

export class ProxiedSnoowrap extends RequestTrackingSnoowrap {
    proxyEndpoint: string;

    constructor(args: any) {
        super(args);
        const {proxy} = args;
        this.proxyEndpoint = proxy;
    }

    rawRequest(options: any) {
        // send all requests through a proxy
        return super.rawRequest(Object.assign(options, {
            proxy: this.proxyEndpoint,
            tunnel: false
        }))
    }
}
