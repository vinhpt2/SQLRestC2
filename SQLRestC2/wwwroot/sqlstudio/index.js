import { w2ui, w2layout, w2utils, w2sidebar, w2grid, w2tabs, w2confirm, w2popup, w2prompt } from "../../lib/w2ui.es6.min.js";
import { SqlREST } from "../js/sqlrest.js";
NUT.ds = SqlREST;
NUT.w2ui = w2ui;
NUT.w2utils = w2utils;
NUT.w2confirm = w2confirm;
NUT.w2popup = w2popup;
NUT.w2prompt = w2prompt;
var _idx = 0;
var SQL_ID=4;
window.onload = function () {
	var strs=(window.location.search.substring(1)).split("&");
	for(var i=0;i<strs.length;i++){
		var str=strs[i].split("=");
		n$[str[0]]=str[1];
	}
	if (n$.theme && n$.theme != "w2ui.min") cssMain.href = "../lib/" + n$.theme + ".css";
	SqlREST.token = "Bearer " + n$.token;
	w2utils.locale(n$.locale).then(function (evt) {
		n$.lang = n$.locale.substring(0, 2);
		n$.phrases = evt.data.phrases;
		document.body.innerHTML = "<div id='divApp'></div>";
		NUT.appinfo = '<img width="64" height="64" src="favicon.ico"/><br/><h2><b style="color:brown">SQL Studio</b></h2><br/><hr/><br/><h3>SQL Studio for Designer</h3>';
		(w2ui["layMain"] || new w2layout({
			name: "layMain",
			style: "width:100%;height:100%;top:0;margin:0",
			panels: [
				{ type: 'top', size: 38, html: '<div id="divTop" class="nut-full"><img id="imgLogo " height="24" src="favicon.ico"/><i class="nut-link"> SQL Studio 1.0</i></div>' },
				{ type: 'left', size: NUT.isMobile ? "100%" : 300, resizable: true, html: '<div id="divLeft" class="nut-full"></div>' },
				{ type: 'main', html: '<div id="divMain" class="nut-full"><div id="divTitle"  class="nut-win-title">'+NUT.appinfo+'</div></div>' }
			],
		})).render(divApp);
		

		NUT.ds.get({ url: NUT.URL_TOKEN + "app/"+SQL_ID+"?setCred=true" }, function (res) {
			var services=res.result.services;
			if (services) {
				var nodes=[];
				for (var key in services)if(services.hasOwnProperty(key)) {
					var rec = services[key];
					var node = { id: "service_" + rec.serviceid, group: true, expanded: true, icon: "nut-img-database", text: rec.servicename,tag:rec.url,nodes:[]};
					nodes.push(node);
					loadSchemaContent(node);
				}
				
				(w2ui["mnuMain"] || new w2sidebar({
					name: "mnuMain",
					flatButton: true,
					nodes: nodes,
					topHTML: "<table><tr><td><input class='w2ui-input' placeholder=" + w2utils.lang("_Search") + "/></td><td><button class='w2ui-btn' onclick='newQueryPage(\"" + nodes[0].tag +"\")'>Query</button></td></tr></table>",
					onClick: menu_onClick,
					onFlat: function (evt) {
						w2ui.layMain.sizeTo("left", this.flat ? 300 : 45);
						divLeft.style.width = (this.flat ? '300px' : '45px');
					}
				})).render(divLeft);
				NUT.loading(divLeft);
			}else NUT.notify("⚠️ No service allow SQL Editor!", "yellow");
		});
	});
}
window.saveNewView = function (nodeid) {
	var node = w2ui.mnuMain.get(nodeid);
	if (txtNewViwName.value) {
		if (txtNewViwScript.value) {
			var url = node.tag + txtNewViwName.value;
			if (txtNewViwAlias.value) url += "?alias=" + txtNewViwAlias.value;
			NUT.loading(divMain);
			NUT.ds.get({ url: url, data: { body:txtNewViwScript.value }, method:"POST" }, function(res) {
				if (res.success) {
					var node = { id: res.result, text: txtNewViwName.value, icon: "nut-img-view", count: "<a onclick='event.stopPropagation();deleteTableView(" + res.result + ")' title='Delete'>➖</a>", name: txtNewViwName.value, alias: txtNewViwAlias.value, type: "table/" };
					w2ui.mnuMain.add(nodeid, node);
					txtNewViwName.value = "";
					txtNewViwAlias.value = "";
					txtNewViwScript.value = "select * from ";
					NUT.notify("New view created!", "lime");
				} else NUT.notify("⛔ ERROR: " + res.result, "red");
				NUT.loading();
			});
		} else NUT.notify("⚠️ New view has NO body script!", "yellow");
	} else txtNewViwName.reportValidity();
}
window.saveNewTable = function (nodeid) {
	if (txtNewTblName.value) {
		var changes = w2ui.gridNewTbl.getChanges();
		if (changes.length) {
			var data = [];
			for (var i = 0; i < changes.length; i++) {
				var change = changes[i];
				var d = { id: -1, name: null, alias: null, dataType: null, nullable: null, defaultValue: null, length: -1, precision: - 1, inPrimaryKey: null, identity: null };
				for (var key in change) if (change.hasOwnProperty(key)) {
					if (key != "recid") d[key] = change[key];
				}
				data.push(d);
			}
			var url = w2ui.gridNewTbl.tag + txtNewTblName.value;
			if (txtNewTblAlias.value) url += "?alias=" + txtNewTblAlias.value;
			NUT.loading(divMain);
			NUT.ds.get({ url: url, data: data, method:"POST" }, function (res) {
				if (res.success) {
					var node = { id: res.result, text: txtNewTblName.value, icon: "nut-img-table", count: "<a onclick='event.stopPropagation();deleteTableView(" + res.result + ")' title='Delete'>➖</a>", name: txtNewTblName.value, alias: txtNewTblAlias.value, type: "table/" };
					w2ui.mnuMain.add(nodeid, node);
					txtNewTblName.value = "";
					txtNewTblAlias.value = "";
					w2ui.gridNewTbl.records = [];
					w2ui.gridNewTbl.refresh();
					NUT.notify("New table created!", "lime");
				} else NUT.notify("⛔ ERROR: " + res.result, "red");
				NUT.loading();
			});
		} else NUT.notify("⚠️ New table has NO column!", "yellow");
	} else txtNewTblName.reportValidity();
}
window.newQueryPage = function (url) {
	var a = NUT.createWindowTitle(++_idx, divTitle);
	var id = 'res_'+_idx;
	if (a) {
		(w2ui[_idx] || new w2layout({
			name: _idx,
			style: "width:100%;height:100%;top:0;margin:0",
			panels: [
				{ type: 'top', size: 200, resizable: true, html: '<textarea id="' + id + '" class="nut-full">select * from ' + url.substring(url.lastIndexOf('/', url.length - 2) + 1, url.length - 1) + '.</textarea>' },
				{ type: 'main', html: '<div id="div_'+_idx+'" class="nut-full"></div>' }
			],
		})).render(a.div);
		(w2ui[id] || new w2grid({
			name: id,
			reorderColumns: true,
			columns: [],
			show: {
				toolbar: true,
				footer: true
			},
			tag: document.getElementById(id),
			toolbar: {
				items: [
					{ id: 'run', type: 'button', text: '▶️ Execute' }
				],
				onClick() {
					var grid = this.owner;
					var sql = grid.tag.value.toLowerCase();
					if (sql.startsWith("insert ") || sql.startsWith("update ") || sql.startsWith("delete ")) {
						NUT.confirm("The query may MODIFY or DELETE data. Continue?", function (awnser) {
							if (awnser == "yes") {
								grid.lock();
								NUT.ds.get({ url: url + "query", data: { body: grid.tag.value }, method: "PUT" }, function (res) {
									if (res.success) {
										grid.columns = [];
										grid.records = [];
										grid.refresh();
										NUT.notify("Query execute success with no return.", "lime");
									} else NUT.notify("⛔ ERROR: " + res.result, "red");
									grid.unlock();
								});
							}
						});
					} else {
						grid.lock();
						NUT.ds.get({ url: url + "query", data: { body: grid.tag.value }, method:"POST" }, function (res) {
							if (res.success) {
								if (res.total) {
									var obj = res.result[0];
									var columns = [];
									for (var key in obj) if (obj.hasOwnProperty(key)) {
										columns.push({ field: key, text: key, sortable: true, searchable: true });
									}
									grid.columns = columns;
									grid.records = res.result;
								} else {
									grid.columns = [];
									grid.records = [];
									NUT.notify("Query execute success with no return.", "lime");
								}
								grid.refresh();
							} else NUT.notify("⛔ ERROR: " + res.result, "red");
							grid.unlock();
						});
					}
				}
			}
		})).render(document.getElementById('div_'+_idx));
		a.innerHTML = "Query " + _idx;
	}
}
window.newTablePage=function(nodeid) {
	var node = w2ui.mnuMain.get(nodeid);
	var a = NUT.createWindowTitle(nodeid, divTitle);
	if (a) {
		a.div.innerHTML = "<table><legend><h3>NEW TABLE <span style='cursor:pointer' title='Save' onclick='saveNewTable(\"" + nodeid + "\")'> 💾 </span></h3></legend><tr><td><i>Name*: </i></td><td><input id='txtNewTblName' class='w2ui-input' required/></td></tr><tr><td><i>Alias: </i></td><td><input id='txtNewTblAlias' class='w2ui-input'/></td></tr></table><br/>";
		var divGrid = a.div.z(["div", { id: "gridNewTbl", className: "nut-full" }]);
		(w2ui[divGrid.id] || new w2grid({
			name: divGrid.id,
			reorderColumns: true,
			recid: "id",
			newid:0,
			columns: [{ field: 'id', text: 'ID', render: "int", sortable: true, size: 36 },
			{ field: 'name', text: 'Column Name', sortable: true, searchable: true, editable: { type: "text" } },
			{ field: 'alias', text: 'Alias', sortable: true, searchable: true, editable: { type: "text" } },
			{ field: 'dataType', text: 'Data Type', sortable: true, editable: { type: "select", items: DATA_TYPE } },
			{ field: 'nullable', text: 'Nullable', sortable: true, editable: { type: "check" } },
			{ field: 'defaultValue', text: 'Default Value', sortable: true, editable: { type: "text" } },
			{ field: 'length', text: 'Length', render: "int", sortable: true, editable: { type: "int" } },
			{ field: 'precision', text: 'Precision', render: "int", sortable: true, editable: { type: "int" } },
			{ field: 'inPrimaryKey', text: 'Primary Key', sortable: true, editable: { type: "check" } },
			{ field: 'identity', text: 'Identity', sortable: true, editable: { type: "check" } }],
			multiSearch: true,
			tag: node.tag,
			show: {
				toolbar: true,
				footer: true,
				toolbarAdd: true,
				toolbarDelete: true,
				toolbarEdit: true
			},
			onAdd: function (evt) {
				var recid = "NEW_"+(++this.newid);
				this.add({ id: recid, w2ui: { changes: { dataType: "int", nullable: true } } });
				this.editField(recid, 1);
			},
			onEdit: function (evt) {
				this.editField(this.getSelection()[0], 1);
			}
		})).render(divGrid);
		a.innerHTML = "New Table";
	}
}
window.newViewPage = function (nodeid) {
	var node = w2ui.mnuMain.get(nodeid);
	var a = NUT.createWindowTitle(nodeid, divTitle);
	if (a) {
		a.div.innerHTML = "<table><legend><h3>NEW VIEW <span style='cursor:pointer' title='Save' onclick='saveNewView(\"" + nodeid + "\")'> 💾 </span></h3></legend><tr><td><i>Name*: </i></td><td><input id='txtNewViwName' class='w2ui-input' required/></td></tr><tr><td><i>Alias: </i></td><td><input id='txtNewViwAlias' class='w2ui-input'/></td></tr></table><br/>";
		a.div.z(["div", { className: "nut-full", innerHTML: "Script:<br/>" }, [["textarea", { id: "txtNewViwScript", innerHTML: "select * from ", className: "nut-full" }]]]);
		a.innerHTML = "New View";
	}
}
window.newProcedurePage = function (nodeid) {
	var node = w2ui.mnuMain.get(nodeid);
	var a = NUT.createWindowTitle(nodeid, divTitle);
	if (a) {
		a.div.innerHTML = "<table><legend><h3>NEW PROCEDURE <span style='cursor:pointer' title='Save' onclick='saveNewProcedure(\"" + nodeid + "\")'> 💾 </span></h3></legend><tr><td><i>Name*: </i></td><td><input id='txtNewPrcName' class='w2ui-input' required/></td></tr><tr><td><i>Alias: </i></td><td><input id='txtNewPrcAlias' class='w2ui-input'/></td></tr></table><br/>";
		a.div.z(["div", { className: "nut-full", innerHTML: "Script:<br/>" }, [["textarea", { id: "txtNewPrcScript", innerHTML: "select * from ", className: "nut-full" }]]]);
		a.innerHTML = "New Procedure";
	}
}
window.loadSchemaContent=function(node) {
	var pos = node.tag.lastIndexOf("/", node.tag.length - 2);
	NUT.ds.get({ url: node.tag.substring(0, pos) + "/schema" + node.tag.substring(pos) + "?detail=true"}, function (res) {
		if (res.success) {
			var count = res.result.tables.length;
			var pnode = { id: "table_" + node.id, text: "TABLES (" + count + ")<span></span><a class='nut-badge' onclick='event.stopPropagation();newTablePage(\"table_" + node.id + "\")' title='New Table'>➕</a>", group: true, expanded: true, nodes: [], tag: node.tag + "table/"}
			node.nodes.push(pnode);
			for (var i = 0; i < count; i++) {
				var rec = res.result.tables[i];
				var n = { id: rec.id, text: "<span ondragstart='drag(event)'>"+rec.name+"</span>",count: "<a onclick='event.stopPropagation();deleteTableView(" + rec.id + ")' title='Delete'>➖</a>", icon: "nut-img-table", type:"TABLE", name: rec.name, alias: rec.alias };
				pnode.nodes.push(n);
			}
			count = res.result.views.length;
			pnode = { id: "view_" + node.id, text: "VIEWS (" + count + ")<span></span><a class='nut-badge' onclick='event.stopPropagation();newViewPage(\"view_" + node.id + "\")' title='New View'> ➕ </a>", group: true, expanded: true, nodes: [], tag:node.tag+"view/" }
			node.nodes.push(pnode);
			for (var i = 0; i < count; i++) {
				var rec = res.result.views[i];
				var n = { id: rec.id, text: "<span ondragstart='drag(event)'>" + rec.name + "</span>", count: "<a onclick='event.stopPropagation();deleteTableView(" + rec.id + ")' title='Delete'>➖</a>", icon: "nut-img-view", type: "VIEW", name: rec.name, alias: rec.alias }
				pnode.nodes.push(n);
			}
			count = res.result.procedures.length;
			pnode = { id: "procedure_" + node.id, text: "PROCEDURES (" + count + ")<span></span><a class='nut-badge' onclick='event.stopPropagation();newProcedurePage(\"proc_" + node.id + "\")' title='New Procedure'> ➕ </a>", group: true, expanded: true, nodes: [], tag:node.tag+"procedure/" }
			node.nodes.push(pnode);
			for (var i = 0; i < count; i++) {
				var rec = res.result.procedures[i];
				var n = { id: rec.id, text: "<span ondragstart='drag(event)'>" + rec.name + "</span>", count: "<a onclick='event.stopPropagation();deleteProcedureView(" + rec.id + ")' title='Delete'>➖</a>", icon: "nut-img-code", type: "PROCEDURE", name: rec.name, alias: rec.alias }
				pnode.nodes.push(n);
			}
			w2ui.mnuMain.set(node.id, node);
			NUT.loading();
		} else NUT.notify("⛔ ERROR: " + res.result, "red");
	});
}
window.lookupEditType=function(type)
{
    var dataType = "text";
	switch (type) {
		case "bigint":
			dataType = "int";
			break;
		case "bit":
			dataType = "check";
			break;
		case "date":
			dataType = "date";
			break;
		case "datetime":
		case "datetime2":
		case "smalldatetime":
			dataType = "datetime";
			break;
		case "decimal":
		case "float":
		case "numeric":
		case "real":
			dataType = "float";
			break;
		case "image":
			dataType = "file";
			break;
		case "int":
		case "smallint":
		case "tinyint":
			dataType = "int";
			break;
		case "money":
		case "smallmoney":
			dataType = "money";
			break;
		case "time":
		case "timestamp":
			dataType = "time";
			break;
	}
	return dataType;
}
window.menu_onClick=function(evt){
	var node = evt.object;
	var isTable = (node.type == "TABLE");
	var isProcedure = (node.type == "PROCEDURE");
	var a = NUT.createWindowTitle(node.id, divTitle);
	if(a)NUT.ds.get({ url: node.parent.tag+node.name+"?detail=true" }, function (res) {
		var rec = res.result;
		node.alias = rec.alias;
		a.div.innerHTML = "<table><legend><h3>" + node.type + ": <span id='labTblName_" + node.id + "'>" + rec.name + "</span><span style='cursor:pointer' title='Rename' onclick='renameTableAlias(" + node.id + ")'> ✏️ </span></h3></legend><tr><td><i>Alias: </i></td><td id='labTblAlias_" + node.id + "'>" + (rec.alias || "-/-") + "</td></tr><tr><td><i>Usage: </i></td><td>" + (rec.dataUsage + rec.indexUsage || 0) + " B</td></tr><tr><td><i>Created: </i></td><td>" + new Date(rec.created).toLocaleString() + "</td></tr></table><br/>";
		var divTab = a.div.z(["div", { id: "tab_" + node.id }]);
		var divCol = a.div.z(["div", { id: "col_" + node.id, className:"nut-full" }]);
		var divData = a.div.z(["div", { id: "data_" + node.id, className: "nut-full", style:"display:none" }]);
		var opt = {
			name: divTab.id,
			active: "COL",
			tabs: [{ id: "COL", text: (isProcedure?"Parameter":"Column"), div: divCol }],
			onClick: function (evt) {
				var id = evt.object.id;
				for (var i = 0; i < this.tabs.length; i++) {
					var tab = this.tabs[i];
					tab.div.style.display = (tab.id == id) ? "" : "none";
				}
				if (id == "DATA") {
					var grid = w2ui["data_" + node.id];
					if (grid.columns.length == 0) {
						var records = w2ui[divCol.id].records;
						var columns = [];
						for (var i = 0; i < records.length; i++) {
							var col = records[i];
							columns.push({ field: col.name, text: col.alias || col.name, size: 100, sortable: true, editable: (col.identity ? false : { type: lookupEditType(col.dataType) }) });
							if (col.inPrimaryKey) grid.recid = col.name;
						}
						grid.columns = columns;
						grid.render(divData);
					}
				}
			}
		}
		if (!isProcedure) {//data
			opt.tabs.push({ id: "DATA", text: "Data", div: divData });
			var conf = {
				name: divData.id,
				reorderColumns: true,
				newid: 0,
				url: node.parent.parent.tag + "data/" + node.name,
				dataType: "RESTFULL",
				httpHeaders: { Authorization: "Bearer " + n$.token },
				limit: NUT.GRID_LIMIT,
				show: {
					toolbar: true,
					footer: true
				},
				toolbar:{
					items: [
						{ type: 'spacer' },
						{ type: 'button', id: 'IMP', text: '📥', tooltip: '_Import' },
						{ type: 'button', id: 'EXP', text: '📤', tooltip: '_Export' }
					],
					onClick: importExportXls
				},
				onLoad: function (evt) {
					var data = evt.detail.data;
					var records = data.result;

					//chuan hoa time
					if (records.length) for (var i = 0; i < this.columns.length; i++) {
						var col = this.columns[i];
						var datatype = col.dataType;
						if (datatype == "date" || datatype == "time" || datatype == "datetime") {
							var len = (datatype == "date" ? 10 : (datatype == "time" ? 5 : 16));
							for (var j = 0; j < records.length; j++) {
								var val = records[j][col.name];
								if (val) records[j][col.name] = (len == 16 ? val.substring(0, len).replace("T", " ") : val.substring(0, len));
							}
						}
					}
					evt.detail.data.status = data.success ? "success" : "error";
					evt.detail.data.records = records;
				}
			}
			if (isTable) {
				conf.show.toolbarAdd = true;
				conf.show.toolbarDelete = true;
				conf.show.toolbarSave = true;
				conf.show.toolbarEdit = true;
				conf.onAdd = function (evt) {
					var recid = "NEW_" + (++this.newid);
					this.add({ [this.recid]: recid }, true);
					this.editField(recid, 1);
				}
				conf.onEdit = function (evt) {
					this.editField(this.getSelection()[0], 1);
				}
				conf.onSave = function (evt) {
					var changes = this.getChanges();
					var updates = []; var inserts = [];
					for (var i = 0; i < changes.length; i++) {
						var change = changes[i];
						if (!NUT.isObjectEmpty(change)) {
							var recid = change.recid;
							var data = {};//remove "" value
							for (var key in change) if (change.hasOwnProperty(key) && key != "recid") {
								var val = change[key];
								data[key] = (val === "" ? null : val);
							}
							if (recid.startsWith && recid.startsWith("NEW_")) inserts.push(data);
							else {
								data[this.recid] = recid;
								updates.push(data);
							}
						}
					}
					var grid = this;
					if (inserts.length) NUT.ds.insert({ url: this.url, data: inserts, returnid: !this.getColumn(this.recid).editable }, function (res) {
						if (res.success) {
							grid.reload();
							NUT.notify("Record added.", "lime");
						} else NUT.notify("⛔ ERROR: " + res.result, "red");
					});
					if (updates.length) NUT.ds.update({ url: this.url, key: this.recid, data: updates }, function (res) {
						if (res.success) {
							grid.reload();
							NUT.notify("Record updated.", "lime");
						} else NUT.notify("⛔ ERROR: " + res.result, "red");
					});
					evt.isCancelled = true;
				}
				conf.onDelete = function (evt) {
					evt.isCancelled = true;
					var grid = this;
					NUT.confirm("DELETE selected record?", function (awnser) {
						if (awnser == "yes") {
							grid.autoLoad = false;/*not reload on delete*/
							var recid = grid.getSelection()[0];
							NUT.ds.delete({ url: grid.url, where: [grid.recid, "=", recid] }, function (res) {
								if (res.success) {
									grid.remove(recid);
									NUT.notify("Record deleted.", "lime");
								} else NUT.notify("⛔ ERROR: " + res.result, "red");
							});
						}
					});
				}
			}
			new w2grid(conf);
		}
		if (!isTable) {
			var txts = [];
			if (isProcedure) {
				var strs = [];
				for (var i = 0; i < rec.parameters.length; i++) {
					var p = rec.parameters[i];
					var str = p.name + " " + p.dataType;
					if (p.length) {
						str += "(" + p.length;
						if (p.precision) str += "," + p.precision;
						str += ")";
					}
					if (p.defaultValue) str += " default " + p.defaultValue;
					strs.push(str);
				}
				txts.push(["textarea", { id: "para_" + node.id, innerHTML: strs.join(","), style: "width:100%" }]);
			}
			txts.push(["textarea", { id: "script_" + node.id, innerHTML: rec.textBody, className: "nut-full" }]);
			var divScript = a.div.z(["div", { className: "nut-full", style: "display:none" }, txts]);
			opt.tabs.push({ id: "SCRIPT", text: "Script <span style='cursor:pointer' title='Edit' onclick='editViewScript(" + node.id + ")'> ✏️ </span>", div: divScript });
		}
		(w2ui[divCol.id] || new w2tabs(opt)).render(divTab);
		//column
		opt = {
			name: divCol.id,
			reorderColumns: true,
			recid: "id",
			newid: 0,
			records: (isProcedure?rec.parameters: rec.columns),
			columns: [{ field: 'id', text: 'ID', sortable: true, size: 36 },
				{ field: 'name', text: 'Name', size: 100, sortable: true, searchable: true, editable: (isTable ? { type: "text" } : false) },
				{ field: 'alias', text: 'Alias', size: 100, sortable: true, searchable: true, editable: (isTable ? { type: "text" } : false) },
				{ field: 'dataType', text: 'Data Type', size: 100, sortable: true, editable: (isTable ? { type: "select", items: DATA_TYPE } : false) },
				{ field: 'defaultValue', text: 'Default Value', size: 100, sortable: true, editable: (isTable ? { type: "text" } : false) },
				{ field: 'length', text: 'Length', size: 100, render: "int", sortable: true, editable: (isTable ? { type: "int" } : false) },
				{ field: 'precision', text: 'Precision', size: 100, render: "int", sortable: true, editable: (isTable ? { type: "int" } : false) }],
			multiSearch: true,
			show: {
				toolbar: true,
				footer: true
			},
			tag: node.parent.parent.tag+"column/" + node.name,
			onLoad: function (evt) {
				var data = evt.detail.data;
				evt.detail.data.status = data.success ? "success" : "error";
				evt.detail.data.records = data.result;
			}
		}
		if (isTable) {
			opt.columns.push({ field: 'nullable', text: 'Nullable', size: 100, sortable: true, editable: (isTable ? { type: "check" } : false) });
			opt.columns.push({ field: 'inPrimaryKey', text: 'Primary Key', size: 100, sortable: true, editable: (isTable ? { type: "check" } : false) });
			opt.columns.push({ field: 'identity', text: 'Identity', size: 100, sortable: true, editable: (isTable ? { type: "check" } : false) });

			opt.show.toolbarAdd = true;
			opt.show.toolbarDelete= true;
			opt.show.toolbarSave= true;
			opt.show.toolbarEdit= true;
			opt.onAdd = function (evt) {
				var recid = "NEW_"+(++this.newid);
				this.add({ id: recid, w2ui: { changes: { dataType: "int", nullable: true } } });
				this.editField(recid, 1);
			}
			opt.onEdit=function (evt) {
				this.editField(this.getSelection()[0], 1);
			}
			opt.onSave=function (evt) {
				var changes = this.getChanges();
				var data = [];
				for (var i = 0; i < changes.length; i++) {
					var d = { name: null, alias: null, dataType: null, nullable: null, defaultValue: null, length: -1, precision: - 1, inPrimaryKey: null, identity: null };
					var change = changes[i];
					for (var key in change) if (change.hasOwnProperty(key) && key != "recid") d[key] = change[key];
					d.id = (isNaN(change.recid) ? -1 : change.recid);
					data.push(d);
				}
				NUT.loading(divMain);
				var grid = this;
				NUT.ds.get({ url: this.tag + "/alter", data: data, method:"POST" }, function (res) {
					if (res.success) {
						grid.mergeChanges();
						NUT.notify(res.result[0] + " columns added, " + res.result[1] + " columns modified, " + res.result[2] + " columns deleted.", "lime");
					} else {
						NUT.notify("⛔ ERROR: " + res.result, "red");
					}
					NUT.loading();
				});
				evt.isCancelled = true;
			}
			opt.onDelete = function (evt) {
				evt.isCancelled = true;
				var grid = this;
				NUT.confirm("DELETE selected record?", function (awnser) {
					if (awnser == "yes") {
						var recid = grid.getSelection()[0];
						NUT.ds.get({ url: grid.tag + "/" + recid, method: "DELETE" }, function (res) {
							if (res.success) {
								grid.total--;
								grid.remove(recid);
								NUT.notify("Record deleted!", "lime");
							} else NUT.notify("⛔ ERROR: " + res.result, "red");
						});
					}
				});
			}
		}
		(w2ui[divCol.id] || new w2grid(opt)).render(divCol);
		
		a.innerHTML=rec.name;
	});
}
window.importExportXls=function(evt){
	var grid=this.owner;
	var cols = [];
	for (var i = 0; i < grid.columns.length; i++)cols.push(grid.columns[i].field);
	switch(evt.object.id){
		case "IMP":
			NUT.importXls(grid.url,cols,function (res) {
				if (res.success) {
					grid.reload();
					NUT.notify("Data imported.", "lime");
				} else NUT.notify("🛑 ERROR: " + res.result, "red");
			});
			break;
		case "EXP":
			// define where
			var where = [];
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
			NUT.exportXls(grid.url,cols,where,orderby);
			break;
	}
}
window.editViewScript = function (nodeid) {
	var node = w2ui.mnuMain.get(nodeid);
	NUT.confirm("MODIFY script of selected "+node.type+"?", function (awnser) {
		if (awnser == "yes") {
			var sql = document.getElementById("script_" + nodeid).value;
			var para = document.getElementById("para_" + nodeid).value;
			if (sql) NUT.ds.get({ url: node.parent.tag + node.name + "/edit", data: { body: sql, parameter:para }, method:"POST" }, function (res) {
				if (res.success) {
					w2ui.mnuMain.remove(nodeid);
					NUT.notify(node.type + " Modified.", "lime");
				} else NUT.notify("⛔ ERROR: " + res.result, "red");
			}); else NUT.notify("⚠️ New "+node.type+" has NO body script!", "yellow");
		}
	});
}
window.deleteTableView = function (nodeid) {
	NUT.confirm('DELETE selected Table/View. All data will be lost?', function (awnser) {
		if (awnser == "yes") {
			var node = w2ui.mnuMain.get(nodeid);
			NUT.ds.get({ url: node.parent.tag + node.name, method: "DELETE" }, function (res) {
				if (res.success) {
					w2ui.mnuMain.remove(nodeid);
					NUT.notify("Table/View deleted.", "lime");
				} else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		}
	});
}
window.renameTableAlias = function (nodeid) {
	var node = w2ui.mnuMain.get(nodeid);
	NUT.openDialog({
		title: "_Rename",
		width: 360,
		height: 240,
		div: '<table style="margin:auto;width:100%"><caption><b>'+node.name+'</b></caption><tr><td align="right">Name*: </td><td><input id="txtTblName" class="w2ui-input" value="'+node.name+'"/></td></tr><tr><td align="right">Alias: </td><td><input id="txtTblAlias" class="w2ui-input" value="'+(node.alias||"")+'"/></td></tr></table>',
		actions: {
			"_Close": function () { NUT.closeDialog() },
			"_Ok": function () {
				if (txtTblName.value) {
					var url = node.parent.tag + node.name + "?newName=" + txtTblName.value;
					if (txtTblAlias.value) url += "&newAlias=" + txtTblAlias.value;
					NUT.ds.get({ url: url, method: "PUT" }, function (res) {
						if (res.success) {
							node.text = node.name = txtTblName.value;
							node.alias = txtTblAlias.value;
							w2ui.mnuMain.refresh(nodeid);
							w2ui["col_" + nodeid].tag = node.parent.parent.tag+"column/" + node.name;
							document.getElementById("labTblName_" + nodeid).innerHTML = node.name;
							document.getElementById("labTblAlias_" + nodeid).innerHTML = (node.alias || "-/-");
							NUT.closeDialog();
							NUT.notify("Table/View name updated.", "lime");
						} else NUT.notify("⛔ ERROR: " + res.result, "red");
					});
				} else NUT.notify("⚠️ Table/View name is empty!", "yellow");
			}
		}
	});
}
window.drag=function (evt) {
	evt.dataTransfer.setData("NODE", evt.target.id);
},
window.allowDrop=function (evt) {
	evt.preventDefault();
},
window.drop=function (evt) {
	evt.preventDefault();
	if (!this.innerHTML) {
		var node = document.getElementById(evt.dataTransfer.getData("NODE"));
		var td = node.parentNode;
		node.lastChild.style.width = "";
		this.prepend(node);
		if (td.height == 35) td.style.background = "whitesmoke";
		this.style.background = "";
	}
}

