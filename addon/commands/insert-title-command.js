export default class InsertTitleCommand {
  name = 'insert-title';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, title) {
    const limitedDatastore = controller.datastore.limitToRange(
      controller.selection.lastRange,
      'rangeIsInside'
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asSubjectNodes()
      .next().value;
    const besluitNode = [...besluit.nodes][0];
    const range = controller.rangeFactory.fromInNode(besluitNode, 0, 0);

    const articleHtml = `
      <h4 class="h4" property="eli:title" datatype="xsd:string">${
        title
          ? title
          : '<span class="mark-highlight-manual">Geef titel besluit op</span>'
      }</h4>
    `;
    controller.executeCommand('insert-html', articleHtml, range);
  }
}
