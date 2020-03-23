const core = require('@actions/core');
const {GitHub, context} = require('@actions/github');
const axios = require('axios').default;

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new GitHub(process.env.GITHUB_TOKEN);

    // Get owner, repo, and event from context of payload that triggered the action
    const {owner, repo} = context.repo;

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
