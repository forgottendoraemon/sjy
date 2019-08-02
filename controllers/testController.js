module.exports = {
    // get test/servertime
    servertime: async function (ctx) {
        ctx.response.ok({ time: new Date(), state: "OK" });
    },
    // post test
    post: async function (ctx) {
        let postValue = ctx.request.body.inputValue;
        ctx.response.ok({ postValue });
    },
};