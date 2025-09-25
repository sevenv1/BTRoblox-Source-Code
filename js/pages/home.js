"use strict"

pageInit.home = () => {
	if(SETTINGS.get("home.favoritesAtTop")) {
		injectScript.call("favoritesAtTop", null)
	}
	
	if(SETTINGS.get("home.showRecommendationPlayerCount")) {
		injectScript.call("showRecommendationPlayerCount", null)
	}
	
	if(SETTINGS.get("home.instantGameHoverAction")) {
		injectScript.call("instantGameHoverAction", null)
	}
}