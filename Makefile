ZIP=build/babelfrog-$(shell cat manifest.json  | jq ".version" | tr -d '"').zip
zip:
	git archive -o $(ZIP) --prefix babelfrog/ HEAD
	echo "Created $(ZIP); ready to upload to Chrome Web Store"

changelog:
	git log `git describe --tags --abbrev=0`..HEAD --oneline |  awk 'BEGIN { print "Commits since last tag:" }; {print "- " $$0}' | vim - -R +"vs CHANGELOG.md" +"set noro"
