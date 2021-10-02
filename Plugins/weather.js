/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/
// const Config = require('../config');
const Asena = require("../Utilis/events");
const Language = require("../language");
const Lang = Language.getString("weather");
// const config = require('../config');
const moment = require("moment");
const {
  getJson,
  dlY2mate,
  getY2mate,
  getBuffer,
  googleSearch,
} = require("../Utilis/download");
const { Mimetype, MessageType } = require("@adiwajshing/baileys");
const ytid =
  /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed|shorts\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;

Asena.addCommand(
  {
    pattern: "weather ?(.*)",
    fromMe: true,
    desc: Lang.WEATHER_DESC
  },
  async (message, match) => {
    if (match === "") return await message.sendMessage(Lang.NEED_LOCATION);
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${match}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&language=en`;
    const json = await getJson(url);
    if (!json) return await message.sendMessage(Lang.NOT_FOUND);
    let o = json.timezone;
    let h = json.sys.sunrise;
    h = h + o;
    p = moment.unix(h);
    let a = json.sys.sunset;
    a = a + o;
    q = moment.unix(a);
    let i = moment.utc(p).format("h:mmA");
    let j = moment.utc(q).format("h:mmA");
    let weather = "```" + Lang.LOCATION + "    : " + json.name + "\n";
    weather += "Country     : " + json.sys.country + "\n";
    weather += Lang.TEMP + " : " + json.main.temp + "°\n";
    weather += Lang.FTEMP + "  : " + json.main.feels_like + "°\n";
    weather += Lang.DESC + " : " + json.weather[0].description + "\n";
    weather += Lang.HUMI + "    : " + json.main.humidity + "%\n";
    weather +=
      Lang.WIND +
      "  : " +
      json.wind.speed +
      " m/s " +
      (json.wind.deg < 23
        ? "N"
        : json.wind.deg < 68
          ? "NE"
          : json.wind.deg < 113
            ? "E"
            : json.wind.deg < 158
              ? "SE"
              : json.wind.deg < 203
                ? "S"
                : json.wind.deg < 248
                  ? "SW"
                  : json.wind.deg < 293
                    ? "W"
                    : "NW") +
      "\n";
    weather += Lang.CLOUD + "       : " + json.clouds.all + "%\n";
    weather += Lang.VISI + "  : " + json.visibility + "m\n";
    weather += Lang.SRISE + "     : " + i + "\n";
    weather += Lang.SET + "      : " + j + "```";
    return await message.sendMessage(weather);
  }
);

Asena.addCommand(
  {
    pattern: "ytv ?(.*)",
    fromMe: true,
    desc: Lang.YTV_DESC,
  },
  async (message, match) => {
    match = !message.repy_message ? match : message.repy_message.text;
    let vid = ytid.exec(match);
    if (match == "" || !vid)
      return await message.sendMessage(Lang.YTV_NEED_REPLY);
    if (/^[0-9]+/.test(match)) {
      await message.sendMessage(Lang.DOWNLOADING);
      let url = await dlY2mate(match);
      let { buffer, size, emessage } = await getBuffer(url);
      if (emessage)
        return message.sendMessage(emessage, { quoted: message.data });
      else if (!buffer)
        return await message.sendMessage(Lang.SIZE.format(size)
        );
      return await message.sendMessage(
        buffer,
        { mimetype: Mimetype.mp4 },
        MessageType.video
      );
    }
    let msg = await getY2mate(match);
    return await message.sendMessage(msg, {}, MessageType.listMessage);
  }
);

Asena.addCommand(
  { pattern: "google ?(.*)", fromMe: true, desc: Lang.GOOGLE_DESC },
  async (message, match) => {
    if (!message.reply_message.image)
      return await message.sendMessage(Lang.INEED_REPLY);
    let msg = "";
    let location = await message.reply_message.downloadMediaMessage();
    let result = await googleSearch(location);
    if (result.length == 0) return await message.sendMessage(Lang.INOT_FOUND);
    result.forEach((url) => {
      msg += `${url}\n`;
    });
    return await message.sendMessage(msg, { quoted: message.data });
  }
);
