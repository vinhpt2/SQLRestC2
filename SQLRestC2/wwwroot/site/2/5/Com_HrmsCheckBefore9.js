var Com_HrmsCheckBefore9={
	run:function(p){
		var self=this;
		self.urledit=_context.service["hrms"].urledit;
		NUT_DS.getNow(function(now){
			var now=new Date(now-86400000);
			self.nam=now.getFullYear();
			self.thang=now.getMonth()+1;
			self.ngay=now.getDate();
			self.before=(now.getHours()<=9);
			NUT_DS.select({url:self.urledit+"nhanvien_v",select:"makhuvuc,madoitac",where:["manhanvien","=",_context.user.username]},function(nv, sdate){
				if(nv.length){
					self.makhuvuc=nv[0].makhuvuc;
					self.madoitac=nv[0].madoitac;
					NUT_DS.select({url:self.urledit+"chamcong_v",order:"lan",where:[["nam","=",self.nam],["thang","=",self.thang],["ngay","=",self.ngay],["dulieu","=",0],["manhanvien","=","%22"+_context.user.username+"%22"],["thoigianden","!is",null]]},function(res){
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
									html+='<td><div id="divInOut_IN'+lan+'" class="nut-tile" style="background:green;border:2px dashed" onclick="Com_HrmsCheckBefore9.divInOut_InfoIn(this,'+id+')"><img src="client/2/6/in.ico"><br/><b>'+data.madiemban+'<br/>'+data.thoigianden+'</b></div></td>';
									if(data.thoigianve){
										data.thoigianve=new Date(data.thoigianve).toLocaleTimeString();
										html+='<td><div id="divInOut_OUT'+lan+'" class="nut-tile" style="background:orange;border:2px dashed" onclick="Com_HrmsCheckBefore9.divInOut_InfoOut(this,'+id+')"><img src="client/2/6/out.ico"><br/><b>OUT<br/>'+data.thoigianve+'</b></div></td>';
										if(data.thoigiansanluong){
											data.thoigiansanluong=new Date(data["thoigiansanluong"]).toLocaleTimeString();
											html+='<td><div id="divInOut_SL'+lan+'" class="nut-tile" style="background:brown;;border:2px dashed" onclick="Com_HrmsCheckBefore9.divInOut_InfoSL(this,'+id+')"><img src="client/2/6/factory.ico"><br/><b>'+(data.bold+data.boldl+data.light+data.lightl+data.trucbach+data.trucbachl+data.hanoipre+data.hanoiprel)+'<br/>'+data.thoigiansanluong+'</b></div></td>';
										}else html+='<td><div id="divInOut_SL'+lan+'" class="nut-tile" style="background:white;border:2px dashed;color:brown" onclick="Com_HrmsCheckBefore9.divInOutSL_onClick(this,'+id+',\''+data.madiemban+'\')"><img src="client/2/6/factory.ico"><br/><b>Check SANLUONG</b></div></td>';
									}else
										html+='<td><div id="divInOut_OUT'+lan+'" class="nut-tile" style="background:white;border:2px dashed;color:orange" onclick="Com_HrmsCheckBefore9.divInOut2_onClick(this,'+id+','+lan+')"><img src="client/2/6/out.ico"><br/><b>Check OUT</b></div></td>';
								}
								html+="</tr>";
							}
						}else{
							html+='<tr><td style="color:orange"><h2>KHÔNG TÌM THẤY CHECK-IN!</h2></td></tr></table>';
						}
						w2popup.open({
							title: '🕘 <i>Check BEFORE 9:am</i> - <b>Hôm qua #<i>'+self.nam+'-'+self.thang+'-'+self.ngay+'</i></b>',
							modal:true,
							width: 600,
							height: 450,
							body: html+"</table>",
							buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button>'
						});
					});
				}
			});
		});
	},
	divInOut_InfoIn:function(elm,id){
		var data=Com_HrmsCheckBefore9.lookupData[id];
		w2alert("<table border='1px' cellspacing='0px' style='margin:auto'><caption style='color:green'><b>Check IN <i>#"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian đến:</i></b></td><td>"+data.thoigianden+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr></table>");
	},
	divInOut_InfoOut:function(elm,id){
		var data=Com_HrmsCheckBefore9.lookupData[id];
		w2alert("<table border='1px' cellspacing='0px' style='margin:auto'><caption style='color:orange'><b>Check OUT <i>#"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian về:</i></b></td><td>"+data.thoigianve+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr></table>");
		
	},
	divInOut_InfoSL:function(elm,id){
		var data=Com_HrmsCheckBefore9.lookupData[id];
		var sum=data.bold+data.boldl+data.light+data.lightl+data.trucbach+data.trucbachl+data.hanoipre+data.hanoiprel;
		var sum1=data.bold1+data.boldl1+data.light1+data.lightl1+data.trucbach1+data.trucbachl1+data.hanoipre1+data.hanoiprel1;
		var sum2=data.bold2+data.boldl2+data.light2+data.lightl2+data.trucbach2+data.trucbachl2+data.hanoipre2+data.hanoiprel2;
		w2popup.message({
			speed:0,
			width:600,
			height:500,
			body:"<table border='1px' cellspacing='0px' style='text-align:center;margin:auto'><caption style='color:brown'><b>Check sản lượng - <i> Lần "+data.lan+"</i></b></caption><tr><td><b style='color:brown'>Tồn<br/>đầu ca</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr><td><b style='color:brown'>"+sum1+"</b></td><td>"+data.bold1+"</td><td>"+data.boldl1+"</td><td>"+data.light1+"</td><td>"+data.lightl1+"</td><td>"+data.trucbach1+"</td><td>"+data.hanoipre1+"</td></tr><tr><td><b style='color:brown'>Nhập NPP</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr><td><b style='color:brown'>"+sum2+"</b></td><td>"+data.bold2+"</td><td>"+data.boldl2+"</td><td>"+data.light2+"</td><td>"+data.lightl2+"</td><td>"+data.trucbach2+"</td><td>"+data.hanoipre2+"</td></tr><tr style='background:yellow'><td><b style='color:brown'>Bán ra</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr style='background:yellow'><td><b style='color:brown'>"+sum+"</b></td><td>"+data.bold+"</td><td>"+data.boldl+"</td><td>"+data.light+"</td><td>"+data.lightl+"</td><td>"+data.trucbach+"</td><td>"+data.hanoipre+"</td></tr></table><br/><table border='1px' cellspacing='0px' style='margin:auto'><caption style='color:brown'><b>Check OUT #<i>"+data.nam+"-"+data.thang+"-"+data.ngay+"</i></b></caption><tr><td><b><i>Thời gian:</i></b></td><td>"+data.thoigiansanluong+"</td></tr><tr><td><b><i>Khu vực:</i></b></td><td>"+data.makhuvuc+"</td></tr><tr><td><b><i>Điểm bán:</i></b></td><td>"+data.madiemban+"</td></tr></table>",
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
	divInOutSL_onClick:function(elm,id,madiemban){
		if(Com_HrmsCheckBefore9.before){
			NUT_DS.select({url:this.urledit+"chamcong_v",order:"ngay.desc,lan.desc",range:"0-0",where:[["nam","=",this.nam],["thang","=",this.thang],["madiemban","=",madiemban],["dulieu","=",0],["manhanvien","=","%22"+_context.user.username+"%22"],["or",["bold1",">","0"],["boldl1",">","0"],["light1",">","0"],["lightl1",">","0"],["trucbach1",">","0"],["hanoipre1",">","0"]]]},function(res){
				w2popup.message({
					speed:0,
					width:600,
					height:500,
					body: '&nbsp;<input type="checkbox" id="chkInOut_ZeroDauCa"><label for="chkInOut_ZeroDauCa">Không tồn chai nào</label><br/><table border="1px" cellspacing="0px" style="margin:auto;width:100%;text-align:center"><caption style="background:pink"><b><i>Check Sản lượng</i> - '+madiemban+'</b></caption><tr><tr><td rowspan="2"><b>Tồn<br/>đầu<br/>ca*</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr><td><input type="number" id="num_bold1" style="width:50px"></td><td><input type="number" id="num_boldl1" style="width:50px"></td><td><input type="number" id="num_light1" style="width:50px"></td><td><input type="number" id="num_lightl1" style="width:50px"></td><td><input type="number" id="num_trucbach1" style="width:50px"></td><td><input type="number" id="num_hanoipre1" style="width:50px"></td></tr><td rowspan="2"><b>Nhập<br/>NPP</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr><td><input type="number" id="num_bold2" style="width:50px"></td><td><input type="number" id="num_boldl2" style="width:50px"></td><td><input type="number" id="num_light2" style="width:50px"></td><td><input type="number" id="num_lightl2" style="width:50px"></td><td><input type="number" id="num_trucbach2" style="width:50px"></td></td><td><input type="number" id="num_hanoipre2" style="width:50px"></td></tr><tr style="background:yellow"><td rowspan="2"><b>Bán<br/>ra*</b></td><td>Bold</td><td>Bold<br/>lon</td><td>Light</td><td>Light<br/>lon</td><td>TrucBach</td><td>HanoiPre</td></tr><tr style="background:yellow"><td><input type="number" id="num_bold" style="width:50px"></td><td><input type="number" id="num_boldl" style="width:50px"></td><td><input type="number" id="num_light" style="width:50px"></td><td><input type="number" id="num_lightl" style="width:50px"></td><td><input type="number" id="num_trucbach" style="width:50px"></td><td><input type="number" id="num_hanoipre" style="width:50px"></td></tr></table><br/>&nbsp;<input type="checkbox" id="chkInOut_ZeroSanLuong"><label for="chkInOut_ZeroSanLuong">Không bán được</label>',
					buttons: '<button class="w2ui-btn" onclick="w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="Com_HrmsCheckBefore9.doCheckSanLuong('+elm.id+','+id+')">✔️ Ok</button>'
				});
				var rec=res[0];
				if(rec){
					num_bold1.value=rec.bold1+rec.bold2-rec.bold;
					num_bold1.disabled=true;
					num_boldl1.value=rec.boldl1+rec.boldl2-rec.boldl;
					num_boldl1.disabled=true;
					num_light1.value=rec.light1+rec.light2-rec.light;
					num_light1.disabled=true;
					num_lightl1.value=rec.lightl1+rec.lightl2-rec.lightl;
					num_lightl1.disabled=true;
					num_trucbach1.value=rec.trucbach1+rec.trucbach2-rec.trucbach;
					num_trucbach1.disabled=true;
					num_hanoipre1.value=rec.hanoipre1+rec.hanoipre2-rec.hanoipre;
					num_hanoipre1.disabled=true;
				}
			});
		} else w2alert("<span style='color:orange'>Đã quá 9h sáng để Check Sản lượng của hôm qua!</span>");
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
		if(cboInOut_MaDiemBan.value&&cboInOut_MaKhuVuc.value){
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
					lan:lan
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
		} else NUT.tagMsg("Chọn Khu vực và Điểm bán để Check IN!","yellow");
	},
	divInOut2_onClick:function(elm,id,lan){
		if(lan==1){
			w2popup.message({
				speed:0,
				width:400,
				height:150,
				body: '<table style="margin:auto;width:100%"><caption style="background:orange"><b><i>Check OUT</i></b></caption><tr><td align="right">Ca làm việc*</td><td><select id="cboInOut_Ca"><option value="0">Ca thẳng</option><option value="1">Ca gãy</option></select></td></tr></table>',
				buttons: '<button class="w2ui-btn" onclick="w2popup.message()">Cancel</button><button class="w2ui-btn" onclick="Com_HrmsCheckBefore9.doCheckOut('+elm.id+','+id+')">✔️ Ok</button>'
			});
		}else this.doCheckOut(elm,id,lan);
	},
	doCheckOut:function(elm,id,lan){
		if(Com_HrmsCheckBefore9.before){
			var self=this;
			NUT_DS.getNow(function(now){
				var data={
					thoigianve:now,
					ca:(lan==2?1:cboInOut_Ca.value)
				};
				NUT_DS.update({url:self.urledit+"chamcong_v",data:data,where:[["idchamcong","=",id]]},function(res){
					elm.style.color="white";
					elm.style.background="orange";
					elm.setAttribute("onclick","");
					elm.lastChild.innerHTML="OUT<br/>"+now.toLocaleTimeString();
					w2popup.message();
					NUT.tagMsg("Check OUT... Done!","yellow",elm);
				});
			});
		} else w2alert("<span style='color:orange'>Đã quá 9h sáng để Check-OUT của hôm qua!</span>");
	},
	doCheckSanLuong:function(elm,id){
		var self=this;
		NUT_DS.getNow(function(now){
			var data={
				thoigiansanluong:now,
				bold1:0,boldl1:0,light1:0,lightl1:0,trucbach1:0,hanoipre1:0,
				bold2:0,boldl2:0,light2:0,lightl2:0,trucbach2:0,hanoipre2:0,
				bold:0,boldl:0,light:0,lightl:0,trucbach:0,hanoipre:0
			};
			
			var sum1=0;
			if(!chkInOut_ZeroDauCa.checked){
				if(num_bold1.value>0){data.bold1=parseInt(num_bold1.value);sum1+=data.bold1}
				if(num_boldl1.value>0){data.boldl1=parseInt(num_boldl1.value);sum1+=data.boldl1}
				if(num_light1.value>0){data.light1=parseInt(num_light1.value);sum1+=data.light1}
				if(num_lightl1.value>0){data.lightl1=parseInt(num_lightl1.value);sum1+=data.lightl1}
				if(num_trucbach1.value>0){data.trucbach1=parseInt(num_trucbach1.value);sum1+=data.trucbach1}
				//if(num_trucbachl1.value>0){data.trucbachl1=parseInt(num_trucbachl1.value);sum1+=data.trucbachl1}
				if(num_hanoipre1.value>0){data.hanoipre1=parseInt(num_hanoipre1.value);sum1+=data.hanoipre1}
				//if(num_hanoiprel1.value>0){data.hanoiprel1=parseInt(num_hanoiprel1.value);sum1+=data.hanoiprel1}
				if(sum1==0){
					NUT.tagMsg("Nhập số lượng tồn đầu ca để Check Sản lượng!","yellow",document.activeElement);
					return;
				}
			}
			
			
			var sum2=0;
			if(num_bold2.value>0){data.bold2=parseInt(num_bold2.value);sum2+=data.bold2}
			if(num_boldl2.value>0){data.boldl2=parseInt(num_boldl2.value);sum2+=data.boldl2}
			if(num_light2.value>0){data.light2=parseInt(num_light2.value);sum2+=data.light2}
			if(num_lightl2.value>0){data.lightl2=parseInt(num_lightl2.value);sum2+=data.lightl2}
			if(num_trucbach2.value>0){data.trucbach2=parseInt(num_trucbach2.value);sum2+=data.trucbach2}
			//if(num_trucbachl2.value>0){data.trucbachl=parseInt(num_trucbachl2.value);sum2+=data.trucbachl2}
			if(num_hanoipre2.value>0){data.hanoipre2=parseInt(num_hanoipre2.value);sum2+=data.hanoipre2}
			//if(num_hanoiprel2.value>0){data.hanoiprel2=parseInt(num_hanoiprel2.value);sum2+=data.hanoiprel2}
			
			var sum=0;
			if(!chkInOut_ZeroSanLuong.checked){
				if(num_bold.value>0){data.bold=parseInt(num_bold.value);sum+=data.bold}
				if(num_boldl.value>0){data.boldl=parseInt(num_boldl.value);sum+=data.boldl}
				if(num_light.value>0){data.light=parseInt(num_light.value);sum+=data.light}
				if(num_lightl.value>0){data.lightl=parseInt(num_lightl.value);sum+=data.lightl}
				if(num_trucbach.value>0){data.trucbach=parseInt(num_trucbach.value);sum+=data.trucbach}
				//if(num_trucbachl.value>0){data.trucbachl=parseInt(num_trucbachl.value);sum+=data.trucbachl}
				if(num_hanoipre.value>0){data.hanoipre=parseInt(num_hanoipre.value);sum+=data.hanoipre}
				//if(num_hanoiprel.value>0){data.hanoiprel=parseInt(num_hanoiprel.value);sum+=data.hanoiprel}
				if(sum==0){
					NUT.tagMsg("Nhập số lượng bán ra để Check Sản lượng!","yellow",document.activeElement);
					return;
				}
			}
			
			if(data.bold1+data.bold2-data.bold<0||data.boldl1+data.boldl2-data.boldl<0||data.light1+data.light2-data.light<0||data.lightl1+data.lightl2-data.lightl<0||data.trucbach1+data.trucbach2-data.trucbach<0||data.hanoipre1+data.hanoipre2-data.hanoipre<0)
				NUT.tagMsg("Tồn cuối ca là số âm. Nhập số lượng nhập NPP!","yellow",document.activeElement);
			else NUT_DS.update({url:self.urledit+"chamcong_v",data:data,where:[["idchamcong","=",id]]},function(res){
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