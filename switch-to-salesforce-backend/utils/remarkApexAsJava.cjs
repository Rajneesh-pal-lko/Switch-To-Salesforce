const { visit } = require('unist-util-visit');

/** Shiki has no Apex in all builds; map fenced `apex` to Java. */
function remarkApexAsJava() {
  return function transformer(tree) {
    visit(tree, 'code', (node) => {
      if (node.lang === 'apex') {
        node.lang = 'java';
      }
    });
  };
}

module.exports = { remarkApexAsJava };
