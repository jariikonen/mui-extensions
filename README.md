# A project template for a React component library (React + TypeScript + Vite)

An opinionated setup for a React TypeScript component library project.

## Selected options

These options were selected when initializing this project:

- [ESLint](#eslint)
- [Prettier](#prettier)
- [EditorConfig](#editorconfig)
- [Vitest](#vitest)
- [Git hooks](#git-hooks)
- [GitHub Actions Workflows](#github-actions-workflows)
- [React Testing Library](#react-testing-library)

## ESLint

The template is configured with recommended rules from
[ESLint](https://eslint.org/docs/latest/), `recommendedTypeChecked` and
`stylisticTypeChecked` rules from
[typescript-eslint](https://typescript-eslint.io/getting-started/) and
plugins for other selected options when available.

## Prettier

The template installs [Prettier](https://prettier.io/docs/) code formatter and if
ESLint is selected, it is also configured to work with it using
[eslint-config-prettier](https://github.com/prettier/eslint-config-prettier).
There are also basic `.prettierrc.json` and `.prettierignore` files.

Read more about integrating Prettier with linters
and [here](https://prettier.io/docs/integrating-with-linters).

## EditorConfig

The template is configured with a simple `.editorconfig` file that
sets basic file settings like charset, end-of-line character, and indent style
and size. Read more about EditorConfig [here](https://editorconfig.org/).

## Vitest

The template is configured with [Vitest](https://vitest.dev/guide/) test
runner. It is configured so that the tests are expacted to be under `src/` and
collected in `__tests__/` subdirectories.

### Setup file

There is also a simple setup file `testSetup.ts`. It uses `cleanup()` function
from `@testing-library/react` to cleanup after each test.

## Git hooks

The template constains a directory `git-hooks` for project's
[Git hooks](https://git-scm.com/docs/githooks), which is meant to be committed
into the repository. There is also a `prepare` script in the `package.json`
that will configure it as Git's hooksPath after you have initialized Git and
installed the dependencies.

### Configuration

Run `git init` to initialize git and install the dependencies, which will
automatically run the configuration script. Or, if you installed the
dependencies first, run the `prepare` script using your package manager
(e.g., `pnpm run prepare`). This will set Git's hooksPath, so it will look for
the hooks from `git-hooks/`.

**Important notice!** The hook files must be executable. The pre-installed
pre-commit hook should already be executable, but if you are adding more hooks,
keep that in mind.

### Pre-commit hook

The pre-commit hook runs the linter (if you selected ESLint), the tests (if you
selected Vitest), tsc for type checking and checks whether Git's worktree is
empty.

### More information

Read more about Git hooks
[here](https://git-scm.com/book/ms/v2/Customizing-Git-Git-Hooks).

## 

The template installs
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
and if ESLint is also installed, it is configured with
[eslint-plugin-testing-library](https://testing-library.com/docs/ecosystem-eslint-plugin-testing-library/).

## GitHub Actions Workflows

There is a .github/workflows/ directory in the project, containing the workflows you selected.

### CI (ci.yaml)

The CI workflow runs the tests, the linter, and builds the project to make sure
that code quality criteria is met. It is configured to run on a push to any
branch and it can be also dispatched manually.

### Automatic release creation with release-please (release-please.yaml)

The Release-please workflow runs the
[googleapis/release-please-action](https://github.com/googleapis/release-please-action)
which creates release pull requests automatically based on the [conventional
commit messages](https://www.conventionalcommits.org/). It runs on a push to
the main branch and it can also be dispatched manually.

The easiest way to start the versioning from a specific version number is to
create an empty commit with `Release-As: <VERSION>` in the message. For
example, like this:

```
git commit --allow-empty -m 'chore: release 0.1.0' -m 'Release-As: 0.1.0'
```

**Notice!** You need to create a Personal Access Token that has read and write
access to code (contents) and pull requests and set it as action secret named
RELEASE_PLEASE_TOKEN in the repository.

### Publish package to npm registry (publish-npm.yaml)

The Publish-npm workflow publishes the package to the npm registry after a new
release is created. It runs on a
[release event](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#release)
that has the type `published` and it can also be dispatched manually.

**Notice!** You also need to add the
[npm publish token](https://docs.npmjs.com/creating-and-viewing-access-tokens)
as an action secret named NPM_TOKEN in the repository.

You may want to customize the arguments for the publish command depending on
whether the access to your package is public or private. The workflow is
currently configured for publishing a public package. Read more about
publishing of npm packages
[here](https://docs.npmjs.com/cli/v11/commands/npm-publish) and
[here](https://docs.npmjs.com/). Read more about publishing packages using pnpm
[here](https://pnpm.io/cli/publish).


