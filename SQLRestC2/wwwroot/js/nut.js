var n$ = {
	user: null,
	windowid: null,
	extent: null,
	layer: null,
	app: null, 
	locale: null,
	phrases:null,
	workflow: null,
	now: function () {
		return (new Date()).toISOString().substr(0, 10);
	},
	nowTime: function () {
		var now=new Date();
		return now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes();
	},
	nowDate: function () {
		return (new Date()).getDate();
	},
	nowMonth: function () {
		return (new Date()).getMonth() + 1;
	},
	nowYear: function () {
		return (new Date()).getFullYear();
	},
	myLocate:function(){
		//do nothing
	},
	//BASE: "https://localhost:7006/"
	BASE: "https://oritholdings.hopto.org:44326/"
}
var NUT = {
	URL: n$.BASE +"rest/zilcode_nut/dbo/data/",
	URL_DB: n$.BASE +"rest/zilcode_nut/dbo/",
	URL_UPLOAD: n$.BASE +"rest/upload/",
	URL_TOKEN: n$.BASE +"rest/token/",
	//URL_PROXY: n$.BASE +"rest/proxy?",
	shortcut: null,
	ds: null,
	access: null,
	appinfo:null,
	apps: {},
	windows: {},
	domains: {},
	dmlinks: {},
	tables: {},
	workflows: {},
	relates: {},
	services: {},
	isMobile: false,
	isGIS:false,
	canva: document.createElement("canvas"),
	CAN_WIDTH: 600,
	ERD: {
		window: ["windowid", "windowname", "windowtype", "appid", "execname", "isopenfind", "translate"],
		tab: ["tabid", "parenttabid", "tabname", "tablevel", "seqno", "layoutcols", "linkchildfield", "linkparentfield", "linktableid", "whereclause", "orderby", "tableid", "windowid", "relatechildfield", "relateparentfield", "relatetableid", "filterfield", "filterdefault", "noinsert", "noupdate", "nodelete", "isarchive", "islock", "isautosave", "translate", "noselect", "noexport", "archivetype", "isviewonly", "labelspan","workflowid"],
		field: ["fieldid", "fieldname", "translate", "hideingrid", "hideinform", "hideinfind", "displaylength", "seqno", "isreadonly", "fieldlength", "vformat", "defaultvalue", "isrequire", "isfrozen", "fieldgroup", "tabid", "columnid", "fieldtype", "linktableid", "domainid", "issearchtonghop", "parentfieldid", "wherefieldname", "placeholder", "calculation", "colspan", "rowspan", "mapcolumn", "foreignwindowid", "columnname", "tableid", "whereclause", "bindfieldname", "options", "columntype","linkcolumn"],
		menu: ["menuid", "menuname", "parentid", "seqno", "translate", "issummary", "appid", "windowid", "siteid", "tabid", "menutype", "execname", "icon","reportid"]
	},
	GRID_LIMIT: 100,
	QUERY_LIMIT: 200,
	DM_NIL:{id:"",text:""},
	z: function (param) {// tag, attribute, children
		var elm = (param[0] ? document.createElement(param[0]) : this);
		if (param[1]) for (var key in param[1]) elm[key] = param[1][key];
		var children = param[2];
		if (Array.isArray(children)) {
			for (var i = 0; i < children.length; i++)elm.z(children[i]);
		}
		if (this instanceof HTMLElement) {
			if (param[0]) this.appendChild(elm);
		}
		return elm;
	},
	getWeek: function (date) {
		var first = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
		var offset = date.getDate() + first - 1;
		return Math.floor(offset / 7);
	},
	dmy: function (ymd) {
		var dmy = "";
		if (ymd) {
			var tokens = ymd.substring(0, 10).split("-");
			dmy = tokens[2] + "/" + tokens[1] + "/" + tokens[0];
		}
		return dmy;
	},
	cookie: function (ck) {
		if (ck) {
			localStorage.setItem("user", ck.username);
			localStorage.setItem("site", ck.sitecode);
			localStorage.setItem("pass", ck.savepass ? ck.password : "");
			localStorage.setItem("save", ck.savepass ? "1" : "");
		} else return {
			username: localStorage.getItem("user"),
			sitecode: localStorage.getItem("site"),
			password: localStorage.getItem("pass"),
			savepass: localStorage.getItem("save"),
		}
	},
	cacheDmLink: function (table) {
		NUT.ds.select({ url: table.urlview, select: [table.columnkey, table.columndisplay] }, function (res4) {
			if (res4.success) {
				var dm = { items: [NUT.DM_NIL], lookup: {}, lookdown: {} };
				for (var i = 0; i < res4.result.length; i++) {
					var data = res4.result[i];
					var itm = { id: data[table.columnkey], text: data[table.columndisplay] };
					dm.items.push(itm);
					dm.lookup[itm.id] = [itm.id,itm.text];
					dm.lookdown[itm.text] = [itm.id,itm.text];
				}
				NUT.dmlinks[table.tableid] = dm;
			} else NUT.notify("🛑 ERROR: " + res4.result, "red");
		});
	},
	configWindow: function (conf, layout) {
		var lookupTab = {}, lookupField = {}, lookupFieldName = {}, layoutFields = {};
		var winconf = { tabs: [], needCache: {} };
		for (var i = 0; i < NUT.ERD.window.length; i++)
			winconf[NUT.ERD.window[i]] = conf.window[i];
		if (conf.tabs) {
			for (var i = 0; i < conf.tabs.length; i++) {
				var tab = { fields: [], tabs: [], menus: [], children: [], maxLevel: 0 };
				for (var j = 0; j < NUT.ERD.tab.length; j++) {
					var key = NUT.ERD.tab[j];
					var val = conf.tabs[i][j];
					tab[key] = val;
					var table=NUT.tables[val]||{};
					if (key == "tableid" && val) tab.table = table;
					if (key == "linktableid" && val) tab.linktable = table;
					if (key == "relatetableid" && val) tab.relatetable = table;
				}
				if(layout){
					tab.layout=document.createElement("div");
					tab.layout.innerHTML=layout[tab.tabid];
					var tables=tab.layout.querySelectorAll("table");
					for(var t=0;t<tables.length;t++){
						var table = tables[t];
						table.border = 0;
						for(var r=0;r<table.rows.length;r++)for(var c=0;c<table.rows[r].cells.length;c++){
							var cell = table.rows[r].cells[c];
							var div = cell.firstChild;
							if(div){
								layoutFields[div.id]=div;
								div.draggable=false;
								div.lastChild.className = "";
								var ctrl = div.lastChild.firstChild;
								if (ctrl.type == "search") ctrl.type = "text";
								else ctrl.style.width = div.lastChild.style.width || "";
							}
						}
					}
				}
				if (NUT.isMobile) tab.tablevel = 0;
				if (tab.tablevel == 0) winconf.tabs.push(tab);
				lookupTab[tab.tabid] = tab;
				if (tab.parenttabid) {
					var parentTab = lookupTab[tab.parenttabid];
					parentTab.children.push(tab);
					if (tab.tablevel > 0) {
						if (tab.tablevel > parentTab.tablevel) {
							parentTab.tabs.push(tab);
							if (tab.tablevel > parentTab.maxLevel) parentTab.maxLevel = tab.tablevel;
						} else {
							lookupTab[parentTab.parenttabid].tabs.push(tab);
						}
					}
					tab.linktable = NUT.tables[parentTab.tableid];
					//n-n relationship
					if(!tab.relatetableid){
						var rel = NUT.relates[tab.tableid + "_" + parentTab.tableid] || NUT.relates[parentTab.tableid + "_" + tab.tableid];
						if (rel) {
							var child = (rel[0].linktableid == tab.tableid ? rel[0] : rel[1]);
							var parent = (rel[0].linktableid == parentTab.tableid ? rel[0] : rel[1]);
							tab.relatetable = NUT.tables[child.tableid];
							tab.relatetableid = tab.relatetable.tableid;
							tab.relatechildfield = child.columnname;
							tab.relateparentfield = parent.columnname;
							tab.linkchildfield=child.linkcolumn||tab.table.columnkey;
							tab.linkparentfield=parent.linkcolumn||parentTab.table.columnkey;
						}
					}
				}
				if (tab.workflowid) tab.menus.push({ menuid: -1, menuname: "_Send", execname: "SysWfSend" })
			}
			for (var i = 0; i < conf.fields.length; i++) {
				var field = { windowid: winconf.windowid, children: [] };
				for (var j = 0; j < NUT.ERD.field.length; j++) {
					var key = NUT.ERD.field[j];
					var val = conf.fields[i][j];
					field[key] = val;
					if (key == "linktableid" && val) field.linktable = NUT.tables[val];
				}
				var tab = lookupTab[field.tabid];
				tab.fields.push(field);
				lookupField[field.fieldid] = field;
				if (tab.table) lookupFieldName[tab.table.tablename + "." + field.columnname] = field;
				if (field.linktableid) {
					winconf.needCache[field.linktableid + (field.whereclause || "")] = field;
					//1-n relationship
					if (!tab.linktableid&&tab.parenttabid) {
						var parentTab = lookupTab[tab.parenttabid];
						if (parentTab.tableid == field.linktableid) {
							tab.linktable = field.linktable;
							tab.linktableid=field.linktableid;
							tab.linkchildfield = field.columnname;
							tab.linkparentfield = field.linkcolumn||parentTab.table.columnkey;
						}
					}
				}
				
				if (tab.workflowid) {
					var wf = NUT.workflows[tab.workflowid][0];
					var isStatusCol = (field.columnname == "status");
					var isRoleCol = (field.columnname == "roleid");
					var isUserCol = (field.columnname == "userid");
					var isStepCol = (field.columnname == "stepid");

					if (isRoleCol || isUserCol || isStepCol) field.isreadonly = field.hideinform = field.hideinfind = field.hideingrid = 1;
					if (isStatusCol) {
						field.isreadonly = 1;
						if (wf.status) field.defaultvalue = wf.status;
					}
					if (isRoleCol) field.defaultvalue = n$.user.roleid;
					if (isUserCol) field.defaultvalue = n$.user.userid;
					if (isStepCol) field.defaultvalue = wf.stepid;
				}
			}
			for (var key in lookupField) if (lookupField.hasOwnProperty(key)) {
				var field = lookupField[key];
				/*if(field.calculation){
					field.calculationInfos=[];
					var tab=lookupTab[field.tabid];
					var names=field.calculation.match(/(?<=\[).*?(?=\])/g); //get string between [ & ]
					var funcs=field.calculation.match(/sum|count|avg|min|max/g);
					var f=0;
					for(var i=0;i<names.length;i++){
						var info=null;
						var name=names[i];
						var isFullName=name.includes(".");
						lookupFieldName[isFullName?name:tab.tabname+"."+name].children.push(field);
						if(isFullName){
							var tokens=name.split(".");
							var tabName=tokens[0];
							for(var j=0;j<tab.children.length;j++)if(tabName==tab.children[j].tabname){
								info={
									func:funcs[f++],
									tab:tab.children[j].tabid,
									field:tokens[1]
								};break;
							}
							if(tab.parenttabid&&tabName==lookupTab[tab.parenttabid].tabname)
								info={
									tab:tab.parenttabid,
									field:tokens[1]
								};
						}else info={field:name};

						field.calculation=field.calculation.replace(info.func?info.func+"["+name+"]":"["+name+"]","_v["+i+"]");
						field.calculationInfos.push(info);
					}
				}
				if(field.displaylogic){
					var fldnames=field.displaylogic.match(/(?<=\[).*?(?=\])/g);
					for(var i=0;i<fldnames.length;i++)lookupFieldName[tab.tabname+"."+fldnames[i]].children.push(field);
					field.displaylogic=field.displaylogic.replaceAll('[','form.record["');
					field.displaylogic=field.displaylogic.replaceAll(']','"]');
				}*/
				if (field.parentfieldid) {
					var parentField = lookupField[field.parentfieldid];
					parentField.children.push(field);
					if (parentField.fieldtype == "search") {
						field.calculation = "record." + field.wherefieldname;
						field.calculationInfos = [];
					}
				}
			}

			if (conf.menus) {
				for (var i = 0; i < conf.menus.length; i++) {
					var menu = {};
					for (var j = 0; j < NUT.ERD.menu.length; j++)
						menu[NUT.ERD.menu[j]] = conf.menus[i][j];
					lookupTab[menu.tabid].menus.push(menu);
				}
			}
			winconf.lookupFieldName = lookupFieldName;
			winconf.lookupField=lookupField;
			winconf.lookupTab=lookupTab;
		}
		return winconf;
	},
	createWindowTitle: function (id, divTitle, notClose) {
		if (n$.windowid) {
			for (var i = 0; i < divTitle.childNodes.length; i++) {
				var node = divTitle.childNodes[i].firstChild;
				node.style.color = "grey";
				if (id == node.tag) {
					node.onclick();
					return;
				}
			}
		} else {
			divTitle.innerHTML = "";
			n$.windowid = id;
		}
		divWindow = divTitle.parentNode;
		for (var i = 1; i < divWindow.childNodes.length; i++)
			divWindow.childNodes[i].style.display = "none";

		var div = divWindow.z(["div", { className: "nut-full" }]);
		var span = divTitle.z(["span", {style:"display:inline-block"}]);
		var a = span.z(["i", {
			innerHTML: n$.phrases["_Loading"],
			className: "nut-link",
			div: div,
			tag: id,
			onclick: function () {
				var children = this.div.parentNode.childNodes;
				for (var i = 1; i < children.length; i++)
					children[i].style.display = "none";
				this.div.style.display = "";
				children = this.parentNode.parentNode.childNodes;
				for (var i = 0; i < children.length; i++)
					var node = children[i].firstChild.style.color = "grey";
				this.style.color = "";
				n$.windowid = this.tag;
			}
		}]);
		var prop = { className: "nut-close", innerHTML: (notClose ? " ─   " : " ⛌   "), tag: id }
		if (!notClose) prop.onclick = function () {
			var title = this.parentNode.parentNode;
			this.previousElementSibling.div.remove();
			this.parentNode.remove();
			if (this.tag == n$.windowid) {
				if (title.childNodes.length) title.childNodes[0].firstChild.onclick();
				else {
					divTitle.innerHTML = NUT.appinfo;
					n$.windowid = null;
				}
			}
		}
		span.z(["span", prop]);
		div.a = a;
		return a;
	},
	translate: function (str) {
		try {
			return JSON.parse(str)[n$.lang];
		} catch (ex) {
			return str;
		}
	},
	/*calcWhere: function (rec) {
		var where = "";
		for (var key in rec) if (rec.hasOwnProperty(key)) {
			where = where ? where + "&" + key + "=like." + rec[key] : key + "=like." + rec[key];
		}
		return where;
	},*/
	isObjectEmpty: function (obj) {
		for (var key in obj)
			if (obj.hasOwnProperty(key)) return false;
		return true;
	},
	clone: function (obj) {
		var objC = {};
		for (var key in obj) if (obj.hasOwnProperty(key)) {
			objC[key] = obj[key];
		}
		return objC;
	},
	loaiBoDau: function (str) {
		return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
	},
	tsv2arr: function (tsv) {
		var arr = [];
		var lines = tsv.split("\n");
		if (lines.length > 1) {
			var header = lines[0].split("\t");
			for (var i = 1; i < lines.length; i++) {
				if (lines[i]) {
					arr.push({});
					var line = lines[i].split("\t");
					for (var j = 0; j < line.length; j++)arr[i - 1][header[j]] = line[j];
				}
			}
		}
		return arr;
	},
	openDialog: function (opt) {
		if(!opt.width)opt.width=(NUT.isMobile?360:(NUT.isGIS?720:1080));
		if(!opt.height)opt.height=640;
		if (NUT.w2popup.status == "closed") {
			opt.body = opt.div; NUT.w2popup.open(opt);
			if(opt.floating)document.getElementsByClassName("w2ui-lock")[0].outerHTML="";
		} else {
			if(opt.actions)	opt.body = opt.div;
			else opt.html = opt.div;
			NUT.w2popup.isMsg = true; NUT.w2popup.message(opt);
		}
	},
	closeDialog: function () {
		if (NUT.w2popup.isMsg) {
			NUT.w2popup.message(); NUT.w2popup.isMsg = false;
		}else NUT.w2popup.close();
	},
	alert: function (msg) {
		NUT.w2alert(msg, '_Information');
	},
	confirm: function (msg, callback) {
		NUT.w2confirm("<span style='color:red'>"+msg+"</span>", '_Confirm', callback);
	},
	prompt: function (opt, callback) {
		NUT.w2prompt(opt).ok(callback);
	},
	notify: function (msg, color) {
		var opt = (color == "red" ? { error: true } : { timeout: 100000 });
		NUT.w2utils.notify("<span style='color:" + (opt.error ? "white" : color) + "'>" + msg + "</span>", opt);
	},
	loading: function (div) {
		if (div) {
			NUT.divLoading = div;
			NUT.w2utils.lock(div, undefined, true);
		} else NUT.w2utils.unlock(NUT.divLoading);
	},
	runComponent(com, data) {//data:records,parent,config,gsmap
		if(com.endsWith(".html")){
			window.open(com+"?siteid="+n$.user.siteid+"&token="+n$.user.token);
		} else {
			if (window[com]) {
				window[com].run(data);
			} else {//load component
				document.head.z(["script", { src: "site/" + (com.startsWith("SysWf") ? 1 : n$.app.siteid) + "/" + (com.startsWith("SysWf") ? 1 : n$.app.appid) + "/" + com + ".js", onload: function () { window[com].run(data) } }]);
			}
		}
	},
	runReport(reportid) {
		NUT.ds.select({ url: NUT.URL + "n_report/" + reportid }, function (res) {
			if (res.success && res.result.length) {
				var rec = res.result[0];
				var select = rec.description;
				var table = NUT.tables[rec.tableid];
				var rpt = JSON.parse(rec.contentjson);
				var groups=[];aggrs=[];
				for(var i=1;i<rpt.slice.columns.length;i++){
					var col=rpt.slice.columns[i];
					groups.push(col.uniqueName);
				}
				for(var i=0;i<rpt.slice.rows.length;i++){
					var col=rpt.slice.rows[i];
					groups.push(col.uniqueName);
				}
				for(var i=0;i<rpt.slice.reportFilters.length;i++){
					var col=rpt.slice.reportFilters[i];
					groups.push(col.uniqueName);
				}
				for(var i=0;i<rpt.slice.measures.length;i++){
					var col=rpt.slice.measures[i];
					if(col.active!==false)aggrs.push({
						statisticType:col.aggregation,
						onStatisticField:col.uniqueName,
						outStatisticFieldName:col.uniqueName
					});
					col.aggregation="sum";
				}
				var win = window.open("../datarock/analyst.html");
				win.onload = function () {
					var rock = this._rock;
					this.divHeader.innerHTML=rec.reportname;
					var divChart = this.divChart;
					if (table.tabletype == "arcgis") {
						var lyr=NUT.AGMap.layers[table.maplayer];
						lyr.queryFeatures({where:"1=1",outStatistics :aggrs,groupByFieldsForStatistics:groups}).then(function (res) {
							if (res.error) NUT.notify("🛑 ERROR: " + res.error.message, "red");
							else {
								var data = [];
								for (i = 0; i < res.features.length; i++){
									var feat=res.features[i];
									data.push(feat.attributes);
								}
								rpt.dataSource.data = data;
								rock.setReport(rpt);
							}
						});
					}else NUT.ds.select({ url: table.urlview, limit:100000 }, function (res) {
						if (res.success) {
							var data = [];
							for (i = 0; i < res.result.length; i++)	data.push(res.result[i]);
							rpt.dataSource.data = data;
							rock.setReport(rpt);
						} else NUT.notify("🛑 ERROR: " + res.result, "red");
					});
				}
				
			}
		});
	},
	genGuid(fileName) {
		var guid = 10000 * Math.random() * Date.now();
		if(fileName)guid+=fileName.substring(fileName.lastIndexOf("."), fileName.length);
		return guid;
	},
	uploadFile(tableid, recid, files, callback) {
		var imgArr = []; fileArr = [];
		for (var i = 0; i < files.length; i++) {
			var file = files[i];
			file.type.startsWith("image") ? imgArr.push(file) : fileArr.push(file);
		}
		//images
		if (imgArr.length) {
			var index = 0;
			var data = new FormData();
			var ctx = NUT.canva.getContext("2d");
			var img = new Image();
			img.src = URL.createObjectURL(imgArr[0]);
			img.onload = function () {
				var needResize = this.width > NUT.CAN_WIDTH;
				NUT.canva.width = needResize ? NUT.CAN_WIDTH : this.width;
				NUT.canva.height = needResize ? Math.round(this.height * NUT.CAN_WIDTH / this.width) : this.height;
				ctx.drawImage(this, 0, 0, NUT.canva.width, NUT.canva.height);
				NUT.canva.toBlob(function (blob) {
					data.append(imgArr[index].guid||NUT.genGuid(imgArr[index].name), blob);
					if (++index == imgArr.length) {
						NUT.ds.post({ url: NUT.URL_UPLOAD + n$.user.siteid + "/" + tableid + "/" + recid, data: data }, function (res) {
							if (callback) callback(res);
						});
					} else {
						img.src = URL.createObjectURL(imgArr[index]);
					}
				});
			}
		}
		if (fileArr.length) {
			var data = new FormData();
			var count = 0;
			for (var i = 0; i < fileArr.length; i++) {
				var file = fileArr[i];
				if (file.size <= 1048576) {
					data.append(file.guid || NUT.genGuid(file.name), file);
					count++;
				}
			}
			if(count)NUT.ds.post({ url: NUT.URL_UPLOAD + n$.user.siteid + "/" + tableid + "/" + recid, data: data }, function (res) {
				if (callback) callback(res);
			});
		}
	},
	linkData(p, search) {
		if (search === "") search = "%";
		var isLoadMore = Number.isInteger(p);
		if (isLoadMore) {
			var tree = NUT.w2ui["link_" + p];
			p = tree.tag;
			p.query.offset = search? 0:tree.nodes.length;
			if (search) {
				var op = (search.includes("%") ? "like" : "=");
				p.query.where = ["or", [p.conf.table.columncode || p.conf.table.columnkey, op, search], [p.conf.table.columndisplay, op, search]];
			}
		}
		var id = "link_" + p.conf.table.tableid;
		var isSimple = true;// p.conf.table.columncode || (p.ids && p.ids.length > NUT.QUERY_LIMIT);
		/*if (notSimple) {//not simple
			var tabconf = NUT.clone(p.conf);
			tabconf.tabid = -p.conf.tabid;
			tabconf.tablevel = 0;
			tabconf.isviewonly = true;
			tabconf.check = true;
			var win = new NUT.NWin(tabconf.tabid);
			win.buildWindow(div, { tabid: tabconf.tabid, tabs: [tabconf] }, 0, function (evt) {
				alert("Developing...")
			});
		*/
		NUT.ds.select(p.query, function (res) {
			if (res.success) {
				var count = res.result.length;
				var lookupIds = {};
				if (p.ids) {//link by check
					for (var i = 0; i < p.ids.length; i++)lookupIds[p.ids[i]] = true;
				} else {//search field
					lookupIds[p.id];
				}
				var nodes = [];
				var lookup = {};
				for (var i = 0; i < count; i++) {
					var rec = res.result[i];
					var key = rec[p.conf.table.columnkey];
					var text = "<input type='" + (p.ids ? "checkbox":"radio") + "' name='rad_" + p.conf.table.tableid + "' class='w2ui-input' onclick='return false' id='linkchk_" + key + "' " + (lookupIds[key] ? "checked" : "") + "/> " + rec[p.conf.table.columndisplay] + " - <i>" + rec[p.conf.table.columncode || p.conf.table.columnkey] + "</i>";
					var node = { id: key, text: text, record: rec };
					var parentid = rec[p.conf.table.columntree];
					if (parentid) {
						var parent = lookup[parentid];
						parent.group = !NUT.isMobile;
						parent.expanded = true;
						parent.text = parent.record[p.conf.table.columndisplay];
						if (parent.nodes) parent.nodes.push(node);
						else parent.nodes = [node];
					} else nodes.push(node);
					lookup[key] = node;
				}
				var total = count + (p.query.offset || 0);
				var tree = (NUT.w2ui[id] || new NUT.w2sidebar({
					name: id,
					tag: p,
					nodes: nodes,
					topHTML: "<table style='width:100%'><tr><td><input style='width:90%' placeholder='" + NUT.w2utils.lang("_Search") + "' class='w2ui-input' onchange='NUT.linkData(" + p.conf.table.tableid + ",this.value)'/><button class='nut-but-helper' title='_Search' onclick='NUT.linkData(" + p.conf.table.tableid +",this.previousSibling.value)'>&nbsp;🔎&nbsp;</button></td><td><button class='nut-but-helper' title='_Close' onclick='NUT.closeDialog()'>&nbsp;❌&nbsp;</button></td></tr></table>",
					bottomHTML: "<i style='float:right'>Read: <span id='link_count'>" + total +  "</span><a class='nut-link' onclick='NUT.linkData(" + p.conf.table.tableid + ")'>"+(total<NUT.QUERY_LIMIT?"":". Load More...")+"</a></i>",
					onClick: function (evt) {
						var node = evt.detail.node;
						var rec = node.record;
						var chk = document.getElementById("linkchk_" + node.id);
						chk.checked = !chk.checked;
						if (p.ids) {
							if (chk.checked) {//add
								var recRelate = {};
								recRelate[p.conf.relateparentfield] = p.parentKey;
								recRelate[p.conf.relatechildfield] = rec[p.conf.linkchildfield];
								if (rec.siteid !== undefined) recRelate.siteid = rec.siteid;
								NUT.ds.insert({ url: p.conf.relatetable.urlview, data: recRelate }, function (res2) {
									if (res2.success) NUT.notify("Link added.", "lime");
									else NUT.notify("🛑 ERROR: " + res2.result, "red");
								});
							} else {//delete
								NUT.ds.delete({ url: p.conf.relatetable.urlview, where: [[p.conf.relatechildfield, "=", rec[p.conf.linkchildfield]], [p.conf.relateparentfield, "=", p.parentKey]] }, function (res2) {
									if (res2.success) NUT.notify("Link removed.", "lime");
									else NUT.notify("🛑 ERROR: " + res2.result, "red");
								});
							}
						} else {
							NUT.closeDialog();
							if (p.callback) p.callback(rec);
						}
					}
				}));
				if (isLoadMore) {
					if (search) tree.nodes = [];
					tree.add(null, nodes);
					link_count.innerHTML = total;
					link_count.nextElementSibling.innerHTML = (total < NUT.QUERY_LIMIT ? "" : ". Load More...");
				} else {
					NUT.openDialog({
						title: "_Link",
						modal:false,
						width: (isSimple||NUT.isMobile ? 360:720),
						height: 660,
						div: '<div id="' + id + '" class="nut-full"></div>',
						onOpen: function (evt) {
							evt.onComplete = function () {
								tree.nodes = nodes;
								tree.render(document.getElementById(id));
							}
						},
						onClose: function () {
							if (p.callback) p.callback();
						}
					});
				}
			} else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	},
	outerCboHTML(items,id) {
		var cbo = document.createElement("select");
		if(id)cbo.id = id;
		cbo.className = "w2ui-input";
		for (var i = 0; i < items.length;i++) {
			var opt = document.createElement("option");
			var itm=items[i];
			opt.value = itm.id;
			opt.innerHTML = itm.text;
			cbo.add(opt);
		}
		return cbo.outerHTML;
	}
}

HTMLElement.prototype.z = NUT.z;