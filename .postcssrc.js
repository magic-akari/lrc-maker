module.exports = (ctx) => ({
    map: ctx.options.map,
    plugins: {
        "postcss-import": {},
        "postcss-custom-properties": {},
        "autoprefixer": {},
        "cssnano": ctx.options.map ? {} : false,
    },
});
