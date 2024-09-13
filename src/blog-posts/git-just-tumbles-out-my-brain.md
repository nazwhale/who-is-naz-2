---
path: git-just-tumbles-out-of-my-brain
date: "2020-07-20"
title: Git just tumbles out of my brain
description: A collection of git commands I constantly forget
featured_image_url: https://post.healthline.com/wp-content/uploads/2020/07/nervous2-30.jpg
tags:
  - coding
  - git
---
## Rename a branch

```bash
git branch -m <new_name>
```

## Delete all local changes (both staged and unstaged)

```bash
git stash # Good habit so that changes are saved just incase
git reset --hard
```

git reset --hard resets the files in both the staging area and the working directory.

## Move a commit from master to a new branch

```bash
git checkout master
git branch new-branch
git status
git reset --hard HEAD~ # Removes the unwanted commit from master
git checkout new-branch
```

## I've got a merge conflict. I wanna rebase.

```bash
# Assuming we're on your feature branch...
# First pull in latest changes from master
git fetch origin master:master
git rebase origin/master
# you should get this:
# error: Failed to merge in the changes.
# Patch failed at...
# Resolve all conflicts manually... 

# Let's see the damage
git status

# Now, go into your editor and resolve the conflicts.
# Then, git add your changes (you don't need to commit)
git add .
git rebase --continue

# You might repeat this process a few more times as git replays you changes commit-by-commit
# When you're done, force push
git push origin <branch> --force-with-lease
```

## Should I merge instead of rebase?

```bash
git merge master 
# or
git rebase origin/master
```

Merging in master isn't always what you want

* If you have a branch branched from commit 1 and you add commit 4 and 5, then merge in master which has commits 2 and 3 to your branch, the order of commits becomes 1, 4, 5, 2, 3
* Typically, you want to change the base of your branch so your changes are on the latest master. For that, there's rebase which changes the base commit of your branch. This will then make the commit order 1, 2, 3, 4, 5 (so your branch root changes from commit 1 to commit 3

See master as the source of truth at any given time, with your branched changes wanting to be applied on top.

## What's the difference between fetch and pull again?

```bash
git fetch
```

Git fetch only downloads new data from a remote repository - but it doesn't integrate any of this new data into your working files. Fetch will never manipulate, destroy, or screw up anything.

Fetch is great for getting a fresh view on all the things that happened in a remote repository.

```bash
git pull
```

Git pull is used to update your current HEAD branch with the latest changes from Github.

This means that pull not only downloads new data. It also directly integrates it into your current working copy files. This has a couple of consequences:

* Since git pull tries to merge remote changes with your local ones, a "merge conflict" can occur.
* It's highly recommended to start a `git pull` only with a clean working directory (i.e. no uncommitted local changes). Use git stash to save your local changes temporarily.

## When to use origin, origin/master, origin:master

```bash
git fetch origin
git fetch origin/master
git fetch origin:master
```

todo 🏗

## What's up with HEAD?

The most recent commit on the current branch is the HEAD of the branch. Commands that take a commit as a parameter will use HEAD by default.

```bash
git show
# is the same as...
git show HEAD

git reset --hard
# is the same as...
git reset --hard HEAD
```

Other ridiculous crap:

```bash
# The at sign (@) is synonymous with HEAD. So we could use...
git show @ 

# The caret (^) represents the commit’s parent.
HEAD^  # So, this will get the second-to-last commit...
HEAD^^ # ...and this will get the third-to-last commit

# The tilda (~) is a shortcut character for when you have multiple carets (^) in a row.
HEAD~3 # ...is equivalent to HEAD^^^
HEAD~5 # ...is equivalent to HEAD^^^^^
HEAD~  # ...is equivalent to HEAD^ 😖
```

It's fine to forget the existence of the at sign (@) and caret (^). Instead, always use HEAD~n