export default class InsertTitleCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { title }) {
    const limitedDatastore = transaction
      .getCurrentDataStore()
      .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asSubjectNodeMapping()
      .single();
    const besluitNode = besluit.nodes[0];
    const range = transaction.rangeFactory.fromInNode(besluitNode, 0, 0);

    const articleHtml = `
      <h4 class="h4" property="eli:title" datatype="xsd:string">${
        title
          ? title
          : '<span class="mark-highlight-manual">Geef titel besluit op</span>'
      }</h4>
    `;
    transaction.commands.insertHtml({ htmlString: articleHtml, range });
    // Currently disable as insertHtml returns a collapsed selection which causes shrinkToVisible to fail
    // transaction.selectRange(
    //   transaction.currentSelection.lastRange.shrinkToVisible()
    // );
    // const containedNodes =
    //   transaction.currentSelection.lastRange.contextNodes('rangeIsInside');
    // const span = containedNodes.next().value;
    // const finalRange = transaction.rangeFactory.fromInNode(span);
    // transaction.selectRange(finalRange);
  }
}
