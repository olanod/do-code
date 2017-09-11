import {template as html} from '/lib/template/template.js'

const template = html`<template>
<link rel="stylesheet" href="code.css">
<code><pre id="code"></pre></code>
</template>`

// TODO extend with more patterns and languages
const patterns = {
  'keyword': /\b(await|break|case|catch|class|const|continue|default|delete|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|return|static|super|switch|throw|try|typeof|var|while|yield)\b/g,
  'keyword value': /\b(false|null|true)\b/g,
  'keyword this': /\b(this)\b/g,
  'value': /\b(\d+)(?!▷)\b/g,
  'string': /(["'`].*?["'`])/g,
  'comment line': /(\/\/.*)/g,
  'comment block': /(\/\*[\s\S]*\*\/)/g,
}
// each match of each pattern will be wrapped with "{index of pattern}▷{wrapped text}◻"
const generic = /\d+[▷️]([^◻]+)[◻]/g
const replacePatterns = Object.keys(patterns)
      .map((_, i) => new RegExp(`${i}[▷]([^◻]+?)[◻]`, 'g'))

function highlight(code) {
  performance.mark('highlight')
  const patternList = Object.entries(patterns)
  patternList.forEach(([,pattern], i) => {
    code = code.replace(pattern, (_, match) => {
      // clear patterns that are inside other patterns
      match = match.replace(generic, '$1')
      return `${i}▷️${match}◻`
    })
  })
  patternList.forEach(([cssClass], i) => {
    code = code.replace(replacePatterns[i], `<span class="${cssClass}">$1</span>`)
  })
  performance.measure('highlight')
  return code
}

export class Code extends HTMLElement {
  static get supportedLanguages() { return ['js'] }

  constructor() {
    super()
    const shadow = this.attachShadow({mode: 'open'})
    shadow.append(document.importNode(template.content, true))
    Object.defineProperty(this, '$code', { value: shadow.getElementById('code') })
  }

  connectedCallback() {
    this.$code.innerHTML = highlight(this.textContent, this.language)
  }

  get language() { return this.getAttribute('lang') }
  set language(val) {
    if (Code.supportedLanguages.includes(val))
      this.setAttribute('lang', val)
  }
}

customElements.define('do-code', Code)
