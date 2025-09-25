"use strict"

pageInit.avatar = () => {
	if(!SETTINGS.get("avatar.enabled")) { return }
	
	modifyAngularTemplate("avatar-base", template => {
		const redraw = template.$find(".redraw-avatar .text-link")
		
		if(redraw) {
			redraw.classList.add("btr-redraw-button")
			redraw.after(html`<a class="text-link btr-advanced-button" ng-click="openAdvancedAccessories();">Advanced</a>`)
		}
	})
	
	if(SETTINGS.get("avatar.assetRefinement")) {
		onPageReset(() => {
			document.body?.classList.remove("btr-avatar-refinement")
		})
		
		onPageLoad(() => {
			document.$watch("body", body => body.classList.add("btr-avatar-refinement"))
		})
		
		modifyAngularTemplate("avatar-base", template => {
			template.$find(".redraw-avatar").after(
				html`
				<div class=btr-avatar-refinement-container>
					<div ng-repeat="item in btrWearingAssets" ng-if="item.meta.position" ng-init="item.btrScale=item.meta.scale.X">
						<div class="scale-container">
							<div class="text-label font-subheader-1" style="width:100%" title="{{item.name}} ({{item.id}})">{{item.name}} ({{item.id}})</div>
							
							<div class="text-label font-subheader-1">Position</div>
							<div class="scale-label font-body">({{item.meta.position.X}}, {{item.meta.position.Y}}, {{item.meta.position.Z}})</div>
							<div style="width:100%;clear:both">
								<input type="range" class="pr0" step="0.01"
									style="width:32%;--btr-input-perc:{{(item.meta.position.X-btrBounds[item.assetType.id].position.X.min)/(btrBounds[item.assetType.id].position.X.max-btrBounds[item.assetType.id].position.X.min)*100}}%;"
									min="{{btrBounds[item.assetType.id].position.X.min}}"
									max="{{btrBounds[item.assetType.id].position.X.max}}"
									ng-model="item.meta.position.X"
									on-input-finished="btrUpdateItem(item)">
								<input type="range" class="pr0" step="0.01"
									style="width:32%;margin-left:2%;margin-right:2%;--btr-input-perc:{{(item.meta.position.Y-btrBounds[item.assetType.id].position.Y.min)/(btrBounds[item.assetType.id].position.Y.max-btrBounds[item.assetType.id].position.Y.min)*100}}%;"
									min="{{btrBounds[item.assetType.id].position.Y.min}}"
									max="{{btrBounds[item.assetType.id].position.Y.max}}"
									ng-model="item.meta.position.Y"
									on-input-finished="btrUpdateItem(item)">
								<input type="range" class="pr0" step="0.01"
									style="width:32%;--btr-input-perc:{{(item.meta.position.Z-btrBounds[item.assetType.id].position.Z.min)/(btrBounds[item.assetType.id].position.Z.max-btrBounds[item.assetType.id].position.Z.min)*100}}%;"
									min="{{btrBounds[item.assetType.id].position.Z.min}}"
									max="{{btrBounds[item.assetType.id].position.Z.max}}"
									ng-model="item.meta.position.Z"
									on-input-finished="btrUpdateItem(item)">
							</div>
							
							<div class="text-label font-subheader-1">Rotation</div>
							<div class="scale-label font-body">({{item.meta.rotation.X}}, {{item.meta.rotation.Y}}, {{item.meta.rotation.Z}})</div>
							<div style="width:100%;clear:both">
								<input type="range" class="pr0" step="1"
									style="width:32%;--btr-input-perc:{{(item.meta.rotation.X-btrBounds[item.assetType.id].rotation.X.min)/(btrBounds[item.assetType.id].rotation.X.max-btrBounds[item.assetType.id].rotation.X.min)*100}}%;"
									min="{{btrBounds[item.assetType.id].rotation.X.min}}"
									max="{{btrBounds[item.assetType.id].rotation.X.max}}"
									ng-model="item.meta.rotation.X"
									on-input-finished="btrUpdateItem(item)">
								<input type="range" class="pr0" step="1"
									style="width:32%;margin-left:2%;margin-right:2%;--btr-input-perc:{{(item.meta.rotation.Y-btrBounds[item.assetType.id].rotation.Y.min)/(btrBounds[item.assetType.id].rotation.Y.max-btrBounds[item.assetType.id].rotation.Y.min)*100}}%;"
									min="{{btrBounds[item.assetType.id].rotation.Y.min}}"
									max="{{btrBounds[item.assetType.id].rotation.Y.max}}"
									ng-model="item.meta.rotation.Y"
									on-input-finished="btrUpdateItem(item)">
								<input type="range" class="pr0" step="1"
									style="width:32%;--btr-input-perc:{{(item.meta.rotation.Z-btrBounds[item.assetType.id].rotation.Z.min)/(btrBounds[item.assetType.id].rotation.Z.max-btrBounds[item.assetType.id].rotation.Z.min)*100}}%;"
									min="{{btrBounds[item.assetType.id].rotation.Z.min}}"
									max="{{btrBounds[item.assetType.id].rotation.Z.max}}"
									ng-model="item.meta.rotation.Z"
									on-input-finished="btrUpdateItem(item)">
							</div>
							
							<div class="text-label font-subheader-1">Scale</div>
							<div class="scale-label font-body">{{item.btrScale}}</div>
							<input type="range" class="pr0" step="0.01"
								style="--btr-input-perc:{{(item.btrScale-btrBounds[item.assetType.id].scale.X.min)/(btrBounds[item.assetType.id].scale.X.max-btrBounds[item.assetType.id].scale.X.min)*100}}%;"
								min="{{btrBounds[item.assetType.id].scale.X.min}}"
								max="{{btrBounds[item.assetType.id].scale.X.max}}"
								ng-model="item.btrScale"
								on-input-finished="btrUpdateItem(item)">
						</div>
					</div>
				</div>`
			)
		})
		
		injectScript.call("assetRefinement", null)
	}
	
	if(SETTINGS.get("avatar.removeAccessoryLimits")) {
		injectScript.call("removeAccessoryLimits", null)
	}
	
	if(SETTINGS.get("avatar.fullRangeBodyColors")) {
		modifyAngularTemplate("avatar-tab-content", template => {
			const bodyColors = template.$find("#bodyColors")
			bodyColors.classList.add("btr-bodyColors")
		})
		
		injectScript.call("fullRangeBodyColors", null)
		
		document.$watch(".btr-bodyColors", async cont => {
			const bodyColor3s = (await RobloxApi.avatar.getCurrentAvatar()).bodyColor3s
			
			const selector = html`
			<div class=btr-color-selector>
				<input type=color class=btr-color-head></input>
				<input type=color class=btr-color-torso></input>
				<input type=color class=btr-color-leftArm></input>
				<input type=color class=btr-color-rightArm></input>
				<input type=color class=btr-color-leftLeg></input>
				<input type=color class=btr-color-rightLeg></input>
			</div>`
			
			const inputs = {}
			
			const updateColors = async () => {
				const json = await RobloxApi.avatar.setBodyColors(bodyColor3s)
				
				if(json && !json.errors) {
					injectScript.send("skinColorUpdated")
				} else {
					injectScript.send("skinColorError")
				}
			}
			
			for(const input of selector.children) {
				const name = input.className.slice(10)
				
				input.value = `#${bodyColor3s[`${name}Color3`]}`
				inputs[name] = input
				
				input.$on("change", () => {
					const color = input.value.slice(1)
					
					if(bodyColor3s[`${name}Color3`].toLowerCase() !== color.toLowerCase()) {
						bodyColor3s[`${name}Color3`] = color
						updateColors()
					}
				})
			}
			
			let debounce = 0
			
			injectScript.listen("updateSkinColors", async () => {
				const deb = ++debounce
				const newColor3s = (await RobloxApi.avatar.getCurrentAvatar()).bodyColor3s
				
				if(debounce === deb) {
					for(const [name, oldColor] of Object.entries(bodyColor3s)) {
						const newColor = newColor3s[name]
						
						if(newColor.toLowerCase() !== oldColor.toLowerCase()) {
							bodyColor3s[name] = newColor
							inputs[name.slice(0, -6)].value = `#${newColor}`
						}
					}
				}
			})
			
			cont.$find(".section-content").prepend(selector, html`<hr style=margin-top:40px;margin-bottom:30px;>`)
		})
	}
}