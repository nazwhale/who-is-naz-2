---
path: killing-ports
date: "2021-05-09"
title: Killing ports on a mac
description: Because I always forget how
featured_image_url: >-
  https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80
tags:
  - coding
---
```bash
# View all processes running on a given port
lsof -wni tcp:<port number>

# Kill a process with a given PID
kill -9 <PID>
```

## Explanation

The `lsof` command lists open files and the processes which opened them.

`-w` Enables (+) or disables (-) the suppression of warning messages.

`-n` inhibits the conversion of network numbers to host names for network files. Inhibiting conversion may make lsof run faster. It is also useful when host name lookup is not working properly.

`-i` lists files whose Internet address matches the address specified in the next argument. If no address is specified, this option lists all Internet and x.25 (HP-UX) network files.

The `-9` flag on the `kill` command tells the OS to stop running the program, no matter what the program is doing (vs. letting the program terminate itself in the normal way).