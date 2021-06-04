# reddit-context-bot

[![Latest Release](https://img.shields.io/github/v/release/foxxmd/reddit-context-bot)](https://github.com/FoxxMD/reddit-context-bot/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Pulls](https://img.shields.io/docker/pulls/foxxmd/reddit-context-bot)](https://hub.docker.com/r/foxxmd/reddit-context-bot)

**Context Bot** is an event-based, [reddit](https://reddit.com) moderation bot built on top of [snoowrap](https://github.com/not-an-aardvark/snoowrap) and written in [typescript](https://www.typescriptlang.org/).

It is designed to help fill in the gaps for [automoderator](https://www.reddit.com/wiki/automoderator/full-documentation) in regard to more complex behavior with a focus on **user-history based moderation.**

An example of the above that Context Bot can do now:

> * On a new submission, check if the user has also posted the same link in **N** number of other subreddits within a timeframe/# of posts
> * On a new submission or comment, check if the user has had any activity (sub/comment) in **N** set of subreddits within a timeframe/# of posts
>
>In either instance Context Bot can then perform any action a moderator can (comment, report, remove, lock, etc...) against that user, comment, or submission.

Some feature highlights:
* Simple rule-action behavior can be combined to create any level of complexity in behavior
* One instance can handle managing many subreddits (as many as it has moderator permissions in!)
* Per-subreddit configuration is handled by JSON stored in the subreddit wiki
* Any text-based actions (comment, submission, message, etc...) can be configured via a wiki page or raw text in JSON
* All text-based actions support [mustache](https://mustache.github.io) templating
* History-based rules support multiple "valid window" types -- [ISO 8601 Durations](https://en.wikipedia.org/wiki/ISO_8601#Durations), [Day.js Durations](https://day.js.org/docs/en/durations/creating), and submission/comment count limits.
* All rules support skipping behavior based on author criteria -- name, css flair/text, and moderator status
* Docker container support *(coming soon...)*

# Table of Contents

* [How It Works](#how-it-works)
* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)

### How It Works

Context Bot's configuration is made up of an array of **Checks**. Each **Check** consists of :

#### Kind

Is this check for a submission or comment?

#### Rules

A list of **Rule** objects to run against the activity. If **any** Rule object is triggered by the activity then the Check runs its **Actions**

#### Actions

A list of **Action** objects that describe what the bot should do with the activity or author of the activity. The bot will run **all** Actions in this list.

___

The **Checks** for a subreddit are split up into **Submission Checks** and **Comment Checks** based on their **kind**. Each list of checks is run independently based on when events happen (submission or comment).

When an event occurs all Checks of that type are run in the order they were listed in the configuration. When one check is triggered (an action is performed) the remaining checks will not be run.

## Installation


### Locally

Clone this repository somewhere and then install from the working directory

```bash
git clone https://github.com/FoxxMD/reddit-context-bot.git .
cd reddit-context-bot
npm install
```

### [Docker](https://hub.docker.com/r/foxxmd/reddit-context-bot)

```
foxxmd/reddit-context-bot:latest
```

Adding [**environmental variables**](#usage) to your `docker run` command will pass them through to the app EX:
```
docker run -e "CLIENT_ID=myId" ... foxxmd/reddit-context-bot
```

## Configuration

Context Bot's [configuration schema](/src/Schema/App.json) conforms to [JSON Schema](https://json-schema.org/) Draft 7.

I suggest using [Atlassian JSON Schema Viewer](https://json-schema.app/start) ([direct link](https://json-schema.app/view/%23?url=https%3A%2F%2Fraw.githubusercontent.com%2FFoxxMD%2Freddit-context-bot%2Fmaster%2Fsrc%2FSchema%2FApp.json)) so you can view all documentation while also interactively writing and validating your config! From there you can drill down into any object, see its requirements, view an example JSON document, and live-edit your configuration on the right-hand side.

### Example Config

Below is a configuration fulfilling the example given at the start of this readme:

<details>
  <summary>Click to expand configuration</summary>

```json
{
  "checks": [
    {
      "name": "repeatSpam",
      "kind": "submission",
      "rules": [
        {
          "kind": "repeatSubmission",
          "gapAllowance": 2,
          "threshold": 10
        }
      ],
      "actions": [
        {
          "kind": "remove"
        },
        {
          "kind": "comment",
          "content": "Thank you for your submission but we do not allow mass crossposting. Your submission has been removed",
          "distingish": true
        }
      ]
    },
    {
      "name": "selfPromoActivity",
      "kind": "submission",
      "rules": [
        {
          "kind": "recentActivity",
          "thresholds": [
            {
              "subreddits": [
                "YouTubeSubscribeBoost",
                "AdvertiseYourVideos"
              ]
            }
          ]
        }
      ],
      "actions": [
        {
          "kind": "report",
          "content": "User posted link {{rules.recentactivity.totalCount}} times in {{rules.recentactivity.subCount}} SP subs: {{rules.recentactivity.summary}}"
        }
      ]
    }
  ]
}

```
</details>

## Usage

`npm run start [list,of,subreddits] [...--options]`

CLI options take precedence over environmental variables

| CLI              | Environmental Variable | Required | Description                                                                                                                      |
|------------------|------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------|
| [First Argument] |                        | No       | Comma-deliminated list of subreddits to run on if you don't want to run all the account has access to.                           |
| --clientId       | CLIENT_ID              | **Yes**  | Your reddit application client id                                                                                                |
| --clientSecret   | CLIENT_SECRET          | **Yes**  | Your reddit application client secret                                                                                            |
| --accessToken    | ACCESS_TOKEN           | **Yes**  | A valid access token retrieved from completing the oauth flow for a user with your application.                                  |
| --refreshToken   | REFRESH_TOKEN          | **Yes**  | A valid refresh token retrieved from completing the oauth flow for a user with your application.                                 |
| --logDir         | LOG_DIR                | No       | The absolute path to where logs should be stored. use `false` to turn off log files. Defaults to `CWD/logs`                      |
| --logLevel       | LOG_LEVEL              | No       | The minimum level to log at. Uses [Winston Log Levels](https://github.com/winstonjs/winston#logging-levels). Defaults to `info`  |
| --wikiConfig     | WIKI_CONFIG            | No       | The location of the bot configuration in the subreddit wiki. Defaults to `botconfig/contextbox`                                  |

### Reddit App??

To use this bot you must do two things:
* Create a reddit application
* Authenticate that application to act as a user (login to the application with an account)

#### Create Application

Visit [your reddit preferences](https://www.reddit.com/prefs/apps) and at the bottom of the page go through the **create an(other) app** process.
* Choose **script**
* For redirect uri use https://not-an-aardvark.github.io/reddit-oauth-helper/
* Write down your **Client ID** and **Client Secret** somewhere

#### Authenticate an Account

Visit https://not-an-aardvark.github.io/reddit-oauth-helper/
* Input your **Client ID** and **Client Secret** in the text boxes with those names.
* Choose scopes. **It is very important you check everything on this list or Context Bot will not work correctly**
    * edit
    * flair
    * history
    * identity
    * modcontributors
    * modflair
    * modposts
    * modself
    * mysubreddits
    * read
    * report
    * submit
    * wikiread
* Click **Generate tokens*, you will get a popup asking you to approve access (or login) -- **the account you approve access with is the account that Bot will control.**
* After approving an **Access Token** and **Refresh Token** will be shown at the bottom of the page. Write these down. 
  
You should now have all the information you need to start the bot.

## License

[MIT](/LICENSE)