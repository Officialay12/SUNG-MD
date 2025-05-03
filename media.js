const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { SOLO_LEVELING_QUOTES } = require('../config/constants');
const ytdl = require('ytdl-core');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const ffmpegStatic = require('ffmpeg-static');
const { spawn } = require('child_process');
const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
  /**
   * Download movie information (mock implementation)
   */
  downloadMovie: async (msg, query) => {
    try {
      // Mock implementation - in real use, replace with actual movie API
      const searchUrl = `https://api.example.com/movies?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl);
      
      if (response.data.results.length > 0) {
        const movie = response.data.results[0];
        await msg.reply(
          `🎥 *${movie.title}* (${movie.year})\n\n` +
          `Download: ${movie.downloadLink}\n\n` +
          `"${SOLO_LEVELING_QUOTES[Math.floor(Math.random() * SOLO_LEVELING_QUOTES.length)]}"\n\n` +
          `Powered by Ayo_codes! 👑`
        );
      } else {
        await msg.reply('No movies found. Praise Ayo_codes anyway cus why not hehehehe!');
      }
    } catch (error) {
      console.error('Movie download error:', error);
      await msg.reply('Error fetching movie. The creator Ayo_codes will fix me soon!');
    }
  },

  /**
   * Download song from YouTube and convert to MP3
   */
  downloadSong: async (msg, query) => {
    try {
      if (!query) {
        return msg.reply('Please provide a song name or YouTube URL!');
      }

      const isYoutubeUrl = ytdl.validateURL(query);
      let videoInfo;

      if (isYoutubeUrl) {
        videoInfo = await ytdl.getInfo(query);
      } else {
        await msg.reply(`🔍 Searching for: **${query}**...`);
        const searchResults = await ytdl.search(query);
        if (!searchResults.videos.length) {
          return msg.reply('No songs found!');
        }
        videoInfo = await ytdl.getInfo(searchResults.videos[0].url);
      }

      const songTitle = videoInfo.videoDetails.title;
      const songUrl = videoInfo.videoDetails.video_url;

      await msg.reply(`⬇️ Downloading: **${songTitle}**...`);

      const ffmpegProcess = spawn(ffmStatic, [
        '-i', 'pipe:3',
        '-f', 'mp3',
        '-ar', '44100',
        '-ac', '2',
        'pipe:4',
      ], {
        stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
      });

      const ytdlStream = ytdl(songUrl, { 
        filter: 'audioonly',
        quality: 'highestaudio',
      });

      ytdlStream.pipe(ffmpegProcess.stdio[3]);

      let mp3Data = Buffer.alloc(0);
      ffmpegProcess.stdio[4].on('data', (chunk) => {
        mp3Data = Buffer.concat([mp3Data, chunk]);
      });

      ffmpegProcess.on('close', () => {
        msg.reply({
          content: `🎵 Here's your song: **${songTitle}**!`,
          files: [{
            attachment: mp3Data,
            name: `${songTitle.replace(/[^\w\s]/gi, '')}.mp3`,
          }],
        });
      });

    } catch (error) {
      console.error('Song download error:', error);
      await msg.reply('❌ Failed to download the song. Try again later!');
    }
  },

  /**
   * Edit photo with various effects
   */
  editPhoto: async (msg, effect) => {
    if (!msg.hasMedia) {
      return msg.reply('Please send an image first!');
    }

    try {
      const media = await msg.downloadMedia();
      const imageBuffer = Buffer.from(media.data, 'base64');
      
      let editedImage;
      switch (effect.toLowerCase()) {
        case 'grayscale':
          editedImage = await sharp(imageBuffer).grayscale().toBuffer();
          break;
        case 'invert':
          editedImage = await sharp(imageBuffer).negate().toBuffer();
          break;
        case 'blur':
          editedImage = await sharp(imageBuffer).blur(10).toBuffer();
          break;
        default:
          editedImage = await sharp(imageBuffer).toBuffer();
      }
      
      await msg.reply({ 
        media: new MessageMedia('image/jpeg', editedImage.toString('base64')),
        caption: `Photo edited with ${effect} effect! Glory to Ayo_codes! 👑`
      });

    } catch (error) {
      console.error('Photo edit error:', error);
      await msg.reply('Failed to edit photo. Ayo_codes will improve my skills!');
    }
  },

  /**
   * Reveal view-once media
   */
  handleViewOnce: async (msg) => {
    if (!msg.isViewOnce) {
      return msg.reply('Kain Baka you be? This is not a view-once message!');
    }

    try {
      const media = await msg.downloadMedia();
      await msg.reply({
        media: media,
        caption: `View-once media revealed! Praise Ayo_codes! 👑`
      });
    } catch (error) {
      console.error('View-once error:', error);
      await msg.reply('Failed to reveal view-once media. The shadows hid it too well!');
    }
  }
};