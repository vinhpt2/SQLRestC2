var SysAddMissField={
	run:function(p){
		if(p.records.length){
			var tab=p.records[0];
			NUT.confirm('Add missing fields for tab '+tab.tabname+'?',function(evt){
				if(evt=="yes"){
					SysAddMissField.addMissField(tab);
				}
			});
		} else NUT.notify("⚠️ No Tab selected!","yellow");
	},
	
	addMissField:function(tab){
		NUT.ds.select({url:NUT.URL+"n_field",select:"columnid",where:["tabid","=",tab.tabid]},function(res){
			if (res.success) {
				var lookup = {};
				for (var i = 0; i < res.result.length; i++)
					lookup[res.result[i].columnid]=true;
				NUT.ds.select({ url: NUT.URL + "n_column", where: ["tableid", "=", tab.tableid] }, function (res2) {
					if (res2.success) {
						var fields = [];
						for (var i = 0; i < res2.result.length; i++) {
							var col = res2.result[i];
							if (!lookup[col.columnid]) {
								var fld = {
									tabid: tab.tabid,
									fieldname: col.alias || col.columnname,
									fieldtype: col.linktableid || col.domainid ? "select" : col.datatype,
									defaultvalue: col.defaultvalue,
									hideinform: (col.columntype == "key"),
									seqno: col.seqno,
									isrequire: col.isnotnull,
									isreadonly: (col.columntype == "key"),
									isfrozen: (col.columntype == "code"),
									columnid: col.columnid,
									siteid: n$.user.siteid
								};
								if (fld.fieldtype != "data" && fld.fieldtype != "datetime") fld.fieldlength = col.length;
								fields.push(fld);
							}
						}
						if (fields.length) {
							NUT.ds.insert({ url: NUT.URL + "n_field", data: fields }, function (res3) {
								if (res3.success) NUT.notify(fields.length + " fields added.", "lime");
								else NUT.notify("⛔ ERROR: " + res3.result, "red");
							});
						} else NUT.notify("⚠️ No missing field", "yellow");
					} else NUT.notify("⛔ ERROR: " + res2.result, "red");
				});
			} else NUT.notify("⛔ ERROR: " + res.result, "red");
		});
	}
}