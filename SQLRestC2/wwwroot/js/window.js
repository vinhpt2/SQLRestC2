import { w2ui, w2grid, w2toolbar, w2form, w2tabs } from "../lib/w2ui.es6.min.js";

export class NWin {
	constructor(id) {
		this.id = id;
	}
	buildWindow(div, conf, tabLevel, callback) {
		var divTabs = div.z(["div", { id: "tabs_" + conf.tabid + "_" + tabLevel }]);
		var tabs = [];
		for (var i = 0; i < conf.tabs.length; i++) {
			var tabconf = conf.tabs[i];
			if (tabconf.tablevel == tabLevel) {
				var divTab = div.z(["div", { id: "tab_" + tabconf.tabid, style: "height:" + (tabconf.maxLevel ? "45%" : "95%"), tag: tabconf }]);
				var tab = { id: tabconf.tabid, text: NUT.translate(tabconf.translate) || tabconf.tabname, div: divTab };
				this.buildContent(divTab, tabconf, callback);
				if (tabconf.tabs.length) {
					for (var l = tabLevel + 1; l <= tabconf.maxLevel; l++)
						this.buildWindow(divTab, tabconf, l, callback);
				}
				if (tabs.length) divTab.style.display = "none";
				tabs.push(tab);
			}
		}

		(w2ui[divTabs.id] || new w2tabs({
			name: divTabs.id,
			active: tabs[0].id,
			tabs: tabs,
			onClick: function (evt) {
				var id = evt.object.id;
				for (var i = 0; i < this.tabs.length; i++) {
					var tab = this.tabs[i];
					var divTab = tab.div;
					divTab.style.display = (tab.id == id) ? "" : "none";
					if (tab.id == id) NWin.updateChildGrid(divTab.tag);
				}
			}
		})).render(divTabs);
		div.parentNode.parentNode.scrollTop = 0;
	}
	cacheDmAndOpenWin(div, conf, needCaches, index) {
		var fldconf = needCaches[index];
		if (fldconf && fldconf.linktable) {
			if (!fldconf.parentfieldid) {
				var that = this;
				var columnkey = fldconf.bindfieldname || fldconf.linkcolumn || fldconf.linktable.columnkey;
				var columndisplay = fldconf.linktable.columndisplay || columnkey;
				NUT.ds.select({ url: fldconf.linktable.urlview, select: [columnkey, columndisplay], where: (fldconf.whereclause ? JSON.parse(fldconf.whereclause) : null) }, function (res) {
					if (res.success) {
						var dm = { items: [NUT.DM_NIL], lookup: {}, lookdown: {} };
						for (var i = 0; i < res.result.length; i++) {
							var data = res.result[i];
							var item = [data[columnkey], data[columndisplay]];
							dm.items.push({ id: item[0], text: item[1] });
							dm.lookup[item[0]] = item;
							dm.lookdown[item[1]] = item;
						}
						NUT.dmlinks[fldconf.linktableid + (fldconf.whereclause || "")] = dm;
						if (++index < needCaches.length) that.cacheDmAndOpenWin(div, conf, needCaches, index);
						else that.buildWindow(div, conf, 0);
					} else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
			}
		} else this.buildWindow(div, conf, 0);
	}

	buildContent(div, conf, callback) {
		var lookupField = {}, columns = [], searches = [];
		for (var i = 0; i < conf.fields.length; i++) {
			var fldconf = conf.fields[i];
			lookupField[fldconf.columnname] = fldconf;
			var alias = NUT.translate(fldconf.translate) || fldconf.fieldname;
			if (fldconf.isreadonly) alias = "<i>" + alias + "</i>";
			if (!fldconf.hideingrid) {
				var column = {field: fldconf.columnname, text: alias, size: (fldconf.displaylength || 100) + "px", sortable: true, frozen: fldconf.isfrozen, resizable: true, searchable: !fldconf.hideinfind, tag: fldconf };
				if (fldconf.fieldtype == "int" || fldconf.fieldtype == "float" || fldconf.fieldtype == "currency" || fldconf.fieldtype == "date" || fldconf.fieldtype == "datetime" || fldconf.fieldtype == "percent") column.render = fldconf.fieldtype;
				else if (fldconf.fieldtype == "file") column.render = function (record, extra) {
					if (extra.value) {
						var files = JSON.parse(extra.value);
						for (var j = 0; j < files.length; j++) {
							files[j] = "<a class='nut-link' target='_blank' href='" + files[j] + "'>[ " + (j + 1) + " ]</a>";
						}
						return files.toString();
					} else return extra.value;
				}
				var domain = NWin.domainFromConfig(fldconf);
				if (domain) {
					column.domain = domain;
					column.render = function (record, obj) {
						var col = this.columns[obj.colIndex];
						var item = col.domain.lookup[obj.value];
						var val = (item ? item[1] : obj.value);
						if (item && item[2]) {
							val = "<span style='color:" + item[2] + "'>" + val + "</span>";
						}
						return val;
					}
				}
				if (!(conf.isviewonly || fldconf.isreadonly)) {
					var type = fldconf.fieldtype;
					if (fldconf.fieldtype == "textarea") type = "text";
					if (fldconf.fieldtype == "radio") type = "select";
					column.editable = { type: type };
					if (domain) column.editable.items = domain.items;
				}
				columns.push(column);
			}
		}
		var fields = NWin.fieldsFromConfig(conf);
		var index = 0;
		for (var i = 0; i < fields.length; i++) {
			if (!fields[i].tag.hideinfind) {
				var fld = NUT.clone(fields[i]);
				fld.required = false;
				fld.html.column = (NUT.isMobile ? 0 : (fld.colspan ? fld.colspan - 1 : index++ % conf.layoutcols));
				searches.push(fld);
			}
		}

		var divTool = div.z(["div", { id: "tool_" + conf.tabid }]);
		var divCont = div.z(["div", { id: "cont_" + conf.tabid, className: "nut-full" }]);
		var divGrid = divCont.z(["div", { id: "grid_" + conf.tabid, className: "nut-full" }]);
		var divForm = divCont.z(["div", { id: "form_" + conf.tabid, className: "nut-full" }]);
		var recid = conf.table.columnkey;

		opt = {
			name: divGrid.id,
			dataType: "RESTFULL",
			httpHeaders: { Authorization: "Bearer " + n$.user.token },
			limit: NUT.GRID_LIMIT,
			reorderColumns: true,
			recid: recid,

			multiSelect: true,
			markSearch: false,
			columns: columns,
			onSelect: this.grid_onSelect,
			onLoad: this.grid_onLoad,
			onRequest: this.grid_onRequest,
			onError: this.grid_onError,
			onChange: NWin.field_onChange,
			onDblClick: this.grid_onDblClick,
		}
		
		if (conf.table.maplayer) {
			opt.columns[0].info={icon: 'w2ui-icon-search',style: "float:left"};
			opt.showBubble=function(row,col,summary){
				NUT.AGMap.zoomToSelect(conf.table.maplayer);
			}
		}
		if (conf.check) opt.show = { selectColumn: true };
		var grid = (w2ui[divGrid.id] || new w2grid(opt));
		grid.searches = searches;
		grid.render(divGrid);
		if (recid) {
			var isArcGIS = (conf.table.tabletype == "arcgis");
			if (isArcGIS) {
				grid.url = conf.table.url + "/query";
				if (NUT.AGMap.token) grid.url += "?token=" + NUT.AGMap.token;
				//grid.proxy = NUT.URL_PROXY;
				if (conf.table.maplayer) NUT.AGMap.grids[conf.table.maplayer] = grid;
			} else grid.url = conf.table.urlview;
		}

		var opt = {
			name: divForm.id,
			autosize: false,
			fields: fields,
			recid: recid,
			onChange: NWin.field_onChange
		}
		var form = (w2ui[divForm.id] || new w2form(opt));
		if (conf.layout) form.formHTML = conf.layout.outerHTML;
		form.render(divForm);

		var viewonly = n$.user.isviewer || conf.table.isreadonly || conf.isviewonly;
		var access = NUT.access[conf.table.tablename] || {};
		var isArchive = access.isarchive && conf.table.archivetype;
		var items = [{ type: 'check', id: "SWIT", text: '↔️', tooltip: "_Switch" }];
		if (conf.table.columntree) items.push({ type: 'check', id: "TREE", text: '🌳', tooltip: "_Tree" });
		items.push({ type: 'button', id: "RELO", text: '🔄', tooltip: "_Reload" });
		items.push({ type: 'break' });
		if (!access.noselect) items.push({ type: 'button', id: "FIND", text: '🔎', tooltip: "_Find" });
		if (callback) items.push({ type: 'button', id: "OK", text: '_Choose', tooltip: "_Choose", callback: callback });
		if (!viewonly && !access.noinsert) items.push({ type: "button", id: "NEW", text: '📝', tooltip: "_New" });
		if (!viewonly && !access.noupdate) items.push({ type: (isArchive ? "menu" : "button"), id: (isArchive ? "save" : "SAVE"), text: '💾', tooltip: "_Save", items: [{ id: "SAVE", text: "_Save" }, { id: "SAVE_A", text: "_SaveA" }] });
		if (!viewonly && !access.nodelete) items.push({ type: (isArchive ? "menu" : "button"), id: (isArchive ? "del" : "DEL"), text: '❌', tooltip: "_Delete", items: [{ id: "DEL", text: "_Delete" }, { id: "DEL_A", text: "_DeleteA" }] });
		items.push({ type: 'break' });
		if (conf.table.hasattach && !viewonly && !access.noattach) items.push({ type: 'button', id: "ATTA", text: '📎', tooltip: "_Attach" });
		if (!viewonly && !access.noupdate && conf.relatetableid) items.push({ type: 'button', id: "LINK", text: '🔗', tooltip: "_Link" });
		if (!viewonly && access.islock && conf.table.columnlock) items.push({ type: 'button', id: "LOCK", text: '🔒', tooltip: "_Lock/Unlock" });
		if (isArchive) items.push({ type: 'button', id: "ARCH", text: '🕰️', tooltip: "_Archive" });
		if (conf.filterfield) {
			var filterfields = JSON.parse(conf.filterfield);
			if (conf.filterdefault) {//where filter
				var filterdefaults = JSON.parse(conf.filterdefault);
				for (var i = 0; i < filterfields.length; i++) {
					items.push({ type: 'radio', id: "FLT_" + i, text: filterdefaults[i], group: 0, tag: filterfields[i] });
				}
			} else {
				for (var i = 0; i < filterfields.length; i++) {
					var key = filterfields[i][0];
					var val = filterfields[i][1];
					if (typeof val == "string" && val.startsWith("n$.")) val = eval(val);

					var fld = lookupField[key]
					var values = [{ id: "", text: "-/-" }];
					var dm = fld.domainid ? NUT.domains[fld.domainid] : NUT.dmlinks[fld.linktableid + (fld.whereclause || "")];
					for (var j = 0; j < dm.items.length; j++) {
						var itm = dm.items[j];
						values.push({ id: itm.id, text: itm.text });
					}
					var item = {
						type: 'menu-radio', id: key, items: values, tooltip: fld.filename, text(itm) {
							return itm.selected || itm.id;
						}
					}
					if (val) {
						item.selected = val;
						var search = grid.getSearchData(key);
						if (search) search.value = val;
						else grid.searchData.push({ field: key, operator: "=", value: val });
					}
					items.push(item);
				}
			}
			items.push({ type: 'break' });
		}

		items.push({ type: 'spacer', id: "SPACE" });
		var lookup = {};
		for (var i = 0; i < conf.menus.length; i++) {
			var menu = conf.menus[i];
			var item = { type: (menu.issummary ? 'check' : 'button'), id: menu.menuid, text: menu.menuname, tooltip: menu.description, tag: menu.execname, rpt: menu.reportid };
			if (menu.parentid) {
				var parent = lookup[menu.parentid];
				if (parent) {
					parent.type = 'menu';
					if (!parent.items) parent.items = [];
					parent.items.push(item);
				} else NUT.notify("⚠️ No menu's parent found!", "yellow");
			} else {
				items.push(item);
			}
			lookup[menu.menuid] = item;
		}
		items.push({ type: 'break' });
		if (!viewonly && !(access.noselect || access.noupdate)) items.push({ type: 'button', id: "IMP", text: '📥', tooltip: "_Import" });
		if (!access.noexport) items.push({ type: 'button', id: "EXP", text: '📤', tooltip: "_Export" });
		items.push({ type: 'break' });
		items.push({ type: 'button', id: "PREV", text: '⬅️', tooltip: "_Previous", step: -1 });
		items.push({ type: 'button', id: "NEXT", text: '➡️', tooltip: "_Next", step: +1 });
		items.push({ type: 'html', id: "STUT", html: "<div style='padding:6px'><span id='rec_" + conf.tabid + "'></span>/<span id='total_" + conf.tabid + "'></span></div>" });
		items.push({ type: 'break' });
		items.push({ type: 'check', id: "EXPD", text: "»", tooltip: "_Expand" });

		//toolbar
		(w2ui[divTool.id] || new w2toolbar({
			name: divTool.id,
			items: items,
			onClick: this.tool_onClick
		})).render(divTool);

		if (!conf.parenttabid && recid) grid.reload();
	}
	static domainFromConfig(fldconf) {
		var domain = null;
		if (fldconf.columntype != "key" && fldconf.columnname == "siteid") domain = NUT.domains[0];
		if (!domain && (fldconf.fieldtype == "select" || fldconf.fieldtype == "list")) {
			domain = fldconf.domainid ? NUT.domains[fldconf.domainid] : NUT.dmlinks[fldconf.linktableid + (fldconf.whereclause || "")];
		}
		return domain;
	}
	static fieldsFromConfig(conf) {
		var fields = [], index = 0, group = null, colGroup = null;
		conf.default = {};
		if (conf.workflowid) {
			var wf = NUT.workflows[conf.workflowid][0];
			if (wf.status) conf.default.status = wf.status;
			conf.default.roleid = n$.user.roleid;
			conf.default.userid = n$.user.userid;
			conf.default.stepid = wf.stepid;
		}
		if (!conf.layoutcols) conf.layoutcols = (NUT.isGIS ? 2 : 3);
		for (var i = 0; i < conf.fields.length; i++) {
			var fldconf = conf.fields[i];
			if (fldconf.columntype != "key") {
				if (fldconf.columnname == "siteid") conf.default.siteid = n$.user.siteid;
				if (fldconf.columnname == "appid") conf.default.appid = n$.app.appid;
				if (fldconf.columnname == "orgid") conf.default.orgid = n$.orgid;
			}
			if (fldconf.defaultvalue) {
				if (fldconf.defaultvalue == "n$.myLocate()") {
					var colname = fldconf.columnname;
					navigator.geolocation.getCurrentPosition(function (evt) {
						conf.default[colname] = evt.coords.longitude + "," + evt.coords.latitude;
					});
				} else conf.default[fldconf.columnname] = (typeof fldconf.defaultvalue == "string" && fldconf.defaultvalue.startsWith("n$.") ? eval(fldconf.defaultvalue) : fldconf.defaultvalue);
			}
			if (!fldconf.hideinform) {
				var alias = NUT.translate(fldconf.translate) || fldconf.fieldname;
				if (fldconf.isreadonly) alias = "<i>" + alias + "</i>";

				var field = { field: fldconf.columnname, type: fldconf.fieldtype, required: fldconf.isrequire, disabled: conf.isviewonly || fldconf.isreadonly, label: alias, html: { label: alias, column: (NUT.isMobile ? 0 : (fldconf.colspan ? fldconf.colspan - 1 : index++ % conf.layoutcols)), attr: "tabindex=0" }, options: fldconf.options || {}, tag: fldconf };
				var labspan = conf.labelspan || (NUT.isGIS&&!NUT.isMobile ? -1 : null);
				if (labspan) {
					field.html.span = labspan;
					field.html.style = "margin-left:16px";
				}
				if (!fldconf.parentfieldid) {
					var domain = NWin.domainFromConfig(fldconf);
					if (domain) field.options.items = domain.items;
				}
				if (fldconf.displaylength) field.html.attr += " style='width:" + fldconf.displaylength + "px'";
				var isGeom = fldconf.fieldtype == "point" || fldconf.fieldtype == "polyline" || fldconf.fieldtype == "polygon";
				if (fldconf.fieldtype == "search") {
					field.html.text = "<span class='nut-fld-helper'><button class='nut-but-helper' onclick='NUT.NWin.helper_onClick(this.parentNode.previousSibling,{fieldtype:\"" + fldconf.fieldtype + "\",tabid:" + fldconf.tabid + ",linktableid:" + fldconf.linktableid + ",linkcolumn:\"" + (fldconf.linkcolumn || "") + "\",whereclause:\"" + (fldconf.whereclause || "") + "\"})'>&nbsp;✏️&nbsp;</button><label>-/-</label></span>";
					if (!fldconf.displaylength) field.html.attr += " style='width:40%'";
				} else if (fldconf.fieldtype == "file") {
					if (!fldconf.displaylength) field.html.attr += " style='width:100%'";
				} else if (fldconf.fieldtype == "array" || fldconf.fieldtype == "map" || isGeom) {
					field.type = "text";
					field.html.text = "<span class='nut-fld-helper'><button class='nut-but-helper' onclick='NUT.NWin.helper_onClick(this.parentNode.previousSibling,{fieldtype:\"" + fldconf.fieldtype + "\",tabid:" + fldconf.tabid + ",alias:\"" + field.label + "\",isreadonly:" + (conf.isviewonly || fldconf.isreadonly) + "})'>&nbsp;✏️&nbsp;</button>" + (isGeom ? "<button class='nut-but-zoom' onclick='NUT.NWin.zoom_onClick(this.parentNode.previousSibling,{fieldtype:\"" + fldconf.fieldtype + "\",tabid:" + fldconf.tabid + ",alias:\"" + field.label + "\",isreadonly:" + (conf.isviewonly || fldconf.isreadonly) + "})'>&nbsp;🔍&nbsp;</button>" : "") + "</span>";
				}

				if (fldconf.placeholder) field.html.attr += " placeholder='" + fldconf.placeholder + "'";
				if (fldconf.fieldlength) field.html.attr += " maxlength=" + fldconf.fieldlength;
				if (fldconf.vformat) field.html.attr += " pattern='" + fldconf.vformat + "'";

				if (fldconf.fieldgroup) {
					if (fldconf.fieldgroup != group) {
						field.html.group = fldconf.fieldgroup;
						colGroup = field.html.column;
						group = fldconf.fieldgroup;
					} else {
						field.html.column = colGroup;
					}
				}
				fields.push(field);
			}
		}
		return fields;
	}
	static showNewDialog(conf, forEdit) {
		var fields = NWin.fieldsFromConfig(conf);
		var grid = w2ui["grid_" + conf.tabid];
		var parentKey = grid && grid.parentRecord ? grid.parentRecord[conf.linkparentfield] : null;
		if (conf.linktable) conf.default[conf.linkchildfield] = parentKey;
		var id = (forEdit ? "edit_" : "new_") + conf.tabid;
		NUT.openDialog({
			title: forEdit ? "_Update" : "_New",
			floating: NUT.isGIS,
			div: '<div id="' + id + '" class="nut-full"></div>',
			onOpen(evt) {
				evt.onComplete = function () {
					var div = document.getElementById(id);
					var opt={
						name: id,
						fields: fields,
						onChange: NWin.field_onChange,
						actions: {
							"_Close": function () {
								NUT.closeDialog();
							},
							[forEdit ? "_Update" : "_New"]: function (evt) {
								if (forEdit) {
									var hasChanged = NWin.saveEditData(frmNew, grid, forEdit ? "SAVE" : "NEW");
									if (hasChanged) {
										if (!conf.isForm) grid.mergeChanges();
									} else NUT.notify("⚠️ No change!", "yellow");
								} else {
									if (this.validate(true).length) return;
									var recRelate = null;
									if (conf.parenttabid) {
										if (conf.relatetable) {//lien ket n-n
											recRelate = {};
											recRelate[conf.relateparentfield] = parentKey;
										} else {
											this.record[conf.linkchildfield] = parentKey;
										}
									}
									var data = {};//remove null value
									var files = [], filename = {};
									for (var key in this.record) if (this.record.hasOwnProperty(key) && this.record[key] !== null) {
										var val = this.record[key];
										if (val instanceof Object) {//file upload
											var names = [];
											for (var f in val) if (val.hasOwnProperty(f) && val[f]) {
												var file = val[f].file;
												file.guid = NUT.genGuid(file.name);
												files.push(file);
												names.push(file.guid);
											}
											filename[key] = names;
											delete data[key];//them moi khong co filename se update sau
										} else data[key] = (val === "" ? null : val);
									}
									var columnkey = conf.table.columnkey;
									if (conf.beforechange) {
										if (conf.onchange) NUT.runComponent(conf.onchange, { action: item.id, data: data, config: conf });
									} else NUT.ds.insert({ url: conf.table.urledit, data: data, returnid: data[columnkey] === undefined }, function (res) {
										if (res.success) {
											var newid = data[columnkey] || res.result[0];
											if (files.length) {//upload file
												NUT.uploadFile(conf.tableid, newid, files);
												//update file name
												for (var key in filename) if (filename.hasOwnProperty(key)) {
													for (var i = 0; i < filename[key].length; i++) {
														filename[key][i] = "media/" + n$.user.siteid + "/" + conf.tableid + "/" + newid + "/" + filename[key][i];
													}
													filename[key] = JSON.stringify(filename[key]);
													data[key] = filename[key];
												}
												NUT.ds.update({ url: conf.table.urledit, data: data, where: [columnkey, "=", newid] });
											}
											NUT.notify("Record inserted.", "lime");
											data[columnkey] = newid;

											if (grid) grid.add(data, true);
											//grid.select(newid);
											if (recRelate) {
												recRelate[conf.relatechildfiled] = data[conf.linkchildfield];
												NUT.ds.insert({ url: conf.relatetable.urledit, data: recRelate }, function (res2) {
													if (res2.success) {
														NUT.notify("Record inserted.", "lime");
													} else NUT.notify("🛑 ERROR: " + res2.result, "red");
												});
											}
											if (conf.onchange) NUT.runComponent(conf.onchange, { action: item.id, data: data, config: conf });
										} else NUT.notify("🛑 ERROR: " + res.result, "red");
									});
								}
							}
						}
					}
					var frmNew = (w2ui[id] || new w2form(opt));
					frmNew.record=forEdit || conf.default;
					if (conf.layout) frmNew.formHTML = conf.layout.outerHTML;
					frmNew.render(div);
				}
			}
		});
	}
	tool_onClick(evt) {
		var item = evt.detail.item;
		var subitem = evt.detail.subItem;

		var conf = this.box.parentNode.tag;
		var grid = w2ui["grid_" + conf.tabid];

		if (subitem && !subitem.text.startsWith("_")) {
			if (subitem.id === "") {//all
				for (var i = 0; i < grid.searchData.length; i++) {
					var search = grid.searchData[i];
					if (search.field == item.id) {
						grid.searchData.splice(i, 1);
						break;
					}
				}
			} else if (subitem.tag) {//menu
				NUT.runComponent(subitem.tag, {
					records: grid.get(grid.getSelection()),
					parent: grid.parentRecord,
					config: conf,
					checked: subitem.checked
				});
			} else {//filter
				var search = grid.getSearchData(item.id);
				if (search) search.value = subitem.id;
				else grid.searchData.push({ field: item.id, operator: "=", value: subitem.id });
				if (conf.table.maplayer) {
					var where = [];
					for (var i = 0; i < grid.searchData.length; i++) {
						var clause = grid.searchData[i];
						where.push([clause.field, clause.operator, clause.value]);
					}
					if (where.length) NUT.AGMap.filterLayer(conf, where);
				}
			}
			grid.reload();
		} else {
			if (subitem) item = subitem;
			if (item.tag)//component
				NUT.runComponent(item.tag, {
					records: grid.get(grid.getSelection()),
					parent: grid.parentRecord,
					config: conf,
					checked: item.checked
				});
			else if (item.rpt) NUT.runReport(item.rpt);
			else {
				var columnkey = conf.table.columnkey;
				var columnlock = conf.table.columnlock;
				var form = w2ui["form_" + conf.tabid];
				var timeArchive = null;
				switch (item.id) {
					case "EXPD":
						document.getElementById("cont_" + conf.tabid).style.height = item.checked ? "45vh" : "95vh";
						if (conf.isForm) form.resize(); else grid.resize();
						break;
					case "SWIT":
						NWin.switchFormGrid(conf, !item.checked);
						break;
					case "TREE":
						NWin.switchTree(conf, !item.checked);
						break;
					case "RELO":
						grid.reload();
						break;
					case "PREV":
					case "NEXT":
						var i = grid.getSelection(true)[0] + item.step;
						if (grid.records[i]) {
							grid.selectNone(true);
							grid.select(grid.records[i][grid.recid]);
						}
						break;
					case "OK":
						item.callback('hello');
						break;
					case "ZOOM":
						NUT.AGMap.zoomToSelect(conf.table.maplayer);
						break;
					case "FIND":
						//grid.searchOpen(evt.originalEvent.target);
						var id = "find_" + conf.tabid;
						NUT.openDialog({
							title: "_Find",
							floating: NUT.isGIS,
							div: '<div id="' + id + '" class="nut-full"></div>',
							onOpen(evt) {
								evt.onComplete = function () {
									var div = document.getElementById(id);
									(w2ui[id] || new w2form({
										name: id,
										fields: grid.searches,
										onChange: NWin.field_onChange,
										actions: {
											"_Close": function () {
												NUT.closeDialog();
											},
											"_Advance": function (evt) {
												NUT.closeDialog();
												grid.searchOpen();
											},
											"_Find": function (evt) {
												var changes = this.getChanges();
												if (NUT.isObjectEmpty(changes))
													grid.searchData = grid.originSearch ? [grid.originSearch] : [];
												else for (var key in changes) if (changes.hasOwnProperty(key)) {
													var val = changes[key];
													var search = grid.getSearchData(key);
													if (search) search.value = val;
													else grid.searchData.push({ field: key, operator: "=", value: val });
												}
												grid.reload();
											}
										}
									})).render(div);
								}
							}
						});
						break;
					case "NEW":
						if (conf.table.tabletype == "arcgis") NUT.AGMap.showEditor(conf.table.maplayer);
						else NWin.showNewDialog(conf);
						break;
					case "SAVE_A":
						timeArchive = new Date();
					case "SAVE":
						var hasChanged = NWin.saveEditData(form, grid, "SAVE", timeArchive);
						if (hasChanged) {
							if (!conf.isForm) grid.mergeChanges();
						} else NUT.notify("⚠️ No change!", "yellow");
						break;
					case "DEL_A":
						NUT.prompt({label:"Archive Time", value:new Date()},function(val){
							timeArchive=val;
						});
						//if (!timeArchive) break;
					case "DEL":
						NUT.confirm('DELETE selected record?', function (awnser) {
							if (awnser == "Yes"||awnser == "yes") {
								var recid = conf.isForm ? [form.record[columnkey]] : grid.getSelection();
								if (conf.beforechange) {
									if (conf.onchange) NUT.runComponent(conf.onchange, { action: item.id, recid: recid, config: conf });
								} else {
									if (recid) {
										//grid.autoLoad=false;/*not reload on delete*/
										if (conf.table.tabletype == "arcgis") NUT.AGMap.submit({ url: conf.table.url + "/deleteFeatures?f=json", data: "objectIds=" + recid }, function(res){
											if(res.error)NUT.notify("🛑 ERROR: " + res.error.message, "red");
											else NUT.notify(res.deleteResults.length + " record(s) deleted.", "lime");
										});
										else NUT.ds.delete({ url: conf.table.urledit, where: [columnkey, "in", recid] }, function(res){
											if (res.success) {
												if (timeArchive) NWin.archiveRecord(conf.tableid, recid, "DELETE", conf.isForm ? form.record : grid.get(recid), timeArchive);
												grid.total -= recid.length;
												for (var k = 0; k < recid.length; k++)grid.remove(recid[k]);
												NUT.notify(recid.length + " record(s) deleted.", "lime");

												if (conf.onchange) NUT.runComponent(conf.onchange, { action: item.id, recid: recid, config: conf });
											} else NUT.notify("⛔ ERROR: " + res.result, "red");
										});
									} else NUT.notify("⚠️ No selection!", "yellow");
								}
							}
						});
						break;

					case "LINK":
						var query = { url: conf.table.urlview, orderby: conf.orderby || conf.table.columndisplay, limit: NUT.QUERY_LIMIT }
						if (conf.whereclause) query.where = JSON.parse(conf.whereclause);
						var p = {
							ids: grid.getSearchData(columnkey).value,
							query: query,
							conf: conf,
							parentKey: (grid.parentRecord ? grid.parentRecord[conf.linkparentfield] : null),
							callback: function () { grid.reload() }
						}
						NUT.linkData(p);
						break;
					case "SEARCH":
						var changes = form.getChanges();
						if (NUT.isObjectEmpty(changes))
							grid.searchData = grid.originSearch ? [grid.originSearch] : [];
						else for (var key in changes) if (changes.hasOwnProperty(key)) {
							var search = grid.getSearchData(key);
							if (search) search.value = changes[key];
							else grid.searchData.push({ field: key, operator: "=", value: changes[key] });
						}
						grid.reload();
						break;
					case "IMP":
						var cols = [];
						for (var i = 0; i < conf.fields.length; i++)cols.push(conf.fields[i].columnname);
						NUT.importXls(conf.table.urledit,cols,function (res) {
							if (res.success) {
								grid.reload();
								NUT.notify("Data updated.", "lime");
							} else NUT.notify("🛑 ERROR: " + res.result, "red");
						});
						break;
					case "EXP":
						var cols = [];
						for (var i = 0; i < conf.fields.length; i++)cols.push(conf.fields[i].columnname);

						// define where
						var where = [];
						if (conf.menuWhere) where.push(conf.menuWhere);
						if (conf.whereclause) where.push(JSON.parse(conf.whereclause));
						for (var i = 0; i < grid.searchData.length; i++) {
							var search = grid.searchData[i];
							where.push(search.operator == "begins" ? [search.field, "like", search.value + "*"] : [search.field, search.operator, search.value]);
						}
						var orderby=undefined;
						if (grid.sortData.length) {
							var sorts = [];
							for (var i = 0; i < grid.sortData.length; i++)
								sorts.push(grid.sortData[i].field + " " + grid.sortData[i].direction);
							orderby = sorts.join(',');
						}
						NUT.exportXls(conf.table.urlview,cols,where,orderby);
						break;
					case "LOCK":
						var record = conf.isForm ? form.record : grid.record;
						var label = record[columnlock] ? "🔓 Unlock" : "🔒 Lock";
						NUT.confirm(label + ' selected record?', function (awnser) {
							if (awnser == 'Yes'||awnser == "yes") {
								var data = {};
								data[columnlock] = record[columnlock] ? false : true;
								NUT.ds.update({ url: conf.table.urledit, data: data, where: [columnkey, "=", record[columnkey]] }, function (res) {
									if (res.success) {
										record[columnlock] = data[columnlock];
										conf.isForm ? form.refresh() : grid.refresh();
									} else NUT.notify("🛑 ERROR: " + res.result, "red");
								});
							}
						});
						break;
					case "ARCH":
						var recid = conf.isForm ? form.record[columnkey] : grid.getSelection();
						NUT.ds.select({ url: NUT.URL + "n_archive", where: [["tableid", "=", conf.tableid], ["recordid", "=", recid]] }, function (res) {
							if (res.success) {
								var id = "arch_" + conf.tabid;
								NUT.openDialog({
									title: "_Archive",
									div: '<div id="' + id + '" class="nut-full"></div>',
									onOpen(evt) {
										evt.onComplete = function () {
											var div = document.getElementById(id);
											(w2ui[id] || new w2grid({
												name: id,
												recid: 'archiveid',
												columns: [
													{ field: 'archiveid', text: 'ID', sortable: true },
													{ field: 'archivetype', text: 'Type', sortable: true },
													{ field: 'archivetime', text: 'Time', sortable: true },
													{
														field: 'archivejson', text: 'Archive', size: 300, sortable: true, info: {
															render: function (rec, idx, col) {
																var obj = JSON.parse(rec.archivejson);
																var str = "<table border='1px'><caption><b>" + rec.archivetype + "</b></caption>"
																for (var key in obj) if (obj.hasOwnProperty(key))
																	str += "<tr><td align='right'><i>" + key + "</i></td><td>" + obj[key] + "</td></tr>";
																return str + "</table>";
															}
														}
													},
													{ field: 'tableid', text: 'Table ID', sortable: true },
													{ field: 'recordid', text: 'Record ID', sortable: true },
													{ field: "siteid", text: "Site ID", sortable: true }
												],
												records: res.result
											})).render(div);
										}
									}
								});
							} else NUT.notify("🛑 ERROR: " + res.result, "red");
						});
						break;
					case "ATTA":
						if (grid.record) {
							var recid = grid.record[conf.table.columnkey];
							var base = n$.user.siteid + "/" + conf.tableid + "/" + recid + "/";
							NUT.FMan.showAttach(NUT.URL_UPLOAD, base,"/media/");
						}
						break;
				}
			}
		}
	}
	
	static saveEditData(form, grid, action, timeArchive) {
		var conf = form.box.parentNode.parentNode.tag;
		if (conf.isForm & form.validate(true).length) return false;
		var changes = conf.isForm ? [form.getChanges()] : grid.getChanges();
		var hasChanged = false;
		for (var i = 0; i < changes.length; i++) {
			var change = changes[i];
			if (!NUT.isObjectEmpty(change)) {
				var recid = (conf.isForm ? form.original.recid : change.recid);
				var data = {};//remove "" value
				var files = [];
				for (var key in change) if (change.hasOwnProperty(key) && key != "recid") {
					var val = change[key];
					if (val instanceof Object) {//file upload
						val = form.record[key];
						var names = [];
						for (var f in val) if (val.hasOwnProperty(f) && val[f]) {
							var file = val[f].file;
							file.guid = NUT.genGuid(file.name);
							files.push(file);
							names.push("media/" + n$.user.siteid + "/" + conf.tableid + "/" + recid + "/" + file.guid);
						}
						data[key] = JSON.stringify(names);
					} else data[key] = (val === "" ? null : val);
				}

				if (conf.beforechange) {
					if (conf.onchange) NUT.runComponent(conf.onchange, { action: action, recid: recid, data: data, config: conf });
				} else {
					if (conf.table.tabletype == "arcgis") {
						data[conf.table.columnkey] = recid;
						NUT.AGMap.submit({ url: conf.table.url + "/updateFeatures?f=json", data: "features="+JSON.stringify([{ attributes: data }]) }, function(res){
							if(res.error)NUT.notify("🛑 ERROR: " + res.error.message, "red");
							else NUT.notify(res.updateResults.length + " record(s) updated.", "lime");
						});
					} else NUT.ds.update({ url: conf.table.urledit, where: [conf.table.columnkey, "=", recid], data: data }, function(res){
						if (res.success) {
							if (files.length) NUT.uploadFile(conf.tableid, recid, files);//upload file
							if (timeArchive) NWin.archiveRecord(conf.tableid, recid, action, data, timeArchive);
							if (conf.isForm) grid.set(recid, data);
							NUT.notify("Record updated.", "lime");

							if (conf.onchange) NUT.runComponent(conf.onchange, { action: action, recid: recid, data: data, config: conf });
						} else NUT.notify("🛑 ERROR: " + res.result, "red");
					});
				}
				hasChanged = true;
			}
		}
		return hasChanged;
	}
	static field_onChange(evt) {
		var conf = null;
		var field = evt.detail.field;
		var current = evt.detail.value.current;
		if (field) {//form
			conf = this.get(field).tag;
			if (conf.fieldtype == "search") {
				var label = this.get(field).el.nextElementSibling.lastElementChild;
				if (label) NUT.ds.select({ url: conf.linktable.urlview, select: conf.linktable.columndisplay, where: [conf.linktable.columncode || conf.linktable.columnkey, "=", current] }, function (res) {
					label.innerHTML = res.success && res.result.length ? res.result[0][conf.linktable.columndisplay] : "-/-";
				});
			}
			if (conf.domainid) {
				var domain = NUT.domains[conf.domainid];
				var item = domain.lookup[current];
				if (item && item[2]) this.get(field).el.style.color = item[2];
			}
		} else {
			conf = this.columns[evt.detail.column].tag;
		}
		if (conf.children.length) {//
			NWin.updateChildFields(conf, this.record, this.parentRecord);
			/*if (conf.fieldtype == "select" && conf.mapcolumn) {//bind with map
				var lyrconf = GSMap.getLayerConfig(conf.maplayer);
				GSMap.applyFilter(lyrconf.maporder, lyrconf.seqno, [conf.mapcolumn, "=", evt.value_new]);

				var where = [conf.table.columnkey, "=", evt.value_new];
				var ext = n$.extent[where.toString()];
				if (ext) GSMap.zoomToExtent(ext);
				else NUT.ds.select({ url: conf.linktable.urlview, select: "minx,miny,maxx,maxy", where: where }, function (res) {
					if (res.success) {
						var ext = [res[0].minx, res[0].miny, res[0].maxx, res[0].maxy];
						if (res.length) GSMap.zoomToExtent(ext);
						n$.extent[where.toString()] = ext;
					} else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
			}*/
		}
	}
	grid_onError(evt) {
		NUT.notify(evt.detail.response.message, "red");
	}
	grid_onRequest(evt) {
		var tabconf = this.box.parentNode.parentNode.tag;
		var postData = evt.detail.postData;
		var reqData = { limit: postData.limit, offset: postData.offset };
		if (postData.sort || tabconf.orderby) reqData.orderby = (postData.sort ? postData.sort[0].field + " " + postData.sort[0].direction : tabconf.orderby);

		// define where
		var where = [];
		if (tabconf.menuWhere) where.push(tabconf.menuWhere);
		if (tabconf.whereclause) where.push(JSON.parse(tabconf.whereclause));

		if (tabconf.workflowid) {
			where.push(["roleid", "=", n$.user.roleid]);
			where.push(["userid", "in", [0, n$.user.userid]]);
		}
		if (postData.search) {
			var clauses = [postData.searchLogic.toLowerCase()];
			for (var i = 0; i < postData.search.length; i++) {
				var search = postData.search[i];
				var val = search.value;
				var op = search.operator;
				if (op == "like") {
					if (!val.includes("%")) val = "%" + val + "%";
				} else if (op == "between") {
					val = (this.operatorsMap[search.type] == "date" ? "'" + val.join("' and '") + "'" : val.join(" and "));
				} else if (val && val.includes && val.includes("%")) op = "like";
				clauses.push([search.field, op, val]);
			}
			if (clauses.length) where.push(clauses);
		}
		if (postData.select) where.push(postData.select);

		reqData.where = where.length ? NUT.ds.decodeSql({ where: where.length == 1 ? where[0] : where }, true) : "1=1";

		evt.detail.postData = reqData;
		this.postData = reqData;

		if (tabconf.table.tabletype == "arcgis") {
			//reqData = { resultRecordCount: postData.limit, resultOffset: postData.offset, f: "geojson", outFields: "*", returnGeometry: false };
			var query = { num: reqData.limit, start: reqData.offset, where: reqData.where, outFields: ["*"] }
			if (reqData.orderby) query.orderByFields = [reqData.orderby];

			var lyr = NUT.AGMap.layers[tabconf.table.maplayer];
			var grid = this;
			grid.lock(undefined, true);
			lyr.queryFeatureCount(query).then(function (total) {
				lyr.queryFeatures(query).then(function (res) {
					grid.unlock();
					if (res.error) NUT.notify("🛑 ERROR: " + res.error.message, "red");
					else {
						var records = [];
						for (var i = 0; i < res.features.length; i++)records.push(res.features[i].attributes);
						grid.requestComplete({ success: true, result: records, total: total }, "load", function () { }, function () { }, function () { });
					}
				});
			});
			evt.isCancelled = true;
		}
	}
	grid_onLoad(evt) {
		var conf = this.box.parentNode.parentNode.tag;
		var data = evt.detail.data;
		var records = data.result;

		//chuan hoa time
		if (records.length) {
			var isGeoTable = (conf.table.tabletype == "arcgis");
			for (var i = 0; i < conf.fields.length; i++) {
				var fldconf = conf.fields[i];
				var datatype = fldconf.fieldtype;
				var columnname = fldconf.columnname;
				if (datatype == "date" || datatype == "time" || datatype == "datetime") {
					var len = (datatype == "date" ? 10 : (datatype == "time" ? 5 : 16));
					for (var j = 0; j < records.length; j++) {
						var rec = records[j];
						var val = rec[columnname];
						if (val) {
							val = (isGeoTable ? new Date(val).toISOString() : val);
							if (val) rec[columnname] = (len == 16 ? val.substring(0, len).replace("T", " ") : val.substring(0, len));
						}
					}
				}
			}
			if (conf.table.columnlock) {
				var dm = NUT.domains[conf.table.lockdomainid];
				if (dm) for (var j = 0; j < records.length; j++) {
					var rec = records[j]
					var item = dm.lookup[rec[conf.table.columnlock]];
					if (item && item[3]) rec.w2ui = { editable: false };
				}
			}
		}


		var total = data.total || 0;
		evt.detail.data.status = data.success ? "success" : "error";
		evt.detail.data.records = records;
		var select = this.getSelection().length;
		evt.onComplete = function () {
			if (total) {
				if (select == 0 && !conf.check) {
					this.select(records[0][this.recid]);
					this.record = records[0];
				}
				if (total == 1) {
					w2ui["tool_" + conf.tabid].check("SWIT");
					NWin.updateFormRecord(conf, this.record, this.parentRecord);
				}
			}
			NWin.switchFormGrid(conf, total == 1);
			document.getElementById("rec_" + conf.tabid).innerHTML = total ? 1 : 0;
			document.getElementById("total_" + conf.tabid).innerHTML = total;
		}
	}
	static zoom_onClick(input, obj) {
		NUT.AGMap.zoomToCoords(JSON.parse(input.value), obj.fieldtype);
	}
	static helper_onClick(input, obj) {
		var form = w2ui[(NUT.w2popup.status == "open" ? "new_" : "form_") + obj.tabid];
		switch (obj.fieldtype) {
			case "search":
				var table = NUT.tables[obj.linktableid];
				var query = { url: table.urlview, orderby: table.columndisplay, limit: NUT.QUERY_LIMIT }
				if (obj.whereclause) query.where = JSON.parse(obj.whereclause);
				var p = {
					id: input.value,
					query: query,
					conf: { table: table, linkcolumn: obj.linkcolumn },
					callback: function (rec) {
						if (rec) {
							var val = rec[obj.linkcolumn || table.columnkey];
							form.rememberOriginal();
							form.setValue(input.id, val);
							form.onChange({ detail: { field: input.id, value: { current: val } } });
						}
					}
				}
				NUT.linkData(p);
				break;
			case "point":
			case "polyline":
			case "polygon":
				var isGeom = true;
			case "array":
			case "map":
				var isMap = (obj.fieldtype == "map");
				var id = "fld_" + input.id;
				var record = [];
				if (input.value) record[input.id] = JSON.parse(input.value);
				var fields = NUT.openDialog({
					title: "✏️ " + obj.alias,
					width: 400,
					height: 360,
					floating: true,
					div: '<div id="' + id + '" class="nut-full"></div>',
					onClose(evt) {
						if (isGeom) NUT.AGMap.view.graphics.removeAll();
					},
					onOpen(evt) {
						evt.onComplete = function () {
							var div = document.getElementById(id);
							if (w2ui[id]) {
								w2ui[id].record = record;
								w2ui[id].render(div);
							} else {
								var actions = {
									"_Close": function () { NUT.closeDialog() },
									"_Update": function (evt) {
										if (!obj.isreadonly) {
											var val = this.record[input.id];
											if (val._order) delete val._order;
											if (!isMap) for (var i = 0; i < val.length; i++) {
												var v = val[i];
												var items = Array.isArray(v) ? v : v.split(",");
												if (isGeom) for (var j = 0; j < items.length; j++)items[j] = parseFloat(items[j]);
												val[i] = (items.length == 1 ? items[0] : items);
											}
											form.rememberOriginal();
											form.setValue(input.id, JSON.stringify(val));
											//form.onChange({detail: {field: input.id,value: { current: val}}});
											NUT.closeDialog();
										}

									}
								};
								if (obj.fieldtype == "point") {
									actions["⛯ GPS"] = function () {
										navigator.geolocation.getCurrentPosition(function (evt) {
											form.rememberOriginal();
											form.setValue(input.id, JSON.stringify([[evt.coords.longitude, evt.coords.latitude]]));
											//form.onChange({detail: {field: input.id,value: { current: val}}});
											NUT.closeDialog();
										});
									}
								}

								var html = { label: obj.alias, span: isMap ? -1 : 6, key: { text: " = ", attr: 'placeholder="key" style="width:120px"' } };
								if (isMap) html.value = { attr: 'placeholder="value"' };
								if (isGeom) {
									html.value = { attr: 'placeholder="x, y"' };
									actions["📍"] = function () {
										NUT.AGMap.callback = function (res) {
											var data = [];
											for (var i = 0; i < res.vertices.length; i++) {
												var rec = res.vertices[i];
												var xy = NUT.AGMap.webMercatorUtils.xyToLngLat(rec[0], rec[1])
												data.push([xy[0].toFixed(6), xy[1].toFixed(6)]);
											}
											var dlg = NUT.w2ui[id];
											dlg.setValue(input.id, data);
										}
										NUT.w2ui["tbrMap"].onClick({ object: { id: obj.fieldtype } });
									};
								}

								(new w2form({
									name: id,
									fields: [{ field: input.id, type: (isMap ? "map" : "array"), disabled: obj.isreadonly, html: html }],
									record: record,
									actions: actions
								})).render(div);
							}
						}
					}
				});
				break;
		}
	}
	grid_onSelect(evt) {
		var selid = (evt.detail.clicked ? evt.detail.clicked.recid || evt.detail.clicked.recids : evt.detail.recid);
		if (selid && this.oldid != selid) {
			var conf = this.box.parentNode.parentNode.tag;
			this.record = this.get(selid);
			var lab = document.getElementById("rec_" + conf.tabid);
			lab.innerHTML = this.get(selid, true) + 1;
			lab.tag = conf.table.columnkey + "=" + selid;
			if (this.record) {
				//n$.record = this.record;
				//n$.parent = this.parentRecord;
				NWin.updateFormRecord(conf,this.record,this.parentRecord);
				for (var i = 0; i < conf.children.length; i++)
					NWin.updateChildGrid(conf.children[i],this.record,this.parentRecord);
			}
			NWin.updateTabLock(conf,this.record);
			this.oldid = selid;
			if (conf.table.maplayer) {
				if (!this.notSelectMap) evt.onComplete = function () {
					if (conf.table.maplayer) NUT.AGMap.selectByOID(conf.table.maplayer, conf.table.tabletype=="arcgis"?selid:this.getSelection(true)[0]+1);
					else {//link by mapcolumns
						var where = [];
						var indexs = this.getSelection(true);
						for (var i = 0; i < indexs.length; i++) {
							var rec = this.records[indexs[i]];
							for (var j = 0; j < conf.fields.length; j++) {
								var fldconf = conf.fields[j];
								if (fldconf.mapcolumn) where.push(fldconf.mapcolumn + "='" + rec[fldconf.columnname] + "'");
							}
						}
						if (where.length) NUT.AGMap.selectByQuery(conf.table.maplayer, { where: where.join(" and ") });
					}
				}
				else this.notSelectMap = false;
			}
		}
	}
	
	static updateTabLock(conf,record){
		var isParentLock=conf.parentTab&&conf.parentTab.isLock;
		var isLock=record[conf.table.columnlock];
		if(conf.table.lockdomainid){
			var item = NUT.domains[conf.table.lockdomainid].lookup[isLock];
			isLock = item && item[3];
		}

		var tbr=w2ui["tool_"+conf.tabid];
		conf.isLock=isLock||isParentLock;
		if(conf.isLock){
			if(isParentLock)tbr.disable("save","SAVE","del","DEL","new","NEW");
			else tbr.disable("save","SAVE","del","DEL");
		}else tbr.enable("save","SAVE","del","DEL","new","NEW");
	}
	
	static updateFormRecord(conf, record, parentRecord) {
		var form = w2ui["form_" + conf.tabid];
		form.clear();
		form.record = record;
		form.parentRecord = parentRecord;
		form.refresh();
		//fire onchange
		for (var i = 0; i < form.fields.length; i++) {
			var field = form.fields[i];
			var key = field.field;
			if (field.type == "file") {
				var ctrl = document.getElementById(key).previousElementSibling;
				if (ctrl && record[key]) {
					ctrl = ctrl.children[1].children[0];
					if (ctrl) {
						ctrl.childNodes[2].remove();
						var files = JSON.parse(record[key]);
						for (var j = 0; j < files.length; j++) {
							var a = document.createElement("a");
							a.className = "nut-link";
							a.target = "_blank";
							a.href = files[j];
							a.innerHTML = "[ " + (j + 1) + " ]";
							ctrl.appendChild(a);
						}
					}
				}
			}
			if (field.type == "search" || field.type == "select" || field.tag.children.length) form.onChange({ detail: { field: key, value: { current: record[key] } } });
		}
	}

	static updateChildGrid(conf, record,updateChildGrid) {
		var grid = w2ui["grid_" + conf.tabid];
		if (record) {
			grid.needUpdate = true;
			grid.parentRecord = record;
		}

		if (grid.needUpdate && !grid.box.parentNode.parentNode.style.display) {
			var parentKey = grid.parentRecord[conf.linkparentfield];
			var search = grid.getSearchData(conf.linkchildfield);
			if (conf.relatetable) {//lien ket n-n
				NUT.ds.select({ url: conf.relatetable.urlview, select: conf.relatechildfield, where: [conf.relateparentfield, "=", parentKey], limit: NUT.QUERY_LIMIT }, function (res) {
					if (res.success) {
						var ids = [];
						for (var i = 0; i < res.result.length; i++) {
							ids.push(res.result[i][conf.relatechildfield]);
						}
						if (ids.length == 0) ids = [-0.101];
						grid.originSearch = { field: conf.linkchildfield, operator: "in", value: ids };
						if (search) search.value = ids;
						else grid.searchData.push(grid.originSearch);
						grid.reload();
					} else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
			} else {
				grid.originSearch = { field: conf.linkchildfield, operator: "=", value: parentKey };
				if (search) search.value = parentKey;
				else grid.searchData.push(grid.originSearch);
				grid.reload();
			}
			grid.needUpdate = false;
		}
	}
	static updateChildFields(conf, record, parentRecord) {
		for (var i = 0; i < conf.children.length; i++) {
			var fldconf = conf.children[i];
			var form = w2ui["form_" + fldconf.tabid];
			var grid = w2ui["grid_" + fldconf.tabid];
			if (fldconf.fieldtype == "select") {
				var field = form.get(fldconf.columnname);
				var column = grid.getColumn(fldconf.columnname);
				var where = [fldconf.wherefieldname || conf.columnname, "=", record[conf.columnname]];
				if (fldconf.whereclause) where = [where, JSON.parse(fldconf.whereclause)];
				var key = fldconf.linktableid + where;
				var domain = NUT.dmlinks[key];
				if (domain) {
					field.options.items = domain.items;
					form.refresh();
					if (column.editable) {
						column.editable.items = domain.items;
						grid.refresh();
					}
				} else {
					var columnkey = fldconf.bindfieldname || fldconf.linktable.columnkey;
					var columndisplay = fldconf.linktable.columndisplay || columnkey;
					NUT.ds.select({ url: fldconf.linktable.urlview, select: [columnkey, columndisplay], where: where }, function (res) {
						if (res.success) {
							domain = { items: [NUT.DM_NIL], lookup: {}, lookdown: {} };
							for (var i = 0; i < res.result.length; i++) {
								var data = res.result[i];
								var item = { id: data[columnkey], text: data[columndisplay] };
								domain.items.push(item);
								domain.lookup[item.id] = item;
								domain.lookdown[item.text] = item;
							}
							NUT.dmlinks[key] = domain;
							field.options.item = domain.items;
							form.refresh();
							if (column.editable) {
								column.editable.items = domain.items;
								grid.refresh();
							}
						} else NUT.notify("🛑 ERROR: " + res.result, "red");
					});
				}
			}
			if (fldconf.calculation) {
				var _v = [];
				for (var v = 0; v < fldconf.calculationInfos.length; v++) {
					var info = fldconf.calculationInfos[v];
					if (info.func)//childs
						_v[v] = this.calculateChilds(info);
					else if (info.tab)//parent
						_v[v] = parentRecord[info.field];
					else _v[v] = record[info.field];
				}
				var value = eval(fldconf.calculation);
				form.record[fldconf.columnname] = value;
				form.refresh(fldconf.columnname);
				//w2ui["grid_"+fldconf.tabid].grid.refresh();
				this.updateChildFields(fldconf, form.record, form.parentRecord);
			}
			if (fldconf.displaylogic) {
				var value = eval(fldconf.displaylogic);
				//if(panel.fields){//is form
				var el = form.get(fldconf.columnname).el;
				el.style.display = value ? "" : "none";
				el.parentNode.previousElementSibling.style.display = el.style.display;
				//}else value?panel.showColumn(fldconf.columnname):panel.hideColumn(fldconf.columnname);
			}
		}
	}
	calculateChilds(info) {
		var records = w2ui["grid_" + info.tab].records;
		var result = (info.func == "min" ? Number.MAX_VALUE : (info.func == "max" ? Number.MIN_VALUE : 0));
		for (var i = 0; i < records.length; i++) {
			value = records[i][info.field];
			switch (info.func) {
				case "avg":
				case "sum": result += value; break;
				case "count": result++; break;
				case "min": if (value < result) result = value; break;
				case "max": if (value > result) result = value; break;
			}
		}
		if (info.func == "avg") result /= res.length;
		return result;
	}

	grid_onDblClick(evt) {
		if (NUT.isObjectEmpty(this.columns[evt.detail.column].editable)) {
			var conf = this.box.parentNode.parentNode.tag;
			w2ui["tool_" + conf.tabid].check("SWIT");
			NWin.switchFormGrid(conf, true);
		}
	}
	static switchFormGrid(conf, isForm) {
		var form = w2ui["form_" + conf.tabid];
		var grid = w2ui["grid_" + conf.tabid];
		form.box.style.display = isForm ? "" : "none";
		grid.box.style.display = isForm ? "none" : "";
		isForm ? form.resize() : grid.resize();
		conf.isForm = isForm;
	}
	static switchTree(conf, isTree) {
		var form = w2ui["form_" + conf.tabid];
		var grid = w2ui["grid_" + conf.tabid];
		if (isTree) {
			var lookup = {}; var parents = []; var lookupParent = {};
			var records = grid.records;
			for (var i = 0; i < records.length; i++)lookup[records[i].recid] = records[i];
			for (var i = 0; i < records.length; i++) {
				var rec = records[i]; var key = rec[conf.table.columntree];
				var parent = lookup[key];
				if (parent) {
					if (!parent.w2ui) parent.w2ui = { children: [] };
					parent.w2ui.children.push(rec);
					if (!lookupParent[key]) {
						parents.push(parent);
						lookupParent[key] = parent;
					}
				}
			}
			grid.records = parents;
			grid.total = grid.records.length;
			grid.refresh();
		} else grid.reload();
		conf.isTree = isTree;
	}
	static archiveRecord(tableid, recid, action, archive, time) {
		var data = {
			archivetype: action,
			archivetime: time,
			archivejson: JSON.stringify(archive),
			recordid: recid,
			tableid: tableid,
			siteid: n$.user.siteid
		};
		NUT.ds.insert({ url: NUT.URL + "n_archive", data: data }, function (res) {
			if (res.success) NUT.notify("Record archived.", "lime");
			else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	}
}