"use strict"

pageInit.gamedetails = () => {
	onPageLoad(placeIdString => {
		const placeId = Number.parseInt(placeIdString, 10)
		
		if(RobuxToCash.isEnabled()) {
			document.$watch("#rbx-passes-container").$then()
				.$watch(".text-robux", label => {
					const robux = parseInt(label.textContent.replace(/\D/g, ""), 10)
					
					if(Number.isSafeInteger(robux)) {
						const cash = RobuxToCash.convert(robux)
						label.after(html`<span class=btr-robuxToCash-tile>&nbsp;(${cash})</span>`)
					}
				}, { continuous: true })
		}
		
		document.$watch("#content").$then().$watch(">#game-detail-page").$then()
			.$watch("#game-context-menu .dropdown-menu .VisitButtonEditGLI", placeEdit => {
				placeEdit.parentNode.parentNode.append(
					html`<li><a class=btr-download-place><div>Download</div></a></li>`
				)
				
				const target = $("#game-context-menu")
				
				target.$on("click", ".btr-download-place", () => {
					AssetCache.loadBuffer(placeId, ab => {
						const blobUrl = URL.createObjectURL(new Blob([ab]))

						const splitPath = window.location.pathname.split("/")
						const type = getAssetFileType(9, ab)

						startDownload(blobUrl, `${splitPath[splitPath.length - 1]}.${type}`)
						URL.revokeObjectURL(blobUrl)
					})
				})
				
				initExplorer(placeId, AssetType.Place).then(btnCont => {
					if(!btnCont) { return }
					
					btnCont.$find(".btr-explorer-button").style.display = "none"
					btnCont.style.position = "absolute"
					btnCont.style.width = `${target.clientWidth}px`
					btnCont.style.height = `${0}px`
					btnCont.style.left = `${target.offsetLeft}px`
					btnCont.style.top = `${target.offsetTop + target.clientHeight}px`
					
					target.after(btnCont)
					
					placeEdit.parentNode.parentNode.append(
						html`<li><a class=btr-open-in-explorer><div>Open in Explorer</div></a></li>`
					)
					
					target.$on("click", ".btr-open-in-explorer", () => {
						btnCont.$find(".btr-explorer-button").click()
					})
				})
			})
	})
	
	if(!SETTINGS.get("gamedetails.enabled")) { return }
	
	injectScript.call("pagedServers", null)
	
	injectScript.call("gamedetails", null)
	
	if(SETTINGS.get("gamedetails.showServerRegion")) {
		const requesting = {}
		
		injectScript.listen("getServerRegion", (placeId, jobId) => {
			if(typeof jobId !== "string" || requesting[jobId]) { return }
			requesting[jobId] = true
			
			getServerDetails(placeId, jobId, details => {
				delete requesting[jobId]
				injectScript.send("setServerRegion", jobId, details)
			})
		})
	}
	
	onPageReset(() => {
		document.body?.classList.remove("btr-gamedetails")
	})
	
	onPageLoad(placeIdString => {
		const placeId = Number.parseInt(placeIdString, 10)
		
		document.$watch("body", body => body.classList.add("btr-gamedetails"))
		
		document.$watch("#content").$then().$watch(">#game-detail-page", container => {
			const newContainer = html`
			<div class="col-xs-12 btr-game-main-container section-content">
				<div class=placeholder-main></div>
			</div>`

			const midContainer = html`
			<div class="col-xs-12 btr-mid-container"></div>`

			container
				.$watch(["#tab-about", "#tab-game-instances"], (aboutTab, gameTab) => {
					aboutTab.$find(".text-lead").textContent = "Recommended"
					
					aboutTab.classList.remove("active")
					gameTab.classList.add("active")

					const parent = aboutTab.parentNode
					parent.append(aboutTab)
					parent.prepend(gameTab)
				})
				.$watch("#game-instances", games => {
					games.classList.add("active")
					
					onMouseEnter(games, ".game-server-join-btn", btn => {
						const instanceId = btn.dataset.btrInstanceId
						
						if(instanceId) {
							ContextMenu.setCustomContextMenu(btn, {
								instanceId: instanceId
							})
						}
					})
				})
				.$watch(".game-main-content", mainCont => {
					mainCont.classList.remove("section-content")
					mainCont.before(newContainer)
					newContainer.after(midContainer)
					newContainer.$find(".placeholder-main").replaceWith(mainCont)
				})
				.$watch("#about", about => {
					about.classList.remove("active")
				})
				.$watch(".game-about-container,#game-details-about-tab-container", cont => {
					if(cont.id === "game-details-about-tab-container") {
						// react about tab
						container.$watch("#game-details-about-tab-container", parent => {
							midContainer.append(parent)
							
							parent.$watch("#btr-description-wrapper", descCont => {
								newContainer.append(descCont)
								redirectEvents(descCont, parent)
							})
							
							parent.$watch("#btr-recommendations-wrapper", recCont => {
								$("#about").append(recCont)
								redirectEvents(recCont, parent)
							})
						})
					} else {
						// legacy about tab
						newContainer.append(cont)
						
						container.$watch("#about").$then().$watchAll("*", child => {
							if(child.id === "private-server-container-about-tab") {
								child.style.display = "none"
							} else if(child.id !== "recommended-games-container") {
								midContainer.append(child)
							}
						})
					}
				})
				
				.$watch(".tab-content", cont => {
					cont.classList.add("section")
					
					cont.$watchAll(".tab-pane", pane => {
						if(pane.id !== "about") {
							pane.classList.add("section-content")
						}
					})
				})
				.$watch(".badge-container", badges => {
					badges.classList.add("btr-badges-container")
					
					if(SETTINGS.get("gamedetails.compactBadgeStats")) {
						badges.classList.add("btr-compact-stats")
					}

					const badgeQueue = []
					let ownedTimeout

					const updateOwned = async () => {
						const userId = await loggedInUserPromise
						const badgeList = badgeQueue.splice(0, badgeQueue.length)
						
						return RobloxApi.badges.getAwardedDates(userId, badgeList.map(x => x.badgeId)).then(json => {
							if(!json?.data) { return }
							
							for(const { row, badgeId } of badgeList) {
								const entry = json.data.find(x => x.badgeId === badgeId)
								
								row.classList.toggle("btr-notowned", !entry)
								row.$find(".btr-unlock-date")?.remove()
								
								if(entry) {
									const awardedDate = new Date(entry.awardedDate)
									row.$find(".badge-data-container").append(html`
									<span class=btr-unlock-date title="${awardedDate.$since()}">
										Unlocked ${awardedDate.$format("MMM D, YYYY, h:mm A")}
									</span>`)
								}
							}
						})
					}

					badges.$watch(">.stack-list").$then().$watchAll(".badge-row", row => {
						const url = row.$find(".badge-image>a").href
						const label = row.$find(".badge-name")
						const link = html`<a href="${url}">${label.textContent}</a>`
						
						label.replaceChildren(link)
						
						if(SETTINGS.get("gamedetails.compactBadgeStats")) {
							for(const valueLabel of row.$findAll(".badge-stats-container .badge-stats-info")) {
								const rarity = valueLabel.textContent.match(/^\s*(\d+\.\d+%)\s*\((.*)\)\s*$/)
								if(rarity) {
									valueLabel.textContent = rarity[1]
									valueLabel.title = rarity[2]
								}
								
								const count = valueLabel.textContent.match(/^\d+$/)
								if(count) {
									valueLabel.textContent = Intl.NumberFormat().format(+count)
								}
							}
						}

						const desc = row.$find("p.para-overflow")
						desc.classList.add("btr-desc-content")
						desc.classList.remove("para-overflow")
						
						if(desc.scrollHeight > desc.clientHeight + 10) {
							const moreBtn = html`<span class="btr-badge-more text-link cursor-pointer">See More</span>`
							desc.after(moreBtn)
							
							moreBtn.$on("click", () => {
								const open = !desc.classList.contains("btr-desc-open")
								desc.classList.toggle("btr-desc-open", open)
								moreBtn.textContent = open ? `See Less` : `See More`
							})
						}

						if(SETTINGS.get("gamedetails.showBadgeOwned")) {
							const match = url.match(/(?:catalog|badges)\/(\d+)\//)
							if(!match) { return }

							const badgeId = +match[1]
							badgeQueue.push({ row, badgeId })

							clearTimeout(ownedTimeout)
							ownedTimeout = setTimeout(updateOwned, 10)

							row.classList.add("btr-notowned")
						}
					})
					
					if(SETTINGS.get("gamedetails.showBadgeOwned")) {
						badges.$watch(".container-header h2", header => {
							const refresh = html`<button type="button" class="btn-more rbx-refresh refresh-link-icon btn-control-xs btn-min-width">Refresh</button>`
							header.after(refresh)
							
							refresh.$on("click", () => {
								if(refresh.getAttribute("disabled")) { return }
								
								badgeQueue.splice(0, badgeQueue.length)
								
								for(const row of badges.$findAll(".badge-row")) {
									const url = row.$find(".badge-image>a").href
									
									const match = url.match(/(?:catalog|badges)\/(\d+)\//)
									if(!match) { continue }

									const badgeId = +match[1]
									badgeQueue.push({ row, badgeId })
								}
								
								if(!badgeQueue.length) { return }
								
								refresh.setAttribute("disabled", "")
								
								updateOwned().finally(() => {
									refresh.removeAttribute("disabled")
								})
							})
						})
					}
				})
				.$watch("#carousel-game-details", details => {
					details.setAttribute("data-is-video-autoplayed-on-ready", "false")
				})
				.$watch("#game-detail-meta-data", dataCont => {
					ContextMenu.setCustomContextMenu(document.documentElement, {
						copyParent: true,
						placeLink: dataCont.dataset.placeId,
						universeLink: dataCont.dataset.universeId
					})
					
					if(dataCont.dataset.placeId !== dataCont.dataset.rootPlaceId) {
						const rootPlaceId = dataCont.dataset.rootPlaceId
						const rootPlaceName = dataCont.dataset.placeName
						
						const box = html`
						<div class="section-content btr-universe-box">
							This place is part of 
							<a class="btr-universe-name text-link" href="/games/${rootPlaceId}/${formatUrlName(rootPlaceName)}">${rootPlaceName || "..."}</a>
							<div class="VisitButton VisitButtonPlayGLI btr-universe-visit-button" placeid="${rootPlaceId}" data-action=play data-is-membership-level-ok=true>
								<a class="btn-secondary-md">Play</a>
							</div>
						</div>`

						newContainer.before(box)
					}
				})
			
			RobloxApi.economy.getAssetDetails(placeId).then(data => {
				if(!data.Updated) { return }
				
				container.$watch(".game-stat-container,.game-stats-container").$then()
					.$watch(
						".game-stat .text-lead",
						x => x.previousElementSibling?.textContent === "Created",
						label => {
							label.title = new Date(data.Created).$format("M/D/YYYY h:mm:ss A (T)")
						}
					)
					.$watch(
						".game-stat .text-lead",
						x => x.previousElementSibling?.textContent === "Updated",
						label => {
							label.classList.remove("date-time-i18n") // Otherwise roblox rewrites the label
							
							label.title = new Date(data.Updated).$format("M/D/YYYY h:mm:ss A (T)")
							label.textContent = `${$.dateSince(data.Updated)}`
						}
					)
			})
		})
	})
}