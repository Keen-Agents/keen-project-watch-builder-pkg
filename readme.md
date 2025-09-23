# KEEN PROJECT WATCH BUILDER

> **KEEN PROJECT WATCH BUILDER PKG** is an npm package for creating and deploying **Keen Agents Projects** to a cloud server.  
> This repository hosts the **Build version** of the package.

---

## 🚀 Overview

This package streamlines the process of creating, building, and deploying Keen Agents Projects to the cloud.  
It comes preconfigured with modern developer tools and practices:

- **Husky hooks** for Git workflow automation
- **Prettier** for code style and formatting

---

## 🛠️ Deployment Process

> Get the **dist** folder from project **keen-project-watch-builder**
> Paste the **dist** in this project
> Authenticate in **npmjs** and publish the package with access **public**

```
npm publish --access public
```

## 📝 Code Standards

We use **Prettier** to maintain consistent code style (spacing, formatting).

For the best experience:

- Install the Prettier VS Code plugin
- Make sure code is formatted before committing

## 🌿 Branching Strategy

Branch names must follow one of these formats:

```
- feature/KWBP-<NUMBER>
- fix/KWBP-<NUMBER>
- hotfix/KWBP-<NUMBER>
- remove/KWBP-<NUMBER>
- release/KWBP-<NUMBER>
```

Where `<NUMBER>` is the ticket number.

## 📝 Commit Messages

Each commit message must follow this format:

```
KWBP-<NUMBER>:<ADD|FIX|DELETE>: <MESSAGE>
```

```
NUMBER: Ticket number

ADD: A new feature

FIX: A feature was fixed

DELETE: Code cleaned or removed

MESSAGE: Short description of the change
```

Example:

```
KWBP-123:ADD: Version 1.0.1
```

## 🔀 Pull Requests

- After pushing, create a PR to the development branch
- A minimum of 2 reviewers must approve before merging
