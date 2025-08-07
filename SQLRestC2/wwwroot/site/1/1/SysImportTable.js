var SysImportTable = {
	run: function (p) {
		if (p.records.length) {
			SysImportTable.ser = p.records[0];
			NUT.ds.select({ url: NUT.URL + "n_table", select: "tablename", where: ["serviceid", "=", SysImportTable.ser.serviceid] }, function (res) {
				if (res.success) {
					var lookup = {};
					for (var i = 0; i < res.result.length; i++)
						lookup[res.result[i].tablename] = true;
					switch (SysImportTable.ser.servicetype) {
						case "sqlrest":
							SysImportTable.importTables(lookup);
							break;
						case "arcgis":
							SysImportTable.importLayers(lookup);
							break;
						default: NUT.notify("⚠️ Service type is not support!", "yellow");
					}
				} else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		} else NUT.notify("⚠️ No Data Service selected!", "yellow");
	},
	importLayers: function (lookup) {
		NUT.AGMap.generateToken(SysImportTable.ser,function(res){
			if (!res.error) {
				NUT.AGMap.token = SysImportTable.ser.iscredential?res.access_token:res.token;
				NUT.AGMap.get({ url: SysImportTable.ser.urlPortal + "sharing/rest/content/items/" + SysImportTable.ser.itemId + "/data?f=json",token:NUT.AGMap.token }, function (res2) {
					if (!res2.error) {
						var fields = []; var info = {};var c=0;
						for (var i = 0; i < res2.operationalLayers.length; i++) {
							var data = res2.operationalLayers[i];
							if (data.layerType == "GroupLayer") {
								for (var j = 0; j < data.layers.length; j++) {
									var lyr = data.layers[j];
									var id = NUT.loaiBoDau(lyr.title).replaceAll(' ', '_');
									info[id] = lyr;
									fields.push({ field: id, type: 'checkbox', html: { column: ++c % 2, attr: lookup[id] ? "disabled" : "tabindex=0" } });
								}
							} else {
								var key = NUT.loaiBoDau(data.title).replaceAll(' ', '_');
								info[key] = data;
								fields.push({ field: key, type: 'checkbox', html: { column: ++c % 2, attr: lookup[key] ? "disabled" : "tabindex=0" } });
							}
						}
						SysImportTable.showDlgImport(lookup, fields, info);
					} else NUT.notify("⛔ ERROR: " + res2.error.message, "red");
				});
			} else NUT.notify("⛔ ERROR: " + res.error.message, "red");
		});
	},
	importTables: function (lookup) {
		NUT.ds.get({ url: SysImportTable.ser.url + "table" }, function (res) {
			if (res.success) {
				var fields = [];
				for (var i = 0; i < res.result.length; i++) {
					var name = res.result[i].name;
					fields.push({ field: name, type: 'checkbox', html: { column: i % 2, attr: lookup[name] ? "disabled" : "tabindex=0" } });
				}
				NUT.ds.get({ url: SysImportTable.ser.url + "view" }, function (res2) {
					if (res2.success) {
						var isViews = {};
						for (var i = 0; i < res2.result.length; i++) {
							var name = res2.result[i].name;
							isViews[name] = true;
							fields.push({ field: name, type: 'checkbox', html: { column: i % 2, attr: lookup[name] ? "disabled" : "tabindex=0" } });
						}
						SysImportTable.showDlgImport(lookup, fields, isViews);
					} else NUT.notify("⛔ ERROR: " + res2.result, "red");
				});
			} else NUT.notify("⛔ ERROR: " + res.result, "red");
		});
	},
	showDlgImport: function (lookup, fields, info) {
		var actions={
			"_Close": function() {
				NUT.w2popup.close();
			},
			"_Import": function() {
				var change = this.getChanges();
				for (key in change) if (change.hasOwnProperty(key)) {
					if (change[key]) {
						var inf=info[key];
						if (SysImportTable.ser.servicetype == "sqlrest") {
							var tabletype = (inf ? "view" : "table");
							NUT.ds.get({ url: SysImportTable.ser.url + tabletype + "/" + key + "?detail=true" }, function (res) {
								if (res.success) {
									res.result.tabletype = tabletype;
									SysImportTable.insertTable(res.result);
								} else NUT.notify("⛔ ERROR: " + res.result, "red");
							});
						} else if (SysImportTable.ser.servicetype == "arcgis") {
							SysImportTable.insertTable({
								columns: (inf.layerType=="SubtypeGroupLayer"?inf.layers[0].popupInfo.fieldInfos:inf.popupInfo.fieldInfos),
								name: key,
								alias: inf.title,
								tabletype: "arcgis",
								id: inf.id,
								url:inf.url
							});
						}
					}
				}
			}
		}
		var id="div_SysImportTable";
		NUT.w2popup.open({
			title: '_Import',
			width: 700,
			height: 600,
			body: '<div id="'+id+'" class="nut-full"></div>',
			onOpen:function(evt){
				evt.onComplete=function(){
					var div=document.getElementById(id);
					(NUT.w2ui[id]||new NUT.w2form({ 
						name: id,
						fields: fields,
						record:lookup,
						actions: actions
					})).render(div);
				}
			}
		});			
	},
	insertTable: function (table) {
		var cols = [];
		var isGeo = (table.tabletype == "arcgis");
		for (var i = 0; i < table.columns.length; i++) {
			var info=table.columns[i];
			var col={
				columnname: (isGeo ? info.fieldName: info.name),
				alias: (isGeo ? info.label :info.alias),
				seqno: i,
				datatype: (isGeo?"text":info.dataType),
				length: (isGeo?null:info.length),
				isnotnull: (isGeo?null:!info.nullable),
				defaultvalue: (isGeo?null:info.defaultValue),
				siteid: n$.user.siteid
			};
			if (info.inPrimaryKey||(isGeo&&info.fieldName=="OBJECTID")) col.columntype ="key";
			cols.push(col);
		}
		var tbl={
			tablename:table.name,
			alias:table.alias||table.name,
			tabletype: table.tabletype,
			serviceid:SysImportTable.ser.serviceid,
			siteid:n$.user.siteid
		};
		if (isGeo) {
			tbl.maplayer = table.id;
			tbl.url=table.url;
		}
		NUT.ds.insert({ url: NUT.URL + "n_table", data: tbl, returnid:true},function(res2){
			if (res2.success) {
				NUT.notify("Table inserted.", "lime");
				var id = res2.result[0];
				for (var i = 0; i < cols.length; i++) cols[i].tableid = id;
				if (cols.length) {//insert cols
					NUT.ds.insert({ url: NUT.URL + "n_column", data: cols }, function (res3) {
						if (res3.success) NUT.notify(cols.length + " columns inserted.", "lime");
						else NUT.notify("⛔ ERROR: " + res3.result, "red");
					});
				}
			} else NUT.notify("⛔ ERROR: " + res2.result, "red");
		});	
	}
}