console.log("Starting bot...");

const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');


const botToken = ;
const channelId = ; 


const userJourneys = new Map();

// Questions
const questions = [
    {
        text: '**1) Welcome to StoryBot!**\n\nLet\'s start, what way would you like to take our dog Rex?\n**HINT:** You can never go wrong with left', 
        correctAnswer: 'left',
        buttons: [
            new ButtonBuilder().setCustomId('left').setLabel('Left').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('right').setLabel('Right').setStyle(ButtonStyle.Secondary)
        ],
        gifUrl: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNG5vdTg4dGJiOWRlbzMxNGozNXhldm1seW01c2Nmd3d1dW9wYTZidCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UwPV4mVZKynlhTk7bd/giphy.gif'
    },
    {
        text: '**2) Great Work, you made it out of the woods!**\nNow to continue on your adventure, what do you think would be best for Rex to eat?\n**HINT:** Dogs like dog food', 
        correctAnswer: 'dogfood',
        buttons: [
            new ButtonBuilder().setCustomId('icecream').setLabel('Ice Cream').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('dogfood').setLabel('Dog Food').setStyle(ButtonStyle.Secondary)
        ],
        imageUrl: 'https://i.ibb.co/z77BcXY/dogfood.png'
    },
    {
        text: '**3) What group should Rex join?**\n**Hint:** Dogs will most likely hang out with same species.',
        correctAnswer: 'dog',
        buttons: [
            new ButtonBuilder().setCustomId('cat').setLabel('Cat Group').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('dog').setLabel('Dog Group').setStyle(ButtonStyle.Secondary)
        ],
        imageUrl: 'https://i.ibb.co/y6RM1JF/park1.png'
    },
    {
        text: '**4) Awesome, you picked the right crew.**\nNow where do you think a dog would want to go with their new friends? In the water or back home?',
        correctAnswer: 'water',
        buttons: [
            new ButtonBuilder().setCustomId('water').setLabel('In the Water').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('home').setLabel('Back Home').setStyle(ButtonStyle.Secondary)
        ],
        imageUrl: 'https://i.ibb.co/pJskgdR/beach.png'
    },
    {
        text: '**5) A swim got Rex tired!**\nDo you think he had a great day?',
        correctAnswer: 'yes',
        buttons: [
            new ButtonBuilder().setCustomId('yes').setLabel('Yes').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('no').setLabel('No').setStyle(ButtonStyle.Secondary)
        ],
        imageUrl: 'https://i.ibb.co/qDHJMSm/home.png'
    }
];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions,
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setupInteractiveButton();
});

function setupInteractiveButton() {
    client.channels.fetch(channelId).then(channel => {
        const startButton = new ButtonBuilder()
            .setCustomId('start-journey')
            .setLabel('Start Journey')
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder().addComponents(startButton);

        channel.send({
            content: 'Click the button to begin your interactive journey with Story Bot!',
            components: [actionRow]
        });
    }).catch(console.error);
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    const customId = interaction.customId;

    if (customId === 'start-journey') {
        await interaction.deferReply({ ephemeral: true });
        userJourneys.set(userId, { currentQuestion: 0 });
        sendQuestion(interaction, 0);
    } else {
        const journey = userJourneys.get(userId);
        if (journey) {
            const selectedButton = customId;
            const question = questions[journey.currentQuestion];
            const isCorrect = selectedButton === question.correctAnswer;

            await interaction.deferReply({ ephemeral: true });

            if (isCorrect) {
                journey.currentQuestion++;
                if (journey.currentQuestion < questions.length) {
                    sendQuestion(interaction, journey.currentQuestion);
                } else {
                    await assignRole(interaction, userId, true); //true
                    interaction.followUp({ content: '**If you would like the chance at a prize try out our lotto game at:** https://storybot.pro/lottery \n If not please head over to #gen-chat', ephemeral: true });
                    userJourneys.delete(userId);
                }
            } else {
                await assignRole(interaction, userId, false); // false
                interaction.followUp({ content: 'Incorrect answer! Try again.', ephemeral: true });
            }
        }
    }
});

async function sendQuestion(interaction, questionIndex) {
    const question = questions[questionIndex];
    const actionRow = new ActionRowBuilder().addComponents(question.buttons);
    
    const embed = new EmbedBuilder()
        .setDescription(question.text)
        .setColor(0x0099ff);

    if (question.gifUrl) {
        embed.setImage(question.gifUrl);
    } else if (question.imageUrl) {
        embed.setImage(question.imageUrl);
    }

    await interaction.editReply({
        embeds: [embed],
        components: [actionRow],
        ephemeral: true
    });
}

async function assignRole(interaction, userId, isCompletionCorrect) {
    const guild = client.guilds.cache.get(interaction.guildId);
    const member = await guild.members.fetch(userId);
    let role, message;

    if (isCompletionCorrect) {
        role = guild.roles.cache.get("1190401872633274601"); 
        message = 'Congratulations! You have completed the journey and have been granted the Tester role.';
    } else {
        role = guild.roles.cache.get("1190401957697953934"); 
        message = 'You did not answer all questions correctly. You have been granted the Incompetent role.';
    }

    await member.roles.add(role);
    await interaction.followUp({ content: message, ephemeral: true });
}

client.login(botToken);



























