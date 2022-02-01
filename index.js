require('dotenv').config();
const axios = require('axios').default;

const { Client, Intents, MessageEmbed } = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let prevTransaction;
let prevTimestamp;
const dexAPIKey = (process.env.DEX_API_KEY);

//Does Discord bot stuff
client.on('ready', () => {
    client.user.setUsername("HecWhaleBot");
    console.log(`${client.user.tag} has logged in.`);
    client.user.setActivity({name: "Watching the Whales.."});

    const interval = 15;

    setInterval(() => {
      // Waiting for the next scraping process
      console.log(`${new Date().toUTCString()} -> Fetching latest transaction Data.`);
      main();
      console.log(`${new Date().toUTCString()} -> Waiting ${interval} Seconds for the next update...`);
    }, interval * 1000);

});

console.log("Logged in the Discord Bot!")
client.login(process.env.DISCORDJS_BOT_TOKEN);

async function handleTransaction(transaction) {
    let buy = "in"
    let sell = "out"
    let whaleAlertAmount ="30000" // SETS THE USD AMOUNT WHEN THE BOT WILL POST A ALERT / PING
    
    const WhaleNotify = "NOTIFY DISCOIRD ROLE"
    const NotfiyChannel = "NOTIFY DISCORD CHANNEL"
    
    let direction = transaction.direction
    let txhhash = transaction.transaction_address
    let transaction_adress_to = transaction.to
    let amount_usd = transaction.amount_usd
    let traderType = transaction.wallet_category
    let tokens_in
    let tokens_in_symbol
    let tokens_out
    let tokens_out_symbol
    let transaction_address_from
    // Need to do this because sometimes for some reason these values don't exist 
    try {
        transaction_address_from = transaction.transaction_address
    } catch(e) {
        console.log(`${new Date().toUTCString()} -> ${e}`)
    }
    
    if (Object.keys(transaction.tokens_in).length == 0){
        console.log(`${new Date().toUTCString()} -> LP Token was probaly created/destroyed undefined Value!"`)
    } else {
        tokens_in = transaction.tokens_in[0].amount
        tokens_in_symbol = transaction.tokens_in[0].symbol
    }

    if (Object.keys(transaction.tokens_out).length == 0){
        console.log(`${new Date().toUTCString()} -> LP Token was probaly created/destroyed undefined Value!"`)
    } else {
        tokens_out = transaction.tokens_out[0].amount
        tokens_out_symbol = transaction.tokens_out[0].symbol
    }

    //Checks if its more than the whaleAlertAmount
    if (amount_usd <= whaleAlertAmount) {
        console.log(`${new Date().toUTCString()} -> Transactions where less than ${whaleAlertAmount}$ they where ${amount_usd.toFixed(2)}$`)
        return;
    }

    //Alerts if its a buy
    if (direction == buy) {
        const buyAlert = new MessageEmbed()
        .setTitle(':rotating_light: Buy Alert :rotating_light:')
        .setColor('#6253cb')
        .setThumbnail('https://i.imgur.com/ILHZRAJ.png')
        .setDescription(`From: ${transaction_address_from}\nTo: ${transaction_adress_to}\nWallet Type: ${traderType}\n\nTransaction hash: [Click here!](https://ftmscan.com/tx/${txhhash})\n\nUSD Value: ${amount_usd.toFixed(2)}$\nTokens Recieved: ${tokens_in.toFixed(4)} ${tokens_in_symbol}\nTokens sent : ${tokens_out.toFixed(4)} ${tokens_out_symbol}`)
        .setTimestamp()
        .setFooter({ text: `Transactions get scraped every 20 Seconds` })
        
    
        console.log(`${new Date().toUTCString()} -> Send Discord Messages!`)
        client.channels.cache.get(NotfiyChannel).send({ embeds: [buyAlert] });
        const channel = client.channels.cache.get(NotfiyChannel);
        channel.send(`<@&${WhaleNotify}> Whale Bought ${tokens_out.toFixed(4)} ${tokens_out_symbol} that is equal to ${amount_usd.toFixed(2)}$`)
        
    }

    //Alerts if its a sell
    if (direction == sell) {
        const sellAlert = new MessageEmbed()
        .setTitle(':rotating_light: Sell Alert :rotating_light:')
        .setColor('#6253cb')
        .setThumbnail('https://i.imgur.com/ILHZRAJ.png')
        .setDescription(`From: ${transaction_address_from}\nTo: ${transaction_adress_to}\nWallet Type: ${traderType}\n\nTransaction hash: [Click here!](https://ftmscan.com/tx/${txhhash})\n\nUSD Value: ${amount_usd.toFixed(2)}$\nTokens Sent: ${tokens_in.toFixed(4)} ${tokens_in_symbol}\nTokens Recieved : ${tokens_out.toFixed(4)} ${tokens_out_symbol}`)
        .setTimestamp()
        .setFooter({ text: `Transactions get scraped every 20 Seconds` })

        console.log(`${new Date().toUTCString()} -> Send Discord Messages!`)
        client.channels.cache.get(NotfiyChannel).send({ embeds: [sellAlert] });
        const channel = client.channels.cache.get(NotfiyChannel);
        channel.send(`<@&${WhaleNotify}> Whale Sold $HEC for ${tokens_out.toFixed(4)} ${tokens_out_symbol} that is equal to ${amount_usd.toFixed(2)}$`)
    }
}

async function main() {
    try {
        console.log(`\n${new Date().toUTCString()} -> Trieng to fetch data...`)
        const prevTsQuery = prevTimestamp ? `&begin_timestamp=${prevTimestamp}` : '';
        res = await axios.get(`https://api.dev.dex.guru/v1/chain/250/tokens/0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0/transactions/?api-key=${dexAPIKey}${prevTsQuery}&limit=25`)
        prevTimestamp = res.data.data[0].timestamp;
        console.log(`${new Date().toUTCString()} -> New Timestamp Set: ${prevTimestamp}\n`)
        } catch(e) {
            console.log(`\n${new Date().toUTCString()} -> Couldnt fetch new data error.\n`)
            return;
        }

    console.log(`${new Date().toUTCString()} -> Looking for new Transactions`)
    for (const transaction of res.data.data) {
        if (prevTransaction === transaction.timestamp) {
            console.log(`${new Date().toUTCString()} -> No New Transactions! \n`)
            break;
        }
        // fetches new data again checks if its over $value and pings everbody.
        handleTransaction(transaction);
    }
    // Store latest transaction

    if (Object.keys(res.data.data).length == 0){
        console.log(`${new Date().toUTCString()} -> Timestamp not available."`)
    } else {
        prevTransaction = res.data.data[0].timestamp;
    }

}
