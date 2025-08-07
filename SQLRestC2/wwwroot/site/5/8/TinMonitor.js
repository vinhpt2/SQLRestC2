var TinMonitor = {
	X1: 105.163522, X4: 106.078134, Y1: 20.510958, Y4: 21.459775,//ha noi extent
	run: function (p) {
		TinMonitor.url = NUT.services[6].url;
		var dmMucDo=NUT.domains[1088].items;
		var a = NUT.createWindowTitle("TinMonitor", divTitle);
		a.innerHTML = "Theo dõi Sự cố";
		a.div.innerHTML = "<div id='divMonTabs'></div><div id='divSuCo' class='nut-full'><table border='1' width='100%' height='90%' style='table-layout: fixed'><caption id='cap'><span style='float:left'><input type='checkbox' checked class='w2ui-input' id='chkBd' onchange='TinMonitor.lyr.visible=this.checked'/><label for='chkBd'>Bản đồ</label></span><label for='cboMucDo'>Mức độ </label>"+NUT.outerCboHTML(dmMucDo,"cboMucDo","Mức độ")+"</caption><tr><td><div id='tongsuco' align='center'>Tổng số sự cố... <img src='img/wait.gif'/></div><div id='sucokhan' align='center'></div></td><td rowspan='3' id='top20'>Tin báo sự cố... <img src='img/wait.gif'/></td></tr><tr><td><div id='mucdosuco'>Mức độ sự cố... <img src='img/wait.gif'/></div></td></tr><tr><td><div id='thongkesuco'>&nbsp;Thống kê... <img src='img/wait.gif'/></div></td></tr></table></div><div id='divDienBien' class='nut-full'><table border='1' width='100%' height='90%' style='table-layout: fixed'><caption id='cap'><label for='cboSuCo'>Sự cố </label><select id='cboSuCo' class='w2ui-input'></select></caption><tr><td style='height:220px'><div id='divVungTimKiem' class='nut-full'></div></td><td rowspan='3' id='topDienbien'></td></tr><tr><td id='formsuco' align='center' style='height:200px'></td></tr><tr><td align='center'><table border='1'><thead><th>Mã</th><th>Tên lực lượng</th><th>Điện thoại</th></thead><tbody id='formlucluong'></tbody></table></td></tr></table></div>";
		cboMucDo.onchange=TinMonitor.cboMucDo_onChange;
		cboSuCo.onchange=TinMonitor.cboSuCo_onChange;

		divDienBien.style.display = "none";
		(NUT.w2ui['tabMonTabs'] || new NUT.w2tabs({
			name: 'tabMonTabs',
			active: 'tabSuCo',
			tabs: [
				{ id: 'tabSuCo', text: 'Sự cố' },
				{ id: 'tabDienBien', text: 'Diễn biến' }
			],
			onClick(evt) {
				if (evt.target == "tabSuCo") {
					divSuCo.style.display = "";
					divDienBien.style.display = "none";
				} else {
					divSuCo.style.display = "none";
					divDienBien.style.display = "";
					
					TinMonitor.cboSuCo_onChange();
				}
			}
		})).render(divMonTabs);

		NUT.AGMap.onInit=function(){
			var opt = {
				id:"LYR_SUCO",
				source: [],
				spatialReference: { wkid: 4326 },
				fields: [
					{ name: "id", alias: "ID", type: "oid" },
					{ name: "mucDo", alias: "Mức độ", type: "string" },
					{ name: "thoiGianXayRa", alias: "Thời gian xảy ra", type: "date" },
					{ name: "tenSuCo", alias: "Tên sự cố", type: "string" },
					{ name: "tenTauBay", alias: "Tên tàu bay", type: "string" },
					{ name: "duongBay", alias: "Đường bay", type: "string" },
					{ name: "diaDiemSuCo", alias: "Địa điểm", type: "string" },
					{ name: "ghiChu", alias: "Ghi chú", type: "string" }
				],
				OBJECTIDField: "id",
				geometryType: "point",
				popupTemplate: {
					title: "Sự cố #{id}",
					content: [
						{
							type: "fields",
							fieldInfos: [
								{ fieldName: "mucDo", label: "Mức độ" },
								{ fieldName: "thoiGianXayRa", label: "thoiGianXayRa" },
								{ fieldName: "tenSuCo", label: "Tên sự cố" },
								{ fieldName: "tenTauBay", label: "Tên tàu bay" },
								{ fieldName: "duongBay", label: "Đường bay" },
								{ fieldName: "diaDiemSuCo", label: "Địa điểm" },
								{ fieldName: "ghiChu", label: "Ghi chú" }
							]
						}
					]
				},
				renderer: {
					type: "unique-value",
					field:"mucDo",
					defaultSymbol: {
						type: "picture-marker",
						url: "site/5/8/gray.png",
						height:'24px',width:'24px'
					},
					uniqueValueInfos: [
						{
							value: 'INCERFA',
							symbol: {
								type: "picture-marker",
								url: "site/5/8/blue.gif",
								height:'24px',width:'24px'
							}
						},{
							value: 'ALERFA',
							symbol: {
								type: "picture-marker",
								url: "site/5/8/yellow.gif",
								height:'24px',width:'24px'
							}
						},{
							value: 'DETRESFA',
							symbol: {
								type: "picture-marker",
								url: "site/5/8/red.gif",
								height:'24px',width:'24px'
							}
						}
					]
				}
			}
			TinMonitor.lyr = new NUT.AGMap.FeatureLayer(opt);
			NUT.AGMap.map.add(TinMonitor.lyr);
			NUT.AGMap.layers['LYR_SUCO'] = TinMonitor.lyr;
			
			var opt2 = {
				id:"LYR_LUCLUONG",
				source: [],
				spatialReference: { wkid: 4326 },
				fields: [
					{ name: "id", alias: "ID", type: "oid" },
					{ name: "maLucLuong", alias: "Mã lực lượng", type: "string" },
					{ name: "tenLucLuong", alias: "Tên lực lượng", type: "string" },
					{ name: "soLienLac", alias: "Số liên lạc", type: "string" },
					{ name: "loaiLucLuong", alias: "Loại lực lượng", type: "string" },
					{ name: "diaDiem", alias: "Địa điểm", type: "string" },
					{ name: "soLuongNhanSu", alias: "Số lượng nhân sự", type: "integer" },
					{ name: "trangThietBi", alias: "Trang thiết bị", type: "string" },
					{ name: "trangThai", alias: "Trạng thái", type: "string" },
					{ name: "nhiemVuPhuTrach", alias: "Nhiệm vụ phụ trách", type: "string" }
				],
				OBJECTIDField: "id",
				geometryType: "point",
				popupTemplate: {
					title: "Lực lượng #{id}",
					content: [
						{
							type: "fields",
							fieldInfos: [
								{ fieldName: "maLucLuong", label: "Mã lực lượng" },
								{ fieldName: "tenLucLuong", label: "Tên lực lượng" },
								{ fieldName: "soLienLac", label: "Số liên lạc" },
								{ fieldName: "loaiLucLuong", label: "Loại lực lượng" },
								{ fieldName: "diaDiem", label: "Địa điểm" },
								{ fieldName: "soLuongNhanSu", label: "Số lượng nhân sự" },
								{ fieldName: "trangThietBi", label: "Trang thiết bị" },
								{ fieldName: "trangThai", label: "Trạng thái" },
								{ fieldName: "nhiemVuPhuTrach", label: "Nhiệm vụ phụ trách" }
							]
						}
					]
				},
				renderer: {
					type: "simple",
					symbol: {
						type: "simple-marker",
						color:"magenta",
						style: "triangle",
						size:8,
						outline:null
					}
				}
			}
			var lyr2=new NUT.AGMap.FeatureLayer(opt2);
			NUT.AGMap.map.add(lyr2);
			NUT.AGMap.layers['LYR_LUCLUONG'] = lyr2;
			TinMonitor.pullLucLuongData();
			TinMonitor.pullSuCoData();

			setInterval(function () {
				TinMonitor.pullSuCoData();
			}, 600000);
			
			TinMonitor.view=new NUT.AGMap.MapView({
				container: divVungTimKiem,
				map: {basemap: "topo-vector"},
				popupEnabled: false,
				ui: { components: [] }
			});
		}
		
	},
	pullLucLuongData: function () {
		NUT.ds.select({url:TinMonitor.url+"data/LucLuongTKCN"},function(res){
			if(res.success){
				var graphics=[];
				for(var i=0;i<res.result.length;i++){
					var rec=res.result[i];
					if(rec.toaDo){
						var xy=JSON.parse(rec.toaDo);
						if(xy.length){
							graphics.push({
								geometry: {
									type: "point",
									x: xy[0][0],
									y: xy[0][1]
								},
								attributes: rec
							});
						}
					}
				}
				NUT.AGMap.layers['LYR_LUCLUONG'].applyEdits({
					addFeatures: graphics
				});
			}else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	},
	pullSuCoData: function () {
		NUT.ds.select({url:TinMonitor.url+"data/SuCoKhanNguy",where:[["status","<>","DRAFT"],["status","<>","FINISH"]]},function(res){
			if(res.success){
				var graphics=[];
				for(var i=0;i<res.result.length;i++){
					var rec=res.result[i];
					if(rec.viTriCuoiCung){
						var xy=JSON.parse(rec.viTriCuoiCung);
						if(xy.length){
							graphics.push({
								geometry: {
									type: "point",
									x: xy[0][0],
									y: xy[0][1]
								},
								attributes: rec
							});
						}
					}
				}
				TinMonitor.lyr.queryObjectIds({where:"1=1"}).then(function(res){
					TinMonitor.lyr.applyEdits({
						deleteFeatures: res,
						addFeatures: graphics
					}).then(function(){
						NUT.loading();
						TinMonitor.showDashboard();
					});
				});
			}else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	},
	cboSuCo_onChange:function(){
		NUT.ds.select({url:TinMonitor.url+"data/KhuVucTimKiem",where:["idSuCo","=",cboSuCo.value]},function(res){
			if(res.success&&res.result.length){
				var coords=res.result[0].vungTimKiem;
				if(coords){
					var geom=new NUT.AGMap.Polygon({rings:[JSON.parse(coords)]});
					if(geom){
						TinMonitor.view.graphics.removeAll();
						TinMonitor.view.graphics.add({
							geometry: geom,
							symbol: NUT.AGMap.SYMBOL.polygon
						});
						TinMonitor.view.goTo(geom.extent.expand(1.5));
					}
				}
			}
		});
		NUT.ds.select({url:TinMonitor.url+"data/DienBien",orderby:"thoiGianBatDau desc",where:["idSuCo","=",cboSuCo.value]},function(res){
			if(res.success){
				var lines = ["<h3>Diễn biến</h3>"];
				for(var i=0;i<res.result.length;i++){
					var rec=res.result[i];
					lines.push(" 🏃 " + (rec.dienBien||"-/-") + " từ " + (rec.nguonTin||"-/-") + " lúc " + (rec.thoiGianBatDau?rec.thoiGianBatDau.toLocaleString():"-/-"));
				}
				NUT.ds.select({url:TinMonitor.url+"data/TinBaoSuCo",orderby:"thoiGianXayRa desc",where:["idSuCo","=",cboSuCo.value]},function(res2){
					if(res2.success){
						lines.push("<br/><h3>Tin bổ sung</h3>");
						for(var j=0;j<res2.result.length;j++){
							var rec2=res2.result[j];
							lines.push(" ✉️ " + (rec.moTaTinBao||"-/-") + " từ " + (rec.nguonTinBao||"-/-") + " lúc " + (rec.thoiGianXayRa?rec.thoiGianXayRa.toLocaleString():"-/-"));
						}
					}else NUT.notify("🛑 ERROR: " + res2.result, "red");
					topDienbien.innerHTML = "<marquee style='height:300px' direction='up' scrollamount='3'>" + lines.join("<br/><br/>") + "</marquee>";
				});
			}else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
		
		NUT.ds.select({url:TinMonitor.url+"data/SuCoKhanNguy",where:["id","=",cboSuCo.value]},function(res){
			if(res.success&&res.result.length){
				var rec=res.result[0];
				formsuco.innerHTML="<table><caption><h3>"+rec.tenSuCo+"</h3></caption><tbody cellpadding='5'><tr><td align='right'><b>Vị trí cuối: </b></td><td>"+(rec.viTriCuoiCung?JSON.parse(rec.viTriCuoiCung)[0]:"-/-")+"</td></tr><tr><td align='right'><b>Tàu bay: </b></td><td>"+(rec.tenTauBay||"-/-")+"</td></tr><tr><td align='right'><b>Đường bay: </b></td><td>"+(rec.duongBay||"-/-")+"</td></tr><tr><td align='right'><b>Số hành khách: </b></td><td>"+(rec.soHanhKhach||"-/-")+"</td></tr><tr><td align='right'><b>Mức độ: </b></td><td>"+(rec.mucDo||"-/-")+"</td></tr><tr><td align='right'><b>Thời gian: </b></td><td>"+(rec.thoiGianXayRa?rec.thoiGianXayRa.toLocaleString():"-/-")+"</td></tr><tr><td align='right'><b>Địa điểm: </b></td><td>"+(rec.diaDiemXaRa||"-/-")+"</td></tr></tbody></table>";
			}
		});
		NUT.ds.select({url:TinMonitor.url+"data/PhuongAnTimKiem",select:"id",orderby:"id desc",where:["idSuCo","=",cboSuCo.value]},function(res2){
			if(res2.success&&res2.result.length){
				var idPhuongAn=res2.result[0].id;
				NUT.ds.select({url:TinMonitor.url+"data/pall_pa_v",where:["idPhuongAn","=",idPhuongAn]},function(res){
					if(res.success){
						formlucluong.innerHTML="";
						for(var i=0;i<res.result.length;i++){
							var rec=res.result[i];
							var row=formlucluong.insertRow();
							row.innerHTML="<td align='center'>"+(rec.maLucLuong||"-/-")+"</td><td align='center'>"+(rec.tenLucLuong||"-/-")+"</td><td align='center'>"+(rec.soLienLac||"-/-")+"</td>";
						}
					}else NUT.notify("🛑 ERROR: " + res.result, "red");
				});
			}
		});
	},
	cboMucDo_onChange:function(){
		TinMonitor.lyr.definitionExpression=cboMucDo.value?"mucDo='"+cboMucDo.value+"'":"1=1";
		TinMonitor.showDashboard();
	},
	showDashboard:function () {
		TinMonitor.lyr.queryFeatures({where:"1=1",orderByFields:["thoiGianXayRa desc"]}).then(function(res){
			var sum={INCERFA:0,ALERFA:0,DETRESFA:0,Other:0};
			cboSuCo.innerHTML="";
			for(var i=0;i<res.features.length;i++){
				var rec=res.features[i].attributes;
				if(rec.mucDo){
					sum[rec.mucDo]++;
					
					var opt = document.createElement("option");
					opt.value = rec.id;
					opt.innerHTML = rec.tenSuCo;
					cboSuCo.add(opt);
				}else sum.Other++;
			}
			var data = [];var total=0;
			var tk = ["<ul><h3>&nbsp;Thống kê </h3><br/>"];
			var colors={INCERFA:"blue",ALERFA:"yellow",DETRESFA:"red",Other:"gray"};
			for (key in sum) if (sum.hasOwnProperty(key)) {
				data.push({name:key,y:sum[key],sliced:key=="DETRESFA",color:colors[key]});
				total+=sum[key];
				tk.push("<img width='20' src='site/5/8/" + key + ".png'/>&nbsp;" + key + ": " + sum[key]);
			}
			tongsuco.innerHTML = "<h2>Tổng số sự cố</h2><br/><h1>" + total + "</h1><br/>";
			sucokhan.innerHTML = "<h2>Sự cố khẩn nguy<br/>(DETRESFA)</h2><br/><h1>" + sum.DETRESFA + "</h1>";
			thongkesuco.innerHTML = tk.join("</li><li>") + "</ul><br/>";
			Highcharts.chart(mucdosuco, {
				chart: {
					type: 'pie',
					width: 250,
					height: 250
				},
				credits: {
					enabled: false
				},
				title: {
					text: 'Mức độ sự cố'
				},
				plotOptions: {
					pie: {
						dataLabels: [{
							enabled: false
						},{
							enabled: true,
							distance: -30,
							format: "{point.percentage:.1f}%"
						}]
					}
				},
				series: [{
					data: data
				}]
			});
		});
		NUT.ds.select({url:TinMonitor.url+"data/TinBaoSuCo",orderby:"thoiGianXayRa desc",where:["or",["status","=","URGENT"],["status","=","CHECK"]]},function(res){
			if(res.success){
				var line20 = ["<h3>Tin báo khẩn nguy</h3>"];
				for(var i=0;i<res.result.length;i++){
					var rec=res.result[i];
					line20.push("<img width='20' src='site/5/8/"+rec.status+".png'/> Tin báo " + (rec.moTaTinBao||"-/-") + " tàu bay " + (rec.tenTauBay||"-/-") + " lúc " + (rec.thoiGianXayRa?rec.thoiGianXayRa.toLocaleString():"-/-"));
					
				}
				top20.innerHTML = "<marquee style='min-height:300px' direction='up' scrollamount='3'>" + line20.join("<br/><br/>") + "</marquee>";
			}else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	},
	showDienBien:function(idSuCo){
		NUT.ds.select({url:TinMonitor.url+"data/DienBien",orderby:"thoiGianBatDau desc",where:["idSuCo","=",idSuCo]},function(res){
			if(res.success){
				var lines = ["<h3>Diễn biến</h3>"];
				for(var i=0;i<res.result.length;i++){
					var rec=res.result[i];
					lines.push("🏃 " + rec.dienBien + " lúc " + (rec.thoiGianBatDau?rec.thoiGianBatDau.toLocaleString():"-/-"));
				}
				topDienbien.innerHTML = "<marquee style='min-height:300px' direction='up' scrollamount='3'>" + lines.join("<br/><br/>") + "</marquee>";
			}else NUT.notify("🛑 ERROR: " + res.result, "red");
		});
	}
}