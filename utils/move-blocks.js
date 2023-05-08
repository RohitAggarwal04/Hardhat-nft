const { network } = require("hardhat")

function sleep(timeinMs) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeinMs)
    })
}

async function moveBlocks(amount, sleepAmount = 0) {
    console.log("moving blocks...")
    for (let i = 0; i < amount; i++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
        if (sleepAmount) {
            await sleep(sleepAmount)
        }
    }
}

module.exports = {
    moveBlocks,
    sleep,
}
