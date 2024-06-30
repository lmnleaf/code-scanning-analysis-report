async function getAnalyses (owner, repos, totalDays, octokit) {
  let analyses = [];
  const daysAgo = new Date();

  // add a default and error for totalDays
  daysAgo.setDate(new Date().getDate() - totalDays);

  for (const repo of repos) {
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
      throw error;
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
