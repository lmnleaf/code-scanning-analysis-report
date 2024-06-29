import * as github from '@actions/github';
import * as core from '@actions/core';
import { createReport } from './src/code-scanning-report.js';

const context = github.context;

async function main() {
  const token = core.getInput('TOKEN');
  const octokit = github.getOctokit(token);
  const repos = core.getInput('repos').split(',');
  const totalDays = core.getInput('total_days');

  try {
    const reportSummary = await createReport(repos, totalDays, context, octokit);

    core.notice(reportSummary);
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
