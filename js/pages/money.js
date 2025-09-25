"use strict"

pageInit.money = () => {
	if(RobuxToCash.isEnabled()) {
		injectScript.call("money", null)
	}
}