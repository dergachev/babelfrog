ZIP=build/babelfrog-$(shell cat manifest.json  | jq ".version" | tr -d '"').zip
zip:
	git archive -o $(ZIP) --prefix babelfrog/ HEAD
	echo "Created $(ZIP); ready to upload to Chrome Web Store"
