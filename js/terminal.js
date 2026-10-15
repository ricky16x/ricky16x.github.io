export class Terminal {
  constructor({ outputElement, inputElement, formElement, onCommand, commandList = [] }) {
    this.outputElement = outputElement;
    this.inputElement = inputElement;
    this.formElement = formElement;
    this.onCommand = onCommand;
    this.commandList = commandList;
    this.history = [];
    this.historyIndex = -1;
    this.tabHistory = null;

    this.bindEvents();
  }

  bindEvents() {
    this.formElement.addEventListener('submit', async (event) => {
      event.preventDefault();
      await this.submit();
    });

    this.inputElement.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.navigateHistory(-1);
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.navigateHistory(1);
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        this.handleAutocomplete();
      }
    });
  }

  setCommandList(commandList) {
    this.commandList = commandList;
  }

  getHistory() {
    return [...this.history];
  }

  setInputValue(value) {
    this.inputElement.value = value;
  }

  focusInput() {
    this.inputElement.focus();
  }

  clearOutput() {
    this.outputElement.innerHTML = '';
    this.inputElement.value = '';
    this.focusInput();
  }

  appendCommand(command) {
    const line = document.createElement('div');
    line.className = 'terminal-line command-entry';

    const prompt = document.createElement('span');
    prompt.className = 'command-prompt';
    prompt.textContent = 'ricky16x@portfolio:~$';

    const commandText = document.createElement('span');
    commandText.className = 'command-text';
    commandText.textContent = command;

    line.append(prompt, commandText);
    this.outputElement.appendChild(line);
    this.scrollToBottom();
  }

  appendText(value, className = 'terminal-line', options = {}) {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = value;

    if (options.title) {
      line.classList.add('output-block');
      line.innerHTML = '';
      const heading = document.createElement('h3');
      heading.textContent = options.title;
      line.appendChild(heading);
      const body = document.createElement('p');
      body.textContent = value;
      line.appendChild(body);
    }

    this.outputElement.appendChild(line);
    this.scrollToBottom();
  }

  appendLink(label, href) {
    const wrapper = document.createElement('div');
    wrapper.className = 'terminal-line';

    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'link-button';
    link.textContent = label;
    wrapper.appendChild(link);

    this.outputElement.appendChild(wrapper);
    this.scrollToBottom();
  }

  appendList(items) {
    const listEl = document.createElement('div');
    listEl.className = 'terminal-list';

    items.forEach((item) => {
      const line = document.createElement('div');
      line.className = 'terminal-list-item';

      if (typeof item === 'string') {
        line.textContent = item;
      } else if (item && item.type === 'link') {
        const anchor = document.createElement('a');
        anchor.href = item.href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.className = 'link-button';
        anchor.textContent = item.label;
        line.appendChild(anchor);
      } else if (item && item.type === 'text') {
        line.textContent = item.value;
      } else {
        line.textContent = String(item);
      }

      listEl.appendChild(line);
    });

    this.outputElement.appendChild(listEl);
    this.scrollToBottom();
  }

  appendBlock(title, content) {
    const block = document.createElement('div');
    block.className = 'output-block';

    const heading = document.createElement('h3');
    heading.textContent = title;
    block.appendChild(heading);

    if (typeof content === 'string') {
      const paragraph = document.createElement('p');
      paragraph.textContent = content;
      block.appendChild(paragraph);
      this.outputElement.appendChild(block);
      this.scrollToBottom();
      return;
    }

    if (Array.isArray(content)) {
      const list = document.createElement('div');
      list.className = 'terminal-list';

      content.forEach((entry) => {
        const row = document.createElement('div');
        row.className = 'terminal-list-item';
        row.textContent = entry;
        list.appendChild(row);
      });

      block.appendChild(list);
      this.outputElement.appendChild(block);
      this.scrollToBottom();
      return;
    }

    this.outputElement.appendChild(block);
    this.scrollToBottom();
  }

  appendResult(result) {
    if (!result || result.length === 0) {
      return;
    }

    result.forEach((entry) => {
      if (typeof entry === 'string') {
        this.appendText(entry);
      } else if (entry && entry.type === 'link') {
        this.appendLink(entry.label, entry.href);
      } else if (entry && entry.type === 'list') {
        this.appendList(entry.items);
      } else if (entry && entry.type === 'block') {
        this.appendBlock(entry.title, entry.content);
      } else if (entry && entry.type === 'code') {
        const codeBlock = document.createElement('div');
        codeBlock.className = 'terminal-line output-block';
        codeBlock.textContent = entry.value;
        this.outputElement.appendChild(codeBlock);
      } else if (entry && entry.type === 'text') {
        this.appendText(entry.value, 'terminal-line');
      } else {
        this.appendText(String(entry));
      }
    });
  }

  scrollToBottom() {
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }

  navigateHistory(direction) {
    if (this.history.length === 0) {
      return;
    }

    const nextIndex = this.historyIndex + direction;

    if (nextIndex < 0) {
      this.historyIndex = -1;
      this.inputElement.value = '';
      return;
    }

    if (nextIndex >= this.history.length) {
      this.historyIndex = this.history.length;
      this.inputElement.value = '';
      return;
    }

    this.historyIndex = nextIndex;
    this.inputElement.value = this.history[nextIndex];
  }

  handleAutocomplete() {
    const inputValue = this.inputElement.value.trim();
    if (!inputValue) {
      return;
    }

    const suggestions = this.commandList
      .map((entry) => entry.command.split(' ')[0])
      .filter((value) => value.startsWith(inputValue.toLowerCase()));

    if (suggestions.length === 0) {
      return;
    }

    if (this.tabHistory === inputValue) {
      const message = `Matching commands: ${suggestions.join(', ')}`;
      this.appendText(message, 'terminal-line muted');
      this.tabHistory = null;
      return;
    }

    this.tabHistory = inputValue;
    this.inputElement.value = suggestions[0];
  }

  async submit() {
    const rawValue = this.inputElement.value.trim();
    if (!rawValue) {
      this.inputElement.value = '';
      this.focusInput();
      return;
    }

    this.history.push(rawValue);
    this.historyIndex = this.history.length;
    this.appendCommand(rawValue);

    const result = await this.onCommand(rawValue);
    this.appendResult(result);
    this.inputElement.value = '';
    this.tabHistory = null;
    this.focusInput();
  }
}
