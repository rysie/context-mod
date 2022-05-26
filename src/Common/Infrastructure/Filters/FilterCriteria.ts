import {CompareValue, CompareValueOrPercent, DurationComparor, ModeratorNameCriteria, ModeratorNames} from "../Atomic";

/**
 * Different attributes a `Subreddit` can be in. Only include a property if you want to check it.
 *
 * Can also set as plain string as a shorthand for `name: /subredditName/i`
 *
 * @examples [{"over18": true}, "mealtimevideos"]
 * */
export interface SubredditCriteria {
    /**
     * Is subreddit quarantined?
     * */
    quarantine?: boolean
    /**
     * Is subreddit NSFW/over 18?
     *
     * **Note**: This is **mod-controlled flag** so it is up to the mods of the subreddit to correctly mark their subreddit as NSFW
     * */
    over18?: boolean
    /**
     * The name of the subreddit.
     *
     * Can be a normal string (will check case-insensitive) or a regular expression
     *
     * EX `["mealtimevideos", "/onlyfans*\/i"]`
     *
     * @examples ["mealtimevideos", "/onlyfans*\/i"]
     * */
    name?: string | RegExp
    /**
     * A friendly description of what this State is trying to parse
     * */
    stateDescription?: string

    /**
     * Test whether the subreddit is a user profile
     * */
    isUserProfile?: boolean

    /**
     * Test whether the subreddit is the profile of the Author of the Activity being checked
     * */
    isOwnProfile?: boolean
}

export interface StrongSubredditCriteria extends SubredditCriteria {
    name?: RegExp
}

export const defaultStrongSubredditCriteriaOptions = {
    defaultFlags: 'i',
    generateDescription: true
};

export type FilterCriteriaDefaultBehavior = 'replace' | 'merge';

export interface UserNoteCriteria {
    /**
     * User Note type key to search for
     * @examples ["spamwarn"]
     * */
    type: string;
    /**
     * Number of occurrences of this type. Ignored if `search` is `current`
     *
     * A string containing a comparison operator and/or a value to compare number of occurrences against
     *
     * The syntax is `(< OR > OR <= OR >=) <number>[percent sign] [ascending|descending]`
     *
     * @examples [">= 1"]
     * @default ">= 1"
     * @pattern ^\s*(?<opStr>>|>=|<|<=)\s*(?<value>\d+)\s*(?<percent>%?)\s*(?<extra>asc.*|desc.*)*$
     * */
    count?: string;

    /**
     * How to test the notes for this Author:
     *
     * ### current
     *
     * Only the most recent note is checked for `type`
     *
     * ### total
     *
     * The `count` comparison of `type` must be found within all notes
     *
     * * EX `count: > 3`   => Must have more than 3 notes of `type`, total
     * * EX `count: <= 25%` => Must have 25% or less of notes of `type`, total
     *
     * ### consecutive
     *
     * The `count` **number** of `type` notes must be found in a row.
     *
     * You may also specify the time-based order in which to search the notes by specifying `ascending (asc)` or `descending (desc)` in the `count` value. Default is `descending`
     *
     * * EX `count: >= 3` => Must have 3 or more notes of `type` consecutively, in descending order
     * * EX `count: < 2`  => Must have less than 2 notes of `type` consecutively, in descending order
     * * EX `count: > 4 asc` => Must have greater than 4 notes of `type` consecutively, in ascending order
     *
     * @examples ["current"]
     * @default current
     * */
    search?: 'current' | 'consecutive' | 'total'
}

export const authorCriteriaProperties = ['name', 'flairCssClass', 'flairText', 'flairTemplate', 'isMod', 'userNotes', 'age', 'linkKarma', 'commentKarma', 'totalKarma', 'verified', 'shadowBanned', 'description', 'isContributor'];

/**
 * Criteria with which to test against the author of an Activity. The outcome of the test is based on:
 *
 * 1. All present properties passing and
 * 2. If a property is a list then any value from the list matching
 *
 * @minProperties 1
 * @additionalProperties false
 * @examples [{"flairText": ["Contributor","Veteran"], "isMod": true, "name": ["FoxxMD", "AnotherUser"] }]
 * */
export interface AuthorCriteria {
    /**
     * A list of reddit usernames (case-insensitive) to match against. Do not include the "u/" prefix
     *
     *  EX to match against /u/FoxxMD and /u/AnotherUser use ["FoxxMD","AnotherUser"]
     * @examples ["FoxxMD","AnotherUser"]
     * */
    name?: string[],
    /**
     * A (user) flair css class (or list of) from the subreddit to match against
     *
     * * If `true` then passes if ANY css is assigned
     * * If `false` then passes if NO css is assigned
     * @examples ["red"]
     * */
    flairCssClass?: boolean | string | string[],
    /**
     * A (user) flair text value (or list of) from the subreddit to match against
     *
     * * If `true` then passes if ANY text is assigned
     * * If `false` then passes if NO text is assigned
     *
     * @examples ["Approved"]
     * */
    flairText?: boolean | string | string[],

    /**
     * A (user) flair template id (or list of) from the subreddit to match against
     *
     * * If `true` then passes if ANY template is assigned
     * * If `false` then passed if NO template is assigned
     *
     * */
    flairTemplate?: boolean | string | string[]
    /**
     * Is the author a moderator?
     * */
    isMod?: boolean,
    /**
     * A list of UserNote properties to check against the User Notes attached to this Author in this Subreddit (must have Toolbox enabled and used User Notes at least once)
     * */
    userNotes?: UserNoteCriteria[]

    /**
     * Test the age of the Author's account (when it was created) against this comparison
     *
     * The syntax is `(< OR > OR <= OR >=) <number> <unit>`
     *
     * * EX `> 100 days` => Passes if Author's account is older than 100 days
     * * EX `<= 2 months` => Passes if Author's account is younger than or equal to 2 months
     *
     * Unit must be one of [DayJS Duration units](https://day.js.org/docs/en/durations/creating)
     *
     * [See] https://regexr.com/609n8 for example
     *
     * @pattern ^\s*(>|>=|<|<=)\s*(\d+)\s*(days?|weeks?|months?|years?|hours?|minutes?|seconds?|milliseconds?)\s*$
     * */
    age?: DurationComparor

    /**
     * A string containing a comparison operator and a value to compare link karma against
     *
     * The syntax is `(< OR > OR <= OR >=) <number>[percent sign]`
     *
     * * EX `> 100`  => greater than 100 link karma
     * * EX `<= 75%` => link karma is less than or equal to 75% of **all karma**
     *
     * @pattern ^\s*(>|>=|<|<=)\s*(\d+)\s*(%?)(.*)$
     * */
    linkKarma?: CompareValueOrPercent

    /**
     * A string containing a comparison operator and a value to compare karma against
     *
     * The syntax is `(< OR > OR <= OR >=) <number>[percent sign]`
     *
     * * EX `> 100`  => greater than 100 comment karma
     * * EX `<= 75%` => comment karma is less than or equal to 75% of **all karma**
     *
     * @pattern ^\s*(>|>=|<|<=)\s*(\d+)\s*(%?)(.*)$
     * */
    commentKarma?: CompareValueOrPercent

    totalKarma?: CompareValue

    /**
     * Does Author's account have a verified email?
     * */
    verified?: boolean

    /**
     * Is the author shadowbanned?
     *
     * This is determined by trying to retrieve the author's profile. If a 404 is returned it is likely they are shadowbanned
     * */
    shadowBanned?: boolean

    /**
     * An (array of) string/regular expression to test contents of an Author's profile description against
     *
     * If no flags are specified then the **insensitive** flag is used by default
     *
     * If using an array then if **any** value in the array passes the description test passes
     *
     * @examples [["/test$/i", "look for this string literal"]]
     * */
    description?: string | string[]

    /**
     * Is the author an approved user (contributor)?
     * */
    isContributor?: boolean
} // properties calculated/derived by CM -- not provided as plain values by reddit
export interface ActivityState {
    /**
     * * true/false => test whether Activity is removed or not
     * * string or list of strings => test which moderator removed this Activity
     * */
    removed?: boolean | ModeratorNames | ModeratorNames[] | ModeratorNameCriteria
    filtered?: boolean
    deleted?: boolean
    locked?: boolean
    spam?: boolean
    stickied?: boolean
    distinguished?: boolean
    /**
     * * true/false => test whether Activity is approved or not
     * * string or list of strings => test which moderator approved this Activity
     * */
    approved?: boolean | ModeratorNames | ModeratorNames[] | ModeratorNameCriteria
    score?: CompareValue
    /**
     * A string containing a comparison operator and a value to compare against
     *
     * The syntax is `(< OR > OR <= OR >=) <number>`
     *
     * * EX `> 2`  => greater than 2 total reports
     *
     * Defaults to TOTAL reports on an Activity. Suffix the value with the report type to check that type:
     *
     * * EX `> 3 mod` => greater than 3 mod reports
     * * EX `>= 1 user` => greater than 1 user report
     *
     * @pattern ^\s*(>|>=|<|<=)\s*(\d+)\s*(%?)(.*)$
     * */
    reports?: CompareValue
    age?: DurationComparor
    /**
     * Test whether the activity is present in dispatched/delayed activities
     *
     * NOTE: This is DOES NOT mean that THIS activity is from dispatch -- just that it exists there. To test whether THIS activity is from dispatch use `source`
     *
     * * `true` => activity exists in delayed activities
     * * `false` => activity DOES NOT exist in delayed activities
     * * `string` => activity exists in delayed activities with given identifier
     * * `string[]` => activity exists in delayed activities with any of the given identifiers
     *
     * */
    dispatched?: boolean | string | string[]


    // can use ActivitySource | ActivitySource[] here because of issues with generating json schema, see ActivitySource comments
    /**
     * Test where the current activity was sourced from.
     *
     * A source can be any of:
     *
     * * `poll` => activity was retrieved from polling a queue (unmoderated, modqueue, etc...)
     * * `poll:[pollSource]` => activity was retrieved from specific polling source IE `poll:unmoderated` activity comes from unmoderated queue
     *   * valid sources: unmoderated modqueue newComm newSub
     * * `dispatch` => activity is from Dispatch Action
     * * `dispatch:[identifier]` => activity is from Dispatch Action with specific identifier
     * * `user` => activity was from user input (web dashboard)
     *
     * */
    source?: string | string[]
}

/**
 * Different attributes a `Submission` can be in. Only include a property if you want to check it.
 * @examples [{"over_18": true, "removed": false}]
 * */
export interface SubmissionState extends ActivityState {
    pinned?: boolean
    spoiler?: boolean
    /**
     * NSFW
     * */
    over_18?: boolean
    is_self?: boolean
    /**
     * A valid regular expression to match against the title of the submission
     * */
    title?: string

    /**
     * * If `true` then passes if flair has ANY text
     * * If `false` then passes if flair has NO text
     * */
    link_flair_text?: boolean | string | string[]
    /**
     * * If `true` then passes if flair has ANY css
     * * If `false` then passes if flair has NO css
     * */
    link_flair_css_class?: boolean | string | string[]
    /**
     * * If `true` then passes if there is ANY flair template id
     * * If `false` then passes if there is NO flair template id
     * */
    flairTemplate?: boolean | string | string[]
    /**
     * Is the submission a reddit-hosted image or video?
     * */
    isRedditMediaDomain?: boolean
}

export const cmActivityProperties = ['submissionState', 'score', 'reports', 'removed', 'deleted', 'filtered', 'age', 'title'];

/**
 * Different attributes a `Comment` can be in. Only include a property if you want to check it.
 * @examples [{"op": true, "removed": false}]
 * */
export interface CommentState extends ActivityState {
    /**
     * Is this Comment Author also the Author of the Submission this comment is in?
     * */
    op?: boolean
    /**
     * A list of SubmissionState attributes to test the Submission this comment is in
     * */
    submissionState?: SubmissionState[]

    /**
     * The (nested) level of a comment.
     *
     * * 0 mean the comment is at top-level (replying to submission)
     * * non-zero, Nth value means the comment has N parent comments
     * */
    depth?: DurationComparor
}

export type TypedActivityState = SubmissionState | CommentState;
export type TypedActivityStates = TypedActivityState[];
export type RequiredAuthorCrit = Required<AuthorCriteria>;