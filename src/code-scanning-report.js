import { getAnalyses } from './analyses.js';

async function createReport(repos, totalDays, context, octokit) {
  let analyses = await getAnalyses(context.repo.owner, repos, totalDays, octokit);
  console.log(analyses);
}

export { createReport };
