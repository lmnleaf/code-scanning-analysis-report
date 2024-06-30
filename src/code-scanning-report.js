import { repoCodeScanning } from './repo-code-scanning.js';
import { processInput } from './process-input.js';
import * as fs from 'fs';

async function createReport(actionInput, path, octokit) {
  const { owner, repos, totalDays } = processInput(actionInput);

  let analyses = [];

  try {
    analyses = await repoCodeScanning.getAnalyses(owner, repos, totalDays, octokit);

    if (analyses.length === 0) {
      return 'No code scanning analyses found.';
    }

    writeReport(analyses, path);

    return reportSummary(analyses, repos);
  } catch (error) {
    throw error;
  }
}

function writeReport(analyses, path) {
  const csvRows = analyses.map((analysis) => [
    analysis.repo,
    analysis.ref,
    analysis.commit_sha,
    analysis.analysis_key,
    analysis.environment,
    analysis.category,
    analysis.error,
    analysis.created_at,
    analysis.results_count,
    analysis.rules_count,
    analysis.id,
    analysis.sarif_id,
    (analysis.tool != null ? analysis.tool.name : null),
    (analysis.tool != null ? analysis.tool.version : null),
    analysis.deletable,
    analysis.warning
  ]);

  csvRows.unshift([
    'repo',
    'ref',
    'commit_sha',
    'analysis_key',
    'environment',
    'category',
    'error',
    'created_at',
    'results_count',
    'rules_count',
    'id',
    'sarif_id',
    'tool_name',
    'tool_version',
    'deletable',
    'warning'
  ]);

  let csvDate = new Date().toISOString().slice(0, 10);

  codeScanningReport.writeFile(path + '/code-scanning-analyses' + csvDate + '.csv', csvRows.join("\r\n"), (error) => {
    console.log(error || "report created successfully");
  });
}

function writeFile (path, data, callback) {
  fs.writeFile(path, data, callback);
}

function reportSummary (analyses, repos) {
  let reportSummary = 'Total code scanning analyses found: ' + analyses.length.toString() + '. \n' +
    'All org repos reviewed: ' + (repos.length === 1 && repos[0] === 'all' ? 'true' : 'false') + '. \n' +
    'Repos reviewed: ' + (repos.length === 1 && repos[0] === 'all' ? 'All Org Repos.' : repos.join(', ') + '.');

  return reportSummary;
}

export const codeScanningReport = {
  writeFile: writeFile,
  createReport: createReport
};
