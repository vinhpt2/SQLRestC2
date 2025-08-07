var SysAppWizard={
	run:function(p){
		if(p.records.length){
			SysAppWizard.app = p.records[0];
			var id="SysAppWizard";
			var a=NUT.createWindowTitle(id,divTitle);
			a.innerHTML='Wizard ' + SysAppWizard.app.appname;
			var tabs = [];
			var divTabs = a.div.z(["div", { id: "tabsWz_" + id }]);
			var confs=[
				{tabid:1,tabname:"<i>Step 1</i> - User & Orgnization",html:'<br/><table><tr><td><button class="w2ui-btn" onclick="SysAppWizard.showTabDialog(2,11)">➕ Add User</button></td><td><button class="w2ui-btn" onclick="SysAppWizard.showTabDialog(4,9)">➕ Add Orgnization</button> <i>(check to assign)</td></tr><tr><td><div class="nut-box" id="lstUser"></div></td><td><div class="nut-box" id="lstOrg"></div></td></tr></table>'},
				{tabid:2,tabname:"<i>Step 2</i> - Data Service",html:'<br/><table><tr><td><button class="w2ui-btn" onclick="SysAppWizard.showTabDialog(1,1)">➕ Add Data Service</button> <i>(check to assign)</i></td><td><button class="w2ui-btn" onclick="SysAppWizard.importMoreTable()">📥 Import Table</button></td></tr><tr><td><div class="nut-box" id="lstService"></div></td><td><div class="nut-box" id="lstTable"></div></td></tr></table>'},
				{tabid:3,tabname:"<i>Step 3</i> - Domain",html:'<br/><table><tr><td><button class="w2ui-btn" onclick="SysAppWizard.showTabDialog(3,23)">➕ Add Domain</button></td><td><button class="w2ui-btn" onclick="SysAppWizard.editDomainValues()">🖋️ Edit Values</button></td></tr><tr><td><div class="nut-box" id="lstDomain"></div></td><td><div class="nut-box" id="lstValue"></div></td></tr></table>'},
				{tabid:4,tabname:"<i>Step 4</i> - Window & Menu",html:'<br/><table><tr><td><div id="titleWindow" style="width:950px"></div></td><td><button class="w2ui-btn" onclick="SysAppWizard.showTabDialog(3,16)">➕ Add Menu</button></td></tr><tr><td><div class="nut-box" style="width:950px"><div id="toolWindow"></div><div id="lstWindow"></div></div></td><td><div class="nut-box" style="width:280px" id="lstMenu"></div></td></tr></table>'},
				{tabid:5,tabname:"<i>Step 5</i> - Role & Permissions",html:'<br/><table><tr><td><button class="w2ui-btn" onclick="SysAppWizard.showTabDialog(6,21)">➕ Add Role</button> <i>(check to assign)</i></td><td></td><td><i>(check to assign)</i></div></td></tr><tr><td><div class="nut-box" id="lstRole"></div></td><td valign="top"><div id="divTabPerm"><button class="w2ui-btn" style="border:1px solid" onclick="SysAppWizard.tabPerm_onClick(this,permUser)">User</button><br/><button class="w2ui-btn" onclick="SysAppWizard.tabPerm_onClick(this,permMenu)">Menu</button><br/><button class="w2ui-btn" onclick="SysAppWizard.tabPerm_onClick(this,permTool)">Tool</button><br/><button class="w2ui-btn" onclick="SysAppWizard.tabPerm_onClick(this,permAccess)">Access</button></div></td><td><div id="divPerm"><div class="nut-box" id="permUser"></div><div class="nut-box" style="display:none" id="permMenu"></div><div class="nut-box" style="display:none" id="permTool"></div><div class="nut-box" style="display:none" id="permAccess"></div></div></td></tr></table>'},
			]
			for (var i = 0; i < confs.length; i++) {
				var tabconf=confs[i];	
				var divTab = a.div.z(["div", { id: "tabWz_" + tabconf.tabid, style: "height:95%;display:"+(i?"none":""),tag:tabconf}]);
				divTab.innerHTML=tabconf.html;
				var tab = { id: tabconf.tabid, text: tabconf.tabname,div:divTab };
				tabs.push(tab);
			}
			(NUT.w2ui[divTabs.id] || new NUT.w2tabs({
				name: id,
				active: 1,
				tabs: tabs,
				onClick: function(evt){
					var id=evt.object.id;
					for(var i=0;i<this.tabs.length;i++){
						var tab=this.tabs[i];
						var divTab=tab.div;
						divTab.style.display=(tab.id==id)?"":"none";
					}
					SysAppWizard.updateTabStep(id);
				}
			})).render(divTabs);
			SysAppWizard.updateTabStep(1);
		} else NUT.notify("⚠️ No Application selected!","yellow");
	},
	updateTabStep(step){
		switch(step){
			case 1://org & user
				NUT.ds.select({url:NUT.URL+"n_user",where:["siteid","=",SysAppWizard.app.siteid]},function(res){
					var nodes=[];
					for(var i=0;i<res.result.length;i++){
						var rec=res.result[i];
						nodes.push({id: rec.userid, selected:i==0, text:rec.username+" - <i>"+(rec.fullname||"")+"</i>", icon:"nut-img-user",count:"<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(2,11,"+rec.userid+")'> ✏️ </a>", tag: rec });
					}
					(NUT.w2ui.lstUser || new NUT.w2sidebar({
						name: "lstUser",
						nodes: nodes,
						onClick:function(evt){
							var userid=evt.object.tag.userid;
							NUT.ds.select({url:NUT.URL+"n_orguser", select:"orgid",where:["userid","=",userid]},function(res2){
								var lookup2={};
								for(var i=0;i<res2.result.length;i++){
									var rec2=res2.result[i];
									lookup2[rec2.orgid]=true;
								}
								NUT.ds.select({url:NUT.URL+"n_org", select:"orgid,orgcode,orgname",where:["siteid","=",SysAppWizard.app.siteid]},function(res){
									var nodes=[];
									for(var i=0;i<res.result.length;i++){
										var rec=res.result[i];
										nodes.push({id: rec.orgid, text:"<input class='w2ui-input' type='checkbox' "+(lookup2[rec.orgid]?"checked":"")+" onchange='event.stopPropagation();SysAppWizard.org_onCheck(this.checked,"+rec.orgid+","+userid+")'/> "+rec.orgcode +" - <i>"+(rec.orgname||"")+"</i>",count:"<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(4,9,"+rec.orgid+")'> ✏️ </a>"});
									}
									if(!NUT.w2ui.lstOrg)new NUT.w2sidebar({name: "lstOrg",nodes:nodes}).render(lstOrg);
									else{
										NUT.w2ui.lstOrg.nodes=nodes;
										NUT.w2ui.lstOrg.refresh();
									}
								});
							});
						}
					})).render(lstUser);
					if(nodes.length)NUT.w2ui.lstUser.click(nodes[0].id);
				});
				NUT.ds.select({url:NUT.URL+"n_org",where:["appid","=",SysAppWizard.app.appid]},function(res2){
					var lookup={};
					for(var i=0;i<res2.result.length;i++){
						var rec2=res2.result[i];
						lookup[rec2.orgid]=true;
					}
				});
				break;
			case 2://service
				NUT.ds.select({url:NUT.URL+"n_appservice",where:["appid","=",SysAppWizard.app.appid]},function(res2){
					var lookup={};
					for(var i=0;i<res2.result.length;i++){
						var rec2=res2.result[i];
						lookup[rec2.serviceid]=true;
					}
				
					NUT.ds.select({url:NUT.URL+"n_service",where:["siteid","=",SysAppWizard.app.siteid]},function(res){
						var nodes=[];
						for(var i=0;i<res.result.length;i++){
							var rec=res.result[i];
							nodes.push({id: rec.serviceid, selected:i==0, text:"<input class='w2ui-input' type='checkbox' "+(lookup[rec.serviceid]?"checked":"")+" onchange='event.stopPropagation();SysAppWizard.service_onCheck(this.checked,"+rec.serviceid+")'/> "+rec.servicename+" - <i>"+(rec.description||"")+"</i>",count:"<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(1,1,"+rec.serviceid+")'> ✏️ </a>", tag: rec });
						}
						(NUT.w2ui.lstService || new NUT.w2sidebar({
							name: "lstService",
							nodes: nodes,
							onClick:function(evt){
								NUT.ds.select({url:NUT.URL+"n_table",where:["serviceid","=",evt.object.tag.serviceid]},function(res){
									var nodes=[];
									for(var i=0;i<res.result.length;i++){
										var rec=res.result[i];
										nodes.push({id: rec.tableid, text:rec.tablename +" - <i>"+(rec.alias||"")+"</i>",count:"<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(1,2,"+rec.tableid+")'> ✏️ </a>", icon:"nut-img-"+rec.tabletype});
									}
									if(!NUT.w2ui.lstTable)new NUT.w2sidebar({name: "lstTable",nodes:nodes}).render(lstTable);
									else{
										NUT.w2ui.lstTable.nodes=nodes;
										NUT.w2ui.lstTable.refresh();
									}
								});
							}
						})).render(lstService);
						if(nodes.length)NUT.w2ui.lstService.click(nodes[0].id);
					});
				});
				break;
			case 3://domain
				NUT.ds.select({url:NUT.URL+"n_domain",where:["appid","=",SysAppWizard.app.appid]},function(res){
					var nodes=[];
					for(var i=0;i<res.result.length;i++){
						var rec=res.result[i];
						nodes.push({id: rec.domainid, selected:i==0, text:rec.domainname+" - <i>"+(rec.description||"")+"</i>",count:"<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(3,23,"+rec.domainid+")'> ✏️ </a>",icon:"nut-img-domain", tag: rec });
					}
					(NUT.w2ui.lstDomain || new NUT.w2sidebar({
						name: "lstDomain",
						nodes: nodes,
						onClick:function(evt){
							var domain=JSON.parse(evt.object.tag.domainjson);
							var records=[];
							for(var i=0;i<domain.length;i++){
								var rec=domain[i];
								records.push({value:rec[0],display:rec[1]});
							}
							if(!NUT.w2ui.lstValue)new NUT.w2grid({name: "lstValue",recid:"value",columns:[{field:"value",text:"Value",size:"100px",sortable:true},{field:"display",text:"Display",size:"300px",sortable:true}],records:records}).render(lstValue);
							else{
								NUT.w2ui.lstValue.records=records;
								NUT.w2ui.lstValue.refresh();
							}
						}
					})).render(lstDomain);
					NUT.w2ui.lstDomain.click(nodes[0].id);
				});
				break;
			case 4://window & menu
				NUT.ds.select({url:NUT.URL+"n_window",where:["appid","=",SysAppWizard.app.appid]},function(res){
					var items=[{id: 0, type:"html", html:"<button class='w2ui-btn' onclick='SysAppWizard.showTabDialog(3,5)'>➕ Add Window</button>"}];
					for(var i=0;i<res.result.length;i++){
						var rec=res.result[i];
						items.push({id: rec.windowid, type:"radio", checked:i==0, text:"<i style='color:brown'>"+rec.windowname+"</i><a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(3,5,"+rec.windowid+")'> ✏️ </a>", tag: rec });
					}
					(NUT.w2ui.titleWindow || new NUT.w2toolbar({
						name: "titleWindow",
						items: items,
						onClick:SysAppWizard.titleWindow_onClick
					})).render(titleWindow);
					SysAppWizard.titleWindow_onClick({object:items[1]});
					
					(NUT.w2ui.toolWindow || new NUT.w2toolbar({
						name: "toolWindow",
						items: [{id:1,type:"button",text:"⚡ Cache Window",execname:"SysCacheWindow"},
							{id:2,type:"button",text:"⛏️ Build Tabs",execname:"SysBuildTab"},
							{id:3,type:"button",text:"📐 Design layout",execname:"SysLayoutWindow"},
							{id:4,type:"button",text:"🪟 Preview Window",execname:"SysPreviewWindow"}],
						onClick :function(evt){
							NUT.runComponent(evt.object.execname,{records:[SysAppWizard.curWin]});
						}
					})).render(toolWindow);
				});
				SysAppWizard.renderMenu(lstMenu);
				break;
			case 5://role & user
				NUT.ds.select({url:NUT.URL+"n_roleapp", select:"roleid",where:["appid","=",SysAppWizard.app.appid]},function(res2){
					var lookup={};
					for(var i=0;i<res2.result.length;i++){
						var rec2=res2.result[i];
						lookup[rec2.roleid]=true;
					}
				
					NUT.ds.select({url:NUT.URL+"n_role",where:["siteid","=",SysAppWizard.app.siteid]},function(res){
						var nodes=[];
						for(var i=0;i<res.result.length;i++){
							var rec=res.result[i];
							nodes.push({id: rec.roleid, selected:i==0, text:"<input class='w2ui-input' type='checkbox' "+(lookup[rec.roleid]?"checked":"")+" onchange='event.stopPropagation();SysAppWizard.role_onCheck(this.checked,"+rec.roleid+")'/> "+rec.rolename+" - <i>"+(rec.description||"")+"</i>",count:"<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(6,21,"+rec.roleid+")'> ✏️ </a>", tag: rec });
						}
						(NUT.w2ui.lstRole || new NUT.w2sidebar({
							name: "lstRole",
							nodes: nodes,
							onClick:function(evt){
								var roleid=evt.object.tag.roleid;
								//user
								NUT.ds.select({url:NUT.URL+"n_roleuser", select:"userid",where:["roleid","=",roleid]},function(res2){
									var lookup2={};
									for(var i=0;i<res2.result.length;i++){
										var rec2=res2.result[i];
										lookup2[rec2.userid]=true;
									}
									NUT.ds.select({url:NUT.URL+"n_user", select:"userid,username,fullname",where:["siteid","=",SysAppWizard.app.siteid]},function(res){
										var nodes=[];
										for(var i=0;i<res.result.length;i++){
											var rec=res.result[i];
											nodes.push({id: rec.userid, text:"<input class='w2ui-input' type='checkbox' "+(lookup2[rec.userid]?"checked":"")+" onchange='event.stopPropagation();SysAppWizard.user_onCheck(this.checked,"+roleid+","+rec.userid+")'/> "+rec.username +" - <i>"+(rec.fullname||"")+"</i>",count:"<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(2,11,"+rec.userid+")'> ✏️ </a>"});
										}
										if(!NUT.w2ui.permUser)new NUT.w2sidebar({name: "permUser",nodes:nodes}).render(permUser);
										else{
											NUT.w2ui.permUser.nodes=nodes;
											NUT.w2ui.permUser.refresh();
										}
									});
								});
								//menu
								NUT.ds.select({url:NUT.URL+"n_rolemenu", select:"menuid",where:["roleid","=",roleid]},function(res2){
									var lookup2={};
									for(var i=0;i<res2.result.length;i++){
										var rec2=res2.result[i];
										lookup2[rec2.menuid]=true;
									}
									SysAppWizard.renderMenu(permMenu,lookup2);
									SysAppWizard.renderMenu(permTool,lookup2,"tool");
								});
								//access
								NUT.ds.select({url:NUT.URL+"n_access",where:["roleid","=",roleid]},function(res2){
									var lookup2={};
									for(var i=0;i<res2.result.length;i++){
										var rec2=res2.result[i];
										lookup2[rec2.tableid]=rec2;
									}
									NUT.ds.select({url:NUT.URL+"nv_appservice_table", select:"tableid,tablename,alias",where:["appid","=",SysAppWizard.app.appid]},function(res3){
										var records=[];
										for(var i=0;i<res3.result.length;i++){
											var rec=res3.result[i];
											var access=lookup2[rec.tableid];
											if(access){access.checked=true;access.tablename=rec.tablename;access.alias=rec.alias};
											records.push(access||rec);
										}
										if(!NUT.w2ui.permAccess)new NUT.w2grid({name:"permAccess",recid:"tableid",columns:[{field:"checked",size:"35px",sortable:true,editable:{type:'checkbox'}},{field:"tablename",text:"Table name",size:"100px",sortable:true},{field:"alias",text:"Alias",size:"100px"},{field:"noselect",text:"<s>👁️</s>",size:"35px",tooltip:"No View",editable:{type:'checkbox'}},{field:"noinsert",text:"<s>📄</s>",size:"35px",tooltip:"No Insert",editable:{type:'checkbox'}},{field:"noupdate",text:"<s>💾</s>",size:"35px",tooltip:"No Update",editable:{type:'checkbox'}},{field:"nodelete",text:"<s>❌</s>",size:"35px",tooltip:"No Delete",editable:{type:'checkbox'}},{field:"noexport",text:"<s>📤</s>",size:"35px",tooltip:"No Export",editable:{type:'checkbox'}},{field:"isarchive",text:"🕰️",size:"35px",tooltip:"Can Archive",editable:{type:'checkbox'}},{field:"islock",text:"🔒",size:"35px",tooltip:"Can Lock",editable:{type:'checkbox'}}],records:records,onChange:function(evt){
											var checked=evt.detail.input.checked;
											var tableid=evt.detail.recid;
											if(evt.detail.column==0)SysAppWizard.access_onCheck(checked,roleid,tableid);
											else{
												var data={
													roleid:roleid,
													tableid:tableid
												}
												data[this.columns[evt.detail.column].field]=checked;
												NUT.ds.update({ url: NUT.URL+"n_access", data: data, where: [["roleid", "=", roleid],["tableid", "=", tableid]]},function(res4){
													if(res.success)NUT.notify("Asset Updated.", "lime");
													else NUT.notify("⛔ ERROR: " + res4.result, "red");
												});
											} 
										}}).render(permAccess);
										else{
											NUT.w2ui.permAccess.records=records;
											NUT.w2ui.permAccess.refresh();
										}
									});
								});
							}
						})).render(lstRole);
						if(nodes.length)NUT.w2ui.lstRole.click(nodes[0].id);
					});
				});
			break;
		}
	},
	renderMenu(div,lookupPerm,isTool){
		NUT.ds.select({url:NUT.URL+"n_menu",orderby:"seqno",where:[["appid","=",SysAppWizard.app.appid],isTool?["menutype","=","tool"]:["menutype","<>","tool"]]},function(res){
			var lookup={},nodes=[];
			for (var i = 0; i < res.result.length; i++) {
				var menu = res.result[i];
				var node = { id: menu.menuid, expanded: menu.isopen,text:(NUT.translate(menu.translate) || menu.menuname),count:"<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(3,16,"+menu.menuid+")'> ✏️ </a>",tag: menu.linkwindowid };
				if(lookupPerm)node.text="<input class='w2ui-input' type='checkbox' "+(lookupPerm[menu.menuid]?"checked":"")+" onchange='event.stopPropagation();SysAppWizard.menu_onCheck(this.checked,"+NUT.w2ui.lstRole.selected+","+menu.menuid+")'/> " + node.text;
				if (menu.icon) node.icon = menu.icon;
				if (menu.whereclause) node.where = JSON.parse(menu.whereclause);
				var parent = lookup[menu.parentid];
				if (parent) {
					parent.group = true;
					if (parent.nodes) parent.nodes.push(node);
					else parent.nodes = [node];
				} else nodes.push(node);
				lookup[node.id] = node;
			};
			(NUT.w2ui[div.id] || new NUT.w2sidebar({
				name: div.id,
				flatButton: true,
				nodes: nodes,
				topHTML:"<input class='w2ui-input' placeholder=" + NUT.w2utils.lang("_Search") + " style='width:100%'/>",
				onFlat: function (evt) {
					var width = NUT.isMobile ? "100%" : "260px";
					div.style.width = (evt.detail.goFlat ? '45px' : width);
				},
				onClick :function(evt){
					var tag=evt.object.tag;
					if(tag!=SysAppWizard.curWin.windowid){
						if(tag){
							if(Number.isInteger(tag)){
								NUT.w2ui.titleWindow.click(tag);
							} else iNUT.runComponent(tag);
						}else NUT.notify("Link-Window not set!");
					}
				}
			})).render(div);
		});
	},
	tabPerm_onClick(selBut,selDiv){
		for(var i=0;i<divPerm.childNodes.length;i++){
			var div=divPerm.childNodes[i];
			div.style.display=(div==selDiv?"":"none");
		}
		for(var i=0;i<divTabPerm.childNodes.length;i++){
			var but=divTabPerm.childNodes[i];
			but.style.border=(but==selBut?"1px solid":"");
		}
		
	},
	showTabDialog(windowid,tabid,recordid){
		NUT.ds.get({ url: NUT.URL_TOKEN + "cache/" + windowid }, function (res) {
			if (res.success) {
				var cache = res.result;
				if (cache) {
					var conf = NUT.configWindow(zipson.parse(cache.configjson), cache.layoutjson ? zipson.parse(cache.layoutjson) : null);
					var tabconf=conf.lookupTab[tabid];
					if(recordid){//edit
						NUT.ds.select({ url:tabconf.table.urlview,where:[tabconf.table.columnkey,"=",recordid] }, function (res2) {
							if(res2.success&&res2.result.length)NUT.NWin.showNewDialog(tabconf,res2.result[0]);
							else NUT.notify("⚠️ Not found record id = " + recordid, "yellow");
						});
					}else NUT.NWin.showNewDialog(tabconf);
				} else NUT.notify("⚠️ No cache for window " + windowid, "yellow");
			} else NUT.notify("⛔ ERROR: " + res.result, "red");
		});
	},
	titleWindow_onClick:function(evt){
		SysAppWizard.curWin=evt.object.tag;
		var cache = { layouts: {}, lookupField: {}, win: evt.object.tag };
		NUT.ds.select({ url: NUT.URL + "n_cache", select: "layoutjson", where: ["windowid", "=", cache.win.windowid] }, function (res) {
			if (res.success) {
				var layout = res.result[0];
				if (layout && layout.layoutjson) {
					cache.layouts = zipson.parse(layout.layoutjson);
				}
				NUT.ds.select({ url: NUT.URL + "nv_field_column", orderby: "tabid,seqno", where: ["windowid", "=", cache.win.windowid] }, function (res3) {
					var lookupFields={};
					for (var j = 0; j < res3.result.length; j++) {
						var fld=res3.result[j];
						if(!lookupFields[fld.tabid])lookupFields[fld.tabid]=[];
						lookupFields[fld.tabid].push(fld);
					}
					NUT.ds.select({ url: NUT.URL + "n_tab", orderby: ["tablevel", "seqno"], where: ["windowid", "=", cache.win.windowid] }, function (res2) {
						if (res2.success) {
							tabs = res2.result;
							if (tabs.length) {
								var lookupTab = {}, lookupDiv = {}, winconf = { tabs: [], tabid: cache.win.windowid, windowname: cache.win.windowname }, ids = [];
								for (var i = 0; i < tabs.length; i++) {
									var tab = tabs[i];
									if (cache.layouts[tab.tabid]) {
										tab.layout = document.createElement("div");
										tab.layout.innerHTML = cache.layouts[tab.tabid];
										cache.layouts[tab.tabid] = tab.layout;
									}
									tab.fields = lookupFields[tab.tabid];
									tab.tabs = [];
									tab.maxLevel = 0;

									if (tab.tablevel == 0) winconf.tabs.push(tab);
									lookupTab[tab.tabid] = tab;
									ids.push(tab.tabid);
									if (tab.parenttabid) {
										var parentTab = lookupTab[tab.parenttabid];
										if (tab.tablevel > 0) {
											if (tab.tablevel > parentTab.tablevel) {
												parentTab.tabs.push(tab);
												if (tab.tablevel > parentTab.maxLevel) parentTab.maxLevel = tab.tablevel;
											} else {
												lookupTab[parentTab.parenttabid].tabs.push(tab);
											}
										}
									}
								}
							}
							lstWindow.innerHTML="";
							SysAppWizard.buildWindow(lstWindow, winconf, 0, cache);
						} else NUT.notify("⛔ ERROR: " + res2.result, "red");
					});
				});
			} else NUT.notify("⛔ ERROR: " + res.result, "red");
		})
	},
	org_onCheck:function(checked,orgid,userid){
		if(checked){
			var data={
				orgid:orgid,
				userid:userid,
				siteid:SysAppWizard.app.siteid
			}
			NUT.ds.insert({url:NUT.URL+"n_orguser",data:data},function(res){
				if(res.success)NUT.notify("Orgniztion Assigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}else{
			NUT.ds.delete({ url:NUT.URL+"n_orguser", where:[["userid","=",userid],["orgid","=",orgid]]}, function(res){
				if(res.success)NUT.notify("Orgniztion Unassigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}
	},
	service_onCheck:function(checked,serviceid){
		if(checked){
			var data={
				appid:SysAppWizard.app.appid,
				serviceid:serviceid,
				siteid:SysAppWizard.app.siteid
			}
			NUT.ds.insert({url:NUT.URL+"n_appservice", data:data},function(res){
				if(res.success)NUT.notify("Service Assigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}else{
			NUT.ds.delete({ url:NUT.URL+"n_appservice", where:[["appid","=",SysAppWizard.app.appid],["serviceid","=",serviceid]] }, function(res){
				if(res.success)NUT.notify("Service Unassigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}
	},
	role_onCheck:function(checked,roleid){
		if(checked){
			var data={
				appid:SysAppWizard.app.appid,
				roleid:roleid,
				siteid:SysAppWizard.app.siteid
			}
			NUT.ds.insert({url:NUT.URL+"n_roleapp", data:data},function(res){
				if(res.success)NUT.notify("Service Assigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}else{
			NUT.ds.delete({ url:NUT.URL+"n_roleapp", where:[["appid","=",SysAppWizard.app.appid],["roleid","=",roleid]] }, function(res){
				if(res.success)NUT.notify("Role Unassigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}
	},
	user_onCheck:function(checked,roleid,userid){
		if(checked){
			var data={
				roleid:roleid,
				userid:userid,
				siteid:SysAppWizard.app.siteid
			}
			NUT.ds.insert({url:NUT.URL+"n_roleuser",data:data},function(res){
				if(res.success)NUT.notify("User Assigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}else{
			NUT.ds.delete({ url:NUT.URL+"n_roleuser", where:[["userid","=",userid],["roleid","=",roleid]]}, function(res){
				if(res.success)NUT.notify("User Unassigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}
	},
	menu_onCheck:function(checked,roleid,menuid){
		if(checked){
			var data={
				roleid:roleid,
				menuid:menuid,
				siteid:SysAppWizard.app.siteid
			}
			NUT.ds.insert({url:NUT.URL+"n_rolemenu",data:data},function(res){
				if(res.success)NUT.notify("Menu Assigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}else{
			NUT.ds.delete({ url:NUT.URL+"n_rolemenu", where:[["menuid","=",menuid],["roleid","=",roleid]]}, function(res){
				if(res.success)NUT.notify("Menu Unassigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}
	},
	access_onCheck:function(checked,roleid,tableid){
		if(checked){
			var data={
				roleid:roleid,
				tableid:tableid,
				siteid:SysAppWizard.app.siteid
			}
			NUT.ds.insert({url:NUT.URL+"n_access",data:data},function(res){
				if(res.success)NUT.notify("Access Assigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}else{
			NUT.ds.delete({ url:NUT.URL+"n_access", where:[["tableid","=",tableid],["roleid","=",roleid]]}, function(res){
				if(res.success)NUT.notify("Access Unassigned.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}
	},
	editDomainValues:function(){
		if(NUT.w2ui.lstDomain.selected)NUT.w2prompt({label:"Values",title:"Edit Domain",textarea:true,attrs:"style='height:140px'",value:NUT.w2ui.lstDomain.get(NUT.w2ui.lstDomain.selected).tag.domainjson}).ok(function(evt,val){
			NUT.ds.update({ url: NUT.URL+"n_domain", data: {domainjson:evt.detail.value}, where: ["domainid", "=", NUT.w2ui.lstDomain.selected]},function(res){
				if(res.success)NUT.notify("Domain Values Updated.", "lime");
				else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		});
		else NUT.notify("⚠️ Select one domain to edit values", "yellow");
	},
	importMoreTable:function(){
		if(NUT.w2ui.lstService.selected)NUT.runComponent("SysImportTable",{records:[NUT.w2ui.lstService.get(NUT.w2ui.lstService.selected).tag]});
		else NUT.notify("⚠️ Select one service to import tables", "yellow");
	},
	
	buildWindow: function (div, winconf, tabLevel, cache) {
		var divTabs = div.z(["div", { id: "tabsWz_" + winconf.tabid + "_" + tabLevel }]);
		var tabs = [];
		for (var i = 0; i < winconf.tabs.length; i++) {
			var tabconf = winconf.tabs[i];
			if (!tabconf.layoutcols) tabconf.layoutcols = (SysAppWizard.app.apptype=="gis"?2:3);
			if (tabconf.tablevel == tabLevel) {
				var divTab = div.z(["div", { id: "tabWz_" + tabconf.tabid,tag:tabconf}]);
				var divCont = divTab.z(["div", { id: "contWz_" + tabconf.tabid, style:"height:230px;width:950px", className: "nut-full" }]);
				var tab = { id: tabconf.tabid, text: tabconf.tabname + "<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(3,7,"+tabconf.tabid+")'> ✏️ </a>", div: divTab };
				SysAppWizard.buildContent(divCont,tabconf);
				if (tabconf.tabs.length) for (var l = tabLevel + 1; l <= tabconf.maxLevel; l++)
					SysAppWizard.buildWindow(divTab, tabconf, l, cache);
				if (tabs.length) divTab.style.display = "none";
				tabs.push(tab);
			}
		}

		(NUT.w2ui[divTabs.id] || new NUT.w2tabs({
			name: divTabs.id,
			active: tabs[0].id,
			tabs: tabs,
			onClick: function (evt) {
				var id = evt.detail.tab.id;
				for (var i = 0; i < this.tabs.length; i++) {
					var tab = this.tabs[i];
					var divTab = tab.div;
					divTab.style.display = (tab.id == id) ? "" : "none";
				}
			}
		})).render(divTabs);
	},
	buildContent(div, conf) {
		var fields=NUT.NWin.fieldsFromConfig(conf);
		var index=0;
		for (var i = 0; i < fields.length; i++){
			var fld=fields[i];
			fld.html.label+="<a style='cursor:pointer' onclick='SysAppWizard.showTabDialog(3,6,"+fld.tag.fieldid+")'> ✏️ </a>";
		}
		var recid = conf.table ? conf.table.columnkey : null;
		var opt = {
			name: div.id,
			autosize: false,
			fields: fields,
			recid: recid,
			onChange: this.field_onChange
		}
		var form = (NUT.w2ui[div.id] || new NUT.w2form(opt));
		if (conf.layout) form.formHTML = conf.layout.outerHTML;
		form.render(div);
	}
}