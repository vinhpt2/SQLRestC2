var SysCacheWindow = {
	run: function (p) {
		//p = {records: [{ windowid: 3,windowname:"Application" }]}
		if(p.records.length){
			var win=p.records[0];
			var cache={};
			NUT.confirm('Apply cache and deploy Window?',function(evt){
				if(evt=="yes"){
					cache.window=[];
					for(var i=0;i<NUT.ERD.window.length;i++)
						cache.window.push(win[NUT.ERD.window[i]]);
					if (win.execname) SysCacheWindow.updateWindowCache(win.appid, win.windowid,cache);
					else SysCacheWindow.cacheTabs(win.appid,win.windowid,cache);
				}
			});
		} else NUT.notify("⚠️ No Window selected!","yellow");
	},
	cacheTabs:function(appid,windowid,cache){
		NUT.ds.select({ url: NUT.URL + "n_tab", orderby: "tablevel,seqno", where: ["windowid", "=", windowid] }, function (res) {
			if (res.success) {
				var tabs = res.result;
				cache.tabs=[];
				for(var i=0;i<tabs.length;i++){
					cache.tabs[i]=[];
					for(var j=0;j<NUT.ERD.tab.length;j++){
						var key=NUT.ERD.tab[j];
						cache.tabs[i].push(tabs[i][key]);
					}
				}
				SysCacheWindow.cacheFields(appid,windowid,cache);
			} else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	},
	cacheFields:function(appid,windowid,cache){
		NUT.ds.select({url:NUT.URL+"nv_field_column",orderby:"tabid,fieldgroup,seqno",where:["windowid","=",windowid]},function(res){
			if (res.success) {
				var fields = res.result;
				cache.fields=[];
				for(var i=0;i<fields.length;i++){
					cache.fields[i] = [];
					for (var j = 0; j < NUT.ERD.field.length; j++){
						var key=NUT.ERD.field[j];
						cache.fields[i].push(fields[i][key]);
					}
				}
				SysCacheWindow.cacheMenus(appid,windowid,cache);
			} else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	},
	cacheMenus:function(appid,windowid,cache){
		NUT.ds.select({ url: NUT.URL + "n_menu", orderby: "seqno", where: [["windowid", "=", windowid], ["menutype", "=", "tool"]] }, function (res) {
			if (res.success) {
				cache.menus = [];
				var menus = res.result;
				for (var i = 0; i < menus.length; i++){
					var menu = menus[i];
					cache.menus[i]=[];
					for(var j=0;j<NUT.ERD.menu.length;j++)
						cache.menus[i].push(menu[NUT.ERD.menu[j]]);
				}
				SysCacheWindow.updateWindowCache(appid,windowid,cache);
			} else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	},
	updateWindowCache: function (appid,windowid, cache) {
		NUT.ds.select({ url: NUT.URL + "n_cache", where: ["windowid", "=", windowid] }, function (res) {
			if (res.success) {
				var para = { url: NUT.URL + "n_cache", where: ["windowid", "=", windowid], data: { configjson: zipson.stringify(cache) } };
				var callback = function (res) {
					if (res.success)NUT.notify("Window's cache updated.", "lime");
					else NUT.notify("🛑 ERROR: " + res.result, "red");
				};
				if (res.result.length) NUT.ds.update(para, callback);
				else {
					para.data.windowid = windowid;
					para.data.appid = appid;
					para.data.siteid = n$.user.siteid;

					NUT.ds.insert(para, callback);
				}
			}
		});
	}
}