var SetMonitor = {
	X1: 105.163522, X4: 106.078134, Y1: 20.510958, Y4: 21.459775,//ha noi extent
	run: function (p) {
		var a = NUT.createWindowTitle("SetMonitor", divTitle);
		a.innerHTML = "Theo dõi sét";
		a.div.innerHTML = "<div id='divMonTabs'></div><div id='divMonitor' class='nut-full'><table border='1' width='100%' height='90%' style='table-layout: fixed'><caption style='margin:4px'><label for='chkBd' style='float:left' class='nut-label-chk'><input type='checkbox' checked class='w2ui-input' id='chkBd' onchange='SetMonitor.lyr.visible=this.checked'/>Bản đồ</label><label for='cboThoiDiem' id='labThoiDiem 'style='float:center'>Lúc <select id='cboThoiDiem' class='w2ui-input' onchange='SetMonitor.cboThoiDiem_onChange()'></select></label><label for='chkHn' style='float:right' class='nut-label-chk'><input type='checkbox' checked class='w2ui-input' id='chkHn' onchange='SetMonitor.pullSetData()'/>Hà Nội</label></caption><tr><td><div id='tongcuset' align='center'>Tổng số cú sét... <img src='img/wait.gif'/></div><div id='setnguyhiem' align='center'></div></td><td rowspan='3' id='top20'>20 cú sét gần nhất... <img src='img/wait.gif'/></td></tr><tr><td><div id='xuhuongset'>Xu hướng số cú sét... <img src='img/wait.gif'/></div></td></tr><tr><td><div id='thongkeset'>&nbsp;Thống kê... <img src='img/wait.gif'/></div></td></tr></table></div><div id='divDuLieu' class='nut-full'><div id='divFindSet' style='padding:6px'><table style='margin:auto'><tr><td align='right'>Dạng sét&nbsp;</td><td><select id='cboDangSet' class='w2ui-input'><option value=''></option><option value='CG'>Sét xuống đất</option><option value='CP'>Sét trong mây</option></select></td><td>&nbsp;</td><td align='right'><input type='checkbox' id='chkNguyHiem' class='w2ui-input'/></td><td>Nguy hiểm&nbsp;</td></tr><tr><td>&nbsp;</td></tr><tr><td align='right'>Cường độ&nbsp;</td><td><input placeholder='=' class='w2ui-input' id='txtCuongDo'/></td><td>&nbsp;</td><td colspan='2'><button class='w2ui-btn' onclick='SetMonitor.timDuLieuSet()'>🔎 Tìm kiếm </button></td></tr></table></div><div id='divDataSet' class='nut-full'></div></div>";

		(NUT.w2ui['gridDataSet'] || new NUT.w2grid({
			name: 'gridDataSet',
			recid: "OBJECTID",
			multiSelect: true,
			show: {
				footer: true
			},
			columns: [
				{ field: "OBJECTID", text: "OID",info:{icon: 'w2ui-icon-search',style: "float:left"} },
				{ field: "DANGSET", text: "Loại sét"},
				{ field: "CUONGDOSET_D", text: "Cường độ (kA)", render:"float" },
				{ field: "THOIGIAN_CS", text: "Thời gian", render: "datetime" },
				{ field: "MILISECOND", text: "Độ dài (s)", render:"int" },
				{ field: "SAISO_CS", text: "Sai số" }
			],
			showBubble(evt) {
				NUT.AGMap.zoomToSelect(SetMonitor.lyr.id);
			},
			onSelect: function (evt) {
				var selid = (evt.detail.clicked ? evt.detail.clicked.recid || evt.detail.clicked.recids : evt.detail.recid);
				NUT.AGMap.selectByOID(SetMonitor.lyr.id, selid);
			}
		})).render(divDataSet);
		
		divDuLieu.style.display = "none";
		(NUT.w2ui['tabMonTabs'] || new NUT.w2tabs({
			name: 'tabMonTabs',
			active: 'tabHienTai',
			tabs: [
				{ id: 'tabHienTai', text: 'Giám sát' },
				{ id: 'tabDuLieu', text: 'Dữ liệu' }
			],
			onClick(evt) {
				if (evt.target == "tabDuLieu") {
					divDuLieu.style.display = "";
					divMonitor.style.display = "none";
				} else {
					divDuLieu.style.display = "none";
					divMonitor.style.display = "";
					SetMonitor.showDashboard();
				}
			}
		})).render(divMonTabs);

		NUT.AGMap.onInit=function(){	
			var url="https://gis.npt.com.vn/server/rest/services/CuSet_1Ngay/FeatureServer/0";
			var opt = {
				id:"LYR_SETMONITOR",
				url: url,
				minScale:0,
				maxScale:0,
				definitionExpression:"0=1",
				selectable:true,
				popupEnabled:true,
				popupTemplate: {
					title: "Sét #{OBJECTID}",
					content: [
						{
							type: "fields",
							fieldInfos: [
								{ fieldName: "DANGSET", label: "Loại sét"},
								{ fieldName: "CUONGDOSET_D", label: "Cường độ (kA)" },
								{ fieldName: "THOIGIAN_CS", label: "Thời gian" },
								{ fieldName: "MILISECOND", label: "Độ dài (ms)" },
								{ fieldName: "SAISO_CS", label: "Sai số" },
								{ fieldName: "LONG_", label: "Vĩ độ" },
								{ fieldName: "LAT", label: "Kinh độ" }
							]
						}
					]
				},
				renderer: {
					type: "unique-value",
					field: "DANGSET",
					uniqueValueInfos: [
						{
							value: 'CG',
							symbol: {type: "picture-marker",url: "site/5/9/CG.png"},
							label:"Sét xuống đất"
						},
						{
							value: 'CP',
							symbol: {type: "picture-marker",url: "site/5/9/CP.png"},
							label:"Sét trong mây"
						}
					]
				}
			}
			var lyr = new NUT.AGMap.FeatureLayer(opt);
			NUT.AGMap.map.add(lyr);
			NUT.AGMap.layers['LYR_SETMONITOR'] = lyr;
			SetMonitor.lyr=lyr;
			var now=new Date();
			opt = {
				id:"LYR_SETHISTORY",
				title:"Lịch sử sét",
				selectable:true,
				popupEnabled:true,
				source: [],
				spatialReference: { wkid: 4326 },
				fields: [
					{ name: "id", alias: "ID", type: "oid" },
					{ name: "loaiset", alias: "Loại sét", type: "string" },
					{ name: "thoigian", alias: "Thời gian", type: "date" },
					{ name: "giatri", alias: "Giá trị (kA)", type: "single" },
					{ name: "nguyhiem", alias: "Nguy hiểm (<100m)", type: "small-integer" },
					{ name: "hanoi", alias: "Khu vực HN", type: "small-integer" },
					{ name: "lat", alias: "Vĩ độ", type: "single" },
					{ name: "lng", alias: "Kinh độ", type: "single" },
					{ name: "nam", alias: "Năm", type: "small-integer" },
					{ name: "thang", alias: "Tháng", type: "small-integer" },
					{ name: "ngay", alias: "Ngày", type: "small-integer" },
					{ name: "gio", alias: "Giờ", type: "small-integer" },
				],
				objectIdField: "id",
				geometryType: "point",
				popupTemplate: {
					title: "Sét #{id}",
					content: [
						{
							type: "fields",
							fieldInfos: [
								{ fieldName: "loaiset", label: "Loại sét" },
								{ fieldName: "thoigian", label: "Thời gian" },
								{ fieldName: "giatri", label: "Giá trị (kA)" },
								{ fieldName: "nguyhiem", label: "Nguy hiểm (<10m)" },
								{ fieldName: "hanoi", label: "Khu vực HN", },
								{ fieldName: "lat", label: "Vĩ độ" },
								{ fieldName: "lng", label: "Kinh độ" }
							]
						}
					]
				},
				renderer: {
					type: "unique-value",
					field: "loaiset",
					uniqueValueInfos: [
						{
							value: 'CG',
							symbol: {type: "picture-marker",url: "site/5/9/CG20.png"},
							label:"Sét xuống đất"
						},
						{
							value: 'CP',
							symbol: {type: "picture-marker",url: "site/5/9/CP20.png"},
							label:"Sét trong mây"
						}
					]
				},
				featureEffect : {
					filter: {where:"nguyhiem=1"},
					includedEffect: "bloom(3)"
				}
			}
			
			lyr= new NUT.AGMap.FeatureLayer(opt);
			NUT.AGMap.map.add(lyr);
			NUT.AGMap.layers['LYR_SETHISTORY'] = lyr;
			SetMonitor.lyrHistory=lyr;
			
			NUT.AGMap.layers["1981fda77f4-layer-19"].queryFeatures({where:"1=1",returnGeometry:true}).then(function(res){
				SetMonitor.dangerZone=res.features[0].geometry;
				SetMonitor.pullSetData();
				SetMonitor.lyr.featureEffect=SetMonitor.lyrHistory.featureEffect={
					filter: {geometry:SetMonitor.dangerZone},
					includedEffect: "bloom(3)"
				}
			});
			
			setInterval(function () {
				SetMonitor.pullSetData();
			}, 600000);
			
		}
	},
	cboThoiDiem_onChange:function(){
		var now2=new Date(parseInt(cboThoiDiem.value)||SetMonitor.now);
		var stamp2=now2.getFullYear()+"-"+(now2.getMonth()+1)+"-"+now2.getDate()+" "+now2.getHours()+":"+now2.getMinutes()+":"+now2.getSeconds();
		var where="THOIGIAN_CS between TIMESTAMP'"+stamp2+"' and TIMESTAMP'"+SetMonitor.stamp+"'";
		if(chkHn.checked)where+=" AND LONG_ between " + SetMonitor.X1 + " and " + SetMonitor.X4 + " AND LAT between " + SetMonitor.Y1 + " and " + SetMonitor.Y4;
		SetMonitor.lyr.definitionExpression=where;

		SetMonitor.showDashboard();
	},
	pullSetData: function () {
		SetMonitor.now=600000+Math.round(new Date().getTime()/300000)*300000;
		var now=new Date(SetMonitor.now);
		var stamp=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
		SetMonitor.stamp=stamp;
		var now2=new Date(SetMonitor.now-3600000);
		var stamp2=now2.getFullYear()+"-"+(now2.getMonth()+1)+"-"+now2.getDate()+" "+now2.getHours()+":"+now2.getMinutes()+":"+now2.getSeconds();
		var where="THOIGIAN_CS between TIMESTAMP'"+stamp2+"' and TIMESTAMP'"+stamp+"'";
		if(chkHn.checked)where+=" AND LONG_ between " + SetMonitor.X1 + " and " + SetMonitor.X4 + " AND LAT between " + SetMonitor.Y1 + " and " + SetMonitor.Y4;
		SetMonitor.lyr.definitionExpression=where;
		cboThoiDiem.innerHTML="";
		for (var i = 60; i >= 10; i-=10) {
			var opt = document.createElement("option");
			var khoangtg=SetMonitor.now-i*60000;
			opt.value = khoangtg;
			opt.innerHTML = new Date(khoangtg).toLocaleString();
			cboThoiDiem.add(opt);
		}
		
		SetMonitor.showDashboard();
	},
	showDashboard:function () {
		var lyr=SetMonitor.lyr;
		//top 20
		lyr.queryFeatures({where:lyr.definitionExpression,num:20,outFields:["OBJECTID","DANGSET","CUONGDOSET_D","THOIGIAN_CS"],orderByFields:["THOIGIAN_CS DESC"]}).then(function (res) {
			if(res.error)NUT.notify(res.error.message,"red");
			else {
				var line20 = ["<h3>20 cú sét gần nhất</h3>"];
				for (var i = 0; i < res.features.length; i++) {
					var s = res.features[i].attributes;
					line20.push((s.DANGSET=="CP" ? "⚡Sét " : "➖Sét ") + s.CUONGDOSET_D + "kV " + "lúc " + (new Date(s.THOIGIAN_CS).toLocaleString()));
				}
				top20.innerHTML = "<marquee style='height:500px' direction='up' scrollamount='3'>" + line20.join("<br/><br/>") + "</marquee>";
			}
		});
		//CP-CG
		var tk = ["<ul><h3>&nbsp;Thống kê </h3><br/>"];
		var total=0;
		lyr.queryFeatureCount({where:lyr.definitionExpression+" AND DANGSET='CG'"}).then(function (res) {
			tk.push("<img width='20' src='site/5/9/CG.png'/>Sét xuống đất: " + res + " cú");
			total+=res;
			lyr.queryFeatureCount({where:lyr.definitionExpression+" AND DANGSET='CP'"}).then(function (res2) {
				tk.push("<img width='20' src='site/5/9/CP.png'/>Sét trên mây: " + res2 + " cú");
				thongkeset.innerHTML = tk.join("</li><li>") + "</ul><br/>";
				total+=res2;
				tongcuset.innerHTML = "<h2>Tổng số cú sét</h2><br/><h1 style='color:#007AFF;cursor:pointer' onclick='NUT.w2ui.tabMonTabs.click(\"tabDuLieu\");chkNguyHiem.checked=false;SetMonitor.timDuLieuSet()'>" + total + "</h1>";
			})
		});
		//DANGER
		lyr.queryFeatureCount({where:lyr.definitionExpression,geometry:SetMonitor.dangerZone}).then(function(count){
			setnguyhiem.innerHTML = "<br/><h2>Sét gần đường dây (<100m)</h2><br/><h1 style='color:#007AFF;cursor:pointer' onclick='NUT.w2ui.tabMonTabs.click(\"tabDuLieu\");chkNguyHiem.checked=true;SetMonitor.timDuLieuSet()'>" + count + "</h1>";
		});
			
		SetMonitor.now=600000+Math.round(new Date().getTime()/300000)*300000;
		var now=new Date(SetMonitor.now);
		var stamp=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
		var now1=new Date(SetMonitor.now-600000);
		var stamp1=now1.getFullYear()+"-"+(now1.getMonth()+1)+"-"+now1.getDate()+" "+now1.getHours()+":"+now1.getMinutes()+":"+now1.getSeconds();
		var where=(chkHn.checked?" AND LONG_ between " + SetMonitor.X1 + " and " + SetMonitor.X4 + " AND LAT between " + SetMonitor.Y1 + " and " + SetMonitor.Y4:"");
		lyr.queryFeatureCount({where:"THOIGIAN_CS between TIMESTAMP'"+stamp1+"' and TIMESTAMP'"+stamp+"'"+where}).then(function(res1){
			var now2=new Date(SetMonitor.now-1200000);
			var stamp2=now2.getFullYear()+"-"+(now2.getMonth()+1)+"-"+now2.getDate()+" "+now2.getHours()+":"+now2.getMinutes()+":"+now2.getSeconds();
			lyr.queryFeatureCount({where:"THOIGIAN_CS between TIMESTAMP'"+stamp2+"' and TIMESTAMP'"+stamp1+"'"+where}).then(function(res2){
				var now3=new Date(SetMonitor.now-1800000);
				var stamp3=now3.getFullYear()+"-"+(now3.getMonth()+1)+"-"+now3.getDate()+" "+now3.getHours()+":"+now3.getMinutes()+":"+now3.getSeconds();
				lyr.queryFeatureCount({where:"THOIGIAN_CS between TIMESTAMP'"+stamp3+"' and TIMESTAMP'"+stamp2+"'"+where}).then(function(res3){
					var now4=new Date(SetMonitor.now-2400000);
					var stamp4=now4.getFullYear()+"-"+(now4.getMonth()+1)+"-"+now4.getDate()+" "+now4.getHours()+":"+now4.getMinutes()+":"+now4.getSeconds();
					lyr.queryFeatureCount({where:"THOIGIAN_CS between TIMESTAMP'"+stamp4+"' and TIMESTAMP'"+stamp3+"'"+where}).then(function(res4){
						var now5=new Date(SetMonitor.now-3000000);
						var stamp5=now5.getFullYear()+"-"+(now5.getMonth()+1)+"-"+now5.getDate()+" "+now5.getHours()+":"+now5.getMinutes()+":"+now5.getSeconds();
						lyr.queryFeatureCount({where:"THOIGIAN_CS between TIMESTAMP'"+stamp5+"' and TIMESTAMP'"+stamp4+"'"+where}).then(function(res5){
							var now6=new Date(SetMonitor.now-3600000);
							var stamp6=now6.getFullYear()+"-"+(now6.getMonth()+1)+"-"+now6.getDate()+" "+now6.getHours()+":"+now6.getMinutes()+":"+now6.getSeconds();
							lyr.queryFeatureCount({where:"THOIGIAN_CS between TIMESTAMP'"+stamp6+"' and TIMESTAMP'"+stamp5+"'"+where}).then(function(res6){
								Highcharts.chart(xuhuongset, {
									chart: {
										width: 250,
										height: 250
									},
									credits: {
										enabled: false
									},
									title: {
										text: 'Xu hướng cú sét'
									},
									yAxis: {
										title: {
											text: 'Số cú sét'
										}
									},
									series: [{
										data: [res6,res5,res4,res3,res2,res1]
									}]
								});
							});
						});
					});
				});
			});
		});
	},
	timDuLieuSet: function (where) {
		var where = [SetMonitor.lyr.definitionExpression];
		if (cboDangSet.value) where.push("DANGSET='" + cboDangSet.value+"'");
		if (chkNguyHiem.checked) where.push("OBJECTID ID IN("+SetMonitor.dangerIds+")");
		if(txtCuongDo.value)where.push("CUONGDOSET_D"+txtCuongDo.value);
					
		SetMonitor.lyr.queryFeatures({where:where.join(" and "),outFields:["*"]}).then(function (res) {
			var records = [];
			for (var i = 0; i < res.features.length; i++) {
				records.push(res.features[i].attributes);
			}
			NUT.w2ui.gridDataSet.records = records;
			NUT.w2ui.gridDataSet.total=records.length
			NUT.w2ui.gridDataSet.refresh();
		});
	}
}