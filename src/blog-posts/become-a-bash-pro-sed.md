---
title: "Become a bash pro: sed"
date: "2024-01-10"
description: From 0 to sed
featured_image_url: https://miro.medium.com/max/2000/1*v4o2AXLIJaHSZmqYZk26qA.jpeg
tags:
  - coding
---
# Intro

`sed` is a great one to have in your text-editing toolbox. It shines when there are patterns in the text.

⚠️ There are two types of `sed`. We're assuming you're using the BSD type found on macOS.️

Here's the format:
```bash
sed [options] <commands> [file-to-edit]
```

# Hello World

```bash
echo "Hello sed" | sed 's/sed/World/'
# Hello World
```

`s` is the sed command for find-and-replace.


# Resources

[Sed BSD docs](https://www.freebsd.org/cgi/man.cgi?query=sed&sektion=&n=1)

[Getting started with sed](https://riptutorial.com/sed)

[Sed basics - Digital Ocean (GNU rather than BSD)](https://www.digitalocean.com/community/tutorials/the-basics-of-using-the-sed-stream-editor-to-manipulate-text-in-linux)