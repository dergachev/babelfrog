# BabelFrog Development

## Publishing new release to Chrome Web Store:

```bash
# make changes

vim CHANGELOG.md # update notes
vim manifest.json # increment version to N.N.N
git commit -am "Published version vN.N.N"
git tag vN.N.N
make zip
```

Now uploaded the created zip file `build/babelfrog-vN.N.N.zip` to [Chrome Web
Store](https://chrome.google.com/webstore/detail/babelfrog/jnhmkblbgggfgeebimebebnkhgnagnpj/?hl=en)
