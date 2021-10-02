/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/

const Asena = require("../Utilis/events");
const Language = require("../language");
const { checkImAdmin } = require("../Utilis/Misc");
const { MessageType } = require("@adiwajshing/baileys");
const { getName } = require("../Utilis/download");
const Lang = Language.getString("admin");
Asena.addCommand(
  { pattern: "kick ?(.*)", fromMe: true, onlyGroup: true, desc: Lang.BAN_DESC },
  async (message, match) => {
    let participants = await message.groupMetadata(message.jid);
    let im = await checkImAdmin(participants, message.client.user.jid);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    if (!message.reply_message && match.startsWith("all")) {
      await message.sendMessage(Lang.REMOVE_ALL);
      await new Promise((r) => setTimeout(r, 10 * 1000));
      let users = participants.filter((member) => !member.isAdmin == true);
      for (let user of users) {
        await new Promise((r) => setTimeout(r, 1000));
        await message.groupRemove(message.jid, user.jid);
      }
      return;
    }
    let user = await checkImAdmin(
      participants,
      !message.reply_message ? message.mention[0] : message.reply_message.jid
    );
    if (user) return await message.sendMessage(Lang.IS_ADMIN);
    if (message.reply_message != false) {
      await message.sendMessage(
        Lang.BANNED.format(message.reply_message.jid.split("@")[0]),
        { contextInfo: { mentionedJid: [message.reply_message.jid] } }
      );
      return await message.groupRemove(message.jid, message.reply_message.jid);
    } else if (message.reply_message === false && message.mention !== false) {
      await message.sendMessage(
        Lang.BANNED.format(message.mention[0].split("@")[0]),
        { contextInfo: { mentionedJid: message.mention } }
      );
      return await message.groupRemove(message.jid, message.mention[0]);
    } else {
      return await message.sendMessage(Lang.GIVE_ME_USER);
    }
  }
);

Asena.addCommand(
  {
    pattern: "add(?: |$)(.*)",
    fromMe: true,
    onlyGroup: true,
    desc: Lang.ADD_DESC,
  },
  async (message, match) => {
    let participant = await message.groupMetadata(message.jid);
    let im = await checkImAdmin(participant, message.client.user.jid);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    if (match !== "") {
      match.split(" ").map(async (user) => {
        let { participants } = await message.client.groupAdd(message.jid, [
          user + "@c.us",
        ]);
        participants.map(async (participant) => {
          let { invite_code, invite_code_exp, code } =
            participant[user + "@c.us"];
          if (code == "403") {
            await message.client.sendMessage(
              user + "@s.whatsapp.net",
              {
                inviteCode: invite_code,
                inviteExpiration: invite_code_exp,
                groupName: await getName(message.jid, message.client),
                groupJid: message.jid,
                caption: "Group Invite Message",
              },
              MessageType.groupInviteMessage
            );
            return await message.sendMessage(Lang.FAILED);
          }
          if (code == "200")
            return await message.sendMessage(Lang.ADDED.format(user), {
              contextInfo: { mentionedJid: [user + "@s.whatsapp.net"] },
            });
        });
      });
    } else {
      return await message.sendMessage(Lang.GIVE_ME_USER);
    }
  }
);

Asena.addCommand(
  {
    pattern: "promote ?(.*)",
    fromMe: true,
    onlyGroup: true,
    desc: Lang.PROMOTE_DESC,
  },
  async (message, match) => {
    let participants = await message.groupMetadata(message.jid);
    let im = await checkImAdmin(participants, message.client.user.jid);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    if (message.reply_message !== false) {
      let checkAlready = await checkImAdmin(
        participants,
        message.reply_message.jid
      );
      if (checkAlready) return await message.sendMessage(Lang.ALREADY_PROMOTED);
      await message.client.groupMakeAdmin(message.jid, [
        message.reply_message.jid,
      ]);
      return await message.sendMessage(
        Lang.PROMOTED.format(message.reply_message.jid.split("@")[0]),
        { contextInfo: { mentionedJid: [message.reply_message.jid] } }
      );
    } else if (message.reply_message === false && message.mention !== false) {
      let checkAlready = await checkImAdmin(participants, message.mention[0]);
      if (checkAlready)
        return await message.sendMessage(Lang.ALREADY_PROMOTED);
      await message.client.groupMakeAdmin(message.jid, message.mention);
      return await message.sendMessage(Lang.PROMOTED.format(message.mention[0].split("@")[0]), {
        contextInfo: { mentionedJid: message.mention },
      });
    } else {
      return await message.sendMessage(Lang.GIVE_ME_USER);
    }
  }
);

Asena.addCommand(
  {
    pattern: "demote ?(.*)",
    fromMe: true,
    onlyGroup: true,
    desc: Lang.DEMOTE_DESC,
  },
  async (message, match) => {
    let participants = await message.groupMetadata(message.jid);
    let im = await checkImAdmin(participants, message.client.user.jid);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    if (message.reply_message !== false) {
      let checkAlready = await checkImAdmin(
        participants,
        message.reply_message.jid
      );
      if (!checkAlready)
        return await message.sendMessage(Lang.ALREADY_NOT_ADMIN);
      await message.sendMessage(
        Lang.DEMOTED.format(message.reply_message.jid.split("@")[0]),
        { contextInfo: { mentionedJid: [message.reply_message.jid] } }
      );
      return await message.client.groupDemoteAdmin(message.jid, [
        message.reply_message.jid,
      ]);
    } else if (message.reply_message === false && message.mention !== false) {
      let checkAlready = await checkImAdmin(participants, message.mention[0]);
      if (!checkAlready)
        return await message.sendMessage(Lang.ALREADY_NOT_ADMIN);
      await message.sendMessage(Lang.DEMOTED.format(message.mention[0].split("@")[0]), {
        contextInfo: { mentionedJid: message.mention },
      });
      return await message.client.groupDemoteAdmin(
        message.jid,
        message.mention
      );
    } else {
      return await message.sendMessage(Lang.GIVE_ME_USER);
    }
  }
);

Asena.addCommand(
  {
    pattern: "mute ?(.*)",
    fromMe: true,
    onlyGroup: true,
    desc: Lang.MUTE_DESC,
  },
  async (message, match) => {
    let participants = await message.groupMetadata(message.jid);
    let im = await checkImAdmin(participants, message.client.user.jid);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    if (match == "") {
      await message.GroupMuteSettingsChange(message.jid, true);
      return await message.sendMessage(Lang.MUTED);
    } else {
      await message.GroupMuteSettingsChange(message.jid, true);
      await message.sendMessage(Lang.TMUTE + match + " mintues```");
      await new Promise((r) => setTimeout(r, match * 60000));
      await message.GroupMuteSettingsChange(message.jid, false);
      return await message.sendMessage(Lang.UNMUTED);
    }
  }
);

Asena.addCommand(
  {
    pattern: "unmute ?(.*)",
    fromMe: true,
    onlyGroup: true,
    desc: Lang.UNMUTE_DESC,
  },
  async (message, match) => {
    let participants = await message.groupMetadata(message.jid);
    let im = await checkImAdmin(participants, message.client.user.jid);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    await message.GroupMuteSettingsChange(message.jid, false);
    return await message.sendMessage(Lang.UNMUTED);
  }
);

Asena.addCommand(
  {
    pattern: "invite ?(.*)",
    fromMe: true,
    onlyGroup: true,
    desc: Lang.INVITE_DESC,
  },
  async (message, match) => {
    let participants = await message.groupMetadata(message.jid);
    let im = await checkImAdmin(participants, message.client.user.jid);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    let invite = await message.client.groupInviteCode(message.jid);
    return await message.sendMessage(Lang.INVITE.format(invite));
  }
);
Asena.addCommand(
  {
    pattern: "common ?(.*)",
    fromMe: true,
    desc: Lang.COMMON_DESC,
  },
  async (message, match) => {
    let [jid1, jid2] = match.split(" ") || [];
    if (jid1 == "" || jid2 == "" || jid1 == undefined || jid2 == undefined)
      return await message.sendMessage(Lang.SYNTAX, {
        quoted: message.data,
      });
    try {
      var grup1 = await message.groupMetadata(jid1);
      var grup2 = await message.groupMetadata(jid2);
    } catch (error) {
      return await message.sendMessage(Lang.INVALID_JID, {
        quoted: message.data,
      });
    }
    let common = "";
    let sonuc1 = grup1.map((member) => member.jid);
    let sonuc2 = grup2.map((member) => member.jid);
    let com = sonuc1.filter((x) => sonuc2.includes(x));
    com.forEach((member) => (common += `@${member.split("@")[0]}\n`));
    return await message.sendMessage(common, {
      contextInfo: { mentionedJid: com },
    });
  }
);

Asena.addCommand(
  {
    pattern: "diff ?(.*)",
    fromMe: true,
    desc: Lang.DIFF_DESC,
  },
  async (message, match) => {
    let [jid1, jid2] = match.split(" ") || [];
    if (jid1 == "" || jid2 == "" || jid1 == undefined || jid2 == undefined)
      return await message.sendMessage(Lang.SYNTAX, {
        quoted: message.data,
      });
    try {
      var grup1 = await message.groupMetadata(jid1);
      var grup2 = await message.groupMetadata(jid2);
    } catch (error) {
      return await message.sendMessage(Lang.INVALID_JID, {
        quoted: message.data,
      });
    }
    let diff = "";
    let sonuc1 = grup1.map((member) => member.jid);
    let sonuc2 = grup2.map((member) => member.jid);
    let difference = sonuc1
      .filter((x) => !sonuc2.includes(x))
      .concat(sonuc2.filter((x) => !sonuc1.includes(x)));
    difference.forEach((member) => (diff += `@${member.split("@")[0]}\n`));
    return await message.sendMessage(diff, {
      contextInfo: { mentionedJid: difference },
    });
  }
);

Asena.addCommand(
  {
    pattern: "join ?(.*)",
    fromMe: true,
    desc: Lang.JOIN_DESC,
  },
  async (message, match) => {
    match = !message.reply_message ? match : message.reply_message.text;
    if (match == "") return await message.sendMessage(Lang.JOIN_ERR);
    let wa = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/;
    let [_, code] = message.message.match(wa) || [];
    if (!code) return await message.sendMessage(Lang.JOIN_ERR);
    await message.client.acceptInvite(code);
    return await message.sendMessage(Lang.JOINED);
  });

Asena.addCommand(
  {
    pattern: "revoke",
    fromMe: true,
    onlyGroup: true,
    desc: Lang.REVOKE_DESC,
  },
  async (message, match) => {
    let participants = await message.groupMetadata(message.jid);
    let im = await checkImAdmin(participants, message.client.user.jid);
    if (!im) return await message.sendMessage(Lang.IM_NOT_ADMIN);
    await message.client.revokeInvite(message.jid);
    return await message.sendMessage(Lang.REVOKE);
  }
);
