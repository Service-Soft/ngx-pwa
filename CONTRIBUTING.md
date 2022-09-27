# Contributing to NgxPwa
Thank you for considering to contribute to this project! It is open for discussion to change anything regarding contributing, linting, workflow etc. at any point in time.
<br>
All development is done using github.

# Table of Contents
- [Contributing to NgxPwa](#contributing-to-ngxpwa)
- [Table of Contents](#table-of-contents)
- [Create an Issue](#create-an-issue)
  - [Special guidelines for bug reports](#special-guidelines-for-bug-reports)
- [Folder structure of the project](#folder-structure-of-the-project)
- [Starting the project](#starting-the-project)
- [Codestyle](#codestyle)
  - [Decorator Configs / User Input](#decorator-configs--user-input)
  - [Naming conventions](#naming-conventions)
- [Tests](#tests)
- [Workflow for submitting Code Changes](#workflow-for-submitting-code-changes)
- [License](#license)

# Create an Issue
If you want to ask a question, need a new feature, found gaps in the documentation, found a bug, found code that can be refactored etc. you first have to start with creating an Issue.
<br>
Please check if there already is an issue for your problem.
<br>
Right now there are now specific guidelines for Issues, other than that their name and description should include enough details so that everyone knows what the issue is about. You should also include some fitting tags.

## Special guidelines for bug reports

Great Bug Reports tend to have:

- A quick summary
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

# Folder structure of the project
The project contains an simple api for testing inside the files `api-data.ts` and `api.ts`.
<br>
The main projects are the library itself which will be published to npm and an showcase project used for trying things out. They can be found inside the `project/ngx-pwa` and `projects/ngx-pwa-showcase` directories

# Starting the project
1. Run `npm install` in the root directory,
2. Run `npm install` in the project/ngx-pwa directory
3. Run `npm run stack` in the root directory. This will start the api, the build-process of the library aswell as the showcase project all in watch-mode (hot reload). That's it! You will probably only ever need this single command.
> :information_source: About package.json
> <br>
> If you open the package.json in the root directory you will probably notice that it looks a bit messy. That is mainly because:
> 1. the scripts should support Windows which means that commands like `cp` or even just chaining stuff with `&&` is not available and needed to be replaced with node alternatives.
> 2. Some of the CD process is done here aswell

# Codestyle
This project is using eslint and requires all linting to pass in order to merge pull requests. It can happen that you need to use code that is against some of the rules (e.g. required use of "any"). In that case you can of course disable that rule at that specific point with
<br>
`// eslint-disable-next-line the-rule-to-disable`
> You can run eslint with the command `npm run lint`
> <br>
> You can autofix some codestyle problems with `npm run lint:fix`

## Decorator Configs / User Input
Every Input the user can make (e.g. with the decorators or with @Input()) should be split up in two different models.

The first model should be used internal and require all input. The second model should only require values where no default value can be set. The second model should only be used by the user and never internally.

That way the components can be highly customizable without requiring the user to input the whole configuration. With the internal model that requires all values we also ensure that newly added configuration options aren't (as easily) forgotten somewhere.

## Naming conventions

All angular components / modules inside the library(projects/ngx-pwa) should be named "`NgxPwa`MyGreatComponentOrModule".

Their selector should follow the same logic:
<br>
"`ngx-pwa`-my-great-component-or-module"

In the folder structure however, you are encouraged to leave the prefix out, because the user will never see this anyway.

# Tests
The testing consists of two test types:
1. Unit Tests with Jest, should be used for everything that isn't an angular component
2. E2E Tests using Cypress, should be used to test how angular components behave in the "real" world

# Workflow for submitting Code Changes

1. Create an issue if it not already exists.
2. Create a branch for that specific issue (The best way to this is directly inside the issue on the right side under "Development". That way the the issue and the branch are automatically linked)
3. Checkout the new branch
4. Add your code
5. Update / add [tests](#tests).
6. Update the documentation.
7. Check that tests and linting passes.
   1. For tests: `npm run test`
   2. For linting: `npm run lint` / `npm run lint:fix`
8. Rebase to dev and solve any merge-conflicts (`git rebase dev`)
9. Issue that pull request!

# License
By contributing to this project, you agree that your contributions will be licensed under its MIT License.