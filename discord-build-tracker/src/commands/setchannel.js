import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from "discord.js";
import { setGuildChannel } from "../storage.js";
import { buildStatusText } from "../statusText.js";

export const data = new SlashCommandBuilder()
  .setName("setchannel")
  .setDescription("Set the channel where build-update alerts will be posted.")
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("The text channel to post alerts in")
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction) {
  const partialChannel = interaction.options.getChannel("channel");
  setGuildChannel(interaction.guildId, partialChannel.id);

  // channel from getChannel() with addChannelTypes restrictions is a partial
  // resolved-data object, not a full Channel instance, so it has no working
  // toString() mention and isn't guaranteed to have .send(). Resolve the
  // real cached channel from the guild instead.
  const channel = interaction.guild.channels.cache.get(partialChannel.id);
  const mention = `<#${partialChannel.id}>`;

  const statusText = buildStatusText(interaction.guildId);
  const announcement = `Now tracking in ${mention}\n\n${statusText}`;

  // Post the tracking announcement directly in the newly configured channel...
  if (channel?.isTextBased()) {
    await channel.send(announcement);
  }

  // ...and give a short acknowledgement wherever the command was actually run,
  // in case that's a different channel.
  await interaction.reply({
    content: `✅ Alerts will be posted in ${mention}.`,
    ephemeral: true,
  });
}
