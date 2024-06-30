import { codeScanningReport } from '../src/code-scanning-report.js';
import { repoCodeScanning } from '../src/repo-code-scanning.js';
import Moctokit from './support/moctokit.js';

describe('Code Scanning Report', function() {
  let octokit;
  let actionInput = {
    repos: 'repo,repo1',
    totalDays: 7,
    context: { repo: { owner: 'some-owner', repo: 'cool-repo' } }
  };
  let path = '/home/runner/work/this-repo/this-repo';
  let mockData = [
    {
      ref: "refs/pull/12/merge",
      commit_sha: "9b56bf4dc03585d3658cb7ec38914df6468f1637",
      analysis_key: ".github/workflows/code_scanning.yml:build",
      environment: "{}",
      category: ".github/workflows/code_scanning.yml:build",
      error: "",
      created_at: "2024-06-28T23:45:27Z",
      results_count: 1,
      rules_count: 73,
      id: 240562790,
      url: "https://api.github.com/repos/some-owner/repo/code-scanning/analyses/240562790",
      sarif_id: "7f41aa7a-35a8-11ef-83c6-a7ccb61c4c9f",
      tool: {
        name: "CodeQL",
        guid: null,
        version: "2.17.6"
      },
      deletable: true,
      warning: ""
    },
    {
      ref: "refs/heads/branch-name",
      commit_sha: "c59c288f88d6858d2a6576d14d79ea743c0f6978",
      analysis_key: ".github/workflows/code_scanning.yml:build",
      environment: "{}",
      category: ".github/workflows/code_scanning.yml:build",
      error: "some error",
      created_at: "2024-06-25T22:05:24Z",
      results_count: 2,
      rules_count: 125,
      id: 238593203,
      url: "https://api.github.com/repos/some-owner/repo1/code-scanning/analyses/238593203",
      sarif_id: "05e46f3e-333f-11ef-8278-f9bcf05666d7",
      tool: {
          name: "SomeOtherTool",
          guid: "30dd879c-ee2f-11db-8314-0800200c9a67",
          version: "1.0.0"
      },
      deletable: true,
      warning: "some warning"
    }
  ]

  beforeEach(() => {
    octokit = new Moctokit(mockData);

    codeScanningReport.writeFile = jasmine.createSpy('writeFile').and.callFake((path, data, callback) => {
      callback(null); // Simulate successful write operation
    });
  });

  it ('creates a CSV of alerts', async function() {
    spyOn(repoCodeScanning, 'getAnalyses').and.callThrough();

    await codeScanningReport.createReport(actionInput, path, octokit);

    expect(octokit.paginate).toHaveBeenCalled();

    const args = codeScanningReport.writeFile.calls.mostRecent().args;
    const filePath = args[0];
    const fileContent = args[1];

    expect(filePath).toContain('/home/runner/work/this-repo/this-repo/code-scanning-analyses');
    
    const lines = fileContent.split('\n');

    expect(lines.length).toBe(5);
    expect(lines[0]).toContain(
      'repo,ref,commit_sha,analysis_key,' +
      'environment,category,error,' +
      'created_at,' +
      'results_count,rules_count,id,sarif_id,' +
      'tool_name,tool_version,deletable,warning'
   );
   expect(lines[1]).toContain(
    'repo,refs/pull/12/merge,9b56bf4dc03585d3658cb7ec38914df6468f1637,' +
    '.github/workflows/code_scanning.yml:build,{},.github/workflows/code_scanning.yml:build,,' +
    '2024-06-28T23:45:27Z,' +
    '1,73,240562790,7f41aa7a-35a8-11ef-83c6-a7ccb61c4c9f,' +
    'CodeQL,2.17.6,true'
   )
   expect(lines[2]).toContain(
    'repo,refs/heads/branch-name,c59c288f88d6858d2a6576d14d79ea743c0f6978,' + 
    '.github/workflows/code_scanning.yml:build,{},.github/workflows/code_scanning.yml:build,some error,' +
    '2024-06-25T22:05:24Z,' +
    '2,125,238593203,05e46f3e-333f-11ef-8278-f9bcf05666d7,' +
    'SomeOtherTool,1.0.0,true,some warning'
   )
   expect(lines[3]).toContain(
    'repo1,refs/pull/12/merge,9b56bf4dc03585d3658cb7ec38914df6468f1637,' +
    '.github/workflows/code_scanning.yml:build,{},.github/workflows/code_scanning.yml:build,,' +
    '2024-06-28T23:45:27Z,' +
    '1,73,240562790,7f41aa7a-35a8-11ef-83c6-a7ccb61c4c9f,' +
    'CodeQL,2.17.6,true'
   )
   expect(lines[4]).toContain(
    'repo1,refs/heads/branch-name,c59c288f88d6858d2a6576d14d79ea743c0f6978,' + 
    '.github/workflows/code_scanning.yml:build,{},.github/workflows/code_scanning.yml:build,some error,' +
    '2024-06-25T22:05:24Z,' +
    '2,125,238593203,05e46f3e-333f-11ef-8278-f9bcf05666d7,' +
    'SomeOtherTool,1.0.0,true,some warning'
   )
  });

  it('returns a report summary', async function() {
    const reportSummary= await codeScanningReport.createReport(actionInput, path, octokit);

    expect(reportSummary).toEqual(
      'Total code scanning analyses found: 4. \n' +
      'All org repos reviewed: false. \n' +
      'Repos reviewed: repo, repo1.'
    );
  });

  // add the code and spec for this later - will need to grab all repos from the org
  xit ('returns a report summary that includes all org repos', async function() {
  });

  it('returns a report summary when no code scanning analyses are found', async function() {
    octokit = new Moctokit([]);
    const reportSummary= await codeScanningReport.createReport(actionInput, path, octokit);

    expect(reportSummary).toEqual('No code scanning analyses found.');
  });

  it('handles errors', async function() {
    let octokitTestError = new Moctokit([], true);
    let caughtError;

    try {
      await codeScanningReport.createReport(actionInput, path, octokitTestError);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
});
