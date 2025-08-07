var Com_HrmsCheckBefore9={
	run:function(p){
		var self=this;
		self.urledit=_context.service["hrms"].urledit;
		NUT.ds.select({url:self.urledit+"nhanvien_v",select:"makhuvuc,madoitac",where:["manhanvien","=",_context.user.username]},function(nv){
			if(nv.length){
				self.makhuvuc=nv[0].makhuvuc;
				self.madoitac=nv[0].madoitac;
				var now=new Date(Date.now()-86400000);
				var nam=now.getFullYear();
				var thang=now.getMonth()+1;
				var ngay=now.getDate();
				self.before=(now.getHours()<=9);
				NUT.ds.select({url:self.urledit+"chamcong_v",orderby:"lan",where:[["nam","=",nam],["thang","=",thang],["ngay","=",ngay],["manhanvien","=","%22"+_context.user.username+"%22"],["thoigianden","!is",null]]},function(res){
					self.lookupData={};
					var html='<table style="margin:auto">';
					if(res.length){
						for(var i=0;i<res.length;i++){
							var data=res[i];
							var lan=data.lan;
							var id=data.idchamcong;
							self.lookupData[id]=data;
							html+='<tr><td><h2 class="nut-link">Lần '+lan+'</h2></td></tr><tr>';
							if(data.thoigianden){
								data.thoigianden=new Date(data["thoigianden"]).toLocaleTimeString();
								html+='<td><div id="divInOut_IN'+lan+'" class="nut-tile" style="background:green;borderby:2px dashed" onclick="Com_HrmsCheckBefore9.divInOut_InfoIn(this,'+id+')"><img src="client/2/img/in.ico"><br/><b>'+data.madiemban+'<br/>'+data.thoigianden+'</b></div></td>';
								if(data.thoigianve){
									data.thoigianve=new Date(data.thoigianve).toLocaleTimeString();
									html+='<td><div id="divInOut_OUT'+lan+'" class="nut-tile" style="background:orange;borderby:2px dashed" onclick="Com_HrmsCheckBefore9.divInOut_InfoOut(this,'+id+')"><img src="client/2/img/out.ico"><br/><b>OUT<br/>'+data.thoigianve+'</b></div></td>';
									if(data.thoigiansanluong){
										data.thoigiansanluong=new Date(data["thoigiansanluong"]).toLocaleTimeString();
										html+='<td><div id="divInOut_SL'+lan+'" class="nut-tile" style="background:brown;;borderby:2px dashed" onclick="Com_HrmsCheckBefore9.divInOut_InfoSL(this,'+id+')"><img src="client/2/img/factory.ico"><br/><b>'+(data.bold+data.boldl+data.light+data.lightl+data.trucbach+data.trucbachl+data.hanoipre+data.hanoiprel)+'<br/>'+data.thoigiansanluong+'</b></div></td>';
									}else html+='<td><div id="divInOut_SL'+lan+'" class="nut-tile" style="background:white;borderby:2px dashed;color:brown" onclick="Com_HrmsCheckBefore9.divInOutSL_onClick(this,'+id+')"><img src="client/2/img/factory.ico"><br/><b>Check SANLUONG</b></div></td>';
								}else
									html+='<td><div id="divInOut_OUT'+lan+'" class="nut-tile" style="background:white;borderby:2px dashed;color:orange" onclick="Com_HrmsCheckBefore9.doCheckOut(this,'+id+')"><img src="client/2/img/out.ico"><br/><b>Check OUT</b></div></td>';
							}
							html+="</tr>";
						}
					}else{
						html+='<tr><td style="color:orange"><h2>KHÔNG TÌM THẤY CHECK-IN!</h2></td></tr></table>';
					}
					w2popup.open({
						title: '🕘 <i>Check BEFORE 9:am</i> - <b>Hôm qua #<i>'+nam+'-'+thang+'-'+ngay+'</i></b>',
						modal:true,
						width: 600,
						height: 450,
						body: html+"</table>",
						buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button>'
					});
				});
			}
		});
	},
	divInOut_InfoIn:function(elm,id){
		var data=Com_HrmsCheckBefore9.lookupData[id];
		w2alert("<table style='margin:auto'><caption style='color:green'><b>Check IN <i>#"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian đến:</i></b></td><td>"+data.thoigianden+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr></table>");
	},
	divInOut_InfoOut:function(elm,id){
		var data=Com_HrmsCheckBefore9.lookupData[id];
		w2alert("<table style='margin:auto'><caption style='color:orange'><b>Check OUT <i>#"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian về:</i></b></td><td>"+data.thoigianve+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr></table>");
		
	},
	divInOut_InfoSL:function(elm,id){
		var data=Com_HrmsCheckBefore9.lookupData[id];
		w2popup.message({
			speed:0,
			width:600,
			height:300,
			body:"<table border='1' style='text-align:center;margin:auto'><caption style='color:brown'><b>Sản lượng <i>#"+(data.bold+data.boldl+data.light+data.lightl+data.trucbach+data.trucbachl+data.hanoipre+data.hanoiprel)+"</i></b></caption><tr><th>Bold</th><th>Bold<br/>lon</th><th>Light</th><th>Light<br/>lon</th><th>TrucBach</th><th>TrucBach<br/>lon</th><th>HanoiPre</th><th>HanoiPre<br/>lon</th></tr><tr><td>"+data.bold+"</td><td>"+data.boldl+"</td><td>"+data.light+"</td><td>"+data.lightl+"</td><td>"+data.trucbach+"</td><td>"+data.trucbachl+"</td><td>"+data.hanoipre+"</td><td>"+data.hanoiprel+"</td></tr></table><br/><table style='margin:auto'><caption style='color:brown'><b>Check OUT #<i>"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian:</i></b></td><td>"+data.thoigiansanluong+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr></table>",
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
		cbo.setAttribute("onchange","Com_HrmsCheckBefore9.cboInOut_MaKhuVuc_onChange(this.value)");
		w2popup.message({
			speed:0,
			width:400,
			height:200,
			body: '<table style="margin:auto;width:100%"><caption style="background:lime"><b><i>Check IN</i> - Địa điểm</b></caption><tr><td align="right">Khu vực</td><td>'+cbo.outerHTML+'</td></tr><tr><td align="right">Điểm bán</td><td><select id="cboInOut_MaDiemBan"></select></td></tr></table>',
			buttons: '<button class="w2ui-btn" onclick="w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="Com_HrmsCheckBefore9.doCheckIn('+elm.id+','+lan+')">✔️ Ok</button>'
		});
		this.cboInOut_MaKhuVuc_onChange(this.makhuvuc);
	},
	divInOutSL_onClick:function(elm,id){
		if(Com_HrmsCheckBefore9.before){
			var sp=["bold"]
			w2popup.message({
				speed:0,
				width:600,
				height:200,
				body: '<table border="1" style="margin:auto;width:100%;text-align:center"><caption style="background:pink"><b><i>Check Sản lượng</i> - Thực đạt</b></caption><tr><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>TrucBach<br/>lon</td><td>HanoiPre</td><td>HanoiPre<br/>lon</td></tr><tr><td><input type="number" id="numInOut_bold" style="width:50px"></td><td><input type="number" id="numInOut_boldl" style="width:50px"></td><td><input type="number" id="numInOut_light" style="width:50px"></td><td><input type="number" id="numInOut_lightl" style="width:50px"></td><td><input type="number" id="numInOut_trucbach" style="width:50px"></td><td><input type="number" id="numInOut_trucbachl" disabled style="width:50px"></td><td><input type="number" id="numInOut_hanoipre" style="width:50px"></td><td><input type="number" id="numInOut_hanoiprel" disabled style="width:50px"></td></tr></table><br/>&nbsp;<input type="checkbox" id="chkInOut_ZeroSanLuong"><label for="chkInOut_ZeroSanLuong">Không bán được</label>',
				buttons: '<button class="w2ui-btn" onclick="w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="Com_HrmsCheckBefore9.doCheckSanLuong('+elm.id+','+id+')">✔️ Ok</button>'
			});
		} else w2alert("<span style='color:orange'>Đã quá 9h sáng để Check Sản lượng của hôm qua!</span>");
	},
	cboInOut_MaKhuVuc_onChange:function(val){
		cboInOut_MaDiemBan.innerHTML=""
		if(val) NUT.ds.select({url:this.urledit+"diemban",where:["makhuvuc","=",val]},function(res){
			for(var i=0;i<res.length;i++){
				var opt=document.createElement("option");
				opt.value=res[i].madiemban;
				opt.innerHTML=res[i].tendiemban;
				cboInOut_MaDiemBan.options.add(opt);
			}
		})
	},
	doCheckIn:function(elm,lan){
		if(cboInOut_MaDiemBan.value&&cboInOut_MaKhuVuc.value){
			var now=new Date();
			var nam=now.getFullYear();
			var thang=now.getMonth()+1;
			var ngay=now.getDate();
			var data={
				thoigianden:now,
				madiemban:cboInOut_MaDiemBan.value,
				makhuvuc:cboInOut_MaKhuVuc.value,
				manhanvien:_context.user.username,
				madoitac:this.madoitac,
				nam:nam,
				thang:thang,
				ngay:ngay,
				lan:lan
			}
			NUT.ds.insert({url:this.urledit+"chamcong_v",data:data},function(res){
				if(res.length){
					elm.style.color="white";
					elm.style.background="green";
					elm.setAttribute("onclick","");
					elm.lastChild.innerHTML="IN<br/>"+now.toLocaleTimeString();
					w2popup.message();
					NUT.tagMsg("Check IN... Done!","lime",elm);
				}
			});
		} else NUT.tagMsg("Chọn Khu vực và Điểm bán để Check IN!","yellow");
	},
	doCheckOut:function(elm,id){
		if(Com_HrmsCheckBefore9.before){
			var now=new Date();
			var data={thoigianve:now};
			NUT.ds.update({url:this.urledit+"chamcong_v",data:data,where:[["idchamcong","=",id]]},function(res){
				elm.style.color="white";
				elm.style.background="orange";
				elm.setAttribute("onclick","");
				elm.lastChild.innerHTML="OUT<br/>"+now.toLocaleTimeString();
				w2popup.message();
				NUT.tagMsg("Check OUT... Done!","yellow",elm);
			});
		} else w2alert("<span style='color:orange'>Đã quá 9h sáng để Check-OUT của hôm qua!</span>");
	},
	doCheckSanLuong:function(elm,id){
		var now=new Date();
		var data={thoigiansanluong:now};
		var sum=0;
		if(!chkInOut_ZeroSanLuong.checked){
			if(numInOut_bold.value>0){data.bold=numInOut_bold.value;sum+=parseInt(data.bold)}
			if(numInOut_boldl.value>0){data.boldl=numInOut_boldl.value;sum+=parseInt(data.boldl)}
			if(numInOut_light.value>0){data.light=numInOut_light.value;sum+=parseInt(data.light)}
			if(numInOut_lightl.value>0){data.lightl=numInOut_lightl.value;sum+=parseInt(data.lightl)}
			if(numInOut_trucbach.value>0){data.trucbach=numInOut_trucbach.value;sum+=parseInt(data.trucbach)}
			if(numInOut_trucbachl.value>0){data.trucbachl=numInOut_trucbachl.value;sum+=parseInt(data.trucbachl)}
			if(numInOut_hanoipre.value>0){data.hanoipre=numInOut_hanoipre.value;sum+=parseInt(data.hanoipre)}
			if(numInOut_hanoiprel.value>0){data.hanoiprel=numInOut_hanoiprel.value;sum+=parseInt(data.hanoiprel)}
			if(sum==0){
				NUT.tagMsg("Nhập ít nhất một sản phẩm để Check Sản lượng!","yellow");
				return;
			}
		}
		
		NUT.ds.update({url:this.urledit+"chamcong_v",data:data,where:[["idchamcong","=",id]]},function(res){
			NUT.tagMsg("Check SANLUONG Done!","lime",elm);
			elm.style.color="white";
			elm.style.background="brown";
			elm.setAttribute("onclick","");
			elm.lastChild.innerHTML=sum+"<br/>"+now.toLocaleTimeString();
			w2popup.message();
		});
	}
}