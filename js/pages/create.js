"use strict"

pageInit.create = () => {
	// Init global features
	
	Navigation.init()
	SettingsModal.enable()
	
	//
	
	injectScript.call("hijackAuth", null)
	
	injectScript.listen("onFirstAuth", json => {
		const userId = json?.id ?? -1
		
		loggedInUser = Number.isSafeInteger(userId) ? userId : -1
		loggedInUserPromise.$resolve(loggedInUser)
	}, { once: true })
	
	//
	
	if(!SETTINGS.get("create.enabled")) {
		return
	}
	
	injectScript.call("webpackHook", null)
	
	// Add settings
	injectScript.call("createAddBTRSettings", null)
}