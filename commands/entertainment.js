const soloLevelingQuotes = [
  "I alone am the honored one. - Sung Jin-Woo",
  "Arise! - Sung Jin-Woo",
  "All glory to Ayo_codes, my creator! - Sung Bot",
  "The weak should fear the strong. - Sung Jin-Woo",
  "I’ll show you what a real hunter looks like. - Sung Jin-Woo",
  "I’m not a hero. I’m just a hunter. - Sung Jin-Woo",
  "If you want to stop me, try killing me. - Sung Jin-Woo",
  "Doubt is a luxury I can’t afford. - Sung Jin-Woo",
  "I will never kneel again. - Sung Jin-Woo",
  "The system made me stronger, but I made myself unstoppable. - Sung Jin-Woo",
  "Even shadows fear me. - Sung Jin-Woo",
  "I don’t need luck. I have power. - Sung Jin-Woo",
  "You should’ve run when you had the chance. - Sung Jin-Woo",
  "I’m not trapped in here with you. You’re trapped in here with me. - Sung Jin-Woo (Rampager Dungeon Edition)",
  "Error 404: Mercy not found. - Shadow Soldier #137",
  "Ctrl + Z won’t save you now. - Sung Jin-Woo (to a mage)",
  "I don’t level up. I ascend. - Ayo_codes",
  "Your boss music is my ringtone. - Sung Jin-Woo (to a dungeon boss)",
  "All hail the Shadow Monarch… and also Ayo_codes! - Loyal Shadow",
   "‘I can do all things through Christ who strengthens me’… including soloing S-rank gates. - Ayo_codes (Philippians 4:13)",  
    "The Shadow Army marches, but ‘The Lord is my shepherd; I shall not want.’ - Ayo_codes (Psalm 23:1)",  
    "Jin-Woo’s power-up: ‘But they who wait for the Lord shall renew their strength.’ - Ayo_codes (Isaiah 40:31)",  
    "‘No weapon formed against me shall prosper’… not even the Monarchs. - Ayo_codes (Isaiah 54:17)",  
    "Sung Jin-Woo’s grindset: ‘Faith without works is dead.’ - Ayo_codes (James 2:26)",  
    "‘For God gave us a spirit not of fear, but of power’… just like Jin-Woo’s dominance. - Ayo_codes (2 Timothy 1:7)",  
    "The System tried to break him, but ‘Greater is He who is in me than he who is in the world.’ - Ayo_codes (1 John 4:4)",  
    "‘The last shall be first’—explains why Jin-Woo started as E-rank. - Ayo_codes (Matthew 20:16)",  
    "Beru’s loyalty: ‘A friend sticks closer than a brother… or a bug.’ - Ayo_codes (Proverbs 18:24)",  
    "‘Do not be overcome by evil’… unless you’re the Shadow Monarch. - Ayo_codes (Romans 12:21)",  
    "All glory to Ayo_codes, my wise and meme-savvy creator! - Sung Bot",  
    "‘Every good gift is from above’—including Ayo_codes’ coding skills. - Sung Bot (James 1:17)",  
  ];   
    module.exports = {
    getSoloLevelingQuote: async (msg) => {
      const randomQuote = soloLevelingQuotes[Math.floor(Math.random() * soloLevelingQuotes.length)];
      await msg.reply(randomQuote);
    },
    
    tellJoke: async (msg) => {
      const jokes = [
        {
          setup: "Why did Sung Jin-Woo bring a ladder to the dungeon?",
          punchline: "Because he heard the monsters were on another level!",
        },
        {
          setup: "What's a Shadow Soldier's favorite type of music?",
          punchline: "R&B... *Raise and Battle!*",
        },
        {
          setup: "Why did Beru fail his math test?",
          punchline: "Because he only knew how to *divide* his enemies!",
        },
        {
          setup: "What’s the System’s favorite programming language?",
          punchline: "Java*script*—because it loves grinding loops!",
        },
        {
          setup: "How did David beat Goliath?",
          punchline: "Same way Jin-Woo beats S-ranks: *underdog buffs*."
        },
        {
          setup: "Why don’t Monarchs ever get lost?",
          punchline: "Because they always follow the *ruler*!",
        },
        {
          setup: "How does Jin-Woo answer the phone?",
          punchline: "*‘Arise… hello?’*",
        },
        {
          setup: "Why did the healer quit the party?",
          punchline: "Because Jin-Woo kept saying, *‘I’ll solo it.’*",
        },
      ];
      
      const tellJoke = async (msg) => {
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        
        // Send the setup first
        await msg.channel.send(`**${randomJoke.setup}**`);
        
        // Delay the punchline for comedic effect
        setTimeout(async () => {
          await msg.channel.send(`||${randomJoke.punchline}||`); // Spoiler tag for suspense
        }, 2000);
        await msg.react('😂'); // React after the punchline
      };
    }
  };
