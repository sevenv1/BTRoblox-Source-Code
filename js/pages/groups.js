"use strict"

pageInit.groups = () => {
	if(SETTINGS.get("general.hoverPreview")) {
		loadOptionalFeature("previewer").then(() => {
			HoverPreview.register(".item-card", ".item-card-thumb-container")
		})
	}

	if(!SETTINGS.get("groups.enabled")) { return }

	if(SETTINGS.get("groups.modifyLayout")) {
		injectScript.call("groupsModifyLayout", null)
		
		modifyAngularTemplate(["group-base", "group-about"], (baseTemplate, aboutTemplate) => {
			const tabs = baseTemplate.$find(".rbx-tabs-horizontal")
			
			// move most things out of about and into the main container
			const hoist = [
				aboutTemplate.$find("group-events"),
				aboutTemplate.$find("#group-announcements"),
				aboutTemplate.$find(".group-shout"),
				aboutTemplate.$find("social-links-container")
			]
			
			for(const element of hoist) {
				if(!element) { continue }
				
				element.removeAttribute("ng-switch-when")
				tabs.before(element)
			}
			
			// toggle members/games/payouts based on custom tab
			const members = aboutTemplate.$find("group-members-list")
			if(members) {
				members.setAttribute("ng-show", `!btrCustomTab.name`)
			}
						
			const games = aboutTemplate.$find("group-games")
			if(games) {
				games.setAttribute("ng-show", `btrCustomTab.name === "games"`)
			}
			
			const payouts = aboutTemplate.$find("group-payouts")
			if(payouts) {
				payouts.setAttribute("layout", "layout")
				payouts.setAttribute("ng-show", `btrCustomTab.name === "payouts"`)
			}
			
			// move discovery and group wall below the main container so it's visible in most views
			const discovery = aboutTemplate.$find("group-forums-discovery")
			if(discovery) {
				discovery.removeAttribute("ng-switch-when")
				discovery.setAttribute("ng-show", "layout.activeTab !== groupDetailsConstants.tabs.forums")
				tabs.parentNode.append(discovery)
			}
			
			const wall = aboutTemplate.$find("group-wall")
			if(wall) {
				wall.removeAttribute("ng-switch-when")
				wall.setAttribute("ng-show", "layout.activeTab !== groupDetailsConstants.tabs.forums")
				tabs.parentNode.append(wall)
			}
		})
		
		modifyAngularTemplate("group-tab", template => {
			const tab = template.$find(".rbx-tab")
			
			tab.setAttribute("btr-custom-tab", "btrCustomTab")
			tab.setAttribute("ng-class", tab.getAttribute("ng-class").replace(/activeTab === tab/, "activeTab.state === tab.state && btrCustomTab.name == tab.btrCustomTab"))
			tab.setAttribute("ng-click", "btrCustomTab.name = tab.btrCustomTab")
			
			// it only supports up to 5 tabs by default, so just hardcode width
			tab.setAttribute("style", "width: calc(100% / {{numTabs}});")
		})

		modifyAngularTemplate("group-members-list", template => {
			template.$find(".dropdown-menu li a").title = `{{ role.name }}`
			template.$find(".dropdown-menu li a .role-member-count").title = `{{ role.memberCount | number }}`
		})
	}

	if(SETTINGS.get("groups.selectedRoleCount")) {
		modifyAngularTemplate("group-members-list", template => {
			const label = template.$find(".group-dropdown > button .rbx-selection-label")
			label.after(html`<span class=btr-role-member-count title="{{ $ctrl.data.currentRoleMemberCount | number }}" ng-if="$ctrl.data.currentRoleMemberCount>0">({{ $ctrl.data.currentRoleMemberCount | abbreviate }})</span>`)
		})
	}

	if(SETTINGS.get("general.enableContextMenus")) {
		modifyAngularTemplate("group-members-list", template => {
			template.$find(".dropdown-menu li").dataset.btrRank = `{{ role.rank }}`
		})

		document.$watch("group-members-list .group-dropdown", dropdown => {
			onMouseEnter(dropdown, ".input-dropdown-btn", btn => {
				const roleName = btn.$find(".rbx-selection-label").textContent.trim()
				const target = dropdown.$find(`.dropdown-menu li>a[title="${roleName}"]`)

				if(target) {
					const elem = target.parentNode

					const roleId = elem.id.replace(/^role-/, "")
					const roleRank = elem.dataset.btrRank
					
					ContextMenu.setCustomContextMenu(btn, {
						roleParent: true,
						roleId: roleId,
						roleRank: roleRank
					})
				}
			})
			
			onMouseEnter(dropdown, ".dropdown-menu > li", elem => {
				const roleId = elem.id.replace(/^role-/, "")
				const roleRank = elem.dataset.btrRank
				
				ContextMenu.setCustomContextMenu(elem, {
					roleParent: true,
					roleId: roleId,
					roleRank: roleRank
				})
			})
		})
	}

	if(SETTINGS.get("groups.pagedGroupWall")) {
		modifyAngularTemplate("group-wall", template => {
			template.firstElementChild.setAttribute("infinite-scroll-disabled", "true")

			template.$find(".group-wall").parentNode.append(html`
			<div class="btr-pager-holder btr-comment-pager" ng-show="!hideWallPost">
				<ul class=btr-pager>
					<li class=btr-pager-first><button class=btn-generic-first-page-sm ng-disabled="!btrPagerStatus.prev" ng-click=btrPagerStatus.prev&&btrLoadWallPosts("first")><span class=icon-first-page></span></button></li>
					<li class=btr-pager-prev><button class=btn-generic-left-sm ng-disabled="!btrPagerStatus.prev" ng-click=btrPagerStatus.prev&&btrLoadWallPosts("prev")><span class=icon-left></span></button></li>
					<li class=btr-pager-mid>
						<span>Page </span><form ng-submit=btrPagerStatus.input&&btrLoadWallPosts("input") style=display:contents><input class=btr-pager-cur ng-init="btrAttachInput()" ng-disabled="!btrPagerStatus.input" ng-value="btrPagerStatus.pageNum" type=text value=-1></form>
					</li>
					<li class=btr-pager-next><button class=btn-generic-right-sm ng-disabled="!btrPagerStatus.next" ng-click=btrPagerStatus.next&&btrLoadWallPosts("next")><span class=icon-right></span></button></li>
					<li class=btr-pager-last><button class=btn-generic-last-page-sm ng-disabled="!btrPagerStatus.next" ng-click=btrPagerStatus.next&&btrLoadWallPosts("last")><span class=icon-last-page></span></button></li>
				</ul>
			</div>`)
		})
		
		injectScript.call("pagedGroupWall", null)
	}
	
	onPageReset(() => {
		document.body?.classList.remove("btr-redesign")
	})
	
	onPageLoad(() => {
		document.$watch("body", body => {
			document.body.classList.toggle("btr-redesign", SETTINGS.get("groups.modifyLayout"))
		})
	})
}