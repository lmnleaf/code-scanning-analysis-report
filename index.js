import * as github from '@actions/github';
import * as core from '@actions/core';
import { codeScanningReport } from './src/code-scanning-report.js';

async function main() {
  const token = core.getInput('TOKEN');
  const octokit = github.getOctokit(token);
  const path = core.getInput('path');
  const actionInput = {
    repos: core.getInput('repos'),
    totalDays: core.getInput('total_days'),
    context: github.context
  }

  try {
    const reportSummary = await codeScanningReport.createReport(actionInput, path, octokit);

    core.notice(reportSummary);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
