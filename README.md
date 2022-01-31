
# hectordao.com / hectorfinance.com whale alert discord bot

This is a Discord Bot that tracks the the transactions of the $HEC Token.
It alerts you if a whale sales or buys the token.


If you just want to checkout the Bot join my Discord!
https://discord.gg/KrbNkMyQut


## How to Setup

First of all you will need to install the Modules from the package.json by going into the Directory and running this command
```
npm install
```

#### 1. Input your Discord Bot Token Key into the .env & you're https://api.dev.dex.guru/docs API Key.

```
  DISCORDJS_BOT_TOKEN= < DISCORD BOT TOKEN >
  DEX_API_KEY= < DEX_API_KEY >
```

#### 2.Input the Discord Channel ID for the Bot where he will Post the Alerts + You will need to create a Role and Copy the Role ID Wich the Bot will Ping.

```javascript
    const WhaleNotify = "NOTIFY DISCOIRD ROLE"
    const NotfiyChannel = "NOTIFY DISCORD CHANNEL"
```

#### 3. Change the value of the Amount you want the Bot to Post messages + Ping the Role

```javascript
    let whaleAlertAmount ="30000"
```


After that all you need to do is run the bot with 
```
node index.js 
```





## Authors

- [@KIiment](https://github.com/xKliment)

