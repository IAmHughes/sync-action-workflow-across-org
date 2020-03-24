# Sync Action Workflow Across Org - GitHub Action
A GitHub Action (written in JavaScript) that monitors a template repo's workflow and propagates it to the rest of your org when a change is made.

## Usage
### Pre-requisites
Create a workflow `.yml` file in your `.github/workflows` directory. An [example workflow](#example-workflow---sync-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
- `workflow-name`: The name of the workflow file to add to every repo in your org

### Example workflow - sync workflow
On push to the .githubs/workflows directory, create a PR on all repos in the org to add the workflow file provided:

```yaml
on:
  push
name: Sync workflow across Org

jobs:
  sync-workflows:
    name: Sync workflow across Org
    runs-on: ubuntu-latest
    steps:
      - name: Sync workflow across Org
        id: sync_workflow
        uses: iamhughes/sync-action-workflow-across-org@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # This token is provided by Actions, you do not need to create your own token
          ORG_TOKEN: ${{ secrets.ORG_TOKEN }} # User-created PAT with repo, admin:org, and workflow scopes
        with:
          workflow-name: main.yml
```

## Contributing
I would love for you to contribute, pull requests are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for more information.

## License
The scripts and documentation in this project are released under the [GNU License](LICENSE)
