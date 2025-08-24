import { w2ui, w2layout, w2toolbar, w2form, w2utils, w2popup, w2sidebar, w2tooltip, w2confirm, w2tabs, w2menu, w2grid, w2alert, w2prompt } from "../lib/w2ui.es6.min.js";
import { NWin } from "./window.js";
import { SqlREST } from "./sqlrest.js";
import { AGMap } from "./agmap.js";
import { FMan } from "./fileman.js";
w2utils.settings.dataType = "RESTFULL";

NUT.ds = SqlREST;
NUT.AGMap = AGMap;
NUT.NWin = NWin;
NUT.FMan = FMan;

NUT.w2ui = w2ui;
NUT.w2utils = w2utils;
NUT.w2confirm = w2confirm;
NUT.w2popup = w2popup;
NUT.w2form = w2form;
NUT.w2layout = w2layout;
NUT.w2toolbar = w2toolbar;
NUT.w2sidebar = w2sidebar;
NUT.w2tooltip = w2tooltip;
NUT.w2tabs = w2tabs;
NUT.w2menu = w2menu;
NUT.w2grid = w2grid;
NUT.w2alert = w2alert;
NUT.w2prompt = w2prompt;


window.onload = function () {
	n$.theme = localStorage.getItem("theme");
	if (n$.theme && n$.theme != "w2ui.min") cssMain.href = "lib/" + n$.theme + ".css";
	n$.user = null;
	NUT.isMobile = w2utils.isMobile;
	//document.body.innerHTML = "<div id='divLogin'></div>";
	w2utils.locale(localStorage.getItem("locale") || w2utils.settings.locale).then(function (evt) {
		n$.locale = evt.data.locale;
		n$.lang = n$.locale.substring(0, 2);
		n$.phrases = evt.data.phrases;
		var cookie = NUT.cookie();
		(w2ui["frmLogin"] || new w2form({
			name: "frmLogin",
			//style: "width:360px;height:230px;top:33%;margin:auto",
			formHTML: divLogin.innerHTML,
			header: "_NUT",
			fields: [
				{ field: 'username', type: 'text', html: { label: "_Username", text: "%site%", attr: "style='width:120px'" } },
				{ field: 'sitecode', type: 'text', html: { label: " . ", anchor: '%site%', attr: "style='width:60px'" } },
				{ field: 'password', type: 'password', html: { label: "_Password", attr: "style='width:190px'" } },
				{ field: 'savepass', type: 'checkbox', html: { label: "_SavePassword" } }
			],
			record: cookie,
			actions: {
				"_Help": function () {
					window.open('help.html');
				},
				"_Login": function () {
					var rec = this.record;
					login(rec);
					/*cookie.password ? login(rec) : NUT.w2utils.sha256(rec.password).then(function (md5) {
						rec.password = md5;
						login(rec);
					});*/
				}
			},
		})).render(divLogin);

		cboLang.value=evt.data.locale;
		cboLang.onchange=function () {
			localStorage.setItem("locale", this.value);
			location.reload();
		}

		cboTheme.value=n$.theme;
		cboTheme.onchange=function () {
			n$.theme = this.value ||"w2ui.min";
			localStorage.setItem("theme", n$.theme);
			cssMain.href="lib/"+n$.theme+".css";
		}
	});
}

function login(cookie) {
	NUT.loading(divLogin);
	NUT.ds.get({ url: NUT.URL_TOKEN, data: [cookie.username, cookie.sitecode, cookie.password], method: "POST" }, function (res) {
		if (res.success) {
			n$.user = res.result;
			if (n$.user.backdrop) n$.user.backdrop = JSON.parse(n$.user.backdrop)[0];
			if (n$.user.icon) n$.user.icon = JSON.parse(n$.user.icon)[0];
			document.body.style.backgroundImage = "url(" + n$.user.backdrop + ")";

			SqlREST.token = "Bearer " + n$.user.token;
			NUT.cookie(cookie);
			//user select role & org
			NUT.roles = res.result.roles;
			var roles = Object.values(NUT.roles);
			NUT.orgs = res.result.orgs;
			var orgs = Object.values(NUT.orgs);
			if (roles.length == 1 && orgs.length <= 1) {
				var orgid = orgs[0] ? orgs[0].id : 0;
				NUT.ds.get({ url: NUT.URL_TOKEN, data: [roles[0].id, orgid], method: "PUT" }, function (res) {
					if (res.success) {
						n$.user.roleid = roles[0].id;
						n$.user.orgid = orgid;
						NUT.access = res.result.access;
						NUT.apps = res.result.apps;
						NUT.notifies=res.result.notifies;
						openDesktop();
					} else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
			} else {
				var fields = [{ field: 'roleid', type: 'select', html: { label: "_Role" }, options: { items: roles } }];
				var record = { roleid: roles[0].id };
				if (orgs.length) {
					fields.push({ field: 'orgid', type: 'select', html: { label: "_Org" }, options: { items: orgs } });
					record.orgid = orgs[0].id;
				}
				divLogin.innerHTML = "";
				(w2ui["frmRoleOrg"] || new w2form({
					name: "frmRoleOrg",
					style: "width:360px;height:240px;top:33%;margin:auto",
					header: '<img height="16" src="' + n$.user.icon + '"/> <span><b>' + n$.user.sitename + '</b> - ' + (NUT.isMobile ? n$.user.sitecode : NUT.translate(n$.user.sitedesc)) + '</span>',
					fields: fields,
					record: record,
					actions: {
						"_Cancel": function () {
							location.reload();
						},
						"_Ok": function () {
							var rec = this.record;
							NUT.ds.get({ url: NUT.URL_TOKEN, data: [rec.roleid, rec.orgid || 0], method: "PUT" }, function (res) {
								if (res.success) {
									n$.user.roleid = rec.roleid;
									n$.user.orgid = rec.orgid;
									NUT.access = res.result.access;
									NUT.apps = res.result.apps;
									NUT.notifies=res.result.notifies;
									openDesktop();
								} else NUT.notify("🛑 ERROR: " + res.result, "red");
							});
						}
					}
				})).render(divLogin);
			}
			//renderMain();
		} else NUT.notify("🛑 ERROR: " + res.result, "red");
		NUT.loading();
	});
}

function openDesktop(force) {
	(w2ui["layMain"] || new w2layout({
		name: "layMain",
		style: "width:100%;height:100%;top:0;margin:0",
		panels: [
			{ type: 'top', size: 38, html: '<div id="divTop" class="nut-full"></div>' },
			{ type: 'left', size: (NUT.isMobile ? 45 : 300), resizable: true, html: '<div id="divLeft" class="nut-full"></div>', hidden: true },
			{ type: 'main', html: '<div id="divMain" class="nut-full" style="background:url(\'' + n$.user.backdrop + '\');background-size:cover"><div id="divApp" style="position:absolute;width:100%;top:40%"></div><div id="divTool" style="position:absolute;width:100%;top:10px"></div></div>' },
			{ type: 'right', size: 500, resizable: true, html: '<div id="divRight" class="nut-full"></div>', hidden: true },
			{ type: 'bottom', size: "40%", resizable: true, html: '<div id="divBottom" class="nut-full"></div>', hidden: true }
		],
	})).render(divLogin);
	
	var items = [];
	var maxprior = 0;
	for (var i = 0; i < NUT.notifies.length; i++) {
		var rec = NUT.notifies[i];
		var text = rec.windowname + " ID=" + rec.recordid + " " + rec.status + " from " + rec.username + " at " + (new Date(rec.created)).toLocaleString();
		if (rec.note) text += "<br/>" + rec.note;
		if (rec.priority) {
			if (rec.priority > maxprior) maxprior = rec.priority;
			text = "<span style='background:" + (rec.priority == 2 ? "red" : "orange") + "'>" + text + "</span>";
		}

		items.push({ id: rec.flowid, text: text, tag: rec });
	}
	var count = NUT.notifies.length;
	if (maxprior) count = "<span style='color:" + (maxprior == 2 ? "red" : "orange") + "'>" + count + "</span>";
	(w2ui["tbrTop"] || new w2toolbar({
		name: "tbrTop",
		items: [
			{ type: 'html', id: 'logo', html: '<table width="' + (NUT.isMobile ? "" : 284) + '"><tr><td><img height="24" id="imgAppLogo" src="' + n$.user.icon + '"/></td><td>&nbsp;</td><td><div id="divAppNames">' + (NUT.isMobile ? '<b>' + n$.user.sitecode + '</b>' + (n$.user.orgid ? '<br/><i>' + NUT.orgs[n$.user.orgid].code + '</i>' : '') : '<b>' + n$.user.sitename + (n$.user.orgid ? '.' + NUT.orgs[n$.user.orgid].text : '') + '</b><br/><i>' + NUT.translate(n$.user.sitedesc) + '</i>') + '</div></td></tr></table>' },
			{ type: 'spacer', id: 'shot' },
			{ type: 'spacer' },
			{ type: 'button', id: "home", text: "🏠", tooltip: "_Home" },
			{ type: 'menu', id: "notify", text: "🔔", tooltip: "_Notify", count: count, items: items },
			{ type: 'break' },
			{
				type: 'menu', id: 'user', text: "🤵 " + n$.user.username, tooltip: n$.user.fullname, items: [
					{ id: 'profile', text: '_Profile' },
					{ id: 'changepass', text: '_ChangePassword' },
					{ text: '--' },
					{ id: 'logout', text: '_Logout' }]
			},
			{ type: 'break' },
			{ type: 'button', id: "apps", text: "⋮", tooltip: "_Application" }
		],
		onClick(evt) {
			if (evt.target.startsWith("notify:")) {
				var tag = evt.detail.subItem.tag;
				if (n$.app && n$.app.appid == tag.appid) {
					menu_onClick({ object: { tag: tag.windowid, where: [NUT.tables[tag.tableid].columnkey, "=", tag.recordid], isFlow: true } });
					NUT.ds.update({ url: NUT.URL + "n_wfflow", data: { isread: true }, where: ["flowid", "=", tag.flowid] }, function (res) {
						if (!res.success) NUT.notify("🛑 ERROR: " + res.result, "red");
					});
				} else NUT.notify("⚠️ Application " + NUT.apps[tag.appid].appname + " is not open yet.", "yellow");
			} else switch (evt.target) {
				case "home":
					w2ui.layMain.hide("left");
					if (NUT.isGIS) w2ui.layMain.hide(NUT.isMobile ? "bottom" : "right");
					for (var i = 0; i < this.shotcut.length; i++)this.remove(this.shotcut[i]);
					n$.winid = null;
					n$.app = null;
					openDesktop(true);
					break;
				case "user:profile":
					NUT.alert("<table><tr><td><b><i>Tài khoản:</i></b></td><td colspan='3'>" + n$.user.username + "</td></tr><tr><td><b><i>Họ tên:</i></b></td><td colspan='3'>" + n$.user.fullname + "</td></tr><tr><td><b><i>Điện thoại:</i></b></td><td>" + n$.user.phone + "</td><td><b><i>Nhóm:</i></b></td><td>" + n$.user.groupid + "</td></tr><tr><td><b><i>Trạng thái:</i></b></td><td>" + n$.user.status + "</td><td><b><i>Ghi chú:</i></b></td><td>" + n$.user.description + "</td></tr></table>", "<b>Information #<i>" + n$.user.userid + "</i></b>");
					break;
				case "user:changepass":
					NUT.openDialog({
						width: 360, height: 240,
						title: "🔑 <i>Change password</i>",
						div: "<table style='margin:auto'><tr><td>*Old password:</b></td><td><input class='w2ui-input' id='txt_PasswordOld' type='password'/></td></tr><tr><td>*New password:</b></td><td><input class='w2ui-input' id='txt_PasswordNew' type='password'/></td></tr><tr><td>*Re-type password:</b></td><td><input class='w2ui-input' id='txt_PasswordNew2' type='password'/></td></tr></table>",
						actions: {
							"_Close": function () { NUT.closeDialog() },
							"_Ok": function () {
								if (txt_PasswordOld.value && txt_PasswordNew.value && txt_PasswordNew2.value) {
									if (txt_PasswordOld.value == n$.user.password && txt_PasswordNew.value == txt_PasswordNew2.value)
										NUT.ds.update({ url: NUT.URL + "n_user", data: { password: txt_PasswordNew.value }, where: [["userid", "=", n$.user.userid], ["password", "=", txt_PasswordOld.value]] }, function (res) {
											if (res.success) NUT.notify("Password change", "lime");
											else NUT.notify("🛑 ERROR: " + res.result, "red");
										})
									else NUT.notify("⚠️ Passwords not match!", "orange");
								} else NUT.notify("⚠️ Old password, new password and Retype password are all required!", "orange");
							}
						}
					});
					break;
				case "user:logout":
					location.reload();
					break;
				case "apps":
					w2tooltip.show({ name: "mnuApps", html: NUT.shortcut, anchor: evt.detail.originalEvent.target, hideOn: ['doc-click'] })
					break;
				default: menu_onClick(evt.object ? evt : { object: { tag: evt.detail.subItem.tag } });
			}
		}
	})).render(divTop);
	var id = null;
	var appHtml = "<center>";
	var toolHtml = "<center>";
	var countApp = 0, idOnlyApp = null;
	for (var key in NUT.apps) if (NUT.apps.hasOwnProperty(key)) {
		var app = NUT.apps[key];
		if (!force && app.icon) app.icon = JSON.parse(app.icon)[0];
		if (app.appid != null) {
			if (id != app.appid) {
				id = app.appid;
				app.appname = NUT.translate(app.translate) || app.appname;
				app.description = NUT.translate(app.description);
				if (app.issystem) {
					toolHtml += "<div class='nut-tool' onclick='openApp(" + id + ")' title='" + app.appname + "'><img src='" + app.icon + "'/></div>";
				} else {
					appHtml += "<div title='" + app.description + "' class='nut-tile' style='background:#" + app.color + "' onclick='openApp(" + id + ")'><img src='" + app.icon + "'/><div>" + app.appname + "</div></div>";
					idOnlyApp = id;
					countApp++;
				}
			}
		}
	};
	divApp.innerHTML = appHtml + "</center>";
	divTool.innerHTML = toolHtml + "</center>";
	NUT.shortcut = "<div style='transform: scale(0.5)'>" + divTool.innerHTML + "<hr/>" + divApp.innerHTML + "</div>";
	if (countApp == 1 && !force) openApp(idOnlyApp);
}

window.openApp = function (id) {
	//load menu
	n$.app = NUT.apps[id];

	if (n$.app.apptype == "engine") {
		var win = window.open(n$.app.linkurl + "?userid=" + n$.user.userid + "&siteid=" + n$.user.siteid + "&theme=" + n$.theme + "&locale=" + n$.locale + "&token=" + n$.user.token);
		win.n$ = n$;
		win.NUT = NUT;
	} else {
		NUT.isGIS = (n$.app.apptype == "gis");
		if (n$.app.theme)cssMain.href = "lib/" + n$.app.theme + ".css";
		divMain.style.backgroundImage = "";
		w2ui.layMain.show("left");

		NUT.appinfo = '<img width="64" height="64" src="' + n$.app.icon + '"/><br/><h2><b style="color:brown">' + n$.app.appname + '</b></h2><br/><hr/><br/><h3>' + n$.app.description + '</h3>';
		var titleHtml = '<div id="divTitle" class="nut-win-title">' + NUT.appinfo + '</div>';
		divMain.innerHTML = titleHtml;
		imgAppLogo.src = n$.app.icon;
		divAppNames.innerHTML = (NUT.isMobile ? '<b>' + n$.app.appname + '</b>' + (n$.user.orgid ? '<br/><i>' + NUT.orgs[n$.user.orgid].code + '</i>' : '') : '<b>' + n$.app.appname + (n$.user.orgid ? '.' + NUT.orgs[n$.user.orgid].text : '') + '</b><br/><i>' + NUT.translate(n$.app.description) + '</i>');
		
		NUT.ds.get({ url: NUT.URL_TOKEN + "app/" + id }, function (res) {
			if (res.success) {
				var result = res.result;
				var item = [n$.user.siteid, n$.user.sitecode];
				NUT.domains = { 0: { items: [{ id: item[0], text: item[1] }], lookup: { [item[0]]: item }, lookdown: { [item[1]]: item } } };

				for (var i = 0; i < result.domains.length; i++) {
					var data = result.domains[i];
					var domain = { items: [NUT.DM_NIL], lookup: {}, lookdown: {} };
					var items = JSON.parse(data.domainjson);
					for (var j = 0; j < items.length; j++) {
						var item = items[j];
						domain.items.push({ id: item[0], text: item[1], color: item[2] });
						domain.lookup[item[0]] = item;
						domain.lookdown[item[1]] = item;
					}
					NUT.domains[data.domainid] = domain;
				}
				NUT.services = result.services || {};
				NUT.relates = result.relates || {};
				NUT.tables = result.tables || {};
				var workflows = {};
				for (var i = 0; i < result.wfsteps.length; i++) {
					var step = result.wfsteps[i];
					step.ins = JSON.parse(step.ins);
					step.outs = JSON.parse(step.outs);
					var key = step.workflowid;
					if (!workflows[key]) workflows[key] = {};
					workflows[key][step.elementid] = step;
					workflows[key][step.stepid] = step;
					if (step.steptype == "bpmn:StartEvent")
						workflows[key][0] = step;
				}
				NUT.workflows = workflows;
				var wfusers = {};
				if (result.wfusers) for (var i = 0; i < result.wfusers.length; i++) {
					var user = result.wfusers[i];
					if (!wfusers[user.roleid]) wfusers[user.roleid] = [];
					wfusers[user.roleid].push({ id: user.userid, text: (user.fullname || user.username) });
				}
				NUT.wfusers = wfusers;
				//cached tables & finds
				NUT.findtables=[];
				for (var key in NUT.tables) if (NUT.tables.hasOwnProperty(key)) {
					var table = NUT.tables[key];
					if (table.iscache) NUT.cacheDmLink(table);
					if(table.columnfind)NUT.findtables.push(table);
				}
				var nodes = [], shotNodes = [], shotids = [], lookup = {}, openWinId = null;
				for (var i = 0; i < result.menus.length; i++) {
					var menu = result.menus[i];
					shotids.push(menu.menuid);
					var node = { id: menu.menuid, isopen: menu.isopen, issummary: menu.issummary, text: NUT.translate(menu.translate) || menu.menuname, tag: menu.linkwindowid || menu.execname, rpt: menu.reportid };
					if(menu.maplayer){
						node.maplayer=menu.maplayer;
						if(!NUT.isMobile||menu.subtype)node.nodes=[{id:"sub_"+node.id,text:"<i>"+(menu.subtype||"&nbsp;")+"</i>",maplayer:node.maplayer,noHandle:true,tag:node.tag}];
						if(menu.subtype)node.subtype=menu.subtype;
					}
					var parent = lookup[menu.parentid];
					if (menu.icon) node.icon = menu.icon;
					if (menu.whereclause) node.where = JSON.parse(menu.whereclause);
					if ((menu.linkwindowid || menu.execname) && menu.isopen) openWinId = menu.linkwindowid || menu.execname;
					if (menu.menutype == "menu") {
						if (parent) {
							parent.group = !NUT.isMobile;
							parent.expanded = !NUT.isMobile && parent.isopen;
							if (parent.nodes) parent.nodes.push(node);
							else parent.nodes = [node];
						} else nodes.push(node);
					} else {//shotcut
						//node.tooltip=node.text;
						//node.text="";
						node.type = menu.haschild ? "menu" : "button";
						if (parent) {
							if (parent.items) parent.items.push(node);
							else parent.items = [node];
						} else shotNodes.push(node);
					}
					lookup[node.id] = node;
				};
				w2ui["tbrTop"].shotcut = shotids;
				if (shotNodes.length) w2ui["tbrTop"].insert('shot', shotNodes);
				var opt = {
					name: "mnuMain",
					flatButton: true,
					flat: NUT.isMobile,
					nodes: nodes,
					topHTML: "<input id='_txttopsearch' class='w2ui-input' placeholder=" + NUT.w2utils.lang("_Search") + " style='width:100%' onchange='NUT.w2ui.mnuMain.search(this.value)'/>",
					onClick: menu_onClick,
					onFlat: function (evt) {
						w2ui.layMain.sizeTo("left", this.flat ? 300 : 45);
						divLeft.style.width = (this.flat ? '300px' : '45px');
					}
				}

				if (id == 1) {//LIST SYSTEM APPLICATIONS
					NUT.ds.get({ url: NUT.URL + "n_app", orderby: "seqno", where: ["siteid", "=", n$.user.siteid] }, function (res2) {
						if (res2.success) {
							var children = [];
							for (var i = 0; i < res2.result.length; i++) {
								var app = res2.result[i];
								children.push({ id: "app_" + app.appid, text: app.appname, tag: (app.apptype == "engine" ? 5 : 3), where: ["appid", "=", app.appid] });
							}
							opt.nodes.push({ id: "app_", text: n$.phrases["_Application"] + "<span></span><a class='nut-badge' onclick='event.stopPropagation();menu_onClick({object:{tag:3,newTab:4,nodes:[]}})' title='New Application'> ➕ </a>", group: !NUT.isMobile, expanded: !NUT.isMobile, nodes: children });
							(w2ui["mnuMain"] || new w2sidebar(opt)).render(divLeft);
						} else NUT.notify("🛑 ERROR: " + res2.result, "red");
					});
				} else (w2ui["mnuMain"] || new w2sidebar(opt)).render(divLeft);
				if (NUT.isGIS) {
					var pan = (NUT.isMobile ? "bottom" : "right");
					if (w2ui.layMain.get(pan).hidden) w2ui.layMain.show(pan);
				}
				
				if (openWinId) menu_onClick({ object: { tag: openWinId } });
			} else NUT.notify("🛑 ERROR: " + res.result, "red");
		});

		if (NUT.isGIS) {
			cssMap.href="https://js.arcgis.com/4.31/esri/themes/"+((n$.app.theme||n$.theme).includes("-dark")?"dark":"light")+"/main.css";
		
			NUT.ds.select({ url: NUT.URL + "nv_appservice_service", orderby: "seqno", where: [["appid", "=", id], ["servicetype", "=", "arcgis"]] }, function (res) {
				if (res.success && res.result.length) {
					divMain.innerHTML = "<div id='divMap' class='nut-full'></div><div id='tbrMap' style='position:absolute;top:10px;right:10px'></div><button style='position:absolute;border:none;top:2px;left:1px' onclick='this.checked=!this.checked;tbrMap.style.display=this.checked?\"none\":\"\"'>&nbsp;«&nbsp;</button><button style='position:absolute;border:none;top:2px;right:1px' onclick='NUT.w2ui.layMain.toggle(NUT.isMobile?\"bottom\":\"right\")'>&nbsp;»&nbsp;</button>";
					new AGMap({ divMap: divMap, service: res.result[0] });
				} else NUT.notify("⚠️ Application has no map", "yellow");
			});

			if (NUT.isGIS && NUT.isMobile) {
				layout_layMain_resizer_bottom.innerHTML = "<center>➖</center>";
				divBottom.innerHTML = titleHtml;
			} else divRight.innerHTML = titleHtml;
		}
	}
}
window.menu_onClick = function (evt) {
	var menu = evt.object, tag = menu.tag;
	if (tag) {
		if (Number.isInteger(tag)) {
			var win = new NWin(tag);
			var conf = NUT.windows[tag];
			if (conf) {
				var tabconf = conf.tabs[0];
				tabconf.menuWhere = menu.where;
				if (menu.maplayer) tabconf.table.maplayer = menu.maplayer;
				if (menu.isFlow) tabconf.menuWhere = null;
				if (menu.newTab) NWin.showNewDialog(conf.lookupTab[menu.newTab]);
				else {
					var a = NUT.createWindowTitle(tag, divTitle);
					if (a) {
						win.buildWindow(a.div, conf, 0);
						a.innerHTML = NUT.translate(conf.translate) || conf.windowname;
						if (menu.layerTitle) document.getElementById("tabs_tabs_" + conf.windowid + "_0_tab_" + tabconf.tabid).innerHTML = menu.layerTitle;
					} else {
						var grid = w2ui["grid_" + tabconf.tabid];
						if (grid) grid.reload();
					}

				}
			} else {
				NUT.ds.get({ url: NUT.URL_TOKEN + "cache/" + tag }, function (res) {
					if (res.success) {
						var cache = res.result;
						if (cache && cache.configjson) {
							conf = NUT.configWindow(zipson.parse(cache.configjson), cache.layoutjson ? zipson.parse(cache.layoutjson) : null);
							var tabconf = conf.tabs[0];
							tabconf.menuWhere = menu.where;
							if (menu.maplayer) tabconf.table.maplayer = menu.maplayer;
							if (menu.isFlow) tabconf.menuWhere = null;
							conf.tabid = conf.windowid;
							conf.windowname = NUT.translate(conf.translate) || conf.windowname;
							NUT.windows[tag] = conf;
							if (menu.newTab) NWin.showNewDialog(conf.lookupTab[menu.newTab]);
							else {
								var a = NUT.createWindowTitle(tag, divTitle);
								if (a) {
									if (NUT.isObjectEmpty(conf.needCache)) {
										win.buildWindow(a.div, conf, 0);
										if (menu.layerTitle) document.getElementById("tabs_tabs_" + conf.windowid + "_0_tab_" + tabconf.tabid).innerHTML = menu.layerTitle;
									} else {
										var needCaches = [];
										for (var key in conf.needCache) {
											if (conf.needCache.hasOwnProperty(key) && !NUT.dmlinks[key]) needCaches.push(conf.needCache[key]);
										}
										win.cacheDmAndOpenWin(a.div, conf, needCaches, 0);
									}
									a.innerHTML = NUT.translate(conf.translate) || conf.windowname;
								}
							}
						} else NUT.notify("⚠️ No cache for window " + tag, "yellow");
					} else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
			}
			if (NUT.isMobile) {
				if (w2ui.mnuMain.flat) NUT.w2menu.hide();
				else w2ui.mnuMain.goFlat(true);
			}
		} else if (tag.startsWith("https://") || tag.startsWith("http://")) window.open(tag);
		else if (tag.endsWith(".pdf") || tag.endsWith(".doc") || tag.endsWith(".xls")) window.open("site/" + n$.app.siteid + "/" + n$.app.appid + "/" + tag);
		else NUT.runComponent(tag);
	} else if (menu.rpt) NUT.runReport(menu.rpt);
}