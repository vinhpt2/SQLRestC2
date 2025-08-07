var TaoPhuongAn = {
	run: function (p) {
		if (p.records.length) {
			TaoPhuongAn.obj=p.records[0];
			TaoPhuongAn.url = NUT.services[6].url;
			var now=new Date();
			NUT.openDialog({
				title: '📃 <i>Tạo phương án TKCN</i>',
				floating: true,
				width: 630,
				height: 630,
				div: "<table style='margin:auto'><tr><td align='right'>Ngày lập</td><td><input type='date' id='txtNgayLap' class='w2ui-input' value='"+(new Date().toISOString().substring(0,10))+"'/></td><td><button class='w2ui-btn' onclick='TaoPhuongAn.vungTimKiem()'>🔍 Vùng tìm kiếm</button></td></tr><tr><td align='right'>Nội dung</td><td><textarea id='txtNoiDung' class='w2ui-input'></textarea></td><td><button class='w2ui-btn' onclick='NUT.AGMap.layers.LYR_GRAPHICS.removeAll()'>❌ Xóa vùng tìm</button></td></tr></table><table><tr><td>Lực lượng<span style='float:right'><button class='w2ui-btn' onclick='TaoPhuongAn.fromMap()'>➕ Từ bản đồ</button><button class='w2ui-btn' onclick='TaoPhuongAn.fromData()'>➕ Từ dữ liệu</button></span></td><td>Phương tiện <button class='w2ui-btn' onclick='TaoPhuongAn.chonPhuongTien()'>🛩️ Lựa chọn</button></td></tr><tr><td><div id='divLucLuong' style='width:301px;height:400px'></div></td><td><div id='divPhuongTien' style='width:301px;height:400px'></div></td></tr></table>",
				actions: {
					"_Cancel": function () {
						NUT.closeDialog();
					}, "_Create": function () {
						if(TaoPhuongAn.lucluongs&&TaoPhuongAn.lucluongs.length){
							NUT.prompt({ label: "Tên phương án" },function(evt){
								if(evt.detail.value){
									var data={
										tenPhuongAn:evt.detail.value,
										noiDung:txtNoiDung.value,
										ngayLap:txtNgayLap.valueAsDate,
										idKhuVuc:TaoPhuongAn.obj.id,
										idSuCo:TaoPhuongAn.obj.idSuCo
									}
									NUT.ds.insert({ url:TaoPhuongAn.url+"data/PhuongAnTimKiem", data: data, returnid:true }, function (res) {
										if (res.success) {
											var newid=res.result[0];
											var pa_ll=[];
											for(var i=0;i<TaoPhuongAn.lucluongs.length;i++)
												pa_ll.push({idPhuongAn:newid,idLucLuong:TaoPhuongAn.lucluongs[i]});
											NUT.ds.insert({ url:TaoPhuongAn.url+"data/PhuongAn_LucLuong", data: pa_ll}, function (res2) {
												if (!res2.success)NUT.notify("🛑 ERROR: " + res2.result, "red");
											});
											if(TaoPhuongAn.phuongtiens&&TaoPhuongAn.phuongtiens.length){
												var pa_pt=[];
												for(var j=0;j<TaoPhuongAn.phuongtiens.length;j++)
													pa_pt.push({idPhuongAn:newid,idPhuongTien:TaoPhuongAn.phuongtiens[j]});
												NUT.ds.insert({ url:TaoPhuongAn.url+"data/PhuongAn_PhuongTien", data: pa_pt}, function (res3) {
													if (!res3.success)NUT.notify("🛑 ERROR: " + res3.result, "red");
												});
											}
											
											NUT.notify("Record inserted.", "lime");
										} else NUT.notify("🛑 ERROR: " + res.result, "red");
									});
								} else NUT.notify("⚠️ Nhập tên cho dự án!", "yellow");
							});
						}else NUT.notify("⚠️ Phương án không có lực lượng TKCN!", "yellow");
					}
				},
				onOpen(evt){
					evt.onComplete=function(){
						(NUT.w2ui["gridLucLuong"]||new NUT.w2grid({
							name: "gridLucLuong",
							recid:"id",
							records:[],
							columns: [ 
								{ field: "id", text: "ID", size: "50px", sortable: true, resizable: true },
								{ field: "maLucLuong", text: "Mã lực lượng", size: "100px", sortable: true, resizable: true },
								{ field: "tenLucLuong", text: "Tên lực lượng", size: "150px", sortable: true, resizable: true }
							]
						})).render(divLucLuong);
						(NUT.w2ui["gridPhuongTien"]||new NUT.w2grid({
							name: "gridPhuongTien",
							recid:"id",
							records:[],
							columns: [ 
								{ field: "id", text: "ID", size: "50px", sortable: true, resizable: true },
								{ field: "maPhuongTien", text: "Mã phương tiện", size: "50px", sortable: true, resizable: true },
								{ field: "tenPhuongTien", text: "Tên phương tiện", size: "130px", sortable: true, resizable: true },
								{ field: "loaiPhuongTien", text: "Loại phương tiện", size: "70px", sortable: true, resizable: true }
							]
						})).render(divPhuongTien);
					}
				},
				onClose(){
					NUT.AGMap.layers["LYR_GRAPHICS"].removeAll();
					NUT.AGMap.view.graphics.removeAll();
				}
			});
		}else NUT.notify("No record selected!", "yellow");
	},
	vungTimKiem:function(){
		var lyr=NUT.AGMap.layers["LYR_GRAPHICS"];
		var val=JSON.parse(TaoPhuongAn.obj.vungTimKiem);
		var area=new NUT.AGMap.Graphic({
			geometry:{
				type:"polygon",
				rings:[val]
			},
			symbol:NUT.AGMap.SYMBOL.polygon
		});
		lyr.add(area);
		
		val=JSON.parse(TaoPhuongAn.obj.diemDenD1);
		var g={
			geometry:{
				type:"point",
				x:val[0][0],
				y:val[0][1]
			},
			symbol:NUT.AGMap.SYMBOL.point
		}
		lyr.add(g);
		
		val=JSON.parse(TaoPhuongAn.obj.diemDenD2);
		g={
			geometry:{
				type:"point",
				x:val[0][0],
				y:val[0][1]
			},
			symbol:NUT.AGMap.SYMBOL.point
		}
		lyr.add(g);
		
		val=JSON.parse(TaoPhuongAn.obj.toaDoLKP);
		g={
			geometry:{
				type:"point",
				x:val[0][0],
				y:val[0][1]
			},
			symbol:NUT.AGMap.SYMBOL.point
		}
		lyr.add(g);
		
		NUT.AGMap.view.goTo(area.geometry.extent.expand(1.5));
	},
	chonPhuongTien:function(){
		if(TaoPhuongAn.lucluongs&&TaoPhuongAn.lucluongs.length){
			NUT.ds.select({url:TaoPhuongAn.url+"data/PhuongTienTKCN",orderby:"idLucLuong",where:["idLucLuong","in",TaoPhuongAn.lucluongs]},function(res){
				if(res.success){
					var items=[], lookup={};
					for(var i=0;i<res.result.length;i++){
						var rec=res.result[i];
						items.push({
							id:rec.id,
							text:rec.maPhuongTien + ' - ' + rec.tenPhuongTien + " - " + rec.loaiPhuongTien
						});
						lookup[rec.id]=rec;
					}
					var id="dlgPhuongTienTKCN";
					NUT.openDialog({
						title: '🛩️ <i>Lựa chọn phương tiện TKCN</i>',
						modal:false,
						width: 360,
						height: 660,
						div: '<div id="' + id + '" class="nut-full"></div>',
						onOpen: function (evt) {
							evt.onComplete = function () {
								(NUT.w2ui[id] || new NUT.w2form({
									name:id,
									fields: [
										{ field: 'phuongtiens', type: 'checks', html: { label: "<b> Chọn phương tiện TKCN</b>", span:-1 }, options:{items:items} }
									],
									actions: {
										"_Close": function () {
											NUT.closeDialog();
										},
										"_Ok": function () {
											var data=[];var phuongtiens=this.record.phuongtiens;
											for(var i=0;i<phuongtiens.length;i++){
												var recid=phuongtiens[i];
												data.push(lookup[recid]);
											}
											var grid=NUT.w2ui["gridPhuongTien"];
											grid.records=data;
											grid.refresh();
											
											TaoPhuongAn.phuongtiens=phuongtiens;
											NUT.closeDialog();
										}
									},
								})).render(document.getElementById(id));
							}
						}
					});
				}else NUT.notify("🛑 ERROR: " + res.result, "red");
			})
		}else NUT.notify("⚠️ Không có lực lượng TKCN nào được chọn!", "yellow");
	},
	fromMap:function(){
		NUT.w2ui["tbrMap"].onClick({object:{id:"circle"}});
		NUT.AGMap.callback=function(res){
			NUT.AGMap.selectByQuery("LYR_LUCLUONG",{geometry:res.geometry},function(res){
				var data=[];
				for(var i=0;i<res.features.length;i++)data.push(res.features[i].attributes);
				var grid=NUT.w2ui["gridLucLuong"];
				grid.records=data;
				grid.refresh();
			});
		}
	},
	fromData:function(){
		var coord=TaoPhuongAn.obj.diemDenD1||TaoPhuongAn.obj.toaDoLKP;
		if(coord){
			coord=JSON.parse(coord);
			var xy=NUT.AGMap.webMercatorUtils.lngLatToXY(coord[0][0],coord[0][1]);
			
			var lyr=NUT.AGMap.layers["LYR_LUCLUONG"];
			lyr.queryFeatures({returnGeometry:true,outFields:["*"],where:"1=1"}).then(function(res){
				var items=[], lookup={};
				for(var i=0;i<res.features.length;i++){
					var feat=res.features[i];
					var attr=feat.attributes;
					var geom=feat.geometry;
					var distance=Math.round(Math.sqrt((geom.x-xy[0])*(geom.x-xy[0])+(geom.y-xy[1])*(geom.y-xy[1])));
					items.push({
						id:attr.id,
						text:attr.maLucLuong + ' - ' + attr.tenLucLuong + " - " + distance.toLocaleString()+"m",
						distance:distance
					});
					lookup[attr.id]=attr;
				}
				items.sort(function(a,b){return a.distance<b.distance});
				var id='dlgLucLuongTKCN';
				NUT.openDialog({
					title: '🧑‍🚒 <i>Lực lượng TKCN</i>',
					modal:false,
					width: 360,
					height: 660,
					div: '<div id="' + id + '" class="nut-full"></div>',
					onOpen: function (evt) {
						evt.onComplete = function () {
							(NUT.w2ui[id] || new NUT.w2form({
								name:id,
								fields: [
									{ field: 'lucluongs', type: 'checks', html: { label: "<b> Chọn lực lượng TKCN</b>", span:-1 }, options:{items:items} }
								],
								actions: {
									"_Close": function () {
										NUT.closeDialog();
									},
									"_Ok": function () {
										var data=[];var lucluongs=this.record.lucluongs;
										for(var i=0;i<lucluongs.length;i++){
											var recid=lucluongs[i];
											data.push(lookup[recid]);
										}
										var grid=NUT.w2ui["gridLucLuong"];
										grid.records=data;
										grid.refresh();
										
										TaoPhuongAn.lucluongs=lucluongs;
										NUT.closeDialog();
									}
								},
							})).render(document.getElementById(id));
						}
					}
				});
			});
		}else NUT.notify("⚠️ Không có dữ liệu điểm đến D1 hoặc vị trí cuối LKP", "yellow");
	}
}