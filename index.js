import * as github from '@actions/github';
import * as core from '@actions/core';
import { codeScanningReport } from './src/code-scanning-report.js';

const context = github.context;

async function main() {
  const token = core.getInput('TOKEN');
  const octokit = github.getOctokit(token);
  const repos = core.getInput('repos').split(',');
  const totalDays = core.getInput('total_days');
  const path = core.getInput('path');

  try {
    const reportSummary = await codeScanningReport.createReport(repos, totalDays, path, context, octokit);

    core.notice(reportSummary);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
