# code-scanning-analysis-report

The Code Scanning Analysis Report action generates a CSV that contains a list of code scan runs for a set
of repositories.
* This action can be configured to include analyses from select repositories or all repositories in an organization. 
* Each row in the CSV is an analysis that includes information about a code scan, such as when
the scan ran, the number of alerts found, and the tool used. This information is helpful for tracking
how frequently code scans are running and can be used to demonstrate that code scans are running
regularly when that's required for compliance purposes.
regularly for compliance purposes.
purposes.
* The workflow annotation includes a report summary.
* **Note:** An row is added to the CSV for each analysis that is found. When a repo is NOT found, the action will
exit with an error. When the repo is found but an analysis is NOT found, the action will continue without
error, and a row for the repo will NOT be included in the CSV.

<br>

:star: **Configuration Details**
* Required input:
  * `TOKEN` - GITHUB_TOKEN or PAT. A PAT is required to get analyses for repos other than the repo where the action is used.
  * `path` - the path where the CSV should be written. **Note:** to upload the CSV as an artifact, use GitHub's [upload-artifact](https://github.com/actions/upload-artifact) action.
* Optional input:
  * `repos` - a comma separated list of repos from which to get the analyses. Set it to `all` to get analyses
  from all repos in an organization. Defaults to the current repo.
  * `total_days` - the number of days to look back for analyses. Defaults to 30 days.

<br>

:file_folder: :page_facing_up: **Sample CSV Header and Data**
```
repo,ref,commit_sha,analysis_key,environment,category,error,created_at,results_count,rules_count,id,sarif_id,tool_name,tool_version,deletable,warning
cool_repo,refs/heads/main,71b7901eb2a18001415f2f51e0e3544322d7ec28,dynamic/github-code-scanning/codeql:analyze,{"language":"javascript-typescript"},/language:javascript-typescript,,2024-07-01T17:19:04Z,85,85,241453152,04400f1a-37ce-11ef-8f54-9b4f1b5f06a0,CodeQL,2.17.6,true,
woot_repo,refs/pull/324/merge,71b7901eb2a18001415f2f51e0e3544322d7ec28,dynamic/github-code-scanning/codeql:analyze,{"language":"python"},/language:python,,2024-07-01T17:18:05Z,0,38,241452646,e11ef5f0-37cd-11ef-838d-ec0d2e8138b2,CodeQL,2.17.6,true,
```

<br>

:card_index: **Sample Workflow Annotation/Report Summary**
```
Total code scanning analyses found: 151.
All org repos reviewed: false.
Repos reviewed: cool-repo, woot-repo.
```

<br>

:space_invader: **Example Workflow Configuration**
```
name: Code Scanning Analysis Report

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 28-31 * *'

jobs:
  code-scanning-analysis-csv:
    runs-on: ubuntu-latest
    name: Code Scanning Analysis CSV
    steps:
      - name: Generate CSV
        uses: lmnleaf/code-scanning-analysis-report@v1.0.0
        with:
          TOKEN: ${{ secrets.GITHUB_TOKEN }}
          path: ${{ github.workspace }}
          repos: cool-repo,woot-repo,wow-repo
          total_days: 7
      - name: Upload CSV
        uses: actions/upload-artifact@v4
        with:
          name: code-scanning-analysis-csv
          path: ${{ github.workspace }}/*.csv
```
