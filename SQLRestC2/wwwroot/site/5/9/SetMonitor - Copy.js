var SetMonitor = {
	X1: 105.163522, X4: 106.078134, Y1: 20.510958, Y4: 21.459775,//ha noi extent
	run: function (p) {
		var a = NUT.createWindowTitle("SetMonitor", divTitle);
		a.innerHTML = "Theo dõi sét";
		a.div.innerHTML = "<div id='divMonTabs'></div><div id='divMonitor' class='nut-full'><table border='1' width='100%' height='90%' style='table-layout: fixed'><caption id='cap'><span style='float:left'><input type='checkbox' checked class='w2ui-input' id='chkBd' onchange='SetMonitor.lyr.visible=this.checked'/><label for='chkBd'>Bản đồ</label></span><label for='cboThoiDiem' id='labThoiDiem'>Thời điểm </label><select id='cboThoiDiem' class='w2ui-input' onchange='SetMonitor.cboThoiDiem_onChange()'></select><span style='float:right'><input type='checkbox' checked class='w2ui-input' id='chkHn' onchange='SetMonitor.pullSetData()'/><label for='chkHn'>Hà Nội</label></span></caption><tr><td><div id='tongcuset' align='center'>Tổng số cú sét... <img src='img/wait.gif'/></div><div id='setnguyhiem' align='center'></div></td><td rowspan='3' id='top20'>20 cú sét gần nhất... <img src='img/wait.gif'/></td></tr><tr><td><div id='xuhuongset'>Xu hướng số cú sét... <img src='img/wait.gif'/></div></td></tr><tr><td><div id='thongkeset'>&nbsp;Thống kê... <img src='img/wait.gif'/></div></td></tr></table></div><div id='divDuLieu' class='nut-full'><div id='divFindSet'></div><div id='divDataSet' class='nut-full'></div></div>";
		var khoangtgs = [10, 20, 30, 40, 50, 60];
		var loaisets=['CP','CG'];
		var nguyhiems=[0,1];
		var uInfos = [];
		for (var i = 0; i < nguyhiems.length; i++) {
			var nguyhiem=nguyhiems[i];
			for (var j = 0; j < loaisets.length; j++) {
				var loaiset=loaisets[j]
				for (var k = 0; k < khoangtgs.length; k++) {
					var khoangtg=khoangtgs[k];
					uInfos.push({
						value: [nguyhiem,loaiset,khoangtg].toString(),
						symbol: {
							type: "picture-marker",
							url: "site/5/9/"+(nguyhiem?loaiset+".gif":loaiset+khoangtg+".png")
						}
					});
				}
			}
		}
		(NUT.w2ui['frmFindSet'] || new NUT.w2form({
			name: 'frmFindSet',
			fields: [
				{ field: 'loaiset', type: 'select', html: { label: "Loại sét", column: 0, span: 3 }, options: { items: [{ id: 'CP', text: "Sét xuống đất" }, { id: 'CG', text: "Sét trong mây" }]} } ,
				{ field: 'nguyhiem', type: 'checkbox', html: { label: "Nguy hiểm (<10m)", column: 1, span: 3 } },
				{ field: 'hanoi', type: 'select', html: { label: "Khu vực HN", column: 0, span: 3 }, options: { items: [{id:1,text:"HN-1"},{id:2,text:"HN-2"},{id:3,text:"HN-3"},{id:4,text:"HN-4"},{id:5,text:"HN-5"},{id:6,text:"HN-6"},{id:7,text:"HN-7"},{id:8,text:"HN-8"},{id:9,text:"HN-9"}]}},
				{ field: 'khoangtg', type: 'select', html: { label: "Khoảng TG", column: 1, span: 3 }, options: { items: [{id:10,text:"10 phút"},{id:20,text:"20 phút"},{id:30,text:"30 phút"},{id:40,text:"40 phút"},{id:50,text:"50 phút"},{id:60,text:"60 phút"}] } } 
			],
			actions: {
				"_Search": function () {
					var rec = this.record;
					var where = [];
					if (rec.loaiset) where.push("loaiset='" + rec.loaiset+"'");
					if (rec.nguyhiem) where.push("nguyhiem=1");
					if(rec.hanoi)where.push("hanoi="+rec.hanoi);
					SetMonitor.timDuLieuSet(where.length ? where.join(" and ") : "1=1");
				}
			}
		})).render(divFindSet);
		(NUT.w2ui['gridDataSet'] || new NUT.w2grid({
			name: 'gridDataSet',
			recid: "OBJECTID",
			multiSelect: true,
			show: {
				footer: true
			},
			columns: [
				{ field: "OBJECTID", text: "OID" },
				{ field: "loaiset", text: "Loại sét"},
				{ field: "giatri", text: "Giá trị (kA)", render:"int" },
				{ field: "thoigian", text: "Thời gian", render: "datetime" },
				{ field: "nguyhiem", text: "Nguy hiểm" },
				{ field: "hanoi", text: "Khu vực HN" }
			],
			contextMenu: [
				{ id: 'zoom', text: 'Zoom To', icon: 'nut-img-find' }
			],
			onContextMenuClick(evt) {
				if(evt.detail.menuItem.id=="zoom")NUT.AGMap.zoomToSelect(SetMonitor.lyr.id);
			},
			onSelect: function (evt) {
				evt.onComplete = function () {
					NUT.AGMap.selectByOID(SetMonitor.lyr.id, this.getSelection());
				}
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

					SetMonitor.timDuLieuSet();
				} else {
					divDuLieu.style.display = "none";
					divMonitor.style.display = "";
					SetMonitor.showDashboard();
				}
			}
		})).render(divMonTabs);

		setTimeout( function(){
			NUT.AGMap.map.loadAll().then(function () {
				
				var opt = {
					id:"LYR_SETMONITOR",
					source: [],
					spatialReference: { wkid: 4326 },
					fields: [
						{ name: "OBJECTID", alias: "Object ID", type: "oid" },
						{ name: "loaiset", alias: "Loại sét", type: "string" },
						{ name: "thoigian", alias: "Thời gian", type: "date" },
						{ name: "giatri", alias: "Giá trị (kA)", type: "integer" },
						{ name: "khoangtg", alias: "Khoảng TG (phút)", type: "integer" },
						{ name: "nguyhiem", alias: "Nguy hiểm (<10m)", type: "small-integer" },
						{ name: "hanoi", alias: "Khu vực HN", type: "small-integer" },
						{ name: "lat", alias: "Vĩ độ", type: "single" },
						{ name: "lng", alias: "Kinh độ", type: "single" }
					],
					OBJECTIDField: "OBJECTID",
					geometryType: "point",
					popupTemplate: {
						title: "Sét #{OBJECTID}",
						content: [
							{
								type: "fields",
								fieldInfos: [
									{ fieldName: "loaiset", label: "Loại sét" },
									{ fieldName: "thoigian", label: "Thời gian" },
									{ fieldName: "giatri", label: "Giá trị (kA)" },
									{ fieldName: "khoangtg", label: "Khoảng TG (phút)" },
									{ fieldName: "nguyhiem", label: "Nguy hiểm (<10m)" },
									{ fieldName: "hanoi", label: "Khu vực HN" },
									{ fieldName: "lat", label: "Vĩ độ" },
									{ fieldName: "lng", label: "Kinh độ" }
								]
							}
						]
					},
					renderer: {
						type: "unique-value",
						field:"nguyhiem",
						field2: "loaiset",
						field3:"khoangtg",
						fieldDelimiter:",",
						defaultSymbol: {
							type: "picture-marker",
							url: "site/5/9/set.png"
						},
						uniqueValueInfos: uInfos
					}
				}
				SetMonitor.lyr = new NUT.AGMap.FeatureLayer(opt);
				NUT.AGMap.map.add(SetMonitor.lyr);
				NUT.AGMap.layers['LYR_SETMONITOR'] = SetMonitor.lyr;
				var now=new Date();
				var opt2 = {
					id:"LYR_SETHISTORY",
					title:"Lịch sử sét",
					selectable:true,
					source: [],
					spatialReference: { wkid: 4326 },
					fields: [
						{ name: "id", alias: "ID", type: "oid" },
						{ name: "loaiset", alias: "Loại sét", type: "string" },
						{ name: "thoigian", alias: "Thời gian", type: "date" },
						{ name: "giatri", alias: "Giá trị (kA)", type: "integer" },
						{ name: "nguyhiem", alias: "Nguy hiểm (<10m)", type: "small-integer" },
						{ name: "hanoi", alias: "Khu vực HN", type: "small-integer" },
						{ name: "lat", alias: "Vĩ độ", type: "single" },
						{ name: "lng", alias: "Kinh độ", type: "single" },
						{ name: "nam", alias: "Năm", type: "small-integer" },
						{ name: "thang", alias: "Tháng", type: "small-integer" },
						{ name: "ngay", alias: "Ngày", type: "small-integer" },
						{ name: "gio", alias: "Giờ", type: "small-integer" },
					],
					OBJECTIDField: "id",
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
						field: "nguyhiem",
						field2: "loaiset",
						fieldDelimiter:",",
						defaultSymbol: {
							type: "picture-marker",
							url: "site/5/9/CP30.png"
						},
						uniqueValueInfos: [
							{
								value: [0,'CP'],
								symbol: {
									type: "picture-marker",
									url: "site/5/9/CP30.png"
								}
							},
							{
								value: [0,'CG'],
								symbol: {
									type: "picture-marker",
									url: "site/5/9/CG30.png"
								}
							},
							{
								value: [1,'CP'],
								symbol: {
									type: "picture-marker",
									url: "site/5/9/CP.gif"
								}
							},
							{
								value: [1,'CG'],
								symbol: {
									type: "picture-marker",
									url: "site/5/9/CG.gif"
								}
							}
						]
					},
					featureReduction: {
						type: "cluster",
						clusterRadius: "100px",
						clusterMinSize: "24px",
						clusterMaxSize: "64px",
						labelingInfo: [{
							deconflictionStrategy: "none",
							labelExpressionInfo: {
							  expression: "$feature.cluster_count"
							},
							symbol: {
							  type: "text",
							  color: "white",
							  font: {
								weight: "bold",
								family: "Noto Sans",
								size: "13px"
							  },
							  haloColor: "black",
							  haloSize: 1
							},
							labelPlacement: "center-center",
						}]
					}
				}
				
				SetMonitor.lyrHistory = new NUT.AGMap.FeatureLayer(opt2);
				NUT.AGMap.map.add(SetMonitor.lyrHistory);
				NUT.AGMap.layers['LYR_SETHISTORY'] = SetMonitor.lyrHistory;
				
				setTimeout(function(){
					NUT.AGMap.layers["1976e4f2672-layer-8"].queryFeatures({
						where:"1=1",
						returnGeometry:true
					}).then(function(res){
						if(res.error)NUT.notify(res.error.message,"red");
						else{
							SetMonitor.nguyhiemArea=res.features[0].geometry;
							NUT.loading(a.div);
							SetMonitor.pullSetData();

							setInterval(function () {
								NUT.loading(a.div);
								NUT.AGMap.refreshToken(function(){
									SetMonitor.pullSetData();
								});
							}, 600000);
						}
					});
				},2000);
			});
		},5000);
	},
	cboThoiDiem_onChange:function(){
		SetMonitor.lyr.definitionExpression=cboThoiDiem.value?"khoangtg="+cboThoiDiem.value:"1=1";
		TinMonitor.showDashboard();
	},
	pullSetData: function () {
		SetMonitor.now=600000+Math.round(new Date().getTime()/300000)*300000;
		var now=new Date(SetMonitor.now);
		var stamp=now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
		var now2=new Date(SetMonitor.now-3600000);
		var stamp2=now2.getFullYear()+"-"+(now2.getMonth()+1)+"-"+now2.getDate()+" "+now2.getHours()+":"+now2.getMinutes()+":"+now2.getSeconds();
		var url="https://gis.npt.com.vn/server/rest/services/CuSet_1Ngay/FeatureServer/0/query?f=json&outfields=OBJECTID,LONG_,LAT,THOIGIAN_CS,CUONGDOSET_D,DANGSET&orderByFields=THOIGIAN_CS desc&where=THOIGIAN_CS>TIMESTAMP'"+stamp2+"' and THOIGIAN_CS<=TIMESTAMP'"+stamp+"'";
		if(chkHn.checked)url+="&geometry={xmin:"+SetMonitor.X1+",ymin:"+SetMonitor.Y1+",xmax:"+SetMonitor.X4+",ymax:"+SetMonitor.Y4+",spatialReference:{wkid:4326}}";
		var data=[];
		NUT.AGMap.getAll({ url:url ,alldata:data, token:false}, function (res) {
			if(res.error)NUT.notify(res.error.message,"red");
			else {
				cboThoiDiem.innerHTML = "<option value=''>6 giờ trước</option>";
				for (var i = 10; i <= 60; i+=10) {
					var opt = document.createElement("option");
					opt.value = i;
					opt.innerHTML = new Date(SetMonitor.now-i*60000).toLocaleString();
					cboThoiDiem.add(opt);
				}
				
				SetMonitor.set=data;
				NUT.loading();
				SetMonitor.showDashboard();
			}
		});
	},
	showDashboard:function () {
		var x1 = SetMonitor.X1, x4 = SetMonitor.X4, y1 = SetMonitor.Y1, y4 = SetMonitor.Y4;
		var dx=(x4-x1)/3, dy=(y4-y1)/3;
		var x2=x1+dx, x3=x4-dx, y2=y1+dy, y3=y4-dy;


		SetMonitor.nguyhiem = 0;
		var hnData = [];
		var sum = {10: 0, 20: 0, 30: 0, 40: 0, 50: 0, 60: 0 };
		var line20 = ["<h3>20 cú sét gần nhất</h3>"];
		var graphics = [];
		for (var j = 0; j < SetMonitor.set.length; j++) {
			var data=SetMonitor.set[j]
			for (var i = 0; i < data.length; i++) {
				var s = data[i].attributes;
				var thoigian=new Date(s.THOIGIAN_CS);
				if (j==0 && i<20)line20.push((s.DANGSET=="CP" ? "⚡Sét " : "➖Sét ") + s.CUONGDOSET_D + " kV " + "lúc " + thoigian.toLocaleString());
				
				var kvHn=0;
				if(x1 < s.LONG_ && s.LONG_ <= x2 && y1 < s.LAT && s.LAT <= y2) kvHn=1;
				else if(x2 < s.LONG_ && s.LONG_ <= x3 && y1 < s.LAT && s.LAT <= y2)kvHn=2;
				else if(x3 < s.LONG_ && s.LONG_ <= x4 && y1 < s.LAT && s.LAT <= y2)kvHn=3;
				else if(x1 < s.LONG_ && s.LONG_ <= x2 && y2 < s.LAT && s.LAT <= y3) kvHn=4;
				else if(x2 < s.LONG_ && s.LONG_ <= x3 && y2 < s.LAT && s.LAT <= y3) kvHn=5;
				else if(x3 < s.LONG_ && s.LONG_ <= x4 && y2 < s.LAT && s.LAT <= y3) kvHn=6;
				else if(x1 < s.LONG_ && s.LONG_ <= x2 && y3 < s.LAT && s.LAT <= y4) kvHn=7;
				else if(x2 < s.LONG_ && s.LONG_ <= x3 && y3 < s.LAT && s.LAT <= y4) kvHn=8;
				else if(x3 < s.LONG_ && s.LONG_ <= x4 && y3 < s.LAT && s.LAT <= y4) kvHn=9;
				var khoangtg=10*Math.floor((SetMonitor.now-s.THOIGIAN_CS)/600000+1);
				
				sum[khoangtg]++;
				var nguyhiem = 0;
				if (kvHn) {
					var pnt = new NUT.AGMap.Point({ type: "point", x: s.LONG_, y: s.LAT, spatialReference: { wkid: 4326 } });
					if (SetMonitor.nguyhiemArea.contains(pnt)) {
						SetMonitor.nguyhiem++;
						nguyhiem=1;
					}

				}

				graphics.push({
					geometry: {
						type: "point",
						x: s.LONG_,
						y: s.LAT
					},
					attributes: {
						OBJECTID: s.OBJECTID,
						loaiset:s.DANGSET,
						thoigian: s.THOIGIAN_CS,
						giatri: s.CUONGDOSET_D,
						khoangtg: khoangtg,
						nguyhiem: nguyhiem,
						hanoi: kvHn,
						lat:s.LAT,
						lng:s.LONG_
					}
				});
				if (kvHn){
					hnData.push({
						loaiset:s.DANGSET,
						giatri:s.CUONGDOSET_D,
						nguyhiem:nguyhiem,
						hanoi:kvHn,
						lat:s.LAT*10000,
						lng:s.LONG_*10000,
						nam:thoigian.getFullYear(),
						thang:thoigian.getMonth()+1,
						ngay:thoigian.getDate(),
						gio:thoigian.getHours(),

					});
				}
			}
		}
		SetMonitor.lyr.queryObjectIds({where:"1=1"}).then(function(res){
			SetMonitor.lyr.applyEdits({
				deleteFeatures: res,
				addFeatures: graphics
			});
		});
		SetMonitor.sum = sum;


		var tk = ["<ul><h3>&nbsp;Thống kê </h3><br/>"];
		var sum = SetMonitor.sum;
		var data = [];var total=0;
		for (key in sum) if (sum.hasOwnProperty(key)) {
			data.push(sum[key]);
			total+=sum[key];
			tk.push("<img width='20' src='site/5/9/CP" + key + ".png'/>" + key + " phút trước: " + sum[key] + " cú");
		}
		thongkeset.innerHTML = tk.join("</li><li>") + "</ul><br/>";
		setnguyhiem.innerHTML = "<h2>Sét gần đường dây (<100m)</h2><br/><h1>" + SetMonitor.nguyhiem + "</h1>";
		tongcuset.innerHTML = "<h2>Tổng số cú sét</h2><br/><h1>" + total + "</h1>";

		top20.innerHTML = "<marquee style='min-height:300px' direction='up' scrollamount='3'>" + line20.join("<br/><br/>") + "</marquee>";

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
				data: data
			}]
		});
		//if (n$.user.userid == 490&&hnData.length) {//setmonitor user
		//	NUT.ds.insert({url:NUT.services[6].url+"data/sethistory",data:hnData});
		//}
	},
	timDuLieuSet: function (where) {
		var query = {
			outFields: "*",
			where:where||"1=1"
		}
		SetMonitor.lyr.queryFeatures(query).then(function (res) {
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