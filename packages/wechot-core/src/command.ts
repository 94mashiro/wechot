import { CAC, cac, Command as CacCommand } from 'cac';
import { Message } from 'wechaty';
import parse from 'yargs-parser';

export interface ICommandOptions {
  command?: string;
  example?: string;
  description?: string;
  action: (message: Message, ...args: any[]) => Promise<string | null>;
}

export class Command {
  static parseCommandString(rawString: string) {
    // 不是很懂这里为什么会出现一个隐藏字符
    const fixedRawString = rawString.replace(/ /g, '');
    return [...fixedRawString.split(' ').filter(Boolean)];
  }

  private cac: CAC;
  private registeredCommand: Map<string, ICommandOptions> = new Map();

  constructor() {
    this.cac = cac();
    this.cac.help();
  }

  // eslint-disable-next-line max-params
  register(
    command: string,
    action: (message: Message, ...args: any[]) => Promise<string | null>,
    description?: string,
    example?: string,
  ): this | null {
    const name = command.split(' ')[0];
    if (this.registeredCommand.has(name)) {
      console.warn('duplicate command detected, skip it');
      return this;
    }
    this.registeredCommand.set(name, {
      command,
      description,
      example,
      action,
    });
    return this;
  }

  async parse(argv: string[], message: Message) {
    try {
      const [name, ...rest] = argv;
      const command = this.registeredCommand.get(name);
      if (!command) {
        return;
      }
      const retMessage = await command.action(message, ...rest);
      return retMessage;
    } catch (e) {
      console.error(e);
      return;
    }
  }

  isCommandRegistered(name: string) {
    return this.registeredCommand.has(name);
  }

  help() {
    return this.cac.outputHelp();
  }

  list() {
    this.cac.commands.forEach((command) => {
      console.log(command.name, command.args.map((o) => '[' + o.value + ']').join(' '), command.examples[0]);
    });
  }
}
