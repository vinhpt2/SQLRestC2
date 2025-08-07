var SysAppEngine = {
	run: function (p) {
		if (p.records.length) {
			var app=p.records[0]
			window.open(app.linkurl, "_blank");
		} else NUT.tagMsg("⚠️ No Application selected!", "yellow");
	}
}