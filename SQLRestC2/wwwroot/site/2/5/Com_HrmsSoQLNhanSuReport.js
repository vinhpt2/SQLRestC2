var Com_HrmsSoQLNhanSuReport={
	run:function(p){		
		var items=_context.domain[24].items;
		var cbo=document.createElement("select");
		cbo.id="cboDoiTac";
		for(var i=0;i<items.length;i++){
			var opt=document.createElement("option");
			opt.value=items[i].id;
			opt.innerHTML=items[i].text;
			cbo.add(opt);
		}
		var now=new Date();
		w2popup.open({
			title: '📜 <i>Sổ quản lý lao động</i>',
			modal:true,
			width: 400,
			height: 170,
			body: "<table style='margin:auto'><tr><td>Dữ liệu:</td><td><select id='cboDuLieu'><option value='DL'>Đi lương</option><option value='KKT'>Kê khai thuế</option></select></td><td>Đối tác</td><td>"+cbo.outerHTML+"</td></tr><tr><td>Năm</td><td><input id='numTinhCong_Year' style='width:60px' type='number' value='"+now.getFullYear()+"'/></td><td>Tháng</td><td><input id='numTinhCong_Month' style='width:60px' type='number'/></td></tr><tr><td></td><td colspan='3'><input type='checkbox' id='chkThueLai'/><label for='chkThueLai'>Nhân sự thuê lại</label></td></tr></table>",
			buttons: '<button class="w2ui-btn" onclick="w2popup.close()">⛌ Close</button><button class="w2ui-btn" onclick="Com_HrmsSoQLNhanSuReport.runReport()">✔️ Report</button>'
		})
	},
	runReport:function(){
		if(numTinhCong_Year.value){
			var nam=parseInt(numTinhCong_Year.value);
			var thang=parseInt(numTinhCong_Month.value);
			var isTongHopThang=(isNaN(thang) && cboDuLieu.value=="DL");
			var url=_context.service["hrms"].urledit;
			var html="client/"+_context.user.clientid+"/"+_context.curApp.applicationid+(isTongHopThang?"/SoQLNhanSuReportTH.html":"/SoQLNhanSuReport.html");
			var namthang=(thang?nam*100+thang:nam);
			var where=(thang?[["batdaulam","<=",namthang],["or",["thoiviec",">=",namthang],["thoiviec","is",null]]]:[["nambatdaulam","<=",namthang],["or",["namthoiviec",">=",namthang],["namthoiviec","is",null]]]);

			NUT_DS.select({url:url+"namthang_hopdonglaodong_v",where:where},function(hopdongs){
				var lookupKhuVuc=_context.domain[9].lookup;
				var lookupGioiTinh=_context.domain[20].lookup;
				var lookupLoaiHD=_context.domain[37].lookup;
				var lookupHopDong={};
				for(var i=0;i<hopdongs.length;i++){
					var hd=hopdongs[i];
					lookupHopDong[hd.manhanvien]=hd;
				}
				NUT_DS.select({url:url+(cboDuLieu.value=="DL"?"rpt_soqlnhansu_thang":"rpt_soqlnhansu_kkthue"),where:thang?[["nam","=",nam],["thang","=",thang]]:["nam","=",nam]},function(res){
					if(res.length){
						var win=window.open(html);
						win.onload=function(){
							this.labTitle.innerHTML=(chkThueLai.checked?"SỔ THEO DÕI LAO ĐỘNG CHO THUÊ LẠI":"SỔ THEO DÕI LAO ĐỘNG");
							this.labThangNam.innerHTML=(thang?"THÁNG "+thang +" NĂM "+nam:"NĂM "+nam);
							this.labDoiTac.innerHTML=(cboDoiTac.value?"Đơn vị đối tác: " + cboDoiTac.value:"");
							var oldMaNhanVien=null;
							var j=0,sumTang=0,sumGiam=0;
							for(var i=0;i<res.length;i++){
								var rec=res[i];
								var hd=lookupHopDong[rec.manhanvien];
								var tanggiam="";
								var ngaythoiviec="";
								var thamgia="";
								if(hd){
									if(cboDoiTac.value&&cboDoiTac.value!=hd.madoitac)continue;
									if(chkThueLai.checked&&hd.nhomvitri!="BA"&&hd.nhomvitri!="SM")continue;
									var tang=(thang?hd.batdaulam==namthang:hd.nambatdaulam==namthang);
									var giam=(thang?hd.thoiviec==namthang:hd.namthoiviec==namthang);
									if(tang){
										tanggiam+=" Tăng";
										sumTang++;
									}
									if(giam){
										tanggiam+=" Giảm";ngaythoiviec=hd.ngaythoiviec;
										sumGiam++;
									}
									if(hd.loaihopdong=="GiaoKhoan")thamgia="Part-time";
									if(hd.loaihopdong=="NghiNgang")thamgia="Nghỉ ngang";
								}
								if(!thamgia)thamgia=(rec.sotien?"✓":(rec.manhanvien.endsWith(".huutri")?"Hưu trí":rec.baogiambhxh||""));
								if(oldMaNhanVien!=rec.manhanvien){
									var row=this.tblData.insertRow();
									row.innerHTML="<td align='center'>"+(++j)+"</td><td align='center'>"+rec.sohoso+"</td><td align='center' class='frozen'>"+rec.hoten+"</td><td align='center'>"+lookupGioiTinh[rec.gioitinh]+"</td><td align='center'>"+(rec.ngaysinh||"")+"</td><td align='center'>"+(rec.socmt||"")+"</td><td align='center'>"+(hd?hd.madoitac||"":rec.madoitac)+"</td><td align='center'>"+(hd?hd.vitrilamviec||"":rec.vitrilv)+"</td><td align='center'>"+(lookupKhuVuc[rec.makhuvuc]||"")+"</td><td align='center'>"+(hd?hd.ngaybatdaulamviec:"")+"</td><td align='center'>"+(hd?lookupLoaiHD[hd.loaihopdong]||"":"")+"</td><td align='right'>"+(rec.sotien?w2utils.formatNumber(rec.sotien)+"đ":(hd?hd.mucluongcoban:""))+"</td>"+(isTongHopThang?"<td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td><td align='center'></td>":"<td align='center'>"+thamgia+"</td><td align='center'>"+thamgia+"</td><td align='center'>"+thamgia+"</td>")+"<td align='center'>"+ngaythoiviec+"</td><td>"+(ngaythoiviec?hd.lydothoiviec||"":"")+"</td><td align='center'>"+tanggiam+"</td>";
									oldMaNhanVien=rec.manhanvien;
								}
								if(isTongHopThang){
									row.cells[10+2*rec.thang].innerHTML="✓";
									row.cells[10+2*rec.thang+1].innerHTML=thamgia;
								}
							}
							this.labBienDong.innerHTML="Biến động";//"+"+sumTang+"<br/>-"+sumGiam;
						}
					}else NUT.tagMsg("No data to report!","yellow");
				});
			});

		} else NUT.tagMsg("Nhập năm trước khi thực hiện!","yellow");
	}
}