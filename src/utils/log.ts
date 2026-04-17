import axios from 'axios';
import { DISCORD_WEBHOOK_URL, GLOBAL_CONFIG } from 'src/settings';
import util from 'util';

const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const LOG_LEVEL_MAP = {
  DEBUG: { level: -1, color: '\x1b[34m', emoji: '<:warn_blue:1363337995939217590>' },
  INFO: { level: 0, color: '\x1b[32m', emoji: '<:warn_green:1363337995939217589>' },
  SUCCESS: { level: 0, color: '\x1b[32m', emoji: '<:warn_green:1363337995939217589>' },
  WARNING: { level: 1, color: '\x1b[33m', emoji: '<:warn_yellow:1363338001073307729>' },
  ERROR: { level: 2, color: '\x1b[31m', emoji: '<:warn_orange:1363337997751419002>' },
  CRITICAL: { level: 3, color: '\x1b[41m\x1b[37m', emoji: '<:warn_red:1363337999386935539>' }
} as const;

type LogType = keyof typeof LOG_LEVEL_MAP;

function convertMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, `${BOLD}$1${RESET}`);
}

function getFormattedDate(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return `${yy}.${mm}.${dd} ${hh}:${min}:${ss}`;
}

export class Logger {
  public name: string | null;

  constructor(name: string | null = null) {
    this.name = name;
  }

  public log(content: string, logType: LogType | string = 'INFO', datestr?: string | null, hidePrompt = false) {
    const dateStr = datestr || getFormattedDate();
    if (!(logType in LOG_LEVEL_MAP)) {
      this.log(`유효하지 않은 로그 타입 사용: ${logType}`, 'WARNING');
      logType = 'INFO';
    }

    const validLogType = logType as LogType;
    const config = LOG_LEVEL_MAP[validLogType];
    const padType = validLogType.padStart(8, ' ');
    const formattedContent = util.format(content);

    const terminalContent = `${BOLD}${config.color}${padType}:   ${RESET} ${dateStr}   ${convertMarkdownBold(formattedContent)}`;

    if (!hidePrompt) {
      if (validLogType === 'ERROR' || validLogType === 'CRITICAL' || validLogType === 'WARNING') {
        console.error(terminalContent);
      } else {
        console.log(terminalContent);
      }
    }
  }

  public async logAsync(content: string, logType: LogType | string = 'INFO', datestr?: string | null, hidePrompt = false) {
    const dateStr = datestr || getFormattedDate();
    if (!(logType in LOG_LEVEL_MAP)) {
      this.log(`유효하지 않은 로그 타입 사용: ${logType}`, 'WARNING');
      logType = 'INFO';
    }

    const validLogType = logType as LogType;
    this.log(content, validLogType, dateStr, hidePrompt);

    const config = LOG_LEVEL_MAP[validLogType];
    const formattedContent = util.format(content);

    let discordContent = '';
    if (this.name === null) {
      discordContent = `${config.emoji}\`[${dateStr}]\` ${formattedContent}`;
    } else {
      discordContent = `${config.emoji}\`[${dateStr}]\` \`[${this.name}]\` ${formattedContent}`;
    }

    await this._sendDiscord(discordContent, config.level >= 2);
  }

  public async reportAsync(content: string, important = false) {
    await this._sendDiscordReport(content, important);
  }

  public d(content: string, datestr?: string | null, hidePrompt = false) { this.log(content, 'DEBUG', datestr, hidePrompt); }
  public i(content: string, datestr?: string | null, hidePrompt = false) { this.log(content, 'INFO', datestr, hidePrompt); }
  public s(content: string, datestr?: string | null, hidePrompt = false) { this.log(content, 'SUCCESS', datestr, hidePrompt); }
  public w(content: string, datestr?: string | null, hidePrompt = false) { this.log(content, 'WARNING', datestr, hidePrompt); }
  public e(content: string, datestr?: string | null, hidePrompt = false) { this.log(content, 'ERROR', datestr, hidePrompt); }
  public c(content: string, datestr?: string | null, hidePrompt = false) { this.log(content, 'CRITICAL', datestr, hidePrompt); }

  public async ad(content: string, datestr?: string | null, hidePrompt = false) { await this.logAsync(content, 'DEBUG', datestr, hidePrompt); }
  public async ai(content: string, datestr?: string | null, hidePrompt = false) { await this.logAsync(content, 'INFO', datestr, hidePrompt); }
  public async as(content: string, datestr?: string | null, hidePrompt = false) { await this.logAsync(content, 'SUCCESS', datestr, hidePrompt); }
  public async aw(content: string, datestr?: string | null, hidePrompt = false) { await this.logAsync(content, 'WARNING', datestr, hidePrompt); }
  public async ae(content: string, datestr?: string | null, hidePrompt = false) { await this.logAsync(content, 'ERROR', datestr, hidePrompt); }
  public async ac(content: string, datestr?: string | null, hidePrompt = false) { await this.logAsync(content, 'CRITICAL', datestr, hidePrompt); }

  private async _sendDiscord(message: string, important = false) {
    if (!DISCORD_WEBHOOK_URL) return;

    let content = message;
    if (important) {
      const roleId = GLOBAL_CONFIG.discordManagerUserId;
      if (roleId) content = `<@${roleId}>\n${content}`;
    }

    try {
      await axios.post(DISCORD_WEBHOOK_URL, { content });
    } catch (error) {
      this.e(`Error sending Discord notification: ${error}`);
    }
  }

  private async _sendDiscordReport(message: string, important = false) {
    const reportUrl = DISCORD_WEBHOOK_URL;
    if (!reportUrl) return;

    let content = message;
    if (important) {
      const roleId = GLOBAL_CONFIG.discordManagerUserId;
      if (roleId) content = `<@${roleId}>\n${content}`;
    }

    try {
      await axios.post(reportUrl, { content });
    } catch (error) {
      this.e(`Error sending Discord report: ${error}`);
    }
  }
}

export const logger = new Logger();