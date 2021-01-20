const http = require("http");
const handler = require("serve-handler");

const server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/vercel/serve-handler#options

    let public = "build";

    if (/^\/src\//.test(request.url) || /^\/node_modules\//.test(request.url)) {
        public = ".";
    }

    return handler(request, response, {
        public,
    });
});

server.listen(3000, () => {
    console.log("Running at http://localhost:3000");
});
