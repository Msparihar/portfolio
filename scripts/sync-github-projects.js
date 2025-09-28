#!/usr/bin/env node
/**
 * GitHub Projects Sync Script
 * Enhanced version that syncs repositories with smart cleanup and change detection
 * Automatically removes private/deleted repos and updates only changed content
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import "dotenv/config";

const streamPipeline = promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GitHubProjectSync {
  constructor(username, options = {}) {
    this.username = username;
    this.token = options.token || process.env.GITHUB_TOKEN;
    this.baseUrl = "https://api.github.com";
    this.maxConcurrent = options.maxConcurrent || 10;
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;

    // Directory setup
    this.downloadDir = path.join(process.cwd(), `github_downloads_${username}`);
    this.stateFile = path.join(this.downloadDir, ".sync-state.json");
    this.backupDir = path.join(this.downloadDir, ".backup");

    // State tracking
    this.previousState = {};
    this.currentState = {};
    this.syncLog = [];

    this.log("Initializing GitHub Project Sync...", "info");
  }

  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.syncLog.push(logEntry);

    if (this.verbose || level === "error" || level === "warn") {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    }
  }

  async makeRequest(url, options = {}) {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Project-Sync/1.0",
    };

    if (this.token) {
      headers["Authorization"] = `token ${this.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      this.log(`Request failed for ${url}: ${error.message}`, "error");
      throw error;
    }
  }

  async loadPreviousState() {
    try {
      const stateData = await fs.readFile(this.stateFile, "utf8");
      this.previousState = JSON.parse(stateData);
      this.log(
        `Loaded previous state with ${
          Object.keys(this.previousState.repositories || {}).length
        } repositories`,
        "info"
      );
    } catch (error) {
      this.log("No previous state found, performing full sync", "info");
      this.previousState = { repositories: {}, lastSync: null };
    }
  }

  async saveSyncState() {
    const state = {
      repositories: this.currentState,
      lastSync: new Date().toISOString(),
      syncLog: this.syncLog.slice(-100), // Keep last 100 log entries
    };

    if (!this.dryRun) {
      await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
      this.log("Sync state saved", "info");
    }
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.downloadDir, { recursive: true });
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      this.log(`Failed to create directories: ${error.message}`, "error");
      throw error;
    }
  }

  async fetchPublicRepositories() {
    this.log("Fetching public repositories...", "info");
    const repositories = [];
    let page = 1;

    while (true) {
      const url = `${this.baseUrl}/users/${this.username}/repos?page=${page}&per_page=100&type=public&sort=updated`;

      try {
        const response = await this.makeRequest(url);
        const pageRepos = await response.json();

        if (pageRepos.length === 0) break;

        repositories.push(...pageRepos);
        page++;

        this.log(
          `Fetched page ${page - 1}, found ${pageRepos.length} repositories`,
          "info"
        );
      } catch (error) {
        this.log(
          `Failed to fetch repositories page ${page}: ${error.message}`,
          "error"
        );
        break;
      }
    }

    this.log(`Total public repositories found: ${repositories.length}`, "info");
    return repositories;
  }

  async getRepositoryContents(repoName, path = "") {
    const url = `${this.baseUrl}/repos/${this.username}/${repoName}/contents/${path}`;

    try {
      const response = await this.makeRequest(url);
      return await response.json();
    } catch (error) {
      if (error.message.includes("404")) {
        return null; // Path doesn't exist
      }
      throw error;
    }
  }

  async downloadFile(downloadUrl, localPath, repoName, fileName) {
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(localPath), { recursive: true });

      // Check if file already exists and compare
      const needsUpdate = await this.fileNeedsUpdate(
        localPath,
        repoName,
        fileName
      );
      if (!needsUpdate) {
        this.log(`Skipping unchanged file: ${fileName}`, "info");
        return true;
      }

      if (this.dryRun) {
        this.log(`[DRY RUN] Would download: ${fileName}`, "info");
        return true;
      }

      const response = await this.makeRequest(downloadUrl);
      const writeStream = createWriteStream(localPath);

      await streamPipeline(response.body, writeStream);
      this.log(`Downloaded: ${fileName}`, "info");

      return true;
    } catch (error) {
      this.log(`Failed to download ${fileName}: ${error.message}`, "error");
      return false;
    }
  }

  async fileNeedsUpdate(localPath, repoName, fileName) {
    try {
      const stats = await fs.stat(localPath);
      const previousRepo = this.previousState.repositories?.[repoName];

      if (!previousRepo || !previousRepo.files?.[fileName]) {
        return true; // New file
      }

      const previousFileInfo = previousRepo.files[fileName];
      const currentSize = stats.size;

      // Simple comparison - in a more advanced version, you could compare hashes
      return currentSize !== previousFileInfo.size;
    } catch (error) {
      return true; // File doesn't exist locally, needs download
    }
  }

  async processAssetsFolder(repoName, repoDir) {
    this.log(`Processing assets folder for ${repoName}`, "info");

    const assetsContents = await this.getRepositoryContents(repoName, "assets");
    if (!assetsContents || !Array.isArray(assetsContents)) {
      this.log(`No assets folder found in ${repoName}`, "info");
      return 0;
    }

    let downloadedCount = 0;
    const assetsDir = path.join(repoDir, "assets");

    for (const item of assetsContents) {
      if (item.type === "file") {
        const localPath = path.join(assetsDir, item.name);
        const success = await this.downloadFile(
          item.download_url,
          localPath,
          repoName,
          `assets/${item.name}`
        );
        if (success) downloadedCount++;

        // Track file info for future comparisons
        this.currentState[repoName].files[`assets/${item.name}`] = {
          size: item.size,
          sha: item.sha,
          lastModified: new Date().toISOString(),
        };
      } else if (item.type === "dir") {
        // Handle subdirectories recursively
        const subContents = await this.getRepositoryContents(
          repoName,
          `assets/${item.name}`
        );
        if (subContents && Array.isArray(subContents)) {
          for (const subItem of subContents) {
            if (subItem.type === "file") {
              const localPath = path.join(assetsDir, item.name, subItem.name);
              const success = await this.downloadFile(
                subItem.download_url,
                localPath,
                repoName,
                `assets/${item.name}/${subItem.name}`
              );
              if (success) downloadedCount++;

              this.currentState[repoName].files[
                `assets/${item.name}/${subItem.name}`
              ] = {
                size: subItem.size,
                sha: subItem.sha,
                lastModified: new Date().toISOString(),
              };
            }
          }
        }
      }
    }

    return downloadedCount;
  }

  async processReadmeFile(repoName, repoDir) {
    const readmeVariants = [
      "README.md",
      "README.txt",
      "README.rst",
      "README",
      "readme.md",
      "readme.txt",
    ];

    for (const readmeName of readmeVariants) {
      const readmeContent = await this.getRepositoryContents(
        repoName,
        readmeName
      );

      if (readmeContent && readmeContent.type === "file") {
        const localPath = path.join(repoDir, readmeName);
        const success = await this.downloadFile(
          readmeContent.download_url,
          localPath,
          repoName,
          readmeName
        );

        if (success) {
          this.currentState[repoName].files[readmeName] = {
            size: readmeContent.size,
            sha: readmeContent.sha,
            lastModified: new Date().toISOString(),
          };
          this.log(`Downloaded README: ${readmeName}`, "info");
          return true;
        }
      }
    }

    this.log(`No README file found in ${repoName}`, "info");
    return false;
  }

  async createBackup() {
    if (this.dryRun) {
      this.log("[DRY RUN] Would create backup", "info");
      return;
    }

    try {
      const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(
        this.backupDir,
        `backup-${backupTimestamp}.json`
      );

      await fs.writeFile(
        backupPath,
        JSON.stringify(this.previousState, null, 2)
      );
      this.log(`Backup created: ${backupPath}`, "info");
    } catch (error) {
      this.log(`Failed to create backup: ${error.message}`, "warn");
    }
  }

  async cleanupRemovedRepositories(currentRepos) {
    const currentRepoNames = new Set(currentRepos.map((repo) => repo.name));

    // Get all existing directories (not just from previous state)
    let existingDirectories = [];
    try {
      const dirEntries = await fs.readdir(this.downloadDir, { withFileTypes: true });
      existingDirectories = dirEntries
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .map(entry => entry.name);
    } catch (error) {
      this.log(`Failed to read download directory: ${error.message}`, 'error');
      return;
    }

    const removedRepos = existingDirectories.filter(
      (name) => !currentRepoNames.has(name)
    );

    if (removedRepos.length === 0) {
      this.log("No repositories to clean up", "info");
      return;
    }

    this.log(
      `Found ${
        removedRepos.length
      } repositories to clean up: ${removedRepos.join(", ")}`,
      "warn"
    );

    for (const repoName of removedRepos) {
      const repoDir = path.join(this.downloadDir, repoName);

      try {
        if (this.dryRun) {
          this.log(`[DRY RUN] Would remove directory: ${repoDir}`, "warn");
        } else {
          await fs.rm(repoDir, { recursive: true, force: true });
          this.log(`Removed directory: ${repoDir}`, "warn");
        }
      } catch (error) {
        this.log(`Failed to remove ${repoDir}: ${error.message}`, "error");
      }
    }
  }

  async processRepository(repo) {
    const repoName = repo.name;
    this.log(`Processing repository: ${repoName}`, "info");

    // Initialize current state for this repo
    this.currentState[repoName] = {
      name: repoName,
      updatedAt: repo.updated_at,
      files: {},
      processed: new Date().toISOString(),
    };

    const repoDir = path.join(this.downloadDir, repoName);

    if (!this.dryRun) {
      await fs.mkdir(repoDir, { recursive: true });
    }

    // Check if repository needs updating
    const previousRepo = this.previousState.repositories?.[repoName];
    if (previousRepo && previousRepo.updatedAt === repo.updated_at) {
      this.log(`Repository ${repoName} unchanged, skipping`, "info");
      this.currentState[repoName] = previousRepo;
      return { assetsCount: 0, readmeSuccess: false, skipped: true };
    }

    // Process assets and README
    const assetsCount = await this.processAssetsFolder(repoName, repoDir);
    const readmeSuccess = await this.processReadmeFile(repoName, repoDir);

    return { assetsCount, readmeSuccess, skipped: false };
  }

  async generateReport(repositories, results) {
    const totalRepos = repositories.length;
    const processedRepos = results.filter((r) => !r.skipped).length;
    const skippedRepos = results.filter((r) => r.skipped).length;
    const totalAssets = results.reduce((sum, r) => sum + r.assetsCount, 0);
    const totalReadmes = results.filter((r) => r.readmeSuccess).length;

    const report = `
GitHub Projects Sync Report
${new Date().toISOString()}
${"=".repeat(50)}

Repositories:
  - Total public repositories: ${totalRepos}
  - Processed (updated): ${processedRepos}
  - Skipped (unchanged): ${skippedRepos}

Downloads:
  - Asset files downloaded: ${totalAssets}
  - README files downloaded: ${totalReadmes}

Mode: ${this.dryRun ? "DRY RUN" : "LIVE"}
Directory: ${this.downloadDir}

${
  this.syncLog.filter((log) => log.level === "warn" || log.level === "error")
    .length > 0
    ? `Warnings/Errors:
${this.syncLog
  .filter((log) => log.level === "warn" || log.level === "error")
  .map((log) => `  [${log.level.toUpperCase()}] ${log.message}`)
  .join("\n")}`
    : "No warnings or errors."
}
`;

    console.log(report);

    // Save report to file
    if (!this.dryRun) {
      const reportPath = path.join(this.downloadDir, "sync-report.txt");
      await fs.writeFile(reportPath, report);
    }
  }

  async sync() {
    try {
      this.log("Starting GitHub projects sync...", "info");

      await this.ensureDirectories();
      await this.loadPreviousState();
      await this.createBackup();

      // Fetch current repositories
      const repositories = await this.fetchPublicRepositories();
      if (repositories.length === 0) {
        this.log("No public repositories found!", "warn");
        return;
      }

      // Clean up removed repositories
      await this.cleanupRemovedRepositories(repositories);

      // Process repositories in batches
      const batchSize = this.maxConcurrent;
      const results = [];

      for (let i = 0; i < repositories.length; i += batchSize) {
        const batch = repositories.slice(i, i + batchSize);
        this.log(
          `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            repositories.length / batchSize
          )}`,
          "info"
        );

        const batchPromises = batch.map((repo) => this.processRepository(repo));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Save state and generate report
      await this.saveSyncState();
      await this.generateReport(repositories, results);

      this.log("Sync completed successfully!", "info");
    } catch (error) {
      this.log(`Sync failed: ${error.message}`, "error");
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes("--dry-run"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    maxConcurrent: 5, // Conservative default
  };

  const username = process.env.GITHUB_USERNAME || "Msparihar";

  if (!process.env.GITHUB_TOKEN) {
    console.error("ERROR: GITHUB_TOKEN environment variable is required");
    process.exit(1);
  }

  console.log(
    `GitHub Projects Sync - ${options.dryRun ? "DRY RUN MODE" : "LIVE MODE"}`
  );
  console.log(`Username: ${username}`);
  console.log(`Max Concurrent: ${options.maxConcurrent}`);
  console.log("");

  const sync = new GitHubProjectSync(username, options);

  try {
    await sync.sync();
  } catch (error) {
    console.error("Sync failed:", error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

main();

export default GitHubProjectSync;
