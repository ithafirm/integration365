module.exports = async (ctx) => {
    const { text } = ctx.activity;
    switch (text) {
      default:
        console.log(112)
        await ctx.sendActivity(`I heard you say ${text}`);
        break;
    }
  };
  