import { w2ui, w2layout, w2utils, w2popup, w2prompt, w2sidebar, w2confirm, w2form } from "../../lib/w2ui.es6.min.js";
import { SqlREST } from "../js/sqlrest.js";
NUT.ds = SqlREST;
NUT.w2ui = w2ui;
NUT.w2utils = w2utils;
NUT.w2confirm = w2confirm;
NUT.w2popup = w2popup;
NUT.w2prompt = w2prompt;
var _rock = null;
window.onload = function () {
	var strs = (window.location.search.substring(1)).split("&");
	for (var i = 0; i < strs.length; i++) {
		var str = strs[i].split("=");
		n$[str[0]] = str[1];
	}
	if (n$.theme && n$.theme != "w2ui.min") cssMain.href = "../lib/" + n$.theme + ".css";
	SqlREST.token = "Bearer " + n$.token;
	w2utils.locale(n$.locale).then(function (evt) {
		n$.lang = n$.locale.substring(0, 2);
		n$.phrases = evt.data.phrases;
		document.body.innerHTML = "<div id='divApp'></div>";
		NUT.appinfo = '<img width="64" height="64" src="favicon.ico"/><br/><h2><b style="color:brown">Data Rock</b></h2><br/><hr/><br/><h3>Data Analyst for Designer</h3>';

		(w2ui["layMain"] || new w2layout({
			name: "layMain",
			style: "width:100%;height:100%;top:0;margin:0",
			panels: [
				{ type: 'top', size: 38, html: '<i class="nut-link"><img id="imgLogo " width="20" height="20" src="favicon.ico"/> DataRock 1.0</i>' },
				{ type: 'left', size: 300, resizable: true, html: '<div id="divLeft" class="nut-full"></div>' },
				{ type: 'main', html: '<div id="divMain" class="nut-full"><div id="divTitle" style="padding:6px;font-size:12pt">' + NUT.appinfo + '</div></div>' },
				{ type: 'preview', size: "40%", resizable: true, html: '<div id="divChart" class="nut-full"></div>' }
			],
		})).render(divApp);
		NUT.ds.select({ url: NUT.URL + "n_app", order: "orderno", where: ["apptype", "<>", "engine"] }, function (res) {
			if (res.success && res.result.length) {
				var appItems = [], lookup = {}, nodes = [];
				for (var i = 0; i < res.result.length; i++) {
					var item = res.result[i];
					appItems.push({ id: item.appid, text: item.appname });
					var node = { id: "app_" + item.appid, text: item.appname + "<span></span><a class='nut-badge' onclick='event.stopPropagation();openReport(" + item.appid + ")' title='New Analyst'>➕</a>", expanded: true, group: true, tag: item.appid, nodes: [] };
					nodes.push(node);
					lookup[item.appid] = node;
				}
				//loadMenu

				NUT.ds.select({ url: NUT.URL + "n_report", select: "reportid,reportname,appid", order: "reportname", where: ["reporttype", "=", "analyst"] }, function (res) {
					if (res.success) {
						for (var i = 0; i < res.result.length; i++) {
							var rec = res.result[i];
							var node = { count: "<a onclick='event.stopPropagation();deleteReport(" + rec.reportid + ")' title='Delete'>➖</a>", id: rec.reportid, text: rec.reportname, icon: 'nut-img-analyst' };
							var parent = lookup[rec.appid];
							if (!parent.nodes) parent.nodes = [];
							parent.nodes.push(node);
						};
						(w2ui['mnuMain'] || new w2sidebar({
							name: 'mnuMain',
							flatButton: true,
							nodes: nodes,
							topHTML: "<input class='w2ui-input' style='width:100%' placeholder=" + w2utils.lang("_Search") + "/>",
							onClick: function (evt) {
								var node = evt.object;
								NUT.ds.select({ url: NUT.URL + "n_report", where: ["reportid", "=", node.id] }, function (res) {
									if (res.success && res.result.length) {
										openReport(node.parent.tag, res.result[0]);
									}
								});
							},
							onFlat: function (evt) {
								w2ui.layMain.sizeTo("left", this.flat ? 300 : 45);
								divLeft.style.width = (this.flat ? '300px' : '45px');
							}
						})).render(divLeft);
					} else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
			} else NUT.notify("⚠️ Site has no application", "yellow");
		});
	});
}
window.deleteReport = function (id) {
	NUT.confirm('Delete selected analyst?', function (evt) {
		if (evt == "yes") NUT.ds.delete({ url: NUT.URL + "n_report", where: ["reportid", "=", id] }, function (res) {
			if (res.success) {
				w2ui.mnuMain.remove(id);
				NUT.notify("Analyst deleted!", "lime");
			} else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	});
}
window.saveReport = function (evt) {
	NUT.openDialog({
		title: "Save Analyst",
		width: 360,
		height: 200,
		div: "<table style='margin:auto'><tr><td>Name<sup style='color:red'>*</sup> </td><td><input id='txtName' class='w2ui-input'/></td></tr><tr><td>Description </td><td><textarea id='txtDescription' class='w2ui-input'></textarea></td></tr></table>",
		onOpen: function (evt) {
			evt.onComplete = function () {
				if (_rock.analyst) {
					txtName.value = _rock.analyst.reportname;
					txtDescription.value = _rock.analyst.description;
				}
			}
		},
		actions: {
			"_Close": function () { NUT.closeDialog() },
			"_Save": function () {
				if (txtName.value) {
					var rpt = _rock.getReport();
					rpt.dataSource.data = [rpt.dataSource.data[0]];
					if (_rock.analyst) {
						NUT.ds.update({ url: NUT.URL + "n_report", data: { reportname: txtName.value, description: txtDescription.value, contentjson: JSON.stringify(rpt), tableid:_rock.tableid }, where: ["reportid", "=", _rock.analyst.reportid] }, function (res) {
							if (res.success) NUT.notify("Analyst updated.", "lime");
							else NUT.notify("🛑 ERROR: " + res.result, "red");
						});
					} else {
						if (_rock.tableid) {
							_rock.analyst = { reportname: txtName.value, description: txtDescription.value, contentjson: JSON.stringify(rpt), reporttype: "analyst", tableid: _rock.tableid, appid: _rock.appid, siteid: n$.siteid };
							NUT.ds.insert({ url: NUT.URL + "n_report", data: _rock.analyst, returnid: true }, function (res) {
								if (res.success) {
									var newid = res.result[0];
									_rock.analyst.reportid = newid;
									var node = { id: newid, text: txtName.value, icon: "nut-img-analyst", count: "<a onclick='event.stopPropagation();deleteReport(" + newid + ")' title='Delete'>➖</a>" };
									w2ui.mnuMain.add("app_" + _rock.appid, node);
									NUT.notify("Analyst inserted.", "lime");

								} else NUT.notify("🛑 ERROR: " + res.result, "red");
							});
						} else NUT.notify("⚠️ No data source!", "yellow");
					}
				} else NUT.notify("⚠️ Name is empty!", "yellow");
			}
		}
	});
}
window.connectTable = function () {
	var appid = this.pivot.appid;
	NUT.ds.select({ url: NUT.URL + "nv_appservice_service", where: ["appid", "=", appid] }, function (res2) {
		if (res2.success && res2.result.length) {
			var lookupService = {}
			for (var i = 0; i < res2.result.length; i++) {
				var rec2 = res2.result[i];
				lookupService[rec2.serviceid] = rec2;
			}
			NUT.ds.select({ url: NUT.URL + "nv_appservice_table", order: "tablename", where: ["appid", "=", appid] }, function (res) {
				if (res.success) {
					var itemDs = [], lookupTable = {};
					for (var i = 0; i < res.result.length; i++) {
						var rec = res.result[i];
						lookupTable[rec.tableid] = rec;
						itemDs.push([rec.tableid, rec.tablename]);
					}
					NUT.openDialog({
						title: "Data Table",
						width: 360,
						height: 200,
						div: "<table style='margin:auto'><tr><td>Table </td><td>" + NUT.outerCboHTML(itemDs, "cboDatasource") + "</td></tr></table>",
						onOpen: function (evt) {
							evt.onComplete = function () {
								if (_rock.tableid) cboDatasource.value = _rock.tableid;
							}
						},
						actions: {
							"_Close": function () { NUT.closeDialog() },
							"_Ok": function () {
								if (cboDatasource.value) {
									_rock.tableid = cboDatasource.value;
									var tbl = lookupTable[cboDatasource.value];
									var service = lookupService[tbl.serviceid];
									if (tbl.tabletype == "arcgis") {
										var url = service.url.split("home/item.html?id=")[0];
										NUT.ds.post({ url: NUT.URL_PROXY+url + "sharing/rest/oauth2/token?f=json&grant_type=client_credentials&client_id=" + service.accessuser + "&client_secret=" + service.accesspass + "&referer=" + location.origin }, function (res4) {
											if (res4.error) NUT.notify("🛑 ERROR: " + res4.error.message, "red");
											else NUT.ds.get({ url: NUT.URL_PROXY + tbl.url + "/query?f=json&where=1=1&outFields=*&token=" + res4.access_token }, function (res3) {
												if (res3.error) NUT.notify("🛑 ERROR: " + res3.error.message, "red");
												else {
													var data = [];
													for (var i = 0; i < res3.features.length; i++) {
														var feat = res3.features[i].attributes;
														data.push(feat);
													}
													_rock.setReport({
														dataSource: {
															dataSourceType: "json",
															data: data
														},
													});
												}
											}); 
										});
									} else NUT.ds.get({ url: service.url + "data/" + tbl.tablename }, function (res3) {
										if (res3.success) {
											var data = res3.result;
											_rock.setReport({
												dataSource: {
													dataSourceType: "json",
													data: data
												},
											});
										} else NUT.notify("🛑 ERROR: " + res3.result, "red");
									});
								} else NUT.notify("⚠️ Select a table!", "yellow");
							}
						}
					});
				} else NUT.notify("🛑 ERROR: " + res.result, "red");
			});
		} else NUT.notify("⚠️ Application have no service!", "yellow");
	});
}
window.openReport = function (appid, rpt) {
	// modeler instance
	divMain.innerHTML = "";

	_rock = new WebDataRocks({
		container: divMain,
		toolbar: true,
		beforetoolbarcreated: function (tbr) {
			const tabs = tbr.getTabs();
			tbr.getTabs = function () {
				tabs.unshift({
					id: "cmd-analyst",
					title: "Analyst",
					icon: "<img src='favicon.ico'/>",
					menu: [
						{
							id: "mnu-datatable",
							title: "Connect Data",
							icon: "<img src='../img/table_go.png'/>",
							handler: connectTable
						}, {
							id: "mnu-save",
							title: "Save to App",
							icon: "<img src='../img/drive_disk.png'/>",
							handler: saveReport
						}
					]
				});
				return tabs;
			}
		},
		update: function () {
			_rock.highcharts.getData({ type: "column" }, function (data) {
				Highcharts.chart(divChart, data);
			});
		}
	});
	_rock.appid = appid;
	if (rpt) {
		_rock.analyst = rpt;
		_rock.tableid = rpt.tableid;
		_rock.setReport(JSON.parse(rpt.contentjson));
	}
}