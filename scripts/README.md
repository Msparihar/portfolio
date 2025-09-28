# GitHub Projects Sync Script

A smart synchronization tool that keeps your local GitHub projects folder in sync with your remote repositories. This enhanced JavaScript version automatically handles repository changes, cleanups, and delta updates.

## Features

✅ **Smart Sync**: Only downloads changed/new content
✅ **Auto Cleanup**: Removes folders for private/deleted repositories
✅ **Change Detection**: Compares timestamps and file sizes
✅ **Safety Backup**: Creates backups before making changes
✅ **Dry Run Mode**: Preview changes without executing them
✅ **Detailed Logging**: Comprehensive sync reports
✅ **State Management**: Tracks sync history and repository states
✅ **Rate Limiting**: Respects GitHub API limits

## Setup

1. **Environment Variables**: Ensure your `.env` file contains:
   ```env
   GITHUB_TOKEN=your_github_token_here
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

## Usage

### Basic Sync
```bash
# Full sync (live mode)
pnpm run sync-projects

# Or using node directly
node scripts/sync-github-projects.js
```

### Dry Run (Preview Mode)
```bash
# See what would be changed without executing
pnpm run sync-projects:dry

# Or with verbose logging
node scripts/sync-github-projects.js --dry-run --verbose
```

### Command Line Options
- `--dry-run`: Preview mode - shows what would be done without executing
- `--verbose` or `-v`: Detailed logging output

## How It Works

### Initial Sync
1. Fetches all public repositories from GitHub
2. Downloads assets folders and README files
3. Creates state file to track repository information

### Delta Sync (Subsequent Runs)
1. Compares current repositories with previous state
2. Downloads only changed/new files
3. Removes folders for repositories that are now private/deleted
4. Updates state file with new information

### Safety Features
- **Backup Creation**: Automatic backup before cleanup operations
- **Dry Run Mode**: Test changes safely before execution
- **State Persistence**: Remembers what was downloaded previously
- **Error Recovery**: Continues processing even if some operations fail

## Output Structure

```
github_downloads_Msparihar/
├── .sync-state.json          # Sync state and history
├── .backup/                  # Backup files
├── sync-report.txt          # Latest sync report
├── project1/
│   ├── README.md
│   └── assets/
│       ├── screenshot.png
│       └── demo.gif
└── project2/
    ├── README.md
    └── assets/
        └── image.jpg
```

## State Management

The script maintains a `.sync-state.json` file that tracks:
- Repository information (name, last update time)
- Downloaded files (size, SHA, timestamps)
- Sync history and logs
- Last successful sync timestamp

## Repository Lifecycle

### New Repository
- Downloads all assets and README
- Adds to state tracking

### Updated Repository
- Downloads only changed files
- Updates state information

### Private/Deleted Repository
- Removes local folder
- Removes from state tracking
- Logs cleanup action

## Error Handling

The script handles various scenarios gracefully:
- Network timeouts and API rate limits
- Missing assets folders or README files
- Permission issues and file conflicts
- Partial download failures

## Troubleshooting

### Common Issues

1. **API Rate Limiting**
   - The script includes built-in rate limiting
   - Reduce `maxConcurrent` if you hit limits

2. **Permission Errors**
   - Ensure GitHub token has proper permissions
   - Check file system permissions for target directory

3. **Network Issues**
   - Script will retry failed downloads
   - Check internet connection and GitHub API status

### Debug Mode
Run with `--verbose` flag for detailed logging:
```bash
node scripts/sync-github-projects.js --verbose
```

## Configuration

You can modify the script behavior by editing the options in the `main()` function:

```javascript
const options = {
    dryRun: false,           // Set to true for dry run
    verbose: false,          // Set to true for verbose logging
    maxConcurrent: 5         // Concurrent download limit
};
```

## Scheduling

To run automatically (e.g., monthly), you can:

1. **Using cron (Linux/Mac)**:
   ```bash
   # Run on 1st of every month at 2 AM
   0 2 1 * * cd /path/to/portfolio && pnpm run sync-projects
   ```

2. **Using Task Scheduler (Windows)**:
   - Create a scheduled task to run the script monthly

3. **Using GitHub Actions**:
   - Set up a workflow to run the sync on a schedule

## Security Notes

- Store your GitHub token securely in the `.env` file
- Never commit the `.env` file to version control
- Use a personal access token with minimal required permissions
- The script only reads public repository data

## Performance

- **Parallel Processing**: Downloads multiple files concurrently
- **Delta Sync**: Only processes changed content
- **Efficient API Usage**: Minimizes API calls through caching
- **Memory Optimized**: Streams large files instead of loading into memory

## License

Same as the main portfolio project.