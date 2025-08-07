var SysPreviewWindow={
	run:function(p){
		if(p.records.length){
			var win=p.records[0];
			NUT.ds.select({ url: NUT.URL + "n_cache",where:["windowid","=",win.windowid] }, function (res) {
				if (res.success) {
					var cache = res.result[0];
					if (cache) {
						conf = NUT.configWindow(zipson.parse(cache.configjson), cache.layoutjson ? zipson.parse(cache.layoutjson) : null);
						conf.tabs[0].tempWhere = win.whereclause;
						conf.tabid = conf.windowid;
						//conf.windowname = NUT.translate(conf.translate) || conf.windowname;
						//NUT.windows[tag] = conf;

						SysPreviewWindow.showDlgPreview(conf);

					} else NUT.notify("⚠️ No cache for window " + tag, "yellow");
				} else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		} else NUT.notify("⚠️ No Window selected!","yellow");
	},
	showDlgPreview:function(conf){
		var id="div_SysPreviewWindow";
		NUT.w2popup.open({
			title: conf.windowname,
			width: 1000,
			height: 700,
			body: '<div id="'+id+'" class="nut-full"></div>',
			onOpen:function(evt){
				evt.onComplete = function () {
					var win = new NUT.NWin(id);
					var div=document.getElementById(id);
					if (NUT.isObjectEmpty(conf.needCache)) win.buildWindow(div, conf, 0);
					else {
						var needCaches = [];
						for (var key in conf.needCache) {
							if (conf.needCache.hasOwnProperty(key) && !NUT.dmlinks[key]) needCaches.push(conf.needCache[key]);
						}
						win.cacheDmAndOpenWin(div, conf, needCaches, 0);
					}
				}
			}
		});
	}
}