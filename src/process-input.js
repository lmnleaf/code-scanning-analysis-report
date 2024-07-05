function processInput (actionInput) {
  let input = {
    owner: actionInput.context.repo.owner,
    repos: [actionInput.context.repo.repo],
    totalDays: 30
  }

  if (actionInput.repos != null && actionInput.repos.length > 0) {
    input.repos = actionInput.repos.split(',');
  }

  let days = parseInt(actionInput.totalDays);
  if (days != NaN && days > 0 && days <= 365) {
    input.totalDays = days;
  } else if (days != NaN && (days <= 0 || days > 365)) {
    throw new Error('total_days must be greater than 0 and less than or equal to 365.');
  }

  return input;
}

export { processInput };
