/* global Feature Scenario BeforeSuite */
const pathToSchema = 'features/edit-json-data'

Feature('edit-json-data')

BeforeSuite(({ I }) => {
  I.amOnPage(I._getPlaygroundUrl())
  I.selectOption('#examples', pathToSchema)
  I._waitForElement('.jedi-ready')
})

Scenario('Should enable inline JSON editing and save changes @edit-json-data', ({ I }) => {
  const testJsonData = JSON.stringify({
    name: 'test',
    description: 'test'
  }, null, 2)

  I.checkOption('#editJsonData')
  I._waitForElement('.jedi-ready')
  I._click('#jedi-json-data-toggle-json-data-root')
  I.clearField('#json-data-input-json-data-root')
  I.fillField('#json-data-input-json-data-root', testJsonData)
  I._click('#jedi-json-data-save-json-data-root')
  I.seeInField('#editor-value', testJsonData)
})
