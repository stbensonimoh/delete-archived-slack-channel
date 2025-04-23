# Delete Archived Slack Channels

A set of Node.js automation scripts for efficiently managing Slack channels, particularly focused on handling archived channels. The official Slack API does not provide a method to delete archived channels programmatically, necessitating the UI automation approach for bulk deletion.

## Features

- **Archive Channel Listing**: Automatically fetch and save a list of all archived channels in your Slack workspace
- **Bulk Channel Deletion**: Interactive UI automation tool for bulk deleting archived channels with safety checks
- **JSON Export**: Exports channel data including names, IDs, and direct URLs

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)
- A Slack Bot Token with the following permissions:
  - `channels:read`
  - `channels:write`
  - `groups:read`
  - `groups:write`
  - `team:read`

## Installation

1. Clone this repository:
   ```bash
   git clone [repository-url]
   cd slack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env-example .env
   ```
   Edit `.env` and add your Slack Bot Token:
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   ```

## Available Scripts

### Get Archived Channels (`getArchivedChannels.js`)

Lists all archived channels in your Slack workspace and saves them to a JSON file.

```bash
node getArchivedChannels.js
```

**Features:**
- Fetches both public and private archived channels
- Generates direct Slack URLs for each channel
- Saves results to `archived_channels.json`
- Includes channel names and IDs
- Handles pagination for large workspaces

**Output Format:**
```json
[
  {
    "name": "channel-name",
    "id": "CHANNEL_ID",
    "url": "https://app.slack.com/client/TEAM_ID/CHANNEL_ID"
  }
]
```

### Delete Channels UI (`deleteChannelsUI.js`)

An automated UI tool for bulk deleting archived channels using Playwright.

```bash
node deleteChannelsUI.js
```

**Features:**
- Interactive browser automation
- Manual authentication support (including SSO)
- Automatic unarchiving before deletion
- Safety checks and confirmations
- Error screenshots for debugging
- Progress logging
- Handles channel settings navigation

**Process:**
1. Opens a browser window for Slack authentication
2. Waits for manual login (supports SSO)
3. For each channel:
   - Navigates to channel URL
   - Unarchives if necessary
   - Opens channel settings
   - Executes deletion with confirmation
   - Takes error screenshots if needed

**Safety Features:**
- Manual login requirement ensures security
- Confirmation checkbox requirement
- Error handling with screenshots
- Timeout protections
- Progress tracking

## Dependencies

- `@slack/web-api`: ^7.9.1 - Official Slack Web API client
- `dotenv`: ^16.5.0 - Environment variable management
- `playwright`: ^1.52.0 - Browser automation for the deletion UI

## Error Handling

The scripts include comprehensive error handling:
- Network timeout protection
- Screenshot capture on failures
- Detailed error logging
- Continuation after individual channel failures

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Security Notes

- Never commit your `.env` file
- Use a dedicated Slack bot with minimum required permissions
- Review the list of channels before deletion
- Keep your bot token secure and rotate if compromised

## Support

For issues and feature requests, please open an issue in the repository.
