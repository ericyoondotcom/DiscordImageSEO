# DiscordImageSEO
Improve searchibility of images in Discord by auto-generating short descriptions/OCR when they're sent.

> ❗ AI warning: this project was vibe coded with Gemini CLI. Everything except this README is written by machine 

When a message containing an uploaded image is sent, the bot will send a message in a specified channel with (1) a short image description, (2) any OCR text, and (3) a link to the original message. This makes it so you can search images easily using Discord's text search feature!

## Getting started
1. Copy `.env.template` to `.env`, fill it in with your API keys and Discord bot token
2. Run bot with `node index.js`
3. Choose a channel (ideally muted :p) that OCR messages will be sent in. Run the `/setocr` command (as a server admin) in that channel
4. Wait for people to send images to your server!

## Technical Details (instructions for LLM)
- Use discord.js v14
- Do not leave unnecessary comments, only leave comments if theres something even a senior SWE wouldn't understand
- Break out functionality into different files when necessary 
- Use structured data API to get separate OCR text and image description fields.
- When sending the bot message use `-# ` prefix to make text formatted small and grey
- Gracefully handle LLM rejections, e.g. if a user sends an NSFW image that the LLM can't caption
- Support all languages
