var Com_HrmsHieuChinhSanLuongBA={
	run:function(p){
		var self=this;
		self.urledit=_context.service["hrms"].urledit;
		NUT_DS.getNow(function(now){
			var nam=now.getFullYear();
			var thang=now.getMonth();
			NUT_DS.select({url:self.urledit+"chamcong_v",where:[["manhanvien","=",_context.user.username],["thang","=",thang],["nam","=",nam]]},function(nv){
				if(nv.length){
					self.makhuvuc=nv[0].makhuvuc;
					self.madoitac=nv[0].madoitac;
					NUT_DS.select({url:self.urledit+"chamcong_v",order:"lan",where:[["nam","=",nam],["thang","=",thang],["ngay","=",ngay],["dulieu","=",0],["manhanvien","=","%22"+_context.user.username+"%22"]]},function(res){
						self.lookupData={};
						var html='<table style="margin:auto">';
						if(res.length){
							for(var i=0;i<res.length;i++){
								var data=res[i];
								var lan=data.lan;
								var id=data.idchamcong;
								self.lookupData[id]=data;
								html+='<tr><td><h2 class="nut-link">Lần '+lan+' - <i>'+(data.ca?"Ca gãy":"Ca thẳng")+'</i></h2></td></tr><tr>';
								if(data.thoigianden){
									data.thoigianden=new Date(data["thoigianden"]).toLocaleTimeString();
									html+='<td><div id="divInOut_IN'+lan+'" class="nut-tile" style="background:green" onclick="Com_HrmsCheckInOut.divInOut_InfoIn(this,'+id+')"><img src="client/2/6/in.ico"><br/><b>'+data.madiemban+'<br/>'+data.thoigianden+'</b></div></td>';
									if(data.thoigianve){
										data.thoigianve=new Date(data.thoigianve).toLocaleTimeString();
										html+='<td><div id="divInOut_OUT'+lan+'" class="nut-tile" style="background:orange" onclick="Com_HrmsCheckInOut.divInOut_InfoOut(this,'+id+')"><img src="client/2/6/out.ico"><br/><b>OUT<br/>'+data.thoigianve+'</b></div></td>';
										if(data.thoigiansanluong){
											data.thoigiansanluong=new Date(data["thoigiansanluong"]).toLocaleTimeString();
											html+='<td><div id="divInOut_SL'+lan+'" class="nut-tile" style="background:brown" onclick="Com_HrmsCheckInOut.divInOut_InfoSL(this,'+id+')"><img src="client/2/6/factory.ico"><br/><b>'+(data.bold+data.boldl+data.light+data.lightl+data.trucbach+data.trucbachl+data.hanoipre+data.hanoiprel)+'<br/>'+data.thoigiansanluong+'</b></div></td>';
										}else html+='<td><div id="divInOut_SL'+lan+'" class="nut-tile" style="background:white;border:1px solid;color:brown" onclick="Com_HrmsCheckInOut.divInOutSL_onClick(this,'+id+')"><img src="client/2/6/factory.ico"><br/><b>Check SANLUONG</b></div></td>';
										if(data.ca&&res.length==1)html+='<tr><td><h2 class="nut-link">Lần 2 - <i>'+(data.ca?"Ca gãy":"Ca thẳng")+'</i></h2></td></tr><tr><td><div id="divInOut_IN2" class="nut-tile" style="background:white;border:1px solid;color:green" onclick="Com_HrmsCheckInOut.divInOut_onClick(this,2)"><img src="client/2/6/in.ico"><br/><b>Check IN</b></div></td></tr>';
									}else
										html+='<td><div id="divInOut_OUT'+lan+'" class="nut-tile" style="background:white;border:1px solid;color:orange" onclick="Com_HrmsCheckInOut.doCheckOut(this,'+id+')"><img src="client/2/6/out.ico"><br/><b>Check OUT</b></div></td>';
								}
								html+="</tr>";
							}
						}else{
							html+='<tr><td><h2 class="nut-link">Lần 1</h2></td></tr><tr><td><div id="divInOut_IN1" class="nut-tile" style="background:white;border:1px solid;color:green" onclick="Com_HrmsCheckInOut.divInOut_onClick(this,1)"><img src="client/2/6/in.ico"><br/><b>Check IN</b></div></td></tr>';
						}
						w2popup.open({
							title: '🚪 <i>Check IN-OUT</i> - <b>Ngày #<i>'+nam+'-'+thang+'-'+ngay+'</i></b>',
							modal:true,
							width: 600,
							height: 450,
							body: html+"</table>",
							buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button>'
						});
					});
				} else NUT.tagMsg("Không tìm thấy nhân viên " + _context.user.username, "yellow");
			});
		});
	},
	divInOut_InfoIn:function(elm,id){
		var data=Com_HrmsCheckInOut.lookupData[id];
		w2alert("<table border='1px' cellspacing='0px' style='margin:auto'><caption style='color:green'><b>Check IN <i>#"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian đến:</i></b></td><td>"+data.thoigianden+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr><tr><td><b><i>Ca làm việc:</i></b></td><td>"+(data.ca?"Ca gãy":"Ca thẳng")+"</td></tr></table>");
	},
	divInOut_InfoOut:function(elm,id){
		var data=Com_HrmsCheckInOut.lookupData[id];
		w2alert("<table border='1px' cellspacing='0px' style='margin:auto'><caption style='color:orange'><b>Check OUT <i>#"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian về:</i></b></td><td>"+data.thoigianve+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr><tr><td><b><i>Ca làm việc:</i></b></td><td>"+(data.ca?"Ca gãy":"Ca thẳng")+"</td></tr></table>");
		
	},
	divInOut_InfoSL:function(elm,id){
		var data=Com_HrmsCheckInOut.lookupData[id];
		var sum=data.bold+data.boldl+data.light+data.lightl+data.trucbach+data.trucbachl+data.hanoipre+data.hanoiprel;
		var sum1=data.bold1+data.boldl1+data.light1+data.lightl1+data.trucbach1+data.trucbachl1+data.hanoipre1+data.hanoiprel1;
		var sum2=data.bold2+data.boldl2+data.light2+data.lightl2+data.trucbach2+data.trucbachl2+data.hanoipre2+data.hanoiprel2;
		w2popup.message({
			speed:0,
			width:600,
			height:500,
			body:"<table border='1px' cellspacing='0px' style='text-align:center;margin:auto'><caption style='color:brown'><b>Check sản lượng - <i> Lần "+data.lan+"</i></b></caption><tr><td><b style='color:brown'>Đầu ca</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr><td><b style='color:brown'>"+sum1+"</b></td><td>"+data.bold1+"</td><td>"+data.boldl1+"</td><td>"+data.light1+"</td><td>"+data.lightl1+"</td><td>"+data.trucbach1+"</td><td>"+data.hanoipre1+"</td></tr><tr><td><b style='color:brown'>Nhập NPP</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr><td><b style='color:brown'>"+sum2+"</b></td><td>"+data.bold2+"</td><td>"+data.boldl2+"</td><td>"+data.light2+"</td><td>"+data.lightl2+"</td><td>"+data.trucbach2+"</td><td>"+data.hanoipre2+"</td></tr><tr style='background:yellow'><td><b style='color:brown'>Bán ra</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr style='background:yellow'><td><b style='color:brown'>"+sum+"</b></td><td>"+data.bold+"</td><td>"+data.boldl+"</td><td>"+data.light+"</td><td>"+data.lightl+"</td><td>"+data.trucbach+"</td><td>"+data.hanoipre+"</td></tr></table><br/><table border='1px' cellspacing='0px' style='margin:auto'><caption style='color:brown'><b>Check OUT #<i>"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian:</i></b></td><td>"+data.thoigiansanluong+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.message()">Ok</button>'
		});
	},
	divInOut_onClick:function(elm,lan){
		var items=_context.domain[9].items;
		var cbo=document.createElement("select");
		cbo.id="cboInOut_MaKhuVuc";
		cbo.innerHTML="<option value='"+this.makhuvuc+"' selected>"+_context.domain[9].lookup[this.makhuvuc]+"</option>";
		for(var i=0;i<items.length;i++){
			if(items[i].id!=this.makhuvuc){
				var opt=document.createElement("option");
				opt.value=items[i].id;
				opt.innerHTML=items[i].text;
				cbo.options.add(opt);
			}
		}
		cbo.setAttribute("onchange","Com_HrmsCheckInOut.cboInOut_MaKhuVuc_onChange(this.value)");
		var html='<table style="margin:auto;width:100%"><caption style="background:lime"><b><i>Check IN</i> - Địa điểm</b></caption><tr><td align="right">Khu vực</td><td>'+cbo.outerHTML+'</td></tr><tr><td align="right">Điểm bán</td><td><select id="cboInOut_MaDiemBan"></select></td></tr></tr>';
		if(lan==1)html+='<tr><td align="right">Ca làm việc*</td><td><select id="cboInOut_Ca"><option></option><option value="0">Ca thẳng</option><option value="1">Ca gãy</option></select></td></tr>';
		w2popup.message({
			speed:0,
			width:400,
			height:200,
			body: html+"</table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="Com_HrmsCheckInOut.doCheckIn('+elm.id+','+lan+')">✔️ Ok</button>'
		});
		this.cboInOut_MaKhuVuc_onChange(this.makhuvuc);
	},
	divInOutSL_onClick:function(elm,id){
		w2popup.message({
			speed:0,
			width:600,
			height:500,
			body: '<table border="1px" cellspacing="0px" style="margin:auto;width:100%;text-align:center"><caption style="background:pink"><b><i>Check Sản lượng</i> - Thực đạt</b></caption><tr><td rowspan="2"><b>Đầu<br/>ca</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr><td><input type="number" id="num_bold1" style="width:50px"></td><td><input type="number" id="num_boldl1" style="width:50px"></td><td><input type="number" id="num_light1" style="width:50px"></td><td><input type="number" id="num_lightl1" style="width:50px"></td><td><input type="number" id="num_trucbach1" style="width:50px"></td><td><input type="number" id="num_hanoipre1" style="width:50px"></td></tr><tr><td rowspan="2"><b>Nhập<br/>NPP</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr><td><input type="number" id="num_bold2" style="width:50px"></td><td><input type="number" id="num_boldl2" style="width:50px"></td><td><input type="number" id="num_light2" style="width:50px"></td><td><input type="number" id="num_lightl2" style="width:50px"></td><td><input type="number" id="num_trucbach2" style="width:50px"></td></td><td><input type="number" id="num_hanoipre2" style="width:50px"></td></tr><tr style="background:yellow"><td rowspan="2"><b>Bán<br/>ra*</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr style="background:yellow"><td><input type="number" id="num_bold" style="width:50px"></td><td><input type="number" id="num_boldl" style="width:50px"></td><td><input type="number" id="num_light" style="width:50px"></td><td><input type="number" id="num_lightl" style="width:50px"></td><td><input type="number" id="num_trucbach" style="width:50px"></td><td><input type="number" id="num_hanoipre" style="width:50px"></td></tr></table><br/>&nbsp;<input type="checkbox" id="chkInOut_ZeroSanLuong"><label for="chkInOut_ZeroSanLuong">Không bán được</label>',
			buttons: '<button class="w2ui-btn" onclick="w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="Com_HrmsCheckInOut.doCheckSanLuong('+elm.id+','+id+')">✔️ Ok</button>'
		});
	},
	cboInOut_MaKhuVuc_onChange:function(val){
		cboInOut_MaDiemBan.innerHTML=""
		if(val) NUT_DS.select({url:this.urledit+"diemban",where:["makhuvuc","=",val]},function(res){
			for(var i=0;i<res.length;i++){
				var opt=document.createElement("option");
				opt.value=res[i].madiemban;
				opt.innerHTML=res[i].tendiemban;
				cboInOut_MaDiemBan.options.add(opt);
			}
		})
	},
	doCheckIn:function(elm,lan){
		if(cboInOut_MaDiemBan.value&&cboInOut_MaKhuVuc.value&&(lan==2||cboInOut_Ca.value)){
			var self=this;
			NUT_DS.getNow(function(now){
				var nam=now.getFullYear();
				var thang=now.getMonth()+1;
				var ngay=now.getDate();
				var data={
					thoigianden:now,
					madiemban:cboInOut_MaDiemBan.value,
					makhuvuc:cboInOut_MaKhuVuc.value,
					manhanvien:_context.user.username,
					madoitac:self.madoitac,
					nam:nam,
					thang:thang,
					ngay:ngay,
					lan:lan,
					ca:(lan==2?1:cboInOut_Ca.value)
				}
				NUT_DS.insert({url:self.urledit+"chamcong_v",data:data},function(res){
					if(res.length){
						elm.style.color="white";
						elm.style.background="green";
						elm.setAttribute("onclick","");
						elm.lastChild.innerHTML="IN<br/>"+now.toLocaleTimeString();
						w2popup.message();
						NUT.tagMsg("Check IN... Done!","lime",elm);
					}
				});
			});
		} else NUT.tagMsg("Chọn Khu vực và Điểm bán và Ca làm việc để Check IN!","yellow");
	},
	doCheckOut:function(elm,id){
		var self=this;
		NUT_DS.getNow(function(now){
			var data={thoigianve:now};
			NUT_DS.update({url:self.urledit+"chamcong_v",data:data,where:[["idchamcong","=",id]]},function(res){
				elm.style.color="white";
				elm.style.background="orange";
				elm.setAttribute("onclick","");
				elm.lastChild.innerHTML="OUT<br/>"+now.toLocaleTimeString();
				w2popup.message();
				NUT.tagMsg("Check OUT... Done!","yellow",elm);
			});
		});
	},
	doCheckSanLuong:function(elm,id){
		var self=this;
		NUT_DS.getNow(function(now){
			var data={thoigiansanluong:now};
			
			var sum1=0;
			if(num_bold1.value>0){data.bold1=num_bold1.value;sum+=parseInt(data.bold1)}
			if(num_boldl1.value>0){data.boldl1=num_boldl1.value;sum+=parseInt(data.boldl1)}
			if(num_light1.value>0){data.light1=num_light1.value;sum+=parseInt(data.light1)}
			if(num_lightl1.value>0){data.lightl1=num_lightl1.value;sum+=parseInt(data.lightl1)}
			if(num_trucbach1.value>0){data.trucbach1=num_trucbach1.value;sum+=parseInt(data.trucbach1)}
			//if(num_trucbachl1.value>0){data.trucbachl1=num_trucbachl1.value;sum+=parseInt(data.trucbachl1)}
			if(num_hanoipre1.value>0){data.hanoipre1=num_hanoipre1.value;sum+=parseInt(data.hanoipre1)}
			//if(num_hanoiprel1.value>0){data.hanoiprel1=num_hanoiprel1.value;sum+=parseInt(data.hanoiprel1)}
			
			var sum2=0;
			if(num_bold2.value>0){data.bold2=num_bold2.value;sum+=parseInt(data.bold2)}
			if(num_boldl2.value>0){data.boldl2=num_boldl2.value;sum+=parseInt(data.boldl2)}
			if(num_light2.value>0){data.light2=num_light2.value;sum+=parseInt(data.light2)}
			if(num_lightl2.value>0){data.lightl2=num_lightl2.value;sum+=parseInt(data.lightl2)}
			if(num_trucbach2.value>0){data.trucbach2=num_trucbach2.value;sum+=parseInt(data.trucbach2)}
			//if(num_trucbachl2.value>0){data.trucbachl=num_trucbachl2.value;sum+=parseInt(data.trucbachl2)}
			if(num_hanoipre2.value>0){data.hanoipre2=num_hanoipre2.value;sum+=parseInt(data.hanoipre2)}
			//if(num_hanoiprel2.value>0){data.hanoiprel2=num_hanoiprel2.value;sum+=parseInt(data.hanoiprel2)}
			
			var sum=0;
			if(!chkInOut_ZeroSanLuong.checked){
				if(num_bold.value>0){data.bold=num_bold.value;sum+=parseInt(data.bold)}
				if(num_boldl.value>0){data.boldl=num_boldl.value;sum+=parseInt(data.boldl)}
				if(num_light.value>0){data.light=num_light.value;sum+=parseInt(data.light)}
				if(num_lightl.value>0){data.lightl=num_lightl.value;sum+=parseInt(data.lightl)}
				if(num_trucbach.value>0){data.trucbach=num_trucbach.value;sum+=parseInt(data.trucbach)}
				//if(num_trucbachl.value>0){data.trucbachl=num_trucbachl.value;sum+=parseInt(data.trucbachl)}
				if(num_hanoipre.value>0){data.hanoipre=num_hanoipre.value;sum+=parseInt(data.hanoipre)}
				//if(num_hanoiprel.value>0){data.hanoiprel=num_hanoiprel.value;sum+=parseInt(data.hanoiprel)}
				if(sum==0){
					NUT.tagMsg("Nhập ít nhất một sản phẩm để Check Sản lượng!","yellow");
					return;
				}
			}
			
			NUT_DS.update({url:self.urledit+"chamcong_v",data:data,where:[["idchamcong","=",id]]},function(res){
				NUT.tagMsg("Check SANLUONG Done!","lime",elm);
				elm.style.color="white";
				elm.style.background="brown";
				elm.setAttribute("onclick","");
				elm.lastChild.innerHTML=sum+"<br/>"+now.toLocaleTimeString();
				w2popup.message();
			});
		});
	}
}