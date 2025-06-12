# Claude Code Session


## Intial prompt

This is an educational app that I am using to show off new Cloudflare's new Container product.

It allows for a terminal like sandbox solution.
Users can make POST API calls to /api/sandbox/SLUG where slug is a unique name that the user can define to create or connect to a sandbox of that SLUG. The API will return something like {cwd: "/app/test", "return_code": 0, "stdout": "results", "stderr": ""} . 

You can wipe the old style, this is for Cloudflare so you could use those colors. 

I'd love to keep track of cwd and each time you pass a post you pass {command: "ls", cwd: "/app/new-dir-example"}. 

Use the returned cwd to mark the prompt. 

Can we simulate a terminal looking environment? 