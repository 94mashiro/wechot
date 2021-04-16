import { CAC, cac, Command as CacCommand } from 'cac';

export class Command {
  static parseCommandString(rawString: string) {
    // 不是很懂这里为什么会出现一个隐藏字符
    const fixedRawString = rawString.replace(/ /g, '');
    return ['a', 'b', ...fixedRawString.split(' ').filter(Boolean)];
  }

  private cac: CAC;
  private registeredCommand: Map<string, CacCommand> = new Map();

  constructor() {
    this.cac = cac();
    this.cac.help();
  }

  register(name: string, description: string): CacCommand | null {
    if (this.registeredCommand.has(name)) {
      console.warn('duplicate command detected, skip it');
      return null;
    }
    const command = this.cac.command(name, description);
    this.registeredCommand.set(name, command);
    return command;
  }

  async parse(argv: string[]) {
    try {
      this.cac.parse(argv, { run: false });
      return await this.cac.runMatchedCommand();
    } catch (e) {
      console.error(e);
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
