import { getAnalyses } from '../src/analyses.js';
import Moctokit from './support/moctokit.js';

describe('Analyses', function() {
  let octokit;
  let baseTime = new Date(2024, 4, 5);
  let owner = 'some-owner'
  let repos = ['repo', 'repo1'];
  let mockData = [
    {
      ref: 'refs/pull/12/merge',
      commit_sha: '9b56bf4dc03585d3658cb7ec38914df6468f1637',
      analysis_key: '.github/workflows/code_scanning.yml:build',
      environment: '{}',
      category: '.github/workflows/code_scanning.yml:build',
      error: '',
      created_at: new Date(baseTime - (24 * 60 * 60 * 1000 * 5)).toISOString(),
      results_count: 1,
      rules_count: 73,
      id: 240562790,
      url: 'https://api.github.com/repos/some-owner/repo/code-scanning/analyses/240562790',
      sarif_id: '7f41aa7a-35a8-11ef-83c6-a7ccb61c4c9f',
      tool: {
        name: 'CodeQL',
        guid: null,
        version: '2.17.6'
      },
      deletable: true,
      warning: ''
    },
    {
      ref: "refs/heads/branch-name",
      commit_sha: "c59c288f88d6858d2a6576d14d79ea743c0f6978",
      analysis_key: ".github/workflows/code_scanning.yml:build",
      environment: "{}",
      category: ".github/workflows/code_scanning.yml:build",
      error: "",
      created_at: new Date(baseTime - (24 * 60 * 60 * 1000 * 10)).toISOString(),
      results: 2,
      count: 125,
      id: 238593203,
      url: "https://api.github.com/repos/some-owner/repo1/code-scanning/analyses/238593203",
      sarif_id: "05e46f3e-333f-11ef-8278-f9bcf05666d7",
      tool: {
          name: "CodeQL",
          guid: null,
          version: "2.17.5"
      },
      deletable: true,
      warning: ""
    }
  ]

  beforeEach(() => {
    octokit = new Moctokit(mockData);

    jasmine.clock().install();
    jasmine.clock().mockDate(baseTime);
    jasmine.clock().tick(50);
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });

  it('gets analyses for the past 7 days', async function () {
    let analyses = await getAnalyses(owner, repos, 7, octokit);

    expect(octokit.paginate).toHaveBeenCalled();
    expect(analyses.length).toEqual(2);
    for (let i = 0; i < analyses.length; i++) {
      expect(new Date(analyses[i].created_at) <= new Date()).toBeTrue();
    }
    expect(analyses[0].commit_sha).toEqual(mockData[0].commit_sha);
    expect(analyses[0].repo).toEqual('repo');
    expect(analyses[1].commit_sha).toEqual(mockData[0].commit_sha);
    expect(analyses[1].repo).toEqual('repo1');
  });

  it('gets analyses for the past 15 days', async function () {
    let analyses = await getAnalyses(owner, repos, 15, octokit);

    expect(analyses.length).toEqual(4);
    expect(octokit.paginate).toHaveBeenCalled();
    for (let i = 0; i < analyses.length; i++) {
      expect(new Date(analyses[i].created_at) <= new Date()).toBeTrue();
    }
    expect(analyses[0].commit_sha).toEqual(mockData[0].commit_sha);
    expect(analyses[0].repo).toEqual('repo');
    expect(analyses[3].commit_sha).toEqual(mockData[1].commit_sha);
    expect(analyses[3].repo).toEqual('repo1');
  });

  it('handles errors', async function() {
    let octokitTestError = new Moctokit([], true);
    let caughtError;

    try {
      await getAnalyses(owner, repos, 7, octokitTestError);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toEqual(new Error('fetch error'));
  });
})
