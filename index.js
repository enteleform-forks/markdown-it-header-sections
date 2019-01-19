
module.exports = function headerSections(md) {

  function addSections(state) {
    var tokens = [];  // output
    var Token = state.Token;
    var sections = [];
    var nestedLevel = 0;

    function openSection(attrs) {
      var t = new Token('section_open', 'section', 1);
      const ids = attrs.filter(attr => attr[0] == "id");
      const nonID_Attrs = attrs.filter(attr => attr[0] != "id");

      // copy ID, add section prefix
      var id = (
        (ids.length == 0)
        ? []
        : [[ids[0][0], "section--" + ids[0][1]]]
      );

      t.block = true;
      t.attrs = [].concat(nonID_Attrs, id);
      return t;
    }

    function closeSection() {
      var t = new Token('section_close', 'section', -1);
      t.block = true;
      return t;
    }

    function closeSections(section) {
      while (last(sections) && section.header <= last(sections).header) {
        sections.pop();
        tokens.push(closeSection());
      }
    }

    function closeSectionsToCurrentNesting(nesting) {
      while (last(sections) && nesting < last(sections).nesting) {
        sections.pop();
        tokens.push(closeSection());
      }
    }

    function closeAllSections() {
      while (sections.pop()) {
        tokens.push(closeSection());
      }
    }

    for (var i = 0, l = state.tokens.length; i < l; i++) {
      var token = state.tokens[i];

      // record level of nesting
      if (token.type.search('heading') !== 0) {
        nestedLevel += token.nesting;
      }
      if (last(sections) && nestedLevel < last(sections).nesting) {
        closeSectionsToCurrentNesting(nestedLevel);
      }

      // add sections before headers
      if (token.type == 'heading_open') {
        var section = {
          header: headingLevel(token.tag),
          nesting: nestedLevel
        };
        if (last(sections) && section.header <= last(sections).header) {
          closeSections(section);
        }
        tokens.push(openSection(token.attrs));
        sections.push(section);
      }

      tokens.push(token);
    }  // end for every token
    closeAllSections();

    state.tokens = tokens;
  }

  md.core.ruler.push('header_sections', addSections);

};

function headingLevel(header) {
  return parseInt(header.charAt(1));
}

function last(arr) {
  return arr.slice(-1)[0];
}
