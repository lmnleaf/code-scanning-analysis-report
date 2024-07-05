import { orgRepos } from './org-repos.js';

async function getAnalyses (owner, repos, totalDays, octokit) {
  let analyses = [];
  let reposList = [];
  const daysAgo = new Date();

  daysAgo.setDate(new Date().getDate() - totalDays);

  if (repos.length === 1 && repos[0] === 'all') {
    reposList = await orgRepos.getOrgRepos(owner, octokit);
  } else {
    reposList = repos;
  }

  for (const repo of reposList) {
    let repoAnalyses = [];

    try {
      await octokit.paginate(
        octokit.rest.codeScanning.listRecentAnalyses,
        {
          owner,
          repo,
          per_page: 100
        },
        (response, done) => {
          let stopListingAnalyses = response.data.find((analysis) => new Date(analysis.created_at) <= daysAgo);
          if (stopListingAnalyses) {
            done();
          }
          repoAnalyses.push(...response.data);
        }
      );

      analyses = analyses.concat(filteredAnalyses(repoAnalyses, daysAgo, repo));
    } catch (error) {
      if (error.message.includes('no analysis found')) {
        continue;
      } else {
        throw error;
      }
    }
  }

  return analyses;
}

function filteredAnalyses(analyses, daysAgo, repo) {
  let filteredAnalyses = analyses.filter((analysis) =>
    new Date(analysis.created_at) >= daysAgo
  );

  filteredAnalyses = filteredAnalyses.map((analysis) => {
    let newAnalysis = {...analysis,
      repo: repo
    };

    return newAnalysis;
  });

  return filteredAnalyses;
}

export const repoCodeScanning = {
  getAnalyses: getAnalyses
};
