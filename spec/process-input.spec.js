import { processInput } from '../src/process-input.js';

describe('Process Input', function() {
  let context = { repo: { owner: 'org', repo: 'cool-repo' } };
  let totalDays = 30;

  it('processes input when no repos and no days are provided (defaults to current repo and 30 days)', async function() {
    let actionInput = {
      repos: null,
      totalDays: null,
      context: context
    };

    const input = processInput(actionInput);

    expect(input.owner).toEqual('org');
    expect(input.repos).toEqual(['cool-repo']);
    expect(input.totalDays).toEqual(30);
  });

  it('processes input when repos and days are empty strings (defaults to current repo and 30 days)', async function() {
    let actionInput = {
      repos: '',
      totalDays: '',
      context: context
    };

    const input = processInput(actionInput);

    expect(input.owner).toEqual('org');
    expect(input.repos).toEqual(['cool-repo']);
    expect(input.totalDays).toEqual(30);
  });

  it('processes input when repos and days are provided', async function() {
    let actionInput = {
      repos: 'woot,cool',
      totalDays: 7,
      context: context
    };

    const input = processInput(actionInput);

    expect(input.owner).toEqual(context.repo.owner);
    expect(input.repos).toEqual(['woot', 'cool']);
    expect(input.totalDays).toEqual(7);
  });

  it('processes input when repos is set to `all`', async function() {
    let actionInput = {
      repos: 'all',
      totalDays: null,
      context: context
    };

    const input = processInput(actionInput);

    expect(input.owner).toEqual(context.repo.owner);
    expect(input.repos).toEqual(['all']);
    expect(input.totalDays).toEqual(totalDays);
  });

  it('errors when total days is greater than 365', async function() {
    let actionInput = {
      repos: null,
      totalDays: 500,
      context: context
    };

    let caughtError;
    let expectedError = new Error('total_days must be greater than 0 and less than or equal to 365.');

    try {
      processInput(actionInput);
    } catch (error) {
      caughtError = expectedError;
    }
  });

  it('errors when total days is less than 1', async function() {
    let actionInput = {
      repos: null,
      totalDays: 0,
      context: context
    };

    let caughtError;
    let expectedError = new Error('total_days must be greater than 0 and less than or equal to 365.');

    try {
      processInput(actionInput);
    } catch (error) {
      caughtError = expectedError;
    }
  });
});
