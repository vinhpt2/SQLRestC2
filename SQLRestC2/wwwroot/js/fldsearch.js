
$().w2field("addType", "search", function (options) {
	var that = this;
	this.form = w2ui["divform_" + options.conf.tabid] || {};
	this.formNew = w2ui["divnew_" + options.conf.tabid] || {};
	this.el.style.width = "80px";
	this.labelSearch = document.createElement("label");
	if (!options.conf.isreadonly) {
		this.butSearch = document.createElement("button");
		this.butSearch.innerHTML = " ... ";
		this.butSearch.onclick = function (evt) {
			var fldconf = that.options.conf;
			_context.ctrlSearch = that;
			NUT_DS.select({ url: NUT_URL + "sv_window_tab", where: [["windowtype", "=", "search"], ["tableid", "=", fldconf.foreigntableid]] }, function (res) {
				if (res.length) {
					NUT_DS.select({ url: NUT_URL + "syscache", where: ["windowid", "=", res[0].windowid] }, function (caches) {
						if (caches.length) {
							conf = NUT.configWindow(zipson.parse(caches[0].config));
							conf.tabid = conf.windowid;
							_context.winconfig[conf.windowid] = conf;
							var div = NUT.openDialog(conf.windowname);
							buildWindow(div, conf, 0, function (code, records) {
								if (code == "OK" && records.length) {
									var rec = records[0];
									if (_context.ctrlSearch.el.value !== rec[fldconf.columnkey]) {
										_context.ctrlSearch.el.value = rec[fldconf.columnkey];
										_context.ctrlSearch.labelSearch.innerHTML = (fldconf.columncode == fldconf.columndisplay || fldconf.columncode == fldconf.columnkey) ? rec[fldconf.columndisplay] : rec[fldconf.columncode] + "-" + rec[fldconf.columndisplay];
										_context.ctrlSearch.form.record[fldconf.fieldname] = rec[fldconf.columnkey];
										_context.ctrlSearch.formNew.record[fldconf.fieldname] = rec[fldconf.columnkey];
										updateChildFields(fldconf, rec);
									}
								}
								NUT.closeDialog();
							});
						}
					});
				}
			});
		};
		this.el.parentNode.appendChild(this.butSearch);
	}
	this.el.parentNode.appendChild(this.labelSearch);
	this.el.onchange = function (evt) {
		//evt.stopImmediatePropagation();
		if (evt instanceof Event) {
			var value = this.value;
			var fldconf = that.options.conf;
			_context.ctrlSearch = that;
			var p = { url: fldconf.foreigntable };

			if (isNaN(parseInt(value)))
				//p.where=["or",[fldconf.columncode,"like","*"+value+"*"],[fldconf.columnkey,"like","*"+value+"*"]];
				p.where = [fldconf.columnkey, "like", "*" + value + "*"];
			else
				p.where = ["or", [fldconf.columncode, "=", value], [fldconf.columnkey, "=", value]];

			if (fldconf.fieldtype == "search") NUT_DS.select(p, function (res) {
				if (res.length) {
					if (res.length == 1) {
						var rec = res[0];
						_context.ctrlSearch.el.value = rec[fldconf.columnkey];
						_context.ctrlSearch.labelSearch.innerHTML = (fldconf.columncode == fldconf.columndisplay || fldconf.columncode == fldconf.columnkey) ? rec[fldconf.columndisplay] : rec[fldconf.columncode] + "-" + rec[fldconf.columndisplay];
						_context.ctrlSearch.form.record[fldconf.fieldname] = rec[fldconf.columnkey];
						_context.ctrlSearch.formNew.record[fldconf.fieldname] = rec[fldconf.columnkey];
						updateChildFields(fldconf, rec);
					} else {
						var items = [];
						for (var i = 0; i < res.length; i++)
							items.push({ id: i, text: (fldconf.columncode == fldconf.columndisplay || fldconf.columncode == fldconf.columnkey ? res[i][fldconf.columndisplay] : res[i][fldconf.columncode] + "-" + res[i][fldconf.columndisplay]), tag: res[i] });
						$(_context.ctrlSearch.labelSearch).w2menu({
							items: items,
							onSelect: function (evt) {
								_context.ctrlSearch.el.value = res[evt.item.id][fldconf.columnkey];
								_context.ctrlSearch.labelSearch.innerHTML = evt.item.text;
								_context.ctrlSearch.form.record[fldconf.fieldname] = res[evt.item.id][fldconf.columnkey];
								_context.ctrlSearch.formNew.record[fldconf.fieldname] = res[evt.item.id][fldconf.columnkey];
								updateChildFields(fldconf, res[evt.item.id]);
							}
						});
					}
				} else {
					_context.ctrlSearch.el.value = "";
					_context.ctrlSearch.labelSearch.innerHTML = "-/-";
					_context.ctrlSearch.form.record[fldconf.fieldname] = "";
					_context.ctrlSearch.formNew.record[fldconf.fieldname] = "";
					updateChildFields(fldconf, {});
				}
			});
		}
	};
});
