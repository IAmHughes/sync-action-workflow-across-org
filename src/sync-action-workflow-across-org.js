const core = require('@actions/core');
const { Octokit } = require('@octokit/action');

async function run() {
  try {
    // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
    const github = new Octokit();

    // Get owner, repo, and event from context of payload that triggered the action
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const workflowName = core.getInput('workflow-name', { required: true });

    // eslint-disable-next-line no-useless-escape
    core.debug(`Searching for workflow: \'${workflowName}\'`);

    // Get the workflow by name
    // Octokit Docs: https://octokit.github.io/rest.js/v17#actions-get-workflow
    // GitHub Docs: https://developer.github.com/v3/actions/workflows/#get-a-
    // TODO: Switch back to this method once issue is fixed: https://github.com/octokit/rest.js/issues/1656#issuecomment-603962429
    // const getWorkflowResponse = await github.actions.getWorkflow({
    //   owner,
    //   repo,
    //   workflow_file_name: workflowName
    // });
    const getWorkflowResponse = await github.request('GET /repos/:owner/:repo/actions/workflows/:workflow_file_name', {
      owner,
      repo,
      workflow_file_name: workflowName
    });

    // Get the path of the workflow
    const workflowPath = getWorkflowResponse.data.path;

    // Get the content of the workflow file and it's sha
    // Octokit Docs: https://octokit.github.io/rest.js/v17#repos-get-contents
    // GitHub Docs: https://octokit.github.io/rest.js/v17#repos-get-contents
    const getContentsResponse = await github.repos.getContents({
      owner,
      repo,
      path: workflowPath
    });

    const workflowContent = getContentsResponse.data.content;
    const workflowSha = getContentsResponse.data.sha;

    // Create commit to PR to other repositories in Org
    // Octokit Docs: https://octokit.github.io/rest.js/v17#git
    // GitHub Docs: https://developer.github.com/v3/git/

    const newSha = process.env.GITHUB_SHA;

    // Create a ref for this commit
    // https://developer.github.com/v3/git/refs/#create-a-reference
    const newRef = `refs/heads/workflow/${newSha.substring(0, 7)}`;
    const createRefResponse = await github.git.createRef({
      ...context.repo,
      ref: newRef,
      sha: newSha
    });

    core.debug(`Create Ref: ${JSON.stringify(createRefResponse)}`);

    // Create/Update a file with the Contents API for every repo in org
    // https://developer.github.com/v3/repos/contents/#create-or-update-a-file
    const orgRepos = [''];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < orgRepos.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const createOrUpdateFile = await github.repos.createOrUpdateFile({
        owner,
        repo: orgRepos[i],
        path: `.github/workflows/${workflowName}`,
        message: `Update ${workflowName}`,
        content: Buffer.from(workflowContent).toString('base64'),
        sha: workflowSha,
        branch: `update-workflow/${newSha.substring(0, 7)}`
      });

      core.debug(`Create or Update File: ${JSON.stringify(createOrUpdateFile)}`);

      // Create a PR with the contents (head is the new ref, base is the default branch)
      // https://developer.github.com/v3/pulls/#create-a-pull-request
      // eslint-disable-next-line no-await-in-loop
      const createPullResponse = await github.pulls.create({
        owner,
        repo: orgRepos[i],
        title: `Update ${workflowName}`,
        head: `${newRef}`,
        base: 'master'
      });

      core.debug(`Create PR: ${JSON.stringify(createPullResponse)}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;
