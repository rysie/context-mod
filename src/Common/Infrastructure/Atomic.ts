import {ActivityType} from "./Reddit";

/**
 * A duration and how to compare it against a value
 *
 * The syntax is `(< OR > OR <= OR >=) <number> <unit>` EX `> 100 days`, `<= 2 months`
 *
 * * EX `> 100 days` => Passes if the date being compared is before 100 days ago
 * * EX `<= 2 months` => Passes if the date being compared is after or equal to 2 months
 *
 * Unit must be one of [DayJS Duration units](https://day.js.org/docs/en/durations/creating)
 *
 * [See] https://regexr.com/609n8 for example
 *
 * @pattern ^\s*(>|>=|<|<=)\s*(\d+)\s*(days|weeks|months|years|hours|minutes|seconds|milliseconds)\s*$
 * */

export type DurationComparor = string;

/**
 * A relative datetime description
 *
 * May be either:
 *
 * * day of the week (monday, tuesday, etc...)
 * * cron expression IE `* * 15 *`
 *
 * See https://crontab.guru/ for generating expressions
 *
 * https://regexr.com/6u3cc
 *
 * @pattern ((?:(?:(?:(?:\d+,)+\d+|(?:\d+(?:\/|-|#)\d+)|\d+L?|\*(?:\/\d+)?|L(?:-\d+)?|\?|[A-Z]{3}(?:-[A-Z]{3})?) ?){5,7})$)|(mon|tues|wed|thurs|fri|sat|sun){1}
 * */
export type RelativeDateTimeMatch = string;

/**
 * A string containing a comparison operator and a value to compare against
 *
 * The syntax is `(< OR > OR <= OR >=) <number>[percent sign]`
 *
 * * EX `> 100`  => greater than 100
 * * EX `<= 75%` => less than or equal to 75%
 *
 * @pattern ^\s*(>|>=|<|<=)\s*((?:\d+)(?:(?:(?:.|,)\d+)+)?)\s*(%?)(.*)$
 * */
export type CompareValueOrPercent = string;
export type StringOperator = '>' | '>=' | '<' | '<=';
/**
 * A string containing a comparison operator and a value to compare against
 *
 * The syntax is `(< OR > OR <= OR >=) <number>`
 *
 * * EX `> 100`  => greater than 100
 *
 * @pattern ^\s*(>|>=|<|<=)\s*(\d+)\s*(%?)(.*)$
 * */
export type CompareValue = string;
/**
 * A shorthand value for a DayJS duration consisting of a number value and time unit
 *
 * * EX `9 days`
 * * EX `3 months`
 * @pattern ^\s*(?<time>\d+)\s*(?<unit>days?|weeks?|months?|years?|hours?|minutes?|seconds?|milliseconds?)\s*$
 * */
export type DayJSShorthand = string;
/**
 * An ISO 8601 Duration
 * @pattern ^(-?)P(?=\d|T\d)(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)([DW]))?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$
 * */
export type ISO8601 = string;
export type DurationString = DayJSShorthand | ISO8601;
export type DurationVal = DurationString | DurationObject;

/**
 * A [Day.js duration object](https://day.js.org/docs/en/durations/creating)
 *
 * @examples [{"minutes": 30, "hours": 1}]
 * @minProperties 1
 * @additionalProperties false
 * */
export interface DurationObject {
    /**
     * @examples [15]
     * */
    seconds?: number
    /**
     * @examples [50]
     * */
    minutes?: number
    /**
     * @examples [4]
     * */
    hours?: number
    /**
     * @examples [7]
     * */
    days?: number
    /**
     * @examples [2]
     * */
    weeks?: number
    /**
     * @examples [3]
     * */
    months?: number
    /**
     * @examples [0]
     * */
    years?: number
}

export type JoinOperands = 'OR' | 'AND';
export type PollOn = 'unmoderated' | 'modqueue' | 'newSub' | 'newComm';
export type ModeratorNames = 'self' | 'automod' | 'automoderator' | string;
export type Invokee = 'system' | 'user';
export type RunState = 'running' | 'paused' | 'stopped';
/**
 * Available cache providers
 * */
export type CacheProvider = 'memory' | 'redis' | 'none';
export type NotificationProvider = 'discord';
export type NotificationEventType = 'runStateChanged' | 'pollingError' | 'eventActioned' | 'configUpdated'

export interface ModeratorNameCriteria {
    behavior?: 'include' | 'exclude'
    name: ModeratorNames | ModeratorNames[]
}

export type StatisticFrequency = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export const statFrequencies: StatisticFrequency[] = ['minute', 'hour', 'day', 'week', 'month', 'year'];
export type StatisticFrequencyOption = StatisticFrequency | false;
export type EventRetentionPolicyRange = DurationVal | number;
export type RedditEntityType = 'user' | 'subreddit';

export interface RedditEntity {
    name: string
    type: RedditEntityType
}

export type SearchFacetType = 'title' | 'url' | 'duplicates' | 'crossposts' | 'external';
export type FilterBehavior = 'include' | 'exclude'
export type GotoPath = `goto:${string}`;
/**
 * Possible outputs to store event details to
 * */
export type RecordOutputType = 'database' | 'influx';
export const recordOutputTypes: RecordOutputType[] = ['database', 'influx'];
/**
 * Possible options for output:
 *
 * * true -> store to all
 * * false -> store to none
 * * string -> store to this one output
 * * list -> store to these specified outputs
 * */
export type RecordOutputOption = boolean | RecordOutputType | RecordOutputType[]
/**
 * The possible behaviors that can occur after a check has run
 *
 * * next => continue to next Check/Run
 * * stop => stop CM lifecycle for this activity (immediately end)
 * * nextRun => skip any remaining Checks in this Run and start the next Run
 * * goto:[path] => specify a run[.check] to jump to
 *
 * */
export type PostBehaviorType = 'next' | 'stop' | 'nextRun' | string;
export type onExistingFoundBehavior = 'replace' | 'skip' | 'ignore';
export type ActionTarget = 'self' | 'parent';
export type ArbitraryActionTarget = ActionTarget | string;
export type InclusiveActionTarget = ActionTarget | 'any';
export const SOURCE_POLL = 'poll';
export type SourcePollStr = 'poll';
export const SOURCE_DISPATCH = 'dispatch';
export type SourceDispatchStr = 'dispatch';
export const SOURCE_USER = 'user';
export type SourceUserStr = 'user';

export type DispatchSourceValue = SourceDispatchStr | `dispatch:${string}`;
export type NonDispatchActivitySourceValue = SourcePollStr | `poll:${PollOn}` | SourceUserStr | `user:${string}`;
export type ActivitySourceTypes = SourcePollStr | SourceDispatchStr | SourceUserStr; // TODO
// https://github.com/YousefED/typescript-json-schema/issues/426
// https://github.com/YousefED/typescript-json-schema/issues/425
// @pattern ^(((poll|dispatch)(:\w+)?)|user)$
// @type string
/**
 * Where an Activity was retrieved from
 *
 * Source can be any of:
 *
 * * `poll` => activity was retrieved from polling a queue (unmoderated, modqueue, etc...)
 * * `poll:[pollSource]` => activity was retrieved from specific polling source IE `poll:unmoderated` activity comes from unmoderated queue
 * * `dispatch` => activity is from Dispatch Action
 * * `dispatch:[identifier]` => activity is from Dispatch Action with specific identifier
 * * `user` => activity was from user input (web dashboard)
 *
 *
 * */
export type ActivitySourceValue = NonDispatchActivitySourceValue | DispatchSourceValue;

export interface ActivitySourceData {
    type: ActivitySourceTypes
    identifier?: string
}

export type ConfigFormat = 'json' | 'yaml';
export type ActionTypes =
    'comment'
    | 'submission'
    | 'lock'
    | 'remove'
    | 'report'
    | 'approve'
    | 'ban'
    | 'flair'
    | 'usernote'
    | 'message'
    | 'userflair'
    | 'dispatch'
    | 'cancelDispatch'
    | 'contributor'
    | 'modnote';

/**
 * Test the calculated VADER sentiment (compound) score for an Activity using this comparison. Can be either a numerical or natural language
 *
 * Sentiment values range from extremely negative to extremely positive in a numerical range of -1 to +1:
 *
 * * -0.6 => extremely negative
 * * -0.3 => very negative
 * * -0.1 => negative
 * *    0 => neutral
 * *  0.1 => positive
 * *  0.3 => very positive
 * *  0.6 => extremely positive
 *
 * The below examples are all equivocal. You can use either set of values as the value for `sentiment` (numerical comparisons or natural langauge)
 *
 * * `>= 0.1` = `is positive`
 * * `<= 0.3` = `is very negative`
 * * `< 0.1` = `is not positive`
 * * `> -0.3` = `is not very negative`
 *
 * Special case:
 *
 * * `is neutral` equates to `> -0.1 and < 0.1`
 * * `is not neutral` equates to `< -0.1 or > 0.1`
 *
 * ContextMod uses a normalized, weighted average from these sentiment tools:
 *
 * * NLP.js (english, french, german, and spanish) https://github.com/axa-group/nlp.js/blob/master/docs/v3/sentiment-analysis.md
 * * (english only) vaderSentiment-js https://github.com/vaderSentiment/vaderSentiment-js/
 * * (english only) wink-sentiment https://github.com/winkjs/wink-sentiment
 *
 * More about the sentiment algorithms used:
 * * VADER https://github.com/cjhutto/vaderSentiment
 * * AFINN http://corpustext.com/reference/sentiment_afinn.html
 * * Senticon https://ieeexplore.ieee.org/document/8721408
 * * Pattern https://github.com/clips/pattern
 * * wink https://github.com/winkjs/wink-sentiment
 *
 * @pattern ((>|>=|<|<=)\s*(-?\d?\.?\d+))|((not)?\s*(very|extremely)?\s*(positive|neutral|negative))
 * @examples ["is negative", "> 0.2"]
 * */
export type VaderSentimentComparison = string;

export type ModUserNoteLabel =
    'BOT_BAN'
    | 'PERMA_BAN'
    | 'BAN'
    | 'ABUSE_WARNING'
    | 'SPAM_WARNING'
    | 'SPAM_WATCH'
    | 'SOLID_CONTRIBUTOR'
    | 'HELPFUL_USER';

export const modUserNoteLabels = ['BOT_BAN', 'PERMA_BAN', 'BAN', 'ABUSE_WARNING', 'SPAM_WARNING', 'SPAM_WATCH', 'SOLID_CONTRIBUTOR', 'HELPFUL_USER'];

export type ModActionType =
    'INVITE' |
    'NOTE' |
    'REMOVAL' |
    'SPAM' |
    'APPROVAL';

export type UserNoteType =
    'gooduser' |
    'spamwatch' |
    'spamwarn' |
    'abusewarn' |
    'ban' |
    'permban' |
    'botban' |
    string;

export const userNoteTypes = ['gooduser', 'spamwatch', 'spamwarn', 'abusewarn', 'ban', 'permban', 'botban'];

export type ConfigFragmentParseFunc = (data: object, fetched: boolean, subreddit?: string) => object | object[];

export interface WikiContext {
    wiki: string
    subreddit?: string
}

export interface ExternalUrlContext {
    url: string
}

export interface UrlContext {
    value: string
    context: WikiContext | ExternalUrlContext
}

export interface ImageHashCacheData {
    original?: string
    flipped?: string
}

// https://www.reddit.com/message/compose?to=/r/mealtimevideos&message=https://www.reddit.com/r/ContextModBot/comments/otz396/introduction_to_contextmodbot

export interface BaseTemplateData {
    botLink: string
    modmailLink?: string
    manager?: string
    check?: string
    //[key: string]: any
}

export interface ActivityTemplateData {
    kind: ActivityType
    author: string
    votes: number
    age: string
    permalink: string
    id: string
    subreddit: string
    title: string
    shortTitle: string
}

export interface ModdedActivityTemplateData {
    reports: number
    modReports: number
    userReports: number
}

export interface SubmissionTemplateData extends ActivityTemplateData, Partial<ModdedActivityTemplateData> {
    nsfw: boolean
    spoiler: boolean
    op: boolean
    upvoteRatio: string
    url: string
}

export interface CommentTemplateData extends ActivityTemplateData, Partial<ModdedActivityTemplateData> {
    op: boolean
}

export interface SubredditTemplateData {
    subredditBreakdownFormatted: string
    subredditBreakdown?: {
        totalFormatted: string
        submissionFormatted: string
        commentFormatted: string
    }
}

export interface RuleResultTemplateData {
    kind: string
    triggered: boolean
    result: string
    [key: string]: any
}

export interface ActionResultTemplateData {
    kind: string
    success: boolean
    result: string
    [key: string]: any
}

export interface ActionResultsTemplateData {
    actionSummary: string
    actions: {
        [key: string]: ActionResultTemplateData
    }
}

export interface RuleResultsTemplateData {
    ruleSummary: string
    rules: {
        [key: string]: RuleResultTemplateData
    }
}

export interface GenericContentTemplateData extends BaseTemplateData, Partial<RuleResultsTemplateData>, Partial<ActionResultsTemplateData> {
    item?: (SubmissionTemplateData | CommentTemplateData)
}
