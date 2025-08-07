$().w2field("addType", "image", function (options) {
	var that = this;
	this.el.className = "nut-link";
	this.el.style.color = "brown";
	this.el.readOnly = true;

	if (!options.conf.isreadonly) {
		this.form = w2ui["divform_" + options.conf.tabid] || {};
		//this.form=w2ui["divnew_"+options.conf.tabid]||{};
		this.buttonUpload = document.createElement("button");
		this.buttonUpload.innerHTML = " 📂 ";
		this.buttonUpload.onclick = function () {
			that.file.click();
		}
		this.el.parentNode.appendChild(this.buttonUpload);
		this.canvas = document.createElement("canvas");
		this.canvas.width = 500;
		this.file = document.createElement("input");
		this.file.multiple = true;
		this.file.type = "file";
		this.file.onchange = function (evt) {
			var ctx = that.canvas.getContext("2d");
			var data = new FormData();
			var i = 0, paths = this.files;
			var img = new Image();
			img.onload = function () {
				that.canvas.height = Math.round(this.height * that.canvas.width / this.width);
				ctx.drawImage(this, 0, 0, that.canvas.width, that.canvas.height);
				that.canvas.toBlob(function (blob) {
					data.append("anh", blob);
					if (++i == paths.length) {
						NUT_DS.upload({ url: "api/image", data: data }, function (fileNames) {
							if (fileNames.length) {
								if (that.form.original == null) that.form.original = NUT.clone(that.form.record);
								that.form.record[that.el.name] = JSON.stringify(fileNames);
								that.form.refresh(that.el.name);
							} else NUT.tagMsg("Upload image error.", "yellow!");
						});
					} else {
						img.src = URL.createObjectURL(paths[i]);
					}
				});
			}

			img.src = URL.createObjectURL(paths[0]);
		}
	}
	this.el.onclick = function () {
		if (this.value) {
			try {
				var paths = JSON.parse(this.value);
				for (var i = 0; i < paths.length; i++)window.open("image/" + paths[i]);
			} catch (e) {
				window.open("upload/" + this.value);
			}
		}
	}
});
