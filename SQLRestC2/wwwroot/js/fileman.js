export class FMan {
	static ID = "tree_Attach";
	static showAttach(url,base,root) {
		FMan.base = base;
		FMan.url=url;
		FMan.root=root;
		var opt = {
			name: FMan.ID,
			topHTML: "<table><tr><td><input placeholder='" + NUT.w2utils.lang("_Search") + "' class='w2ui-input'/></td><td><button id='attaCreateFolder' class='nut-but-helper' title='Create Folder' onclick='NUT.FMan.attaCreateFolder_onClick()'>&nbsp;📁&nbsp;</button></td><td style='background-image:url(\"img/upload.png\");background-repeat:no-repeat;background-position:center'><input id='attaFile' type='file' style='width:40px;height:40px;opacity:0' onchange='NUT.FMan.attaFile_onChange()' title='Upload File'/></td></tr></table>",
			bottomHTML: "<small style='float:right' id='attaInfo'>" + this.base + "</small>",
			onClick: function (evt) {
				var node = evt.object;
				var tree = this;
				if (node.icon == "nut-file-folder") {
					if (node.nodes && node.nodes.length) attaInfo.innerHTML = node.nodes.length + " file(s)";
					else FMan.loadFolderNodes(node.id, function (nodes) {
						node.expanded = true;
						tree.add(node, nodes);
						attaInfo.innerHTML = node.nodes.length + " file(s)";
					});
				}else {
					var a = NUT.createWindowTitle(node.id, divAttach);
					if(a){
						FMan.previewFile(a.div,node);
						a.innerHTML=node.id
					}
				}
			}
		}
		var tree = (NUT.w2ui[FMan.ID] || new NUT.w2sidebar(opt));
		FMan.loadFolderNodes("", function (nodes) {
			tree.nodes = nodes;
			NUT.openDialog({
				title: "_Attach",
				width: 1000,
				height: 660,
				showMax: true,
				resizable: true,
				div: '<table class="nut-full"><tr><td style="width:260px"><div  class="nut-full" id="' + FMan.ID + '"></div></td><td><div class="nut-win-title" id="divAttach"></div></td></tr></table>',
				onOpen: function (evt) {
					evt.onComplete = function () {
						tree.render(document.getElementById(FMan.ID));
					}
				},
				actions: {
					"_Close": function () { NUT.closeDialog() },
					"_Save": FMan.saveAttaContent,
					"_Preview": function () {
						if(n$.windiv&&n$.windiv.tag)window.open(FMan.root+FMan.base+"/"+n$.windiv.tag.id);
						else NUT.notify("⚠️ No file selected!", "yellow");
					}
				}
			});

			
		});
	}
	static saveAttaContent=function(){
		if(n$.windiv&&n$.windiv.tag){
			var txt=n$.windiv.firstChild;
			if(txt instanceof HTMLTextAreaElement){
				var node=n$.windiv.tag;
				var tree = node.sidebar;
				var path = node.tag;
				NUT.prompt({label:"Update file", value:node.text}, function (evt) {
					var name=evt.detail.value;
					if (name) {
						var callback = function (overwrite) {
							var data = new FormData();
							data.append(name, new Blob([txt.value]));
							var url = FMan.url + FMan.base + "?f=file";
							if (path) url += "&d=" + path;
							NUT.ds.post({ url: url, data: data }, function (res) {
								if (res.success) {
									if (!overwrite) {
										var ext = name.substring(name.lastIndexOf(".") + 1);
										var id = path + name;
										tree.add(node.parent, { id: id, text: name, icon: "nut-file-" + (NUT.FILE_EXT.includes("." + ext) ? ext : "file"), tag: path, count: "<a onclick='event.stopPropagation();NUT.FMan.deleteFile(\"" + id + "\")' title='Delete'>➖</a>" });
									}
									NUT.notify("File is saved!", "lime");
								} else NUT.notify("⛔ ERROR: " + res.result, "red");
							});
						}
						if (tree.get(path + name)) {
							evt.onComplete=function(){
								NUT.confirm("<span>⚠️ File '" + name + "' already exist. Overwrite?</span>", function (awnser) {
									if (awnser == "Yes"||awnser == "yes") callback(true);
								});
							}
						} else callback();
					} else NUT.notify("⚠️ Enter file name!", "yellow");
				});
			}else NUT.notify("⚠️ File type is not support edit!", "yellow");
		}else NUT.notify("⚠️ No File selected!", "yellow");
	}
	
	static previewFile(div, node) {
		var path=node.id;
		NUT.ds.get({ url: FMan.url+ FMan.base + "?d=" + path }, function (res) {
			if (res.success) {
				attaInfo.innerHTML = res.total + " byte(s)";
				var ext = path.substring(path.lastIndexOf("."));
				var ext2 = path.substring(path.lastIndexOf(".")+1);
				var url2=FMan.root+FMan.base+"/"+path;
				div.tag=node;
				if (NUT.TEXT_EXT.includes(ext)) {
					if (res.total <= 10485760) fetch(url2).then(function (res) {//10MB
						if (res.ok) {
							res.text().then(function (val) {
								div.innerHTML='<textarea class="nut-full">'+val+'</textarea>';
							});
						} else NUT.notify("⛔ ERROR: " + res.status, "red");
					}); else NUT.notify("⚠️ Cannot preview. File too big (>20M)!", "yellow");
				} else {
					div.innerHTML='<a class="nut-link" style="float:right" href="'+url2+'" download>&nbsp;Download&nbsp;</a>';
					div.style.backgroundImage="url('"+(NUT.IMAGE_EXT.includes(ext)?url2:"img/file/"+(NUT.DOC_EXT.includes(ext)?ext2:"file")+"32.png")+"')";
					div.style.backgroundRepeat="no-repeat";
					div.style.backgroundPosition="center";
				}
			} else NUT.notify("⛔ ERROR: " + res.status, "red");
		});
	}
	static loadFolderNodes(path, callback) {
		NUT.ds.get({ url: FMan.url+FMan.base + "?d=" + path }, function (res) {
			var nodes = [];
			if (res.success) {
				for (var i = 0; i < res.result.dirs.length; i++) {
					var rec = res.result.dirs[i];
					var name = rec.substring(rec.lastIndexOf("/") + 1, rec.length);
					var id = path + name + "/";
					nodes.push({ id: id, text: name, icon: "nut-file-folder", tag: path, count: "<a onclick='event.stopPropagation();NUT.FMan.deleteFile(\"" + id + "\")' title='Delete'>➖</a>" });
				}
				for (var i = 0; i < res.result.files.length; i++) {
					var rec = res.result.files[i];
					var name = rec.substring(rec.lastIndexOf("/") + 1, rec.length);
					var ext = rec.substring(rec.lastIndexOf(".") + 1);
					var id = path + name;
					nodes.push({ id: id, text: name, icon: "nut-file-" + (NUT.FILE_EXT.includes("." + ext) ? ext : "file"), tag: path, count: "<a onclick='event.stopPropagation();NUT.FMan.deleteFile(\"" + id + "\")' title='Delete'>➖</a>" });
				}
			}
			callback(nodes);
		});
	}
	static attaCreateFolder_onClick = function () {
		NUT.prompt({ label: "Create folder", value: "new_folder" }, function (name) {
			if (name) {
				var tree = NUT.w2ui[NUT.FMan.ID];
				var node = tree.get(tree.selected);
				var isFolder = (node && node.icon == "nut-file-folder");
				var path = isFolder ? node.id : (node ? node.tag : "");
				var id = path + name + "/";
				if (tree.get(id)) NUT.notify("⚠️ Folder '" + name + "' already exist!", "yellow");
				else {
					NUT.ds.get({ url: NUT.FMan.url + NUT.FMan.base + "?d=" + id, method: "POST" }, function (res) {
						if (res.success) {
							tree.add(isFolder||node.icon == "nut-img-app" ? node : (node ? node.parent : null), { id: id, text: name, icon: "nut-file-folder", tag: path, count: "<a onclick='event.stopPropagation();NUT.FMan.deleteFile(\"" + id + "\")' title='Delete'>➖</a>" });
							NUT.notify("Folder created!", "lime");
						} else NUT.notify("⛔ ERROR: " + res.result, "red");
					});
				}
			} else NUT.notify("⚠️ Enter folder name!", "yellow");
		});
	}
	static attaFile_onChange = function () {
		var file = attaFile.files[0];
		if (file) {
			NUT.prompt({ label: "Upload file", value: file.name }, function (name) {
				if (name) {
					var tree = NUT.w2ui[FMan.ID];
					var node = tree.get(tree.selected);
					var isFolder = (node && node.icon == "nut-file-folder");
					var path = isFolder ? node.id : (node ? node.tag : "");
					var id = path + name;
					var callback = function (replace) {
						var data = new FormData();
						data.append(name, file);
						var url = FMan.url + FMan.base + "?f=file";
						if (path) url += "&d=" + path;
						NUT.ds.post({ url: url, data: data }, function (res) {
							if (res.success) {
								if (replace) tree.onClick({ object: node });
								else {
									var ext = name.substring(name.lastIndexOf(".") + 1);
									tree.add(isFolder||node.icon == "nut-img-app"? node : (node ? node.parent : null), { id: id, text: name, icon: "nut-file-" + (NUT.FILE_EXT.includes("." + ext) ? ext : "file"), tag: path, count: "<a onclick='event.stopPropagation();NUT.FMan.deleteFile(\"" + id + "\")' title='Delete'>➖</a>" });
								}
								NUT.notify("File is " + (replace ? "replaced!" : "uploaded!"), "lime");
							} else NUT.notify("⛔ ERROR: " + res.result, "red");
						});
					}
					if (tree.get(id)) {
						NUT.confirm("<span>⚠️ File '" + name + "' already exist. Replace?</span>", function (awnser) {
							if (awnser == "Yes"||awnser == "yes") callback(true);
						});
					} else callback();
				} else NUT.notify("⚠️ Enter file name to upload!", "yellow");
			});
		}
	}
	static deleteFile = function (id) {
		var tree = NUT.w2ui[FMan.ID];
		var node = tree.get(id);
		if (node.nodes && node.nodes.length) NUT.notify("⚠️ Folder is not empty!", "yellow");
		else NUT.confirm("<span>⚠️ Delete file/folder '" + node.text + "'?</span>", function (awnser) {
			if (awnser == "Yes"||awnser == "yes") NUT.ds.get({ url: FMan.url + FMan.base + "?d=" + id, method: "DELETE" }, function (res) {
				if (res.success) {
					tree.remove(id);
					NUT.notify("File/folder deleted!", "lime");
				} else NUT.notify("⛔ ERROR: " + res.result, "red");
			});
		});
	}
}